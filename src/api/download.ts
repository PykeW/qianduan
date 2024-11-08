import request from '@/utils/request'

export interface DownloadUrlResponse {
  download_url: string
  expires_at: string
}

export interface DownloadStats {
  total: number
  daily: {
    date: string
    count: number
  }[]
}

export const downloadApi = {
  // 获取下载链接
  getUrl: (versionId: string) =>
    request.get<any, DownloadUrlResponse>(`/download/url/${versionId}`),

  // 获取下载统计
  getStats: (params: {
    software_id: string
    start_date: string
    end_date: string
  }) =>
    request.get<any, DownloadStats>('/stats/download', { params })
} 