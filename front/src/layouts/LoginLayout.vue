<template>
  <div class="login-layout">
    <div class="login-container">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
// 登录页面布局
</script>

<style scoped>
.login-layout {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 400px;
  max-width: 90%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>