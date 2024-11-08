export type AdminUser = {
  id: string
  username: string
  role: 'admin' | 'editor'
  avatar?: string
}

export type SoftwareStats = {
  totalDownloads: number
  activeUsers: number
  averageRating: number
  lastWeekDownloads: number
}

export type UploadStatus = 'uploading' | 'processing' | 'success' | 'error'

export type UserStatus = 'active' | 'inactive' | 'banned'

export type AdminUserDetail = AdminUser & {
  email: string
  status: UserStatus
  lastLogin: string
  createdAt: string
  permissions: string[]
}

export type VersionManagement = {
  id: string
  softwareId: string
  softwareName: string
  version: string
  status: 'draft' | 'published' | 'deprecated'
  publishDate?: string
  changelog: string
  size: string
  downloads: number
}