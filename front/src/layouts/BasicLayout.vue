<template>
  <div class="basic-layout">
    <Header />
    <div class="layout-content">
      <Sider />
      <Main />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/layout/Header.vue'
import Sider from '@/components/layout/Sider.vue'
import Main from '@/components/layout/Main.vue'

const router = useRouter()

// 页面加载时的处理
onMounted(() => {
  // 可以在这里添加一些初始化逻辑
  console.log('基础布局加载完成')
})

onUnmounted(() => {
  // 清理工作
})
</script>

<style scoped>
.basic-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>