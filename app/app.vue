<script setup lang="ts">
const { $pwa } = useNuxtApp();

onMounted(() => {
  console.log(111, $pwa?.showInstallPrompt);

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
