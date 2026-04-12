<script setup>
import { defineModel, ref } from 'vue';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";

const isOpen = defineModel({ type: Boolean, default: false });

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoginMode = ref(true); // true = 登入, false = 註冊
const isLoading = ref(false);

const handleGoogleLogin = async () => {
  errorMsg.value = '';
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Google 登入成功:", result.user);
    isOpen.value = false;
  } catch (error) {
    console.error("Google 登入失敗:", error);
    errorMsg.value = "Google 登入失敗: " + error.message;
  }
};

const handleFacebookLogin = async () => {
  errorMsg.value = '';
  const auth = getAuth();
  const provider = new FacebookAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Facebook 登入成功:", result.user);
    isOpen.value = false;
  } catch (error) {
    console.error("Facebook 登入失敗:", error);
    errorMsg.value = "Facebook 登入失敗: " + error.message;
  }
};

const handleEmailAuth = async () => {
  if (!email.value || !password.value) {
    errorMsg.value = '請填寫電子郵件與密碼';
    return;
  }
  errorMsg.value = '';
  isLoading.value = true;
  
  const auth = getAuth();
  try {
    if (isLoginMode.value) {
      const result = await signInWithEmailAndPassword(auth, email.value, password.value);
      console.log("Email 登入成功:", result.user);
    } else {
      const result = await createUserWithEmailAndPassword(auth, email.value, password.value);
      console.log("Email 註冊成功:", result.user);
    }
    isOpen.value = false;
    email.value = '';
    password.value = '';
  } catch (error) {
    console.error("Email 驗證失敗:", error);
    errorMsg.value = (isLoginMode.value ? "登入失敗: " : "註冊失敗: ") + error.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="isOpen = false">
    <div class="modal-content">
      <button class="modal-close" @click="isOpen = false">&times;</button>
      <h2 class="modal-title">{{ isLoginMode ? '登入' : '註冊' }}</h2>
      <div class="login-options">
        <button class="oauth-btn google-btn" type="button" @click="handleGoogleLogin">
          <span class="icon">G</span> 繼續使用 Google
        </button>
        <button class="oauth-btn fb-btn" type="button" @click="handleFacebookLogin">
          <span class="icon">f</span> 繼續使用 Facebook
        </button>
        
        <div class="divider">
          <span>或使用電子郵件</span>
        </div>
        
        <form class="email-login-form" @submit.prevent="handleEmailAuth">
          <input type="email" v-model="email" placeholder="電子郵件信箱" class="login-input" required />
          <input type="password" v-model="password" placeholder="密碼" class="login-input" required />
          
          <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
          
          <button type="submit" class="submit-btn" :disabled="isLoading">
            {{ isLoading ? '處理中...' : (isLoginMode ? '登入' : '註冊') }}
          </button>
          
          <div class="toggle-mode">
            <span v-if="isLoginMode">還沒有帳號？ <a href="#" @click.prevent="isLoginMode = false">點此註冊</a></span>
            <span v-else>已經有帳號了？ <a href="#" @click.prevent="isLoginMode = true">點此登入</a></span>
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
  from { opacity: 0; }
  to { opacity: 1; }
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
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
  transition: opacity 0.2s, border-color 0.2s;
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
