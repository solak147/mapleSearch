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
          <NuxtLink to="/bossBirth" class="cta secondary">怪物重生</NuxtLink>
          <NuxtLink to="/search" class="cta secondary">前往搜尋頁</NuxtLink>
          
          <template v-if="authStore.isLoggedIn">
            <span class="user-greeting">Hi, {{ authStore.user?.displayName || 'User' }}</span>
            <button class="cta secondary logout-btn" @click="handleLogout">登出</button>
          </template>
          <template v-else>
            <button class="cta login-btn" @click="showLoginModal = true">登入</button>
          </template>
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
      <section class="media-section">
        <div class="video-container">
          <iframe 
            class="hero-video"
            src="https://www.youtube.com/embed/-9wY4O6AXLg?rel=0&modestbranding=1&autoplay=1&mute=1&loop=1&playlist=-9wY4O6AXLg" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
          </iframe>
        </div>
        
        <div class="carousel-container">
          <div class="carousel">
            <div
              class="carousel-track"
              :style="carouselTrackStyle"
              @transitionend="handleCarouselTransitionEnd"
            >
              <div
                v-for="(img, idx) in displayedCarouselImages"
                :key="`${img}-${idx}`"
                class="carousel-slide"
              >
                <img :src="img" alt="carousel image" class="carousel-image">
              </div>
            </div>
            <button
              v-if="carouselImages.length > 1"
              class="carousel-btn prev"
              @click="prevImage(); resetCarouselAutoPlay()"
            >&lt;</button>
            <button
              v-if="carouselImages.length > 1"
              class="carousel-btn next"
              @click="nextImage(); resetCarouselAutoPlay()"
            >&gt;</button>
            <div v-if="carouselImages.length > 1" class="carousel-indicators">
              <span 
                v-for="(img, idx) in carouselImages" 
                :key="idx" 
                :class="['dot', { active: idx === carouselIndex }]" 
                @click="goToImage(idx)">
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="community-section">
        <div class="section-heading">
          <h2 class="section-title">社群 <span class="section-count">2</span></h2>
        </div>

        <div class="community-grid">
          <a
            class="community-card"
            href="https://www.youtube.com/@artale_tw"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="community-icon youtube-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path
                  d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span class="community-label">Artale Official Youtube!</span>
            <span class="community-more" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path
                  d="M12 7a1.75 1.75 0 1 0 0-3.5A1.75 1.75 0 0 0 12 7Zm0 6.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Zm0 6.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </a>

          <a
            class="community-card"
            href="https://discord.com/invite/pAQYfS2eE5"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="community-icon discord-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path
                  d="M20.3 4.4A16.9 16.9 0 0 0 16.2 3l-.2.4c-.2.5-.4 1-.5 1.5a15.5 15.5 0 0 0-7 0c-.2-.5-.3-1-.5-1.5L7.8 3A16.8 16.8 0 0 0 3.7 4.4C1.1 8.3.4 12 .7 15.6a17 17 0 0 0 5 2.5l1.1-1.8c-.6-.2-1.2-.5-1.8-.8l.4-.3c3.4 1.6 7 1.6 10.4 0l.4.3c-.6.3-1.2.6-1.8.8l1.1 1.8a17 17 0 0 0 5-2.5c.4-4.1-.7-7.8-3.2-11.2ZM8.8 13.4c-.9 0-1.6-.8-1.6-1.9s.7-1.9 1.6-1.9 1.6.8 1.6 1.9-.7 1.9-1.6 1.9Zm6.4 0c-.9 0-1.6-.8-1.6-1.9s.7-1.9 1.6-1.9 1.6.8 1.6 1.9-.7 1.9-1.6 1.9Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span class="community-label">Artale Official Discord!</span>
          </a>
        </div>
      </section>

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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { apiGet } from "~/composables/useApi";
import { useApiStore } from "~/stores/api";
import { useAuthStore } from "~/stores/auth";
import { getAuth, signOut } from "firebase/auth";

const isDark = ref(false);
const showLoginModal = ref(false);
const carouselImages = ref([
  "https://mod-file.dn.nexoncdn.co.kr/game/cabbc2ce91844c79989b18931fe492fe/20372000134359036_1767833892263_f7403765-c041-42a3-be82-9010c34bead0.png?s=892x500&t=crop&q=100&f=png",
  "https://mod-file.dn.nexoncdn.co.kr/game/cabbc2ce91844c79989b18931fe492fe/20372100000149640_1776059994338_252c617b-0caf-44db-839b-830f4e1b2875.png?s=892x500&t=crop&q=100&f=png",
  "https://mod-file.dn.nexoncdn.co.kr/game/cabbc2ce91844c79989b18931fe492fe/20372100000149640_1776059991731_63cb4747-77e3-466b-94ad-86b36f13fbda.png?s=892x500&t=crop&q=100&f=png",
  "https://mod-file.dn.nexoncdn.co.kr/game/cabbc2ce91844c79989b18931fe492fe/20372100000149640_1776059984999_6382e9a7-2d58-4b52-81bb-2612ad8b83f6.jpg?s=892x500&t=crop&q=100&f=png",
]);
const carouselIndex = ref(0);
const currentSlide = ref(1);
const isCarouselAnimating = ref(true);
const carouselDirection = ref(0);
const carouselIntervalMs = 4000;
let carouselTimer = null;

const displayedCarouselImages = computed(() => {
  if (carouselImages.value.length <= 1) return carouselImages.value;
  const total = carouselImages.value.length;
  const prevIdx = (carouselIndex.value - 1 + total) % total;
  const nextIdx = (carouselIndex.value + 1) % total;
  return [
    carouselImages.value[prevIdx],
    carouselImages.value[carouselIndex.value],
    carouselImages.value[nextIdx],
  ];
});

const carouselTrackStyle = computed(() => ({
  transform: `translateX(-${currentSlide.value * (100 / 3)}%)`,
  transition: isCarouselAnimating.value ? "transform 0.55s ease" : "none",
}));

const resetCarouselAutoPlay = () => {
  stopCarouselAutoPlay();
  startCarouselAutoPlay();
};

const nextImage = () => {
  if (carouselImages.value.length <= 1) return;
  carouselDirection.value = 1;
  isCarouselAnimating.value = true;
  currentSlide.value = 2;
};

const prevImage = () => {
  if (carouselImages.value.length <= 1) return;
  carouselDirection.value = -1;
  isCarouselAnimating.value = true;
  currentSlide.value = 0;
};

const goToImage = (idx) => {
  if (idx === carouselIndex.value || carouselImages.value.length <= 1) return;
  carouselIndex.value = idx;
  currentSlide.value = 1;
  isCarouselAnimating.value = false;
  resetCarouselAutoPlay();
};

const startCarouselAutoPlay = () => {
  if (carouselImages.value.length <= 1 || carouselTimer !== null) return;
  carouselTimer = window.setInterval(() => {
    nextImage();
  }, carouselIntervalMs);
};

const stopCarouselAutoPlay = () => {
  if (carouselTimer !== null) {
    window.clearInterval(carouselTimer);
    carouselTimer = null;
  }
};

const waitForNextFrame = () =>
  new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolve);
    });
  });

const handleCarouselTransitionEnd = async () => {
  if (carouselImages.value.length <= 1) return;
  if (carouselDirection.value === 0) return;

  isCarouselAnimating.value = false;
  carouselIndex.value =
    (carouselIndex.value + carouselDirection.value + carouselImages.value.length) %
    carouselImages.value.length;
  currentSlide.value = 1;
  carouselDirection.value = 0;
  await nextTick();
  await waitForNextFrame();
  isCarouselAnimating.value = true;
};

const apiStore = useApiStore();
const authStore = useAuthStore();
const { apiData, apiError, isLoading, area } = storeToRefs(apiStore);

const handleLogout = async () => {
  try {
    const auth = getAuth();
    await signOut(auth);
  } catch (error) {
    console.error('登出失敗:', error);
  }
};

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
  startCarouselAutoPlay();
});

onBeforeUnmount(() => {
  stopCarouselAutoPlay();
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

.media-section {
  display: flex;
  gap: 24px;
  margin-bottom: 60px;
  margin-top: 20px;
  align-items: stretch;
}

.video-container, .carousel-container {
  flex: 1;
  display: flex;
  min-width: 0;
}

.hero-video {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 20px;
  box-shadow: 0 20px 40px var(--shadow);
  background: var(--card);
}

.carousel {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px var(--shadow);
  background: var(--card);
}

.carousel-track {
  display: flex;
  height: 100%;
  width: 300%;
  will-change: transform;
}

.carousel-slide {
  flex: 0 0 calc(100% / 3);
  min-width: 0;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  font-size: 20px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.carousel-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.carousel-btn.prev {
  left: 12px;
}

.carousel-btn.next {
  right: 12px;
}

.carousel-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background 0.2s;
}

.dot.active {
  background: white;
}

.community-section {
  margin-bottom: 48px;
}

.section-heading {
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.section-count {
  color: #f97316;
}

.community-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.community-card {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 78px;
  padding: 0 28px;
  border-radius: 14px;
  background: var(--card);
  box-shadow: 0 14px 30px var(--shadow);
  color: var(--text-muted);
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.community-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px var(--shadow);
}

.community-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
}

.community-icon svg {
  width: 100%;
  height: 100%;
}

.youtube-icon {
  color: #ff2d20;
}

.discord-icon {
  color: #7289da;
}

.community-label {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-muted);
}

.community-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--text);
}

.community-more svg {
  width: 100%;
  height: 100%;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
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

  .media-section {
    flex-direction: column;
  }

  .hero-stats,
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .cta-band {
    flex-direction: column;
    align-items: flex-start;
  }

  .community-grid {
    grid-template-columns: 1fr;
  }
}


</style>
