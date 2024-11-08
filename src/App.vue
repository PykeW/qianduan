<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from './components/layout/Navbar.vue'
import { healthApi } from './api'

const connectionStatus = ref('')

onMounted(async () => {
  try {
    await healthApi.check()
    connectionStatus.value = '连接成功'
  } catch (error) {
    connectionStatus.value = '连接失败'
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    <main class="container mx-auto px-4 py-8">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <div>{{ connectionStatus }}</div>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
