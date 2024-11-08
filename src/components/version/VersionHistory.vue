<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Version } from '@/types/version'
import { versionApi, downloadApi } from '@/api'
import { useTimeAgo } from '@vueuse/core'

const props = defineProps<{
  softwareId: string
}>()

const versions = ref<Version[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const downloadUrls = ref<Record<string, string>>({}) // 存储每个版本的下载链接

// 加载版本列表
const loadVersions = async () => {
  try {
    isLoading.value = true
    error.value = null
    versions.value = await versionApi.getList(props.softwareId)
  } catch (err) {
    error.value = '加载版本历史失败'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// 获取下载链接
const getDownloadUrl = async (versionId: string) => {
  try {
    if (downloadUrls.value[versionId]) return

    const response = await downloadApi.getUrl(versionId)
    downloadUrls.value[versionId] = response.download_url
  } catch (err) {
    console.error('获取下载链接失败:', err)
  }
}

// 处理下载点击
const handleDownload = async (version: Version) => {
  await getDownloadUrl(version.id)
  const downloadUrl = downloadUrls.value[version.id]
  
  if (downloadUrl) {
    // 创建一个隐藏的 a 标签来触发下载
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `${version.version}.zip` // 或其他适当的文件名
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

const getTimeAgo = (date: string) => {
  const timeAgo = useTimeAgo(new Date(date))
  return timeAgo.value
}

const getChangeTypeColor = (type: Version['changes'][0]['type']) => {
  switch (type) {
    case 'feature':
      return 'text-green-600 bg-green-50'
    case 'improvement':
      return 'text-blue-600 bg-blue-50'
    case 'fix':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

const getChangeTypeText = (type: Version['changes'][0]['type']) => {
  switch (type) {
    case 'feature':
      return '新功能'
    case 'improvement':
      return '优化'
    case 'fix':
      return '修复'
    default:
      return '更新'
  }
}

// 监听 softwareId 变化
watch(() => props.softwareId, (newId) => {
  if (newId) {
    loadVersions()
  }
})

// 初始加载
onMounted(() => {
  if (props.softwareId) {
    loadVersions()
  }
})
</script>

<template>
  <div class="space-y-8">
    <!-- 错误提示 -->
    <div
      v-if="error"
      class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600"
    >
      {{ error }}
    </div>

    <!-- 加载状态 -->
    <div
      v-if="isLoading"
      class="flex justify-center py-12"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
    </div>

    <!-- 版本列表 -->
    <template v-else>
      <div
        v-for="version in versions"
        :key="version.id"
        class="relative"
      >
        <!-- 版本时间线 -->
        <div
          v-if="!version.isLatest"
          class="absolute top-0 -bottom-8 left-4 w-px bg-gray-200"
        />
        
        <div class="relative card">
          <!-- 版本标记点 -->
          <div
            :class="[
              'absolute -left-3 w-6 h-6 rounded-full border-4 border-white',
              version.isLatest ? 'bg-primary-500' : 'bg-gray-300'
            ]"
          />

          <!-- 版本头部 -->
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold flex items-center gap-3">
                v{{ version.version }}
                <span
                  v-if="version.isLatest"
                  class="px-2 py-1 text-xs font-medium bg-primary-50 text-primary-600 rounded-full"
                >
                  最新版本
                </span>
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                发布于 {{ getTimeAgo(version.releaseDate) }}
              </p>
            </div>
            <button
              class="btn btn-primary flex items-center gap-2"
              :class="{ 'opacity-80': !version.isLatest }"
              @click="handleDownload(version)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载 ({{ version.size }})
            </button>
          </div>

          <!-- 版本描述 -->
          <p class="mt-4 text-gray-600">
            {{ version.description }}
          </p>

          <!-- 更新内容 -->
          <div class="mt-6 space-y-4">
            <div
              v-for="(change, index) in version.changes"
              :key="index"
              class="flex items-start gap-3"
            >
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap',
                  getChangeTypeColor(change.type)
                ]"
              >
                {{ getChangeTypeText(change.type) }}
              </span>
              <span class="text-gray-600">{{ change.description }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="versions.length === 0"
        class="text-center py-12 text-gray-500"
      >
        暂无版本历史记录
      </div>
    </template>
  </div>
</template> 