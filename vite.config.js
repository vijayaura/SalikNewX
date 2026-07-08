import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { chatApiPlugin } from './server/chat-handler.mjs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), chatApiPlugin(env)],
  }
})
