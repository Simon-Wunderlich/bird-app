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

export default defineConfig({
  server: {
    port: 8001, // Set your desired port number here
    allowedHosts: ["base.sorry.horse"]
  },
  plugins: [react(), mkcert()],
  resolve: {
    alias: {
      // This line defines the '@' alias
      '@': path.resolve(__dirname, './src'),
    },
  },
});

