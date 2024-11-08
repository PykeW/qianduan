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
  <div>
    <!-- 软件列表内容 -->
  </div>
</template> 