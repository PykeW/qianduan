export type Version = {
  id: string
  version: string
  releaseDate: string
  description: string
  changes: {
    type: 'feature' | 'fix' | 'improvement'
    description: string
  }[]
  size: string
  downloadUrl: string
  isLatest: boolean
} 