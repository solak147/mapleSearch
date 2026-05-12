import {randomUUID, createHmac} from "node:crypto";
import type {Request, Response} from "express";
import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

setGlobalOptions({maxInstances: 10});

const LINE_PAY_SANDBOX_BASE_URL = "https://sandbox-api-pay.line.me";
const DEFAULT_CURRENCY = "TWD";

type LinePayConfig = {
  channelId: string;
  channelSecret: string;
  apiBaseUrl: string;
  callbackBaseUrl?: string;
};

type LinePayResponse<T = Record<string, unknown>> = {
  returnCode: string;
  returnMessage: string;
  info?: T;
};

type LinePayRequestPaymentInfo = {
  transactionId?: string | number;
  paymentUrl?: {
    web?: string;
    app?: string;
  };
  [key: string]: unknown;
};

const setCorsHeaders = (res: Response) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
};

const handlePreflight = (req: Request, res: Response) => {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }
  return false;
};

const getLinePayConfig = (): LinePayConfig => {
  const channelId = process.env.LINE_PAY_CHANNEL_ID ?? "";
  const channelSecret = process.env.LINE_PAY_CHANNEL_SECRET ?? "";

  if (!channelId || !channelSecret) {
    throw new Error(
      "Missing LINE Pay credentials. " +
      "Please set LINE_PAY_CHANNEL_ID and LINE_PAY_CHANNEL_SECRET.",
    );
  }

  return {
    channelId,
    channelSecret,
    apiBaseUrl:
      process.env.LINE_PAY_API_BASE_URL || LINE_PAY_SANDBOX_BASE_URL,
    callbackBaseUrl: process.env.LINE_PAY_CALLBACK_BASE_URL,
  };
};

const getBaseUrl = (
  req: Pick<Request, "protocol" | "get">,
  config: LinePayConfig,
) => {
  if (config.callbackBaseUrl) {
    return config.callbackBaseUrl.replace(/\/$/, "");
  }

  const host = req.get("host");
  if (!host) {
    throw new Error("Unable to determine callback host.");
  }

  return `${req.protocol || "https"}://${host}`;
};

const createSignature = (
  channelSecret: string,
  apiPath: string,
  bodyText: string,
  nonce: string,
) => {
  const message = channelSecret + apiPath + bodyText + nonce;
  return createHmac("sha256", channelSecret).update(message).digest("base64");
};

const requestLinePay = async <T>(
  config: LinePayConfig,
  apiPath: string,
  body: Record<string, unknown>,
) => {
  const nonce = randomUUID();
  const bodyText = JSON.stringify(body);
  const response = await fetch(`${config.apiBaseUrl}${apiPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-LINE-ChannelId": config.channelId,
      "X-LINE-Authorization-Nonce": nonce,
      "X-LINE-Authorization": createSignature(
        config.channelSecret,
        apiPath,
        bodyText,
        nonce,
      ),
    },
    body: bodyText,
  });

  const text = await response.text();
  let parsedBody: LinePayResponse<T> | undefined;

  try {
    parsedBody = JSON.parse(text) as LinePayResponse<T>;
  } catch (error) {
    logger.error("Failed to parse LINE Pay response", {text, error});
    throw new Error(`LINE Pay returned a non-JSON response: ${text}`);
  }

  return {
    ok: response.ok,
    status: response.status,
    body: parsedBody,
  };
};

const toPositiveInteger = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.round(parsed);
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const hello = onRequest((req, res) => {
  if (handlePreflight(req, res)) {
    return;
  }

  logger.info("Hello logs!", {structuredData: true});
  res.send("Hello from Firebase!");
});

export const linePayTestRequest = onRequest(async (req, res) => {
  if (handlePreflight(req, res)) {
    return;
  }
  setCorsHeaders(res);

  if (!["GET", "POST"].includes(req.method)) {
    res.status(405).json({error: "Method not allowed"});
    return;
  }

  try {
    const config = getLinePayConfig();
    const amount = toPositiveInteger(
      req.body?.amount ?? req.query.amount,
      10,
    );
    const currency = String(
      req.body?.currency ?? req.query.currency ?? DEFAULT_CURRENCY,
    ).toUpperCase();
    const productName = String(
      req.body?.productName ?? req.query.productName ?? "LINE Pay 測試商品",
    );
    const packageName = String(
      req.body?.packageName ?? req.query.packageName ?? "LINE Pay 測試包裹",
    );
    const orderId = `test-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const baseUrl = getBaseUrl(req, config);
    const confirmUrl =
      `${baseUrl}/linePayTestConfirm?amount=${amount}&currency=${currency}`;
    const cancelUrl =
      `${baseUrl}/linePayTestCancel?orderId=${encodeURIComponent(orderId)}`;

    const payload = {
      amount,
      currency,
      orderId,
      packages: [
        {
          id: "test-package-1",
          amount,
          name: packageName,
          products: [
            {
              id: "test-product-1",
              name: productName,
              quantity: 1,
              price: amount,
            },
          ],
        },
      ],
      redirectUrls: {
        confirmUrl,
        cancelUrl,
      },
    };

    const linePayResponse = await requestLinePay<LinePayRequestPaymentInfo>(
      config,
      "/v3/payments/request",
      payload,
    );

    logger.info("LINE Pay request created", {
      orderId,
      amount,
      linePayResponse: linePayResponse.body,
    });

    res.status(linePayResponse.ok ? 200 : 502).json({
      success: linePayResponse.body.returnCode === "0000",
      orderId,
      requestPayload: payload,
      linePay: linePayResponse.body,
      paymentPageUrl: linePayResponse.body.info?.paymentUrl?.web ?? null,
      paymentAppUrl: linePayResponse.body.info?.paymentUrl?.app ?? null,
      transactionId: linePayResponse.body.info?.transactionId ?? null,
    });
  } catch (error) {
    logger.error("LINE Pay request failed", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export const linePayTestConfirm = onRequest(async (req, res) => {
  if (handlePreflight(req, res)) {
    return;
  }
  setCorsHeaders(res);

  if (!["GET", "POST"].includes(req.method)) {
    res.status(405).json({error: "Method not allowed"});
    return;
  }

  const transactionId = String(
    req.query.transactionId ?? req.body?.transactionId ?? "",
  );
  const orderId = String(req.query.orderId ?? req.body?.orderId ?? "");
  const amount = toPositiveInteger(
    req.query.amount ?? req.body?.amount,
    10,
  );
  const currency = String(
    req.query.currency ?? req.body?.currency ?? DEFAULT_CURRENCY,
  ).toUpperCase();

  if (!transactionId) {
    res.status(400).json({
      success: false,
      error: "Missing transactionId",
    });
    return;
  }

  try {
    const config = getLinePayConfig();
    const apiPath = `/v3/payments/${transactionId}/confirm`;
    const payload = {amount, currency};
    const linePayResponse = await requestLinePay(config, apiPath, payload);

    logger.info("LINE Pay payment confirmed", {
      transactionId,
      orderId,
      amount,
      linePayResponse: linePayResponse.body,
    });

    const responsePayload = {
      success: linePayResponse.body.returnCode === "0000",
      transactionId,
      orderId,
      amount,
      currency,
      linePay: linePayResponse.body,
    };

    const wantsHtml =
      String(req.query.format ?? "").toLowerCase() !== "json" &&
      (req.method === "GET" || req.headers.accept?.includes("text/html"));

    if (wantsHtml) {
      const title = responsePayload.success ?
        "LINE Pay 測試付款成功" :
        "LINE Pay 測試付款失敗";
      res
        .status(linePayResponse.ok ? 200 : 502)
        .set("Content-Type", "text/html; charset=utf-8")
        .send(`<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #f5f7fb;
        color: #1f2937;
        margin: 0;
        padding: 32px;
      }
      .card {
        max-width: 720px;
        margin: 0 auto;
        background: #fff;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
      }
      h1 { margin: 0 0 16px; font-size: 28px; }
      p { margin: 0 0 12px; line-height: 1.6; }
      pre {
        background: #0f172a;
        color: #e2e8f0;
        padding: 16px;
        border-radius: 12px;
        overflow: auto;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>${escapeHtml(title)}</h1>
      <p>orderId: ${escapeHtml(orderId || "-")}</p>
      <p>transactionId: ${escapeHtml(transactionId)}</p>
      <p>amount: ${escapeHtml(String(amount))} ${escapeHtml(currency)}</p>
      <pre>${escapeHtml(JSON.stringify(responsePayload, null, 2))}</pre>
    </main>
  </body>
</html>`);
      return;
    }

    res.status(linePayResponse.ok ? 200 : 502).json(responsePayload);
  } catch (error) {
    logger.error("LINE Pay confirm failed", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export const linePayTestCancel = onRequest((req, res) => {
  if (handlePreflight(req, res)) {
    return;
  }
  setCorsHeaders(res);

  const orderId = String(req.query.orderId ?? "");
  res.set("Content-Type", "text/html; charset=utf-8").send(`<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>LINE Pay 測試付款已取消</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #fff7ed;
        color: #7c2d12;
        margin: 0;
        padding: 32px;
      }
      .card {
        max-width: 720px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 18px 50px rgba(124, 45, 18, 0.08);
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>LINE Pay 測試付款已取消</h1>
      <p>orderId: ${escapeHtml(orderId || "-")}</p>
    </main>
  </body>
</html>`);
});
