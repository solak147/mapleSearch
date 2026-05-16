<template>
  <div class="test-page">
    <div class="phone-shell">
      <header class="topbar">
        <button class="icon-button" type="button" aria-label="開啟選單">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <img
          class="brand-logo"
          :src="logoUrl"
          alt="ShareTech"
          loading="eager"
        />

        <button class="icon-button search-button" type="button" aria-label="搜尋">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16L21 21" />
          </svg>
        </button>
      </header>

      <main class="content">
        <p class="intro">
          Lorem ipsum dolor sit amet consectetur. Tortor bibendum augue facilisi cras
          vivamus.
        </p>

        <section class="hero-carousel" aria-label="活動輪播">
          <div class="carousel-track" :style="carouselTrackStyle">
            <article
              v-for="(slide, index) in slides"
              :key="slide.image"
              :class="['carousel-slide', { active: index === currentSlide }]"
            >
              <img :src="slide.image" :alt="slide.alt" loading="lazy" />
            </article>
          </div>
        </section>

        <form class="login-form" @submit.prevent="handleSubmit">
          <label class="input-card">
            <span class="input-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path
                  d="M3 6.75A1.75 1.75 0 0 1 4.75 5h14.5A1.75 1.75 0 0 1 21 6.75v10.5A1.75 1.75 0 0 1 19.25 19H4.75A1.75 1.75 0 0 1 3 17.25V6.75Z"
                />
                <path d="M4 7.5 12 13l8-5.5" />
              </svg>
            </span>
            <span class="divider"></span>
            <input v-model="form.email" type="email" placeholder="電子郵件" />
          </label>

          <label class="input-card">
            <span class="input-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M7.5 10V7.75a4.5 4.5 0 1 1 9 0V10" />
                <rect x="5" y="10" width="14" height="10" rx="2" ry="2" />
                <circle cx="12" cy="15" r="1.2" />
              </svg>
            </span>
            <span class="divider"></span>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="密碼"
            />
            <button
              class="visibility-button"
              type="button"
              :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
              @click="showPassword = !showPassword"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
                />
                <circle cx="12" cy="12" r="2.75" />
              </svg>
            </button>
          </label>

          <label class="input-card">
            <span class="input-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="5" y="3.5" width="8" height="17" rx="1.5" />
                <path d="M9 7h.01" />
                <path d="M9 17h.01" />
                <path d="M13 13h6v7h-6z" />
              </svg>
            </span>
            <span class="divider"></span>
            <input v-model="form.host" type="text" placeholder="主機" />
          </label>

          <div class="option-row">
            <label class="radio-control">
              <input v-model="keepSignedIn" type="radio" name="remember" :value="true" />
              <span class="radio-mark"></span>
            </label>

            <button
              class="toggle-switch"
              type="button"
              role="switch"
              :aria-checked="notificationsEnabled"
              @click="notificationsEnabled = !notificationsEnabled"
            >
              <span class="toggle-thumb"></span>
            </button>
          </div>

          <button class="submit-button" type="submit">登入</button>
        </form>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";

const logoUrl =
  "https://www.figma.com/api/mcp/asset/d7ca019c-106f-4561-8100-bf28070b33e6";

const slides = [
  {
    image: "https://www.figma.com/api/mcp/asset/bebfb435-3cb2-42d7-92ff-3134e8c4a984",
    alt: "輪播圖片 1",
  },
  {
    image: "https://www.figma.com/api/mcp/asset/9bb3aed5-051c-41fd-ba13-60b72fedb1ca",
    alt: "輪播圖片 2",
  },
  {
    image: "https://www.figma.com/api/mcp/asset/35e5b0e4-8bda-42a6-a253-edaf93aaa301",
    alt: "輪播圖片 3",
  },
  {
    image: "https://www.figma.com/api/mcp/asset/73d60697-7e47-4c6e-8671-363432ea4727",
    alt: "輪播圖片 4",
  },
] as const;

const form = reactive({
  email: "",
  password: "",
  host: "",
});

const showPassword = ref(false);
const keepSignedIn = ref(true);
const notificationsEnabled = ref(true);
const currentSlide = ref(0);

let slideTimer: number | null = null;

const carouselTrackStyle = computed(() => ({
  transform: `translateX(-${currentSlide.value * 100}%)`,
}));

const startAutoplay = () => {
  if (slideTimer !== null) {
    return;
  }

  slideTimer = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length;
  }, 3200);
};

const stopAutoplay = () => {
  if (slideTimer !== null) {
    window.clearInterval(slideTimer);
    slideTimer = null;
  }
};

const handleSubmit = () => {
  console.log("test login payload", {
    ...form,
    keepSignedIn: keepSignedIn.value,
    notificationsEnabled: notificationsEnabled.value,
  });
};

onMounted(() => {
  startAutoplay();
});

onBeforeUnmount(() => {
  stopAutoplay();
});
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 16px;
  background:
    radial-gradient(circle at top, rgba(123, 183, 238, 0.22), transparent 32%),
    linear-gradient(180deg, #f5f8fd 0%, #edf2fb 100%);
}

.phone-shell {
  width: min(100%, 393px);
  min-height: 852px;
  background: #ffffff;
  box-shadow: 0 26px 70px rgba(70, 105, 152, 0.24);
  overflow: hidden;
}

.topbar {
  height: 141px;
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  gap: 24px;
  padding: 0 24px;
  background: #7bb7ee;
  border-bottom: 2px solid #6b6b6b;
}

.icon-button {
  border: 0;
  background: transparent;
  padding: 0;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.icon-button span {
  display: block;
  width: 33px;
  height: 3px;
  margin: 3px 0;
  border-radius: 999px;
  background: #ffffff;
}

.search-button svg {
  width: 34px;
  height: 34px;
  fill: none;
  stroke: #ffffff;
  stroke-width: 2.1;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.brand-logo {
  width: 129px;
  justify-self: center;
}

.content {
  padding: 26px 25px 56px;
}

.intro {
  margin: 0 0 13px;
  color: #111111;
  font-size: 14px;
  line-height: 2.15;
  font-family: "Trebuchet MS", "Noto Sans TC", sans-serif;
}

.hero-carousel {
  width: 343px;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid #202020;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.35);
}

.carousel-track {
  display: flex;
  transition: transform 0.55s ease;
}

.carousel-slide {
  width: 100%;
  flex: 0 0 100%;
}

.carousel-slide img {
  display: block;
  width: 100%;
  height: 156px;
  object-fit: cover;
}

.login-form {
  margin-top: 46px;
}

.input-card {
  height: 61px;
  display: grid;
  grid-template-columns: 44px 1px 1fr auto;
  align-items: center;
  gap: 18px;
  border: 2px solid #7bb7ee;
  border-radius: 10px;
  padding: 0 16px 0 18px;
  margin-bottom: 24px;
}

.input-icon {
  display: grid;
  place-items: center;
  width: 31px;
  height: 31px;
  color: #5f8ded;
}

.input-icon svg {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.divider {
  width: 1px;
  height: 38px;
  background: #7bb7ee;
}

.input-card input {
  width: 100%;
  border: 0;
  outline: 0;
  padding: 0;
  background: transparent;
  color: #111111;
  font-size: 14px;
  font-family: "Trebuchet MS", "Noto Sans TC", sans-serif;
}

.input-card input::placeholder {
  color: #111111;
  opacity: 1;
}

.visibility-button {
  border: 0;
  background: transparent;
  padding: 0;
  color: #a6a6a6;
  cursor: pointer;
}

.visibility-button svg {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
}

.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 0;
}

.radio-control {
  position: relative;
  width: 26px;
  height: 26px;
  display: inline-block;
}

.radio-control input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.radio-mark {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid #4e82ec;
}

.radio-mark::after {
  content: "";
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: #4e82ec;
}

.toggle-switch {
  width: 34px;
  height: 17px;
  border: 0;
  border-radius: 999px;
  background: #5d8ef3;
  padding: 2px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle-thumb {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.2s ease;
  transform: translateX(17px);
}

.toggle-switch[aria-checked="false"] {
  background: #b9c4d8;
}

.toggle-switch[aria-checked="false"] .toggle-thumb {
  transform: translateX(0);
}

.submit-button {
  display: block;
  width: 114px;
  height: 48px;
  margin: 47px auto 0;
  border: 0;
  border-radius: 10px;
  background: #62a1fe;
  color: #ffffff;
  font-size: 18px;
  font-weight: 400;
  font-family: "Times New Roman", "Noto Serif TC", serif;
  cursor: pointer;
  box-shadow: 0 16px 28px rgba(98, 161, 254, 0.28);
}

@media (max-width: 460px) {
  .test-page {
    padding: 0;
    background: #ffffff;
  }

  .phone-shell {
    width: 100%;
    min-height: 100vh;
    box-shadow: none;
  }
}
</style>
