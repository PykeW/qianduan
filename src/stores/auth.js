// 如果使用 Pinia
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 认证状态
  }),
  actions: {
    // 认证相关方法
  }
}) 