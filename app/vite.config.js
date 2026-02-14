// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
//
// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import mkcert from 'vite-plugin-mkcert'
import { VitePWA } from 'vite-plugin-pwa'

const manifest = {
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico"
      ],
      manifest: {
        name: "Leaderbird",
        short_name: "Bird",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#14329c", 
        icons: [
          {
            src: "pwa144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "pwa192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable_icon_x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        screenshots: [
        ],
      },
      workbox: {
        navigateFallback: "/offline.html",
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg}",
        ],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/public"), // 👈 any /data/** file
            handler: "CacheFirst",
            options: {
              cacheName: "bird-json",
              expiration: {
                maxEntries: 200, // adjust based on how many files
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }

export default defineConfig({
  server: {
    port: 8001, // Set your desired port number here
    allowedHosts: ["base.sorry.horse"]
  },
  plugins: [react(), mkcert(), VitePWA(mainfest)],
  resolve: {
    alias: {
      // This line defines the '@' alias
      '@': path.resolve(__dirname, './src'),
    },
  },
});

