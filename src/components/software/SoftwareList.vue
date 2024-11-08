<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useVModel, useDebounce } from '@vueuse/core'
import { softwareApi } from '@/api'
import type { Software, SoftwareCategory } from '@/types/software'

const props = withDefaults(defineProps<{
  modelValue?: string
  category?: SoftwareCategory
}>(), {
  modelValue: '',
  category: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const searchQuery = useVModel(props, 'modelValue', emit)
const debouncedSearch = useDebounce(searchQuery, 300)

const isLoading = ref(false)
const error = ref<string | null>(null)
const softwareList = ref<Software[]>([])
const currentPage = ref(1)
const totalItems = ref(0)
const pageSize = ref(12)

// 加载软件列表
const loadSoftwareList = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const response = await softwareApi.getList({
      page: currentPage.value,
      pageSize: pageSize.value,
      category: props.category,
      keyword: debouncedSearch.value
    })
    
    softwareList.value = response.items
    totalItems.value = response.total
  } catch (err) {
    error.value = '加载软件列表失败'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadSoftwareList()
}

// 监听搜索和分类变化
watch([debouncedSearch, () => props.category], () => {
  currentPage.value = 1 // 重置页码
  loadSoftwareList()
})

// 初始加载
onMounted(() => {
  loadSoftwareList()
})

// 计算总页数
const totalPages = computed(() => 
  Math.ceil(totalItems.value / pageSize.value)
)

// 生成分页数组
const paginationArray = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  
  return pages
})
</script>

<template>
  <div class="space-y-6">
    <!-- 错误提示 -->
    <div
      v-if="error"
      class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600"
    >
      {{ error }}
    </div>

    <!-- 搜索框 -->
    <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="relative w-full sm:w-96">
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
    </div>

    <!-- 加载状态 -->
    <div
      v-if="isLoading"
      class="flex justify-center py-12"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
    </div>

    <!-- 软件列表 -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="software in softwareList"
        :key="software.id"
        class="card group hover:scale-[1.02] transition-all duration-300"
      >
        <div class="flex items-start space-x-4">
          <img
            :src="software.icon"
            :alt="software.name"
            class="w-16 h-16 rounded-lg object-cover"
            loading="lazy"
          />
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600">
              {{ software.name }}
            </h3>
            <p class="mt-1 text-sm text-gray-500 line-clamp-2">
              {{ software.description }}
            </p>
            <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span>{{ software.version }}</span>
              <span>{{ software.size }}</span>
            </div>
          </div>
        </div>
        
        <div class="mt-4 flex items-center justify-between">
          <span class="text-sm text-gray-500">
            下载次数: {{ software.downloadCount.toLocaleString() }}
          </span>
          <button class="btn btn-primary">
            下载
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-if="!isLoading && softwareList.length === 0"
      class="text-center py-12 text-gray-500"
    >
      没有找到匹配的软件
    </div>

    <!-- 分页 -->
    <div
      v-if="totalPages > 1"
      class="flex justify-center space-x-2 mt-8"
    >
      <button
        class="btn"
        :disabled="currentPage === 1"
        @click="handlePageChange(currentPage - 1)"
      >
        上一页
      </button>
      
      <button
        v-for="page in paginationArray"
        :key="page"
        class="btn"
        :class="{ 'bg-primary-50 text-primary-600': page === currentPage }"
        @click="handlePageChange(page)"
      >
        {{ page }}
      </button>
      
      <button
        class="btn"
        :disabled="currentPage === totalPages"
        @click="handlePageChange(currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template> 