import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget =
    env.VITE_PROXY_TARGET ?? 'https://tabitayo-backend.onrender.com'
  const mediaTarget = proxyTarget.replace(/\/api\/v1\/?$/, '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api/v1': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
        },
        '/media': {
          target: mediaTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
