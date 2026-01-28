import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  base: "/",
  server: {
    proxy: {
      '/api': {
        target: 'https://ai-counsellor-backend-vqlp.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
