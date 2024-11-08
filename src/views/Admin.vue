<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { softwareApi, versionApi, downloadApi } from '@/api'
import type { Software } from '@/types/software'
import type { SoftwareStats, UploadStatus, AdminUserDetail, VersionManagement } from '@/types/admin'
import { useFileDialog } from '@vueuse/core'

const router = useRouter()
const authStore = useAuthStore()

// 如果未登录，重定向到登录页
if (!authStore.token) {
  router.push('/login')
}

const activeTab = ref<'overview' | 'software' | 'versions' | 'users'>('overview')
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref<UploadStatus>('success')
const searchQuery = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

// 数据状态
const stats = ref<SoftwareStats>({
  totalDownloads: 0,
  activeUsers: 0,
  averageRating: 0,
  lastWeekDownloads: 0
})
const softwareList = ref<Software[]>([])
const versions = ref<VersionManagement[]>([])
const users = ref<AdminUserDetail[]>([])

const { files, open, reset } = useFileDialog({
  accept: '.exe,.dmg,.zip',
  multiple: false
})

// 加载软件列表
const loadSoftwareList = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await softwareApi.getList({
      page: 1,
      pageSize: 10,
      keyword: searchQuery.value
    })
    softwareList.value = response.items
  } catch (err) {
    error.value = '加载软件列表失败'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// 加载版本列表
const loadVersions = async (softwareId: string) => {
  try {
    isLoading.value = true
    error.value = null
    const response = await versionApi.getList(softwareId)
    versions.value = response
  } catch (err) {
    error.value = '加载版本列表失败'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await downloadApi.getStats({
      software_id: 'all',
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    })
    stats.value = {
      totalDownloads: response.total,
      activeUsers: 0, // 需要添加相应的 API
      averageRating: 0,
      lastWeekDownloads: response.daily
        .slice(-7)
        .reduce((sum, item) => sum + item.count, 0)
    }
  } catch (err) {
    error.value = '加载统计数据失败'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// 处理文件上传
const handleFileUpload = async () => {
  if (!files.value?.length) return
  
  isUploading.value = true
  uploadStatus.value = 'uploading'
  
  try {
    const formData = new FormData()
    formData.append('file', files.value[0])
    
    // 模拟上传进度
    const uploadInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 500)

    await softwareApi.create(formData)
    
    clearInterval(uploadInterval)
    uploadProgress.value = 100
    uploadStatus.value = 'success'
    
    // 重新加载软件列表
    await loadSoftwareList()
  } catch (err) {
    uploadStatus.value = 'error'
    error.value = '上传失败'
    console.error(err)
  } finally {
    isUploading.value = false
    reset()
  }
}

// 删除软件
const handleDeleteSoftware = async (id: string) => {
  if (!confirm('确定要删除这个软件吗？')) return
  
  try {
    isLoading.value = true
    error.value = null
    await softwareApi.delete(id)
    await loadSoftwareList()
  } catch (err) {
    error.value = '删除失败'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// 删除版本
const handleDeleteVersion = async (id: string) => {
  if (!confirm('确定要删除这个版本吗？')) return
  
  try {
    isLoading.value = true
    error.value = null
    await versionApi.delete(id)
    // 重新加载版本列表
    if (versions.value[0]) {
      await loadVersions(versions.value[0].softwareId)
    }
  } catch (err) {
    error.value = '删除失败'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const filteredSoftware = computed(() => {
  if (!searchQuery.value) return softwareList.value
  
  const query = searchQuery.value.toLowerCase()
  return softwareList.value.filter(software => 
    software.name.toLowerCase().includes(query) ||
    software.description.toLowerCase().includes(query)
  )
})

// 监听标签页切换
watch(activeTab, (newTab) => {
  error.value = null
  if (newTab === 'overview') {
    loadStats()
  } else if (newTab === 'software') {
    loadSoftwareList()
  } else if (newTab === 'versions' && softwareList.value[0]) {
    loadVersions(softwareList.value[0].id)
  }
})

// 初始加载
onMounted(() => {
  loadStats()
})

const getUserStatusColor = (status: AdminUserDetail['status']) => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50'
    case 'inactive':
      return 'text-yellow-600 bg-yellow-50'
    case 'banned':
      return 'text-red-600 bg-red-50'
  }
}

const getVersionStatusColor = (status: VersionManagement['status']) => {
  switch (status) {
    case 'published':
      return 'text-green-600 bg-green-50'
    case 'draft':
      return 'text-yellow-600 bg-yellow-50'
    case 'deprecated':
      return 'text-gray-600 bg-gray-50'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 错误提示 -->
      <div
        v-if="error"
        class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600"
      >
        {{ error }}
      </div>

      <!-- 加载状态 -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/50 flex items-center justify-center"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>

      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">管理后台</h1>
        <p class="mt-1 text-sm text-gray-500">管理软件、版本和用户</p>
      </div>

      <!-- 标签页导航 -->
      <div class="mb-8">
        <nav class="flex space-x-4" aria-label="Tabs">
          <button
            v-for="tab in ['overview', 'software', 'versions', 'users']"
            :key="tab"
            class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="[
              activeTab === tab
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700'
            ]"
            @click="activeTab = tab as typeof activeTab"
          >
            {{ {
              overview: '概览',
              software: '软件管理',
              versions: '版本管理',
              users: '用户管理'
            }[tab] }}
          </button>
        </nav>
      </div>

      <!-- 概览面板 -->
      <div v-if="activeTab === 'overview'" class="space-y-6">
        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="text-sm font-medium text-gray-500">总下载量</div>
            <div class="mt-2 text-3xl font-bold text-gray-900">
              {{ stats.totalDownloads.toLocaleString() }}
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="text-sm font-medium text-gray-500">活跃用户</div>
            <div class="mt-2 text-3xl font-bold text-gray-900">
              {{ stats.activeUsers.toLocaleString() }}
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="text-sm font-medium text-gray-500">平均评分</div>
            <div class="mt-2 text-3xl font-bold text-gray-900">
              {{ stats.averageRating }}
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="text-sm font-medium text-gray-500">本周下载</div>
            <div class="mt-2 text-3xl font-bold text-gray-900">
              {{ stats.lastWeekDownloads.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>

      <!-- 软件管理面板 -->
      <div v-if="activeTab === 'software'" class="space-y-6">
        <!-- 操作栏 -->
        <div class="flex justify-between items-center">
          <div class="relative w-64">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索软件..."
              class="input pl-10"
            />
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <button
            class="btn btn-primary flex items-center gap-2"
            @click="open"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            上传新软件
          </button>
        </div>

        <!-- 上传进度 -->
        <div v-if="isUploading" class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">上传进度</span>
            <span class="text-sm text-gray-500">{{ uploadProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${uploadProgress}%` }"
            />
          </div>
        </div>

        <!-- 软件列表 -->
        <div class="bg-white rounded-xl shadow-sm divide-y">
          <div
            v-for="software in filteredSoftware"
            :key="software.id"
            class="p-6 flex items-center justify-between hover:bg-gray-50"
          >
            <div class="flex items-center space-x-4">
              <img
                :src="software.icon"
                :alt="software.name"
                class="w-12 h-12 rounded-lg"
              />
              <div>
                <h3 class="text-lg font-medium text-gray-900">
                  {{ software.name }}
                </h3>
                <p class="text-sm text-gray-500">
                  版本 {{ software.version }} | {{ software.downloadCount.toLocaleString() }} 次下载
                </p>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <button class="btn text-primary-600 hover:text-primary-700">
                编辑
              </button>
              <button
                class="btn text-red-600 hover:text-red-700"
                @click="handleDeleteSoftware(software.id)"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 版本管理面板 -->
      <div v-if="activeTab === 'versions'" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">版本管理</h2>
          </div>
          <div class="divide-y divide-gray-200">
            <div
              v-for="version in versions"
              :key="version.id"
              class="p-6 hover:bg-gray-50"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ version.softwareName }} v{{ version.version }}
                  </h3>
                  <p class="mt-1 text-sm text-gray-500">
                    {{ version.changelog }}
                  </p>
                  <div class="mt-2 flex items-center space-x-4 text-sm">
                    <span
                      class="px-2 py-1 rounded-full text-xs font-medium"
                      :class="getVersionStatusColor(version.status)"
                    >
                      {{ version.status }}
                    </span>
                    <span class="text-gray-500">{{ version.size }}</span>
                    <span class="text-gray-500">
                      {{ version.downloads.toLocaleString() }} 下载
                    </span>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="btn text-primary-600 hover:text-primary-700">
                    编辑
                  </button>
                  <button
                    v-if="version.status === 'draft'"
                    class="btn text-green-600 hover:text-green-700"
                  >
                    发布
                  </button>
                  <button
                    v-if="version.status === 'published'"
                    class="btn text-yellow-600 hover:text-yellow-700"
                  >
                    废弃
                  </button>
                  <button
                    class="btn text-red-600 hover:text-red-700"
                    @click="handleDeleteVersion(version.id)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户管理面板 -->
      <div v-if="activeTab === 'users'" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">用户管理</h2>
          </div>
          <div class="divide-y divide-gray-200">
            <div
              v-for="user in users"
              :key="user.id"
              class="p-6 hover:bg-gray-50"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <img
                    :src="user.avatar"
                    :alt="user.username"
                    class="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">
                      {{ user.username }}
                      <span
                        class="ml-2 px-2 py-1 rounded-full text-xs font-medium"
                        :class="getUserStatusColor(user.status)"
                      >
                        {{ user.status }}
                      </span>
                    </h3>
                    <div class="mt-1 text-sm text-gray-500">
                      {{ user.email }} | {{ user.role }}
                    </div>
                    <div class="mt-1 text-xs text-gray-400">
                      最后登录: {{ new Date(user.lastLogin).toLocaleString() }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="btn text-primary-600 hover:text-primary-700">
                    编辑
                  </button>
                  <button
                    v-if="user.status === 'active'"
                    class="btn text-yellow-600 hover:text-yellow-700"
                  >
                    禁用
                  </button>
                  <button
                    v-else-if="user.status === 'inactive'"
                    class="btn text-green-600 hover:text-green-700"
                  >
                    启用
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 