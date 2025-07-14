// vite.config.js - Updated for SPA routing
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true, // This ensures SPA routing works in dev
  },
  build: {
    rollupOptions: {
      // Ensure proper routing for production builds
      output: {
        manualChunks: undefined,
      },
    },
  },
})