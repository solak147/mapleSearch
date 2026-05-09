<script setup>
import { defineModel, onMounted, ref } from "vue";
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  EmailAuthProvider,
  EmailAuthCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  linkWithPopup,
  OAuthCredential,
} from "firebase/auth";
import { getFirebaseAuth } from "~/utils/firebase";

const isOpen = defineModel({ type: Boolean, default: false });

const email = ref("");
const password = ref("");
const errorMsg = ref("");
const isLoginMode = ref(true); // true = 登入, false = 註冊
const isLoading = ref(false);
const pendingLinkStorageKey = "pending-auth-link";

const providerLabels = {
  "google.com": "Google",
  "facebook.com": "Facebook",
  password: "電子郵件密碼",
};

const closeModal = () => {
  isOpen.value = false;
  email.value = "";
  password.value = "";
};

const getProviderLabel = (providerId) =>
  providerLabels[providerId] || providerId;

const savePendingLink = (
  credential,
  conflictEmail,
  providerName,
  providerId = credential.providerId,
) => {
  if (!process.client) {
    return;
  }

  sessionStorage.setItem(
    pendingLinkStorageKey,
    JSON.stringify({
      credential: credential.toJSON(),
      conflictEmail,
      providerName,
      providerId,
    }),
  );
};

const getPendingLink = () => {
  if (!process.client) {
    return null;
  }

  const raw = sessionStorage.getItem(pendingLinkStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem(pendingLinkStorageKey);
    return null;
  }
};

const clearPendingLink = () => {
  if (!process.client) {
    return;
  }

  sessionStorage.removeItem(pendingLinkStorageKey);
};

const createEmailCredential = (inputEmail, inputPassword) =>
  EmailAuthProvider.credential(inputEmail.trim(), inputPassword);

const createGoogleProvider = () => {
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  return provider;
};

const createFacebookProvider = () => {
  const provider = new FacebookAuthProvider();
  provider.addScope("email");
  return provider;
};

const tryLinkStoredCredential = async (user) => {
  const pendingLink = getPendingLink();
  if (!pendingLink?.credential || !user) {
    return false;
  }

  const restoredCredential =
    pendingLink.providerId === "password"
      ? EmailAuthCredential.fromJSON(pendingLink.credential)
      : OAuthCredential.fromJSON(pendingLink.credential);
  if (!restoredCredential) {
    clearPendingLink();
    return false;
  }

  try {
    await linkWithCredential(user, restoredCredential);
    clearPendingLink();
    console.log(
      `${pendingLink.providerName || "社群帳號"} 已綁定到既有帳號:`,
      user.email,
    );
    return true;
  } catch (error) {
    if (
      error.code === "auth/provider-already-linked" ||
      error.code === "auth/credential-already-in-use"
    ) {
      clearPendingLink();
      return true;
    }

    throw error;
  }
};

const handleProviderLogin = async (provider, providerId, providerName) => {
  errorMsg.value = "";
  isLoading.value = true;
  const auth = getFirebaseAuth();

  try {
    if (
      auth.currentUser &&
      !auth.currentUser.isAnonymous &&
      auth.currentUser.providerData.some(
        (linkedProvider) => linkedProvider.providerId !== providerId,
      )
    ) {
      const result = await linkWithPopup(auth.currentUser, provider);
      console.log(`${providerName} 綁定成功:`, result.user);
      closeModal();
      return;
    }

    const result = await signInWithPopup(auth, provider);
    await tryLinkStoredCredential(result.user);
    console.log(`${providerName} 登入成功:`, result.user);
    closeModal();
  } catch (error) {
    try {
      if (error.code === "auth/account-exists-with-different-credential") {
        const pendingCredential =
          providerId === "google.com"
            ? GoogleAuthProvider.credentialFromError(error)
            : FacebookAuthProvider.credentialFromError(error);
        const conflictEmail = error.customData?.email;

        if (!pendingCredential) {
          throw error;
        }

        if (!conflictEmail) {
          throw new Error(
            `${providerName} 沒有回傳 email，無法自動綁定。請先用原本帳號登入後，再點 ${providerName} 進行綁定。`,
          );
        }

        savePendingLink(pendingCredential, conflictEmail, providerName);
        errorMsg.value = `${conflictEmail} 已有既有帳號。請先用原本登入方式登入，登入成功後我會自動綁定 ${providerName}。`;
        return;
      }

      if (error.code === "auth/credential-already-in-use") {
        errorMsg.value = `${providerName} 已經綁定到其他帳號，請改用原本的登入方式。`;
        return;
      }

      if (error.code === "auth/provider-already-linked") {
        errorMsg.value = `${providerName} 已經綁定在目前帳號。`;
        return;
      }

      throw error;
    } catch (handledError) {
      console.error(`${providerName} 登入失敗:`, handledError);
      errorMsg.value = `${providerName} 登入失敗: ${handledError.message}`;
    }
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleLogin = async () =>
  handleProviderLogin(createGoogleProvider(), "google.com", "Google");

const handleFacebookLogin = async () =>
  handleProviderLogin(createFacebookProvider(), "facebook.com", "Facebook");

const handleEmailAuth = async () => {
  if (!email.value || !password.value) {
    errorMsg.value = "請填寫電子郵件與密碼";
    return;
  }
  errorMsg.value = "";
  isLoading.value = true;

  const auth = getFirebaseAuth();
  const normalizedEmail = email.value.trim();
  const emailCredential = createEmailCredential(normalizedEmail, password.value);
  try {
    if (auth.currentUser && !auth.currentUser.isAnonymous) {
      const currentEmail = auth.currentUser.email?.trim().toLowerCase();
      if (currentEmail && currentEmail !== normalizedEmail.toLowerCase()) {
        throw new Error("目前登入中的帳號信箱不同，請使用相同信箱進行綁定。");
      }

      await linkWithCredential(auth.currentUser, emailCredential);
      console.log("Email 密碼已綁定到目前帳號:", auth.currentUser);
      closeModal();
      return;
    }

    if (isLoginMode.value) {
      const result = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password.value,
      );
      await tryLinkStoredCredential(result.user);
      console.log("Email 登入成功:", result.user);
    } else {
      const result = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password.value,
      );
      await tryLinkStoredCredential(result.user);
      console.log("Email 註冊成功:", result.user);
    }
    closeModal();
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      savePendingLink(emailCredential, normalizedEmail, "電子郵件密碼", "password");
      errorMsg.value = `${normalizedEmail} 已有既有帳號。請先用 Google 或 Facebook 登入，登入成功後我會自動綁定電子郵件密碼。`;
      isLoading.value = false;
      return;
    }

    if (error.code === "auth/provider-already-linked") {
      errorMsg.value = "電子郵件密碼已經綁定在目前帳號。";
      isLoading.value = false;
      return;
    }

    if (error.code === "auth/credential-already-in-use") {
      errorMsg.value = "這組電子郵件密碼已經綁定到其他帳號。";
      isLoading.value = false;
      return;
    }

    console.error("Email 驗證失敗:", error);
    errorMsg.value =
      (isLoginMode.value ? "登入失敗: " : "註冊失敗: ") + error.message;
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  const auth = getFirebaseAuth();
  if (auth.currentUser) {
    try {
      await tryLinkStoredCredential(auth.currentUser);
    } catch (error) {
      console.error("自動綁定待處理 credential 失敗:", error);
    }
  }
});
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="isOpen = false">
    <div class="modal-content">
      <button class="modal-close" @click="isOpen = false">&times;</button>
      <h2 class="modal-title">{{ isLoginMode ? "登入" : "註冊" }}</h2>
      <div class="login-options">
        <button
          class="oauth-btn google-btn"
          type="button"
          @click="handleGoogleLogin"
        >
          <span class="icon">G</span> 繼續使用 Google
        </button>
        <button
          class="oauth-btn fb-btn"
          type="button"
          @click="handleFacebookLogin"
        >
          <span class="icon">f</span> 繼續使用 Facebook
        </button>

        <div class="divider">
          <span>或使用電子郵件</span>
        </div>

        <form class="email-login-form" @submit.prevent="handleEmailAuth">
          <input
            type="email"
            v-model="email"
            placeholder="電子郵件信箱"
            class="login-input"
            required
          />
          <input
            type="password"
            v-model="password"
            placeholder="密碼"
            class="login-input"
            required
          />

          <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            {{ isLoading ? "處理中..." : isLoginMode ? "登入" : "註冊" }}
          </button>

          <div class="toggle-mode">
            <span v-if="isLoginMode"
              >還沒有帳號？
              <a href="#" @click.prevent="isLoginMode = false"
                >點此註冊</a
              ></span
            >
            <span v-else
              >已經有帳號了？
              <a href="#" @click.prevent="isLoginMode = true">點此登入</a></span
            >
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Login Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--card);
  width: 90%;
  max-width: 400px;
  border-radius: 24px;
  padding: 36px 32px;
  box-shadow: 0 24px 48px var(--shadow);
  position: relative;
  text-align: center;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
}

.modal-close:hover {
  background: var(--bg);
}

.modal-title {
  margin: 0 0 24px;
  font-size: 22px;
}

.login-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.oauth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.google-btn {
  background: #ffffff;
  color: #757575;
  border: 1px solid #e0e0e0;
}
.google-btn:hover {
  background: #f1f1f1;
}

.fb-btn {
  background: #1877f2;
  color: #ffffff;
  border: none;
}
.fb-btn:hover {
  background: #166fe5;
}

.icon {
  font-weight: bold;
  font-size: 18px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 16px 0;
  color: var(--text-muted);
  font-size: 13px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid var(--text-muted);
  opacity: 0.2;
}

.divider span {
  padding: 0 10px;
}

.email-login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-input {
  border: 1px solid var(--text-muted);
  opacity: 0.5;
  font-size: 15px;
  padding: 12px 14px;
  outline: none;
  background: transparent;
  border-radius: 12px;
  color: var(--text);
  transition:
    opacity 0.2s,
    border-color 0.2s;
}

.login-input:focus {
  opacity: 1;
  border-color: var(--brand);
}

.submit-btn {
  border: none;
  background: var(--brand);
  color: var(--brand-contrast);
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
  padding: 12px;
  font-size: 16px;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  color: #e74c3c;
  font-size: 13px;
  margin: 0;
  text-align: left;
}

.toggle-mode {
  font-size: 13px;
  margin-top: 10px;
  color: var(--text-muted);
}

.toggle-mode a {
  color: var(--brand);
  text-decoration: none;
  font-weight: 600;
}

.toggle-mode a:hover {
  text-decoration: underline;
}
</style>
