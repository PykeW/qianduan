import axios from 'axios'
import type { DownloadInfo } from '@/types/download'

export class DownloadManager {
  private static instance: DownloadManager
  private downloads: Map<string, DownloadTask>
  private maxConcurrent: number
  private speedLimit: number // bytes per second
  private notificationSupported: boolean

  private constructor() {
    this.downloads = new Map()
    this.maxConcurrent = 3 // 默认最大并行下载数
    this.speedLimit = 0 // 默认不限速
    this.notificationSupported = 'Notification' in window
    
    if (this.notificationSupported) {
      Notification.requestPermission()
    }
  }

  static getInstance(): DownloadManager {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager()
    }
    return DownloadManager.instance
  }

  setMaxConcurrent(max: number) {
    this.maxConcurrent = max
  }

  setSpeedLimit(bytesPerSecond: number) {
    this.speedLimit = bytesPerSecond
  }

  async startDownload(info: DownloadInfo): Promise<void> {
    const task = new DownloadTask(info, this.speedLimit)
    this.downloads.set(info.id, task)

    try {
      await task.start()
      this.showNotification(info.softwareName, '下载完成')
    } catch (error) {
      console.error('Download failed:', error)
      this.showNotification(info.softwareName, '下载失败')
    }
  }

  pauseDownload(id: string): void {
    this.downloads.get(id)?.pause()
  }

  resumeDownload(id: string): void {
    this.downloads.get(id)?.resume()
  }

  cancelDownload(id: string): void {
    this.downloads.get(id)?.cancel()
    this.downloads.delete(id)
  }

  private showNotification(title: string, body: string) {
    if (this.notificationSupported && Notification.permission === 'granted') {
      new Notification(title, { body })
    }
  }
}

class DownloadTask {
  private xhr: XMLHttpRequest | null = null
  private chunks: Blob[] = []
  private downloadedSize = 0
  private startTime = 0
  private isPaused = false
  private lastProgressUpdate = 0
  private speedLimitTimer: NodeJS.Timeout | null = null

  constructor(
    private info: DownloadInfo,
    private speedLimit: number
  ) {}

  async start(): Promise<void> {
    const response = await axios.head(this.info.downloadUrl)
    const totalSize = parseInt(response.headers['content-length'], 10)
    const ranges = this.calculateChunkRanges(totalSize)

    this.startTime = Date.now()
    await Promise.all(ranges.map(range => this.downloadChunk(range)))
  }

  pause(): void {
    this.isPaused = true
    if (this.xhr) {
      this.xhr.abort()
    }
    if (this.speedLimitTimer) {
      clearInterval(this.speedLimitTimer)
    }
  }

  resume(): void {
    this.isPaused = false
    this.continueDownload()
  }

  cancel(): void {
    this.pause()
    this.chunks = []
    this.downloadedSize = 0
  }

  private calculateChunkRanges(totalSize: number): Array<[number, number]> {
    const chunkSize = 1024 * 1024 // 1MB per chunk
    const ranges: Array<[number, number]> = []
    
    for (let start = 0; start < totalSize; start += chunkSize) {
      const end = Math.min(start + chunkSize - 1, totalSize - 1)
      ranges.push([start, end])
    }
    
    return ranges
  }

  private async downloadChunk([start, end]: [number, number]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.xhr = new XMLHttpRequest()
      this.xhr.open('GET', this.info.downloadUrl)
      this.xhr.setRequestHeader('Range', `bytes=${start}-${end}`)
      this.xhr.responseType = 'blob'

      this.xhr.onload = () => {
        if (this.xhr!.status >= 200 && this.xhr!.status < 300) {
          this.chunks.push(this.xhr!.response)
          this.downloadedSize += this.xhr!.response.size
          this.updateProgress()
          resolve()
        } else {
          reject(new Error(`HTTP Error: ${this.xhr!.status}`))
        }
      }

      this.xhr.onerror = () => reject(new Error('Network Error'))
      
      if (this.speedLimit > 0) {
        this.applySpeedLimit()
      }
      
      this.xhr.send()
    })
  }

  private applySpeedLimit() {
    const chunkSize = 16 * 1024 // 16KB chunks
    const interval = (chunkSize / this.speedLimit) * 1000
    
    this.speedLimitTimer = setInterval(() => {
      if (!this.isPaused) {
        // Send next chunk
        this.xhr?.send()
      }
    }, interval)
  }

  private updateProgress() {
    const now = Date.now()
    const timeDiff = (now - this.lastProgressUpdate) / 1000
    
    if (timeDiff >= 1) { // 每秒更新一次
      const speed = this.downloadedSize / ((now - this.startTime) / 1000)
      const progress = (this.downloadedSize / this.info.size) * 100
      
      // 触发进度更新事件
      window.dispatchEvent(new CustomEvent('download-progress', {
        detail: {
          id: this.info.id,
          progress,
          speed,
          downloaded: this.downloadedSize
        }
      }))
      
      this.lastProgressUpdate = now
    }
  }

  private async continueDownload() {
    // 获取未完成的块
    const incompleteChunks = this.calculateIncompleteChunks()
    await Promise.all(incompleteChunks.map(range => this.downloadChunk(range)))
  }

  private calculateIncompleteChunks(): Array<[number, number]> {
    // 根据已下载的块计算未完成的范围
    const downloadedRanges = this.chunks.map((chunk, index) => {
      const start = index * (1024 * 1024)
      return [start, start + chunk.size - 1] as [number, number]
    })
    
    // 计算缺失的范围
    const missingRanges: Array<[number, number]> = []
    let lastEnd = -1
    
    downloadedRanges.forEach(([start, end]) => {
      if (start > lastEnd + 1) {
        missingRanges.push([lastEnd + 1, start - 1])
      }
      lastEnd = end
    })
    
    return missingRanges
  }
}

export const downloadManager = DownloadManager.getInstance() 