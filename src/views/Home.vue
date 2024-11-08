<script setup lang="ts">
import { ref } from 'vue'
import type { Software } from '@/types/software'
import SoftwareList from '@/components/software/SoftwareList.vue'
import { useScroll } from '@vueuse/core'

const searchQuery = ref('')
const { y } = useScroll(window)

// 模拟特色软件数据
const featuredSoftware = ref<Software[]>([
  {
    id: '1',
    name: 'Visual Studio Code',
    description: '轻量级但功能强大的代码编辑器',
    category: 'development',
    version: '1.84.0',
    downloadCount: 50000,
    size: '88.5 MB',
    lastUpdated: '2023-11-07',
    icon: '/icons/vscode.png',
    screenshots: []
  },
  // 更多特色软件...
])

const categories = [
  {
    id: 'development',
    name: '开发工具',
    icon: '💻',
    count: 158
  },
  {
    id: 'design',
    name: '设计软件',
    icon: '🎨',
    count: 86
  },
  {
    id: 'productivity',
    name: '效率工具',
    icon: '⚡',
    count: 124
  },
  {
    id: 'utilities',
    name: '系统工具',
    icon: '🔧',
    count: 95
  }
]
</script>

<template>
  <div class="min-h-screen">
    <!-- 英雄区域 -->
    <div class="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div
          class="absolute -top-48 -right-48 w-96 h-96 bg-primary-400 rounded-full blur-3xl opacity-30"
        />
        <div
          class="absolute -bottom-48 -left-48 w-96 h-96 bg-primary-400 rounded-full blur-3xl opacity-30"
        />
      </div>

      <!-- 内容 -->
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div class="text-center space-y-8">
          <h1
            class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
            :class="{ 'animate-fade-in': y < 100 }"
          >
            发现优质软件
            <span class="block text-primary-200">轻松下载与管理</span>
          </h1>
          <p
            class="max-w-2xl mx-auto text-lg sm:text-xl text-primary-100"
            :class="{ 'animate-slide-up': y < 100 }"
          >
            一站式软件下载平台，为您提供安全、快速的下载体验
          </p>

          <!-- 搜索框 -->
          <div
            class="max-w-2xl mx-auto mt-8 flex"
            :class="{ 'animate-slide-up': y < 100 }"
          >
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索软件..."
              class="flex-1 px-6 py-4 text-gray-900 rounded-l-xl border-0 focus:ring-2 focus:ring-primary-500"
            />
            <button class="px-8 py-4 bg-primary-500 text-white rounded-r-xl hover:bg-primary-400 transition-colors">
              搜索
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-8">软件分类</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <router-link
          v-for="category in categories"
          :key="category.id"
          :to="`/software?category=${category.id}`"
          class="group p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div class="text-4xl mb-4">{{ category.icon }}</div>
          <h3 class="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
            {{ category.name }}
          </h3>
          <p class="text-sm text-gray-500">{{ category.count }} 个软件</p>
        </router-link>
      </div>
    </div>

    <!-- 特色软件 -->
    <div class="bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">特色推荐</h2>
        <SoftwareList
          v-model="searchQuery"
          :software-list="featuredSoftware"
        />
      </div>
    </div>

    <!-- 统计数据 -->
    <div class="bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div class="text-4xl font-bold text-primary-600">500+</div>
            <div class="mt-2 text-gray-600">优质软件</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-primary-600">100万+</div>
            <div class="mt-2 text-gray-600">下载次数</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-primary-600">99.9%</div>
            <div class="mt-2 text-gray-600">下载成功率</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-primary-600">24/7</div>
            <div class="mt-2 text-gray-600">技术支持</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

.animate-slide-up {
  animation: slideUp 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 