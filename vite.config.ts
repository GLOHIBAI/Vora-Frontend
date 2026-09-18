import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import https from 'node:https'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://vora-backend-y5ui.onrender.com',
        changeOrigin: true,
        secure: false,
        agent: new https.Agent({
          keepAlive: false,
          maxCachedSessions: 0,
        }),
      },
    },
  },
})
