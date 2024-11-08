<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { DownloadInfo } from '@/types/download'
import { downloadApi } from '@/api'
import { useTimeAgo, useIntervalFn } from '@vueuse/core'
import { downloadManager } from '@/utils/downloadManager'

const props = defineProps<{
  download: DownloadInfo
}>()

const emit = defineEmits<{
  (e: 'pause'): void
  (e: 'resume'): void
  (e: 'cancel'): void
  (e: 'retry'): void
  (e: 'remove'): void
}>()

const isLoading = ref(false)
const error = ref<string | null>(null)
const downloadProgress = ref(props.download.progress)
const downloadSpeed = ref(props.download.speed)
const remainingTime = ref(props.download.estimatedTimeLeft)

// 模拟下载进度更新
const { pause: pauseProgress, resume: resumeProgress } = useIntervalFn(() => {
  if (downloadProgress.value < 100) {
    downloadProgress.value += 1
    // 模拟速度变化
    downloadSpeed.value = `${Math.floor(Math.random() * 10 + 1)} MB/s`
    // 模拟剩余时间
    const remaining = Math.floor((100 - downloadProgress.value) * 10)
    remainingTime.value = `${Math.floor(remaining / 60)}分${remaining % 60}秒`
  } else {
    pauseProgress()
  }
}, 1000, { immediate: false })

const statusColor = computed(() => {
  switch (props.download.status) {
    case 'downloading':
      return 'text-primary-600'
    case 'completed':
      return 'text-green-600'
    case 'error':
      return 'text-red-600'
    case 'paused':
      return 'text-yellow-600'
    default:
      return 'text-gray-600'
  }
})

const statusText = computed(() => {
  switch (props.download.status) {
    case 'downloading':
      return '下载中'
    case 'completed':
      return '已完成'
    case 'error':
      return '下载失败'
    case 'paused':
      return '已暂停'
    case 'pending':
      return '等待中'
    default:
      return '未知状态'
  }
})

const startTimeAgo = computed(() => {
  return useTimeAgo(new Date(props.download.startTime)).value
})

// 修改处理下载的逻辑
const handleDownload = async () => {
  if (props.download.status === 'paused') {
    downloadManager.resumeDownload(props.download.id)
    emit('resume')
  } else {
    downloadManager.startDownload(props.download)
  }
}

const handlePause = () => {
  downloadManager.pauseDownload(props.download.id)
  emit('pause')
}

const handleCancel = () => {
  if (!confirm('确定要取消下载吗？')) return
  downloadManager.cancelDownload(props.download.id)
  emit('cancel')
}

// 监听下载进度
onMounted(() => {
  window.addEventListener('download-progress', ((event: CustomEvent) => {
    if (event.detail.id === props.download.id) {
      downloadProgress.value = event.detail.progress
      downloadSpeed.value = `${(event.detail.speed / (1024 * 1024)).toFixed(2)} MB/s`
    }
  }) as EventListener)
})

// 处理重试
const handleRetry = async () => {
  try {
    isLoading.value = true
    error.value = null
    downloadProgress.value = 0
    resumeProgress()
    emit('retry')
  } catch (err) {
    error.value = '操作失败'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// 处理移除
const handleRemove = () => {
  emit('remove')
}

// 如果是下载中状态，开始进度更新
if (props.download.status === 'downloading') {
  resumeProgress()
}
</script>

<template>
  <div
    class="card group hover:shadow-lg transition-all duration-300"
    :class="{ 'border-l-4': download.status !== 'completed' }"
    :style="{
      borderLeftColor: download.status === 'downloading' ? '#2563eb' :
                      download.status === 'error' ? '#dc2626' :
                      download.status === 'paused' ? '#d97706' : 'transparent'
    }"
  >
    <!-- 错误提示 -->
    <div
      v-if="error"
      class="mb-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600"
    >
      {{ error }}
    </div>

    <!-- 头部信息 -->
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">
          {{ download.softwareName }}
        </h3>
        <p class="text-sm text-gray-500">
          版本 {{ download.version }} | {{ download.size }}
        </p>
      </div>
      
      <!-- 状态标签 -->
      <span
        class="px-2 py-1 text-xs font-medium rounded-full"
        :class="[
          statusColor.value.replace('text-', 'bg-').replace('600', '50'),
          statusColor.value
        ]"
      >
        {{ statusText }}
      </span>
    </div>

    <!-- 进度条 -->
    <div class="mt-4">
      <div class="relative pt-1">
        <div class="flex mb-2 items-center justify-between">
          <div>
            <span class="text-xs font-semibold inline-block text-primary-600">
              {{ downloadProgress }}%
            </span>
          </div>
          <div class="text-right">
            <span class="text-xs font-semibold inline-block text-gray-600">
              {{ downloadSpeed }}
            </span>
          </div>
        </div>
        <div class="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
          <div
            :style="{ width: `${downloadProgress}%` }"
            class="transition-all duration-300 ease-out shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
            :class="{
              'bg-primary-500': download.status === 'downloading',
              'bg-green-500': download.status === 'completed',
              'bg-yellow-500': download.status === 'paused',
              'bg-red-500': download.status === 'error'
            }"
          />
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="mt-4 flex items-center justify-between">
      <span class="text-sm text-gray-500">
        开始于 {{ startTimeAgo }}
        <template v-if="remainingTime && download.status === 'downloading'">
          · 剩余 {{ remainingTime }}
        </template>
      </span>
      
      <div class="flex gap-2">
        <template v-if="download.status === 'downloading'">
          <button
            class="btn text-sm text-yellow-600 hover:text-yellow-700"
            :disabled="isLoading"
            @click="handlePause"
          >
            暂停
          </button>
          <button
            class="btn text-sm text-red-600 hover:text-red-700"
            :disabled="isLoading"
            @click="handleCancel"
          >
            取消
          </button>
        </template>
        
        <template v-else-if="download.status === 'paused'">
          <button
            class="btn text-sm text-primary-600 hover:text-primary-700"
            :disabled="isLoading"
            @click="handleDownload"
          >
            继续
          </button>
          <button
            class="btn text-sm text-red-600 hover:text-red-700"
            :disabled="isLoading"
            @click="handleCancel"
          >
            取消
          </button>
        </template>
        
        <template v-else-if="download.status === 'error'">
          <button
            class="btn text-sm text-primary-600 hover:text-primary-700"
            :disabled="isLoading"
            @click="handleRetry"
          >
            重试
          </button>
          <button
            class="btn text-sm text-gray-600 hover:text-gray-700"
            :disabled="isLoading"
            @click="handleRemove"
          >
            移除
          </button>
        </template>
        
        <template v-else-if="download.status === 'completed'">
          <button
            class="btn text-sm text-gray-600 hover:text-gray-700"
            :disabled="isLoading"
            @click="handleRemove"
          >
            清除
          </button>
        </template>
      </div>
    </div>
  </div>
</template> 