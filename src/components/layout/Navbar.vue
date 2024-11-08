<script setup lang="ts">
import { ref } from 'vue'
import { MenuIcon, XIcon } from '@heroicons/vue/outline'
import { useWindowSize } from '@vueuse/core'

const isMenuOpen = ref(false)
const { width } = useWindowSize()

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const navItems = [
  { name: '首页', path: '/' },
  { name: '软件列表', path: '/software' },
  { name: '版本管理', path: '/versions' },
  { name: '下载中心', path: '/downloads' },
]
</script>

<template>
  <nav class="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <!-- Logo -->
        <div class="flex-shrink-0 flex items-center">
          <h1 class="text-2xl font-bold text-primary-600">软件中心</h1>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex space-x-8">
          <router-link
            v-for="item in navItems"
            :key="item.name"
            :to="item.path"
            class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium
                   transition-colors duration-200"
            active-class="text-primary-600"
          >
            {{ item.name }}
          </router-link>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100
                   focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            @click="toggleMenu"
          >
            <MenuIcon v-if="!isMenuOpen" class="h-6 w-6" />
            <XIcon v-else class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-full opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-full opacity-0"
    >
      <div v-if="isMenuOpen" class="md:hidden bg-white border-b">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <router-link
            v-for="item in navItems"
            :key="item.name"
            :to="item.path"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700
                   hover:text-primary-600 hover:bg-gray-50"
            active-class="text-primary-600 bg-primary-50"
            @click="isMenuOpen = false"
          >
            {{ item.name }}
          </router-link>
        </div>
      </div>
    </transition>
  </nav>
</template> 