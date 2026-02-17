// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
//
// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],

// })
import { fileURLToPath } from "url";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  server: {
    port: 8001, // Set your desired port number here
    allowedHosts: ["base.sorry.horse"],
    https : {
	    key : fs.readFileSync(path.resolve(__dirname, "certs/private.key")),
	    cert : fs.readFileSync(path.resolve(__dirname, "certs/certificate.crt")),
    }
  },
  plugins: [react(), VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "pwa144.png",
        "pwa192.png",
        "pwa512.png",
        "maskable_icon_x512.png"
      ],
      manifest: {
        name: "Leaderbird",
        short_name: "Leaderbird",
        start_url: "/",
	scope: "/",	
	id: "/",	
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000", 
        icons: [
          {
            src: "/pwa144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "/pwa192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/maskable_icon_x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        screenshots: [          {
            src: "/maskable_icon_x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "wide",
          }, 
	{
            src: "/maskable_icon_x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "narrow",
          }],
      },
      devOptions: {
        enabled: true,
        type: 'module',
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
    }),
  ],
  resolve: {
    alias: {
      // This line defines the '@' alias
      '@': path.resolve(__dirname, './src'),
    },
  },
});

