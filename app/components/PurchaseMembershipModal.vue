<script setup>
import { defineModel, ref } from "vue";

const isOpen = defineModel({ type: Boolean, default: false });
const isLoading = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

const handlePurchase = async () => {
  errorMsg.value = "";
  successMsg.value = "";
  isLoading.value = true;
  
  try {
    // 你的 linePayTestRequest 是 onRequest 型態，所以我們改用標準的 fetch 來呼叫
    const response = await fetch('https://us-central1-maplesearch-cee92.cloudfunctions.net/linePayTestRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 150, // 測試金額
        currency: 'TWD',
        productName: '進階會員 (測試)',
        packageName: '會員升級'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API 回傳結果:", data);

    if (data.success && data.paymentPageUrl) {
      successMsg.value = "取得付款連結成功！即將導向 LINE Pay...";
      setTimeout(() => {
        window.location.href = data.paymentPageUrl;
      }, 1000);
    } else {
      throw new Error("無法取得付款連結");
    }
  } catch (error) {
    console.error("購買處理失敗:", error);
    errorMsg.value = "處理失敗：" + error.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="isOpen = false">
    <div class="modal-content">
      <button class="modal-close" @click="isOpen = false">&times;</button>
      <h2 class="modal-title">購買會員</h2>
      
      <div class="purchase-content">
        <p>確認要升級為進階會員嗎？</p>
        <p class="description">這將會呼叫您建立的 Firebase Function 進行測試。</p>
        
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>

        <div class="actions">
          <button 
            class="cancel-btn" 
            type="button" 
            @click="isOpen = false"
            :disabled="isLoading"
          >
            取消
          </button>
          <button 
            class="confirm-btn" 
            type="button" 
            @click="handlePurchase"
            :disabled="isLoading"
          >
            {{ isLoading ? "處理中..." : "確定購買" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.purchase-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.description {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: -8px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 12px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.2s;
  border: none;
}

.cancel-btn {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--text-muted);
}

.cancel-btn:hover:not(:disabled) {
  background: var(--bg);
}

.confirm-btn {
  background: var(--accent);
  color: #fff; /* or var(--brand-contrast) depending on theme */
}

.confirm-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.confirm-btn:disabled, .cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  color: #e74c3c;
  font-size: 13px;
  margin: 0;
  text-align: left;
}

.success-msg {
  color: #1f7a1f;
  font-size: 13px;
  margin: 0;
  text-align: left;
}
</style>
