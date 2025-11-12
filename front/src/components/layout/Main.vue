<template>
  <main class="main-content">
    <div class="content-wrapper">
      <router-view />
    </div>
  </main>
</template>

<script setup lang="ts">
// 主内容区域组件
</script>

<style scoped>
.main-content {
  flex: 1;
  background: #f0f2f5;
  overflow: hidden;
}

.content-wrapper {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
}
</style>