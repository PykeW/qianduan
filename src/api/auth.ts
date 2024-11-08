import request from '@/utils/request'
import type { AdminUser } from '@/types/admin'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AdminUser
}

export const authApi = {
  login: (data: LoginParams) => 
    request.post<any, LoginResponse>('/auth/login', data),
  
  logout: () => 
    request.post('/auth/logout')
} 