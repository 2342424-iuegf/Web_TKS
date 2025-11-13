<template>
  <header class="header">
    <div class="header-left">
      <div class="logo">Web_TKS 系统</div>
    </div>
    <div class="header-right">
      <ElDropdown trigger="click">
        <span class="user-info">
          <img :src="userAvatar" alt="用户头像" class="user-avatar">
          {{ userName }} <ElIcon class="el-icon--right"><ArrowDown /></ElIcon>
        </span>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem @click="handleProfile">
              <ElIcon><User /></ElIcon>
              <span style="margin-left: 8px">个人中心</span>
            </ElDropdownItem>
            <ElDropdownItem @click="handleSettings">
              <ElIcon><Setting /></ElIcon>
              <span style="margin-left: 8px">系统设置</span>
            </ElDropdownItem>
            <ElDropdownItem divided @click="handleLogout">
              <ElIcon><SwitchButton /></ElIcon>
              <span style="margin-left: 8px">退出登录</span>
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElIcon, ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessageBox, ElMessage } from 'element-plus'
import { ArrowDown, User, Setting, SwitchButton } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/modules/auth'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => authStore.userInfo?.username || '未登录')
const userAvatar = computed(() => 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif')

function handleProfile() {
  // 跳转到个人中心
  console.log('跳转到个人中心')
}

function handleSettings() {
  // 跳转到系统设置
  router.push('/system/parameter')
}

async function handleLogout() {
  try {
    // 确认退出
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 执行退出
    await authStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error: any) {
    // 用户取消退出，不处理
    if (error === 'cancel') {
      return
    }
    console.error('退出登录失败:', error)
  }
}
</script>

<style scoped>
.header {
  height: 60px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
}
</style>