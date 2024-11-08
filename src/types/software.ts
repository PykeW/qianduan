export type SoftwareCategory = 'development' | 'design' | 'productivity' | 'utilities'

export type Software = {
  id: string
  name: string
  description: string
  category: SoftwareCategory
  version: string
  downloadCount: number
  size: string
  lastUpdated: string
  icon: string
  screenshots: string[]
}

export type SortOption = 'name' | 'downloadCount' | 'lastUpdated' 