import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Crucial for Electron to load files correctly
  server: {
    // Prevent Vite from watching non-source files
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
