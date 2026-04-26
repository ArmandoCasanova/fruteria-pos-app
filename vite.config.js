import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'Frutería Lemus Admin',
        short_name: 'FL Admin',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [] // Para evitar errores si no hay iconos aún
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\.(png|jpg|jpeg|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ]
})
