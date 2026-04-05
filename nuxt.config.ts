// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@vite-pwa/nuxt'],
  // app: {
  //   head: {
  //     直接在pubic目录下放置manifest.webmanifest文件，實現pwa功能，這樣就不需要使用@vite-pwa/nuxt模塊
  //     link: [{ rel: 'manifest', href: '/manifest.webmanifest' }]
  //   }
  // },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'https://artaledrop.com',
        changeOrigin: true
      }
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'robots.txt', 'icons/icon.svg'],
    client: {
      installPrompt: true
    },
    manifest: {
      name: 'Maple Search',
      short_name: 'MapleSearch',
      description: 'Maple Search web app',
      lang: 'zh-TW',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#0f172a',
      icons: [
        {
          src: '/icons/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any'
        },
        {
          src: '/icons/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'maskable'
        }
      ]
    },
    devOptions: {
      enabled: true
    }
  }
})
