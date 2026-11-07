import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import offlineServiceWorker from './swplugin.js'

// In production Django serves the build: index.html for every page route and
// hashed assets from /static/assets/. In development, Vite proxies /api to Django.
export default defineConfig(({ command }) => ({
  plugins: [react(), offlineServiceWorker()],
  base: command === 'build' ? '/static/' : '/',
  server: {
    port: 5173,
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          d3: ['d3'],
        },
      },
    },
  },
}))
