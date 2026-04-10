<script setup lang="ts">
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD9xCT9U1z6tGRAMEz9kS-glyfaPewEouQ",
  authDomain: "maplesearch-cee92.firebaseapp.com",
  projectId: "maplesearch-cee92",
  storageBucket: "maplesearch-cee92.firebasestorage.app",
  messagingSenderId: "82569881003",
  appId: "1:82569881003:web:623e3c08a80b4a15b89eee",
  measurementId: "G-WSZNYBV1E2",
};

const { $pwa } = useNuxtApp();

onMounted(async () => {
  if (process.client) {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    console.log('app',app) //可以初始化有沒有成功
    if (await isSupported()) {
      getAnalytics(app);
    }

    // ========== Firebase 接收推播設定 ==========
    try {
      const messaging = getMessaging(app);
      
      // 請求通知權限並獲取 Token
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: 'BFOQRXQEq6FyYvcB5QDhyfUchTJ5Z9_Ce3JNYC0-m8mx7FDzpcmwy5uHntBjpEzPS3XtsLJ2n0Hv1YBeJERp5nk' // (需到 Firebase console -> 專案設定 -> 雲端通訊 -> Web 設定 產生/取得)
        });
        
        if (token) {
          console.log('成功取得 FCM Token: ', token);
          // alert('成功取得 FCM Token: ' + token);
          // TODO: 將 token 傳到你的後端伺服器儲存，以便發送推播
        } else {
          console.warn('無法獲取 FCM Token。');
        }
      } else {
        console.warn('使用者尚未允許通知權限');
      }

      // 接聽前景推播訊息
      onMessage(messaging, (payload) => {
        console.log('收到前景推播: ', payload);
        if (payload.notification) {
          // TODO: 這裡你可以使用 UI 元件 (如 Toast 或 ElNotification) 改善預設的 alert 體驗
          alert(`推播通知\n標題: ${payload.notification.title}\n內容: ${payload.notification.body}`);
        }
      });
    } catch (error) {
      console.error('Firebase 推播功能初始化失敗:', error);
    }
    // ===========================================
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    console.log("🔥 可以安裝了", e);
  });
  // if ($pwa) {
  //   $pwa.on('beforeinstallprompt', (event) => {
  //     // 阻止默认的安装提示
  //     event.preventDefault();
  //     // 显示自定义的安装提示
  //     $pwa.showInstallPrompt = true;
  //   });
  // }
});
</script>

<template>
  <div>
    <NuxtPwaManifest />
    <!-- <NuxtRouteAnnouncer /> -->
    <NuxtPage />

    <div
      v-if="$pwa?.showInstallPrompt"
      class="pwa-install-banner"
      role="dialog"
      aria-live="polite"
    >
      <div class="pwa-install-text">安裝 MapleSearch，離線也能快速開啟</div>
      <div class="pwa-install-actions">
        <button
          class="pwa-install-primary"
          type="button"
          @click="$pwa.install()"
        >
          安裝
        </button>
        <button
          class="pwa-install-ghost"
          type="button"
          @click="$pwa.cancelInstall()"
        >
          稍後
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pwa-install-banner {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #0f172a;
  color: #f8fafc;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.28);
  z-index: 50;
}

.pwa-install-text {
  font-size: 14px;
  letter-spacing: 0.2px;
}

.pwa-install-actions {
  display: flex;
  gap: 8px;
}

.pwa-install-primary,
.pwa-install-ghost {
  appearance: none;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
}

.pwa-install-primary {
  background: #38bdf8;
  color: #0f172a;
  border-color: #38bdf8;
}

.pwa-install-ghost {
  background: transparent;
  color: #e2e8f0;
  border-color: rgba(226, 232, 240, 0.3);
}
</style>
