import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdminUser } from '@/types/admin'
import { authApi } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AdminUser | null>(null)
  const token = ref<string | null>(null)

  const login = async (username: string, password: string) => {
    const response = await authApi.login({ username, password })
    token.value = response.token
    user.value = response.user
    localStorage.setItem('token', response.token)
  }

  const logout = async () => {
    await authApi.logout()
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    login,
    logout
  }
}) 