<script setup>
import { defineModel } from 'vue';

const isOpen = defineModel({ type: Boolean, default: false });
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="isOpen = false">
    <div class="modal-content">
      <button class="modal-close" @click="isOpen = false">&times;</button>
      <h2 class="modal-title">登入 / 註冊</h2>
      <div class="login-options">
        <button class="oauth-btn google-btn">
          <span class="icon">G</span> 繼續使用 Google
        </button>
        <button class="oauth-btn fb-btn">
          <span class="icon">f</span> 繼續使用 Facebook
        </button>
        
        <div class="divider">
          <span>或使用電子郵件</span>
        </div>
        
        <form class="email-login-form" @submit.prevent>
          <input type="email" placeholder="電子郵件信箱" class="login-input" required />
          <input type="password" placeholder="密碼" class="login-input" required />
          <button type="submit" class="submit-btn">登入</button>
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

.submit-btn:hover {
  opacity: 0.9;
}
</style>
