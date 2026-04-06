// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  // ssr: false,
  modules: ["@vite-pwa/nuxt"],
  // app: {
  //   head: {
  //     直接在pubic目录下放置manifest.webmanifest文件，實現pwa功能，這樣就不需要使用@vite-pwa/nuxt模塊
  //     link: [{ rel: 'manifest', href: '/manifest.webmanifest' }]
  //   }
  // },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api",
    },
  },
  nitro: {
    devProxy: {
      "/api": {
        target: "https://artaledrop.com",
        changeOrigin: true,
      },
    },
    routeRules: {
      // Production (and dev) proxy for /api/*
      "/api/**": { proxy: "https://artaledrop.com/**" },
    },
    // prerender: {
    //   routes: ['/'],   // 預先渲染首頁產生靜態 HTML
    // },
  },
  pwa: {
    registerType: "autoUpdate",
    includeAssets: ["favicon.ico", "robots.txt", "icons/icon.svg"],
    client: {
      installPrompt: true,
    },
    workbox: {
      // App shell offline support
      navigateFallback: "/",
      navigateFallbackDenylist: [/^\/api\//, /^\/_nuxt\//, /\/@fs\//],
      // additionalManifestEntries: [
      //   { url: "/", revision: null },
      //   { url: "/offline.html", revision: null },
      // ],
      globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2,json}"],
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === "document",
          handler: "NetworkFirst",
          options: {
            cacheName: "pages",
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
          },
        },
        {
          urlPattern: ({ request }) =>
            ["style", "script", "worker"].includes(request.destination),
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "assets",
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === "image",
          handler: "CacheFirst",
          options: {
            cacheName: "images",
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 },
          },
        },
        {
          urlPattern: /^https:\/\/artaledrop\.com\/api\//,
          handler: "NetworkFirst",
          options: {
            cacheName: "api",
            networkTimeoutSeconds: 10,
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
          },
        },
      ],
    },
    manifest: {
      name: "Maple Search",
      short_name: "MapleSearch",
      description: "Maple Search web app",
      lang: "zh-TW",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#0f172a",
      icons: [
        {
          src: "/icons/icon.svg",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "any",
        },
        {
          src: "/icons/icon.svg",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "maskable",
        },
      ],
    },
    devOptions: {
      enabled: true,
    },
  },
});
