import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png', 'sounds/new-order.wav'],
      manifest: {
        name: 'KafeBar — Касса',
        short_name: 'Касса',
        description: 'Кассовое рабочее место KafeBar — приём оплат и управление заказами',
        theme_color: '#10B981',
        background_color: '#0B0F1A',
        display: 'standalone',
        orientation: 'landscape',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,mp3}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: { cacheName: 'api', networkTimeoutSeconds: 5 },
          },
          {
            urlPattern: /^https:\/\/images\./,
            handler: 'CacheFirst',
            options: { cacheName: 'images', expiration: { maxEntries: 100, maxAgeSeconds: 86400 * 30 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    host: '0.0.0.0',
    port: 5181,
  },
})
