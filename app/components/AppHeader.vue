<template>
  <header class="app-header">
    <nav class="nav">
      <NuxtLink to="/" class="brand">
        <span class="brand-mark">M</span>
        <span class="brand-name">MapleSearch</span>
      </NuxtLink>
      <div class="nav-actions">
        <button class="theme-toggle" @click="isDark = !isDark">
          {{ isDark ? "Light Mode" : "Dark Mode" }}
        </button>
        <NuxtLink to="/bossBirth" class="cta secondary">怪物重生</NuxtLink>
        <NuxtLink to="/search" class="cta secondary">前往搜尋頁</NuxtLink>
        <template v-if="authStore.isLoggedIn">
          <span class="user-greeting">Hi, {{ authStore.user?.displayName || "User" }}</span>
          <button class="cta secondary logout-btn" @click="handleLogout">登出</button>
        </template>
        <template v-else>
          <button class="cta login-btn" @click="showLoginModal = true">登入</button>
        </template>
      </div>
    </nav>

    <LoginModal v-model="showLoginModal" />
  </header>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { getAuth, signOut } from "firebase/auth";
import { useAuthStore } from "~/stores/auth";

defineProps({
  showLinks: {
    type: Boolean,
    default: true,
  },
});

const authStore = useAuthStore();
const isDark = ref(false);
const showLoginModal = ref(false);

const handleLogout = async () => {
  try {
    const auth = getAuth();
    await signOut(auth);
  } catch (error) {
    console.error("登出失敗:", error);
  }
};

const applyTheme = (value) => {
  const theme = value ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
};

onMounted(() => {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") {
    isDark.value = saved === "dark";
  } else if (window.matchMedia) {
    isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  applyTheme(isDark.value);
});

watch(isDark, (value) => {
  applyTheme(value);
});
</script>

<style scoped>
:global(:root) {
  --bg: #f6f2ea;
  --bg-accent-1: #ffe9c6;
  --bg-accent-2: #d7f0ff;
  --text: #0f1b2d;
  --text-muted: #2c4158;
  --brand: #1c3d5a;
  --brand-contrast: #fff4dc;
  --accent: #ffb44d;
  --card: #ffffff;
  --card-glass: rgba(255, 255, 255, 0.65);
  --shadow: rgba(28, 61, 90, 0.12);
}

:global([data-theme="dark"]) {
  --bg: #0b121c;
  --bg-accent-1: rgba(255, 180, 77, 0.18);
  --bg-accent-2: rgba(127, 208, 255, 0.2);
  --text: #ecf1f7;
  --text-muted: #b3c0d4;
  --brand: #9dd2ff;
  --brand-contrast: #0b121c;
  --accent: #ffb44d;
  --card: #121b28;
  --card-glass: rgba(18, 27, 40, 0.7);
  --shadow: rgba(0, 0, 0, 0.4);
}

:global(body) {
  margin: 0;
  font-family: "Space Grotesk", "Trebuchet MS", sans-serif;
  color: var(--text);
  background: var(--bg);
}

.app-header {
  width: 100%;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: inherit;
  text-decoration: none;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--brand);
  color: var(--brand-contrast);
  font-size: 18px;
}

.brand-name {
  font-size: 18px;
  letter-spacing: 0.4px;
}

.nav-links {
  display: flex;
  gap: 20px;
  font-size: 14px;
}

.nav-link {
  text-decoration: none;
  color: var(--brand);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.user-greeting {
  font-weight: 600;
  font-size: 15px;
  color: var(--text);
  margin-right: 8px;
}

.theme-toggle {
  border: 1px solid var(--brand);
  background: transparent;
  color: var(--brand);
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.cta {
  border: none;
  background: var(--brand);
  color: var(--brand-contrast);
  padding: 10px 18px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.cta.secondary {
  background: var(--brand-contrast);
  color: var(--brand);
  border: 1px solid var(--brand);
}

.login-btn,
.logout-btn {
  font: inherit;
}

@media (max-width: 960px) {
  .nav {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav-links,
  .nav-actions {
    width: 100%;
  }

  .nav-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .nav-links {
    flex-wrap: wrap;
  }
}
</style>
