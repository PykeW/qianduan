export type DownloadStatus = 'pending' | 'downloading' | 'paused' | 'completed' | 'error'

export type DownloadInfo = {
  id: string
  softwareId: string
  softwareName: string
  version: string
  size: number
  sizeFormatted: string
  progress: number
  speed: string
  status: DownloadStatus
  startTime: string
  estimatedTimeLeft?: string
  error?: string
  downloadUrl: string
} 