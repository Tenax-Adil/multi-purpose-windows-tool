import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  // Allow <webview> tag for Theatre's embedded streaming
  define: { 'process.env.VITE_ELECTRON': '"true"' },
  server: {
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/.electron-userdata/**',
        '**/dist/**',
        '**/.git/**',
      ],
    },
  },
})
