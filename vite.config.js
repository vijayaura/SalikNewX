import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const ollamaProxy = {
  target: 'http://localhost:11434',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api\/ollama/, ''),
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api/ollama': ollamaProxy,
    },
  },
  preview: {
    proxy: {
      '/api/ollama': ollamaProxy,
    },
  },
})
