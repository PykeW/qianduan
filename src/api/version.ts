import request from '@/utils/request'
import type { Version } from '@/types/version'

export const versionApi = {
  // 获取版本列表
  getList: (softwareId: string) =>
    request.get<any, Version[]>(`/version/list/${softwareId}`),

  // 创建新版本
  create: (data: FormData) =>
    request.post<any, Version>('/version/create', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),

  // 删除版本
  delete: (id: string) =>
    request.delete(`/version/delete/${id}`)
} 