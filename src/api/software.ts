import request from '@/utils/request'
import type { Software } from '@/types/software'

export interface SoftwareListParams {
  page?: number
  pageSize?: number
  category?: string
  keyword?: string
}

export interface SoftwareListResponse {
  items: Software[]
  total: number
}

export const softwareApi = {
  // 获取软件列表
  getList: (params: SoftwareListParams) =>
    request.get<any, SoftwareListResponse>('/software/list', { params }),

  // 获取软件详情
  getDetail: (id: string) =>
    request.get<any, Software>(`/software/detail/${id}`),

  // 创建软件
  create: (data: FormData) =>
    request.post<any, Software>('/software/create', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),

  // 更新软件
  update: (id: string, data: FormData) =>
    request.put<any, Software>(`/software/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),

  // 删除软件
  delete: (id: string) =>
    request.delete(`/software/${id}`)
} 