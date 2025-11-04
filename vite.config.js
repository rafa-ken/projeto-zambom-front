import { defineConfig } from 'vite'
export default defineConfig({
  server: {
    proxy: {
      '/notes': {
        target: 'http://54.233.188.129:8082',
        changeOrigin: true,
        secure: false,
      },
      '/reports': { target: 'http://54.233.188.129:8082', changeOrigin: true },
      '/tarefas': { target: 'http://54.233.188.129:8082', changeOrigin: true }
    }
  }
})