<template>
  <div class="page">
    <header class="hero">
      <nav class="nav">
        <div class="brand">
          <span class="brand-mark">M</span>
          <span class="brand-name">MapleSearch</span>
        </div>
        <div class="nav-links">
          <a href="#" class="nav-link">Features</a>
          <a href="#" class="nav-link">Pricing</a>
          <a href="#" class="nav-link">Docs</a>
        </div>
        <div class="nav-actions">
          <button class="theme-toggle" @click="isDark = !isDark">
            {{ isDark ? "Light Mode" : "Dark Mode" }}
          </button>
          <NuxtLink to="/search" class="cta secondary">前往搜尋頁</NuxtLink>
          <button class="cta login-btn" @click="showLoginModal = true">登入</button>
        </div>
      </nav>

      <div class="hero-body">
        <p class="eyebrow">Fast, focused search for teams</p>
        <h1 class="title">Search smarter. Ship faster.</h1>
        <p class="subtitle">
          A clean, custom homepage to help users find exactly what they need
          with one simple query.
        </p>

        <div class="search-card">
          <input
            class="search-input"
            type="text"
            placeholder="Search products, docs, or answers..."
          />
          <button class="search-btn">Search</button>
        </div>

        <div class="api-panel">
          <button class="api-btn" @click="fetchApi" :disabled="isLoading">
            {{ isLoading ? "Loading..." : "載入 API 資料" }}
          </button>
          <p v-if="apiError" class="api-error">{{ apiError }}</p>
          <pre v-if="apiData" class="api-output">{{
            JSON.stringify(apiData, null, 2)
          }}</pre>
        </div>

        <div class="hero-stats">
          <div class="stat">
            <div class="stat-value">98%</div>
            <div class="stat-label">Answer accuracy</div>
          </div>
          <div class="stat">
            <div class="stat-value">120ms</div>
            <div class="stat-label">Avg. response time</div>
          </div>
          <div class="stat">
            <div class="stat-value">3x</div>
            <div class="stat-label">Faster onboarding</div>
          </div>
        </div>
      </div>
    </header>

    <main class="content">
      <section class="feature-grid">
        <article class="feature">
          <h3 class="feature-title">Unified results</h3>
          <p class="feature-text">
            Search docs, tickets, and knowledge in a single place.
          </p>
        </article>
        <article class="feature">
          <h3 class="feature-title">Team-ready</h3>
          <p class="feature-text">
            Share answers instantly with smart snippets and links.
          </p>
        </article>
        <article class="feature">
          <h3 class="feature-title">Custom signals</h3>
          <p class="feature-text">
            Prioritize results that matter most to your workflow.
          </p>
        </article>
      </section>

      <section class="cta-band">
        <div>
          <h2 class="cta-title">Ready to personalize your homepage?</h2>
          <p class="cta-text">
            Drop in your brand, colors, and copy in minutes.
          </p>
        </div>
        <button class="cta secondary">View Templates</button>
      </section>
    </main>

    <!-- Login Modal Component -->
    <LoginModal v-model="showLoginModal" />
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";
import { apiGet } from "~/composables/useApi";
import { useApiStore } from "~/stores/api";

const isDark = ref(false);
const showLoginModal = ref(false);
const apiStore = useApiStore();
const { apiData, apiError, isLoading, area } = storeToRefs(apiStore);

const applyTheme = (value) => {
  const theme = value ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
};

onMounted(() => {
  fetchApi();
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

const fetchApi = async () => {
  apiStore.setApiError("");
  apiStore.setLoading(true);
  try {
    const map = await apiGet("/map.json");
    const data = await apiGet("/map_exception.json");
    const area = await apiGet("/area.json");
    const monster = await apiGet("/mob.json");

    apiStore.setMapData(map);
    apiStore.setApiData(data);
    apiStore.setAreaData(area);
    apiStore.setMonsterData(monster);
  } catch (error) {
    apiStore.setApiError("API 讀取失敗，請稍後再試。");
  } finally {
    apiStore.setLoading(false);
  }
};
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

.page {
  min-height: 100vh;
  background:
    radial-gradient(
      1200px 500px at 10% 5%,
      var(--bg-accent-1) 0%,
      transparent 70%
    ),
    radial-gradient(
      900px 400px at 90% 10%,
      var(--bg-accent-2) 0%,
      transparent 60%
    ),
    var(--bg);
}

.hero {
  padding: 28px 8vw 64px;
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

.hero-body {
  max-width: 680px;
  margin-top: 72px;
}

.eyebrow {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 2px;
  color: #b7652b;
  margin-bottom: 12px;
}

.title {
  font-size: clamp(36px, 5vw, 56px);
  margin: 0 0 16px;
  line-height: 1.05;
}

.subtitle {
  font-size: 18px;
  line-height: 1.6;
  margin: 0 0 28px;
  color: var(--text-muted);
}

.search-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: var(--card);
  border-radius: 20px;
  box-shadow: 0 20px 40px var(--shadow);
}

.search-input {
  flex: 1;
  border: none;
  font-size: 16px;
  padding: 12px 14px;
  outline: none;
  background: rgba(244, 246, 248, 0.8);
  border-radius: 14px;
}

.search-btn {
  padding: 12px 22px;
  border: none;
  background: var(--accent);
  color: var(--brand);
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
}

.api-panel {
  margin-top: 18px;
  display: grid;
  gap: 10px;
}

.api-btn {
  align-self: flex-start;
  border: 1px solid var(--brand);
  background: transparent;
  color: var(--brand);
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.api-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.api-error {
  margin: 0;
  color: #c44b4b;
}

.api-output {
  margin: 0;
  padding: 14px;
  border-radius: 12px;
  background: var(--card);
  box-shadow: 0 10px 20px var(--shadow);
  font-size: 12px;
  max-height: 220px;
  overflow: auto;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.stat {
  background: var(--card-glass);
  padding: 16px;
  border-radius: 16px;
  backdrop-filter: blur(6px);
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
}

.stat-label {
  font-size: 13px;
  color: #47627c;
}

.content {
  padding: 0 8vw 80px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  margin-top: -28px;
}

.feature {
  background: var(--card);
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 18px 30px rgba(28, 61, 90, 0.08);
}

.feature-title {
  margin: 0 0 10px;
}

.feature-text {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.5;
}

.cta-band {
  margin-top: 40px;
  padding: 28px;
  background: var(--brand);
  color: var(--brand-contrast);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.cta-title {
  margin: 0 0 8px;
}

.cta-text {
  margin: 0;
  opacity: 0.8;
}

@media (max-width: 900px) {
  .nav-links {
    display: none;
  }

  .nav-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .hero-body {
    margin-top: 48px;
  }

  .hero-stats,
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .cta-band {
    flex-direction: column;
    align-items: flex-start;
  }
}


</style>
