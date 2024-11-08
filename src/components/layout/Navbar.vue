<template>
  <nav>
    <div class="nav-container">
      <button class="menu-button">
        <MenuIcon class="h-6 w-6" />
      </button>
      <!-- 其他导航内容 -->
    </div>
  </nav>
</template>

<script setup>
import { Bars3Icon as MenuIcon } from '@heroicons/vue/24/outline'
</script>

<style scoped>
.nav-container {
  padding: 1rem;
}

.menu-button {
  cursor: pointer;
}
</style> 