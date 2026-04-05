import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";

let cachedApi: AxiosInstance | null = null;

export const useApi = () => {
  if (cachedApi) {
    return cachedApi;
  }

  const config = useRuntimeConfig();
  cachedApi = axios.create({
    baseURL: config.public.apiBase,
    timeout: 10000,
  });

  cachedApi.interceptors.request.use(
    (request) => {
      const requestId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      request.headers = request.headers ?? {};
      request.headers["X-Request-Id"] = requestId;
      (request as { meta?: { startTime: number; requestId: string } }).meta = {
        startTime: Date.now(),
        requestId,
      };

      if (import.meta.dev) {
        const method = request.method?.toUpperCase() ?? "GET";
        console.debug(
          `[api:request] ${method} ${request.baseURL ?? ""}${request.url ?? ""}`,
        );
      }

      return request;
    },
    (error) => Promise.reject(error),
  );

  cachedApi.interceptors.response.use(
    (response: AxiosResponse) => {
      const meta = (response.config as { meta?: { startTime?: number } }).meta;
      if (import.meta.dev) {
        const method = response.config.method?.toUpperCase() ?? "GET";
        const duration = meta?.startTime
          ? Date.now() - meta.startTime
          : undefined;
        const durationText = duration !== undefined ? ` ${duration}ms` : "";
        console.debug(
          `[api:response] ${method} ${response.config.url ?? ""} ${response.status}${durationText}`,
        );
      }
      return response;
    },
    (error) => {
      if (import.meta.dev) {
        const method = error?.config?.method?.toUpperCase() ?? "GET";
        const url = error?.config?.url ?? "";
        const status = error?.response?.status ?? "NO_RESPONSE";
        console.error(`[api:error] ${method} ${url} ${status}`, error);
      }
      return Promise.reject(error);
    },
  );

  return cachedApi;
};

export const apiGet = async <T = unknown>(
  url: string,
  config?: Parameters<AxiosInstance["get"]>[1],
) => {
  try {
    const api = useApi();
    const response = await api.get<T>(url, config);
    return response.data;
  } catch (error) {
    if (import.meta.dev) {
      console.error("[api:get:error]", error);
    }
    throw error;
  }
};
