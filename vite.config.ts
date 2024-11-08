import { defineConfig } from 'vite'
import * as path from 'path'

// 使用 require 导入
const vue = require('@vitejs/plugin-vue')

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}) 