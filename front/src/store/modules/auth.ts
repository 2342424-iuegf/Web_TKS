import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginApi, logoutApi } from '@/api/auth'
import { storage } from '@/utils/storage'

interface UserInfo {
  id: string
  username: string
  role: string
  permissions: string[]
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(storage.get('token'))
  const userInfo = ref<UserInfo | null>(null)
  
  const isLoggedIn = computed(() => !!token.value)
  
  async function login(loginData: { username: string, password: string }) {
    const res = await loginApi(loginData.username, loginData.password)
    token.value = res.data.token
    storage.set('token', token.value)
    // 获取用户信息
    userInfo.value = res.data.userInfo
  }
  
  async function logout() {
    await logoutApi()
    token.value = null
    userInfo.value = null
    storage.remove('token')
  }
  
  function hasPermission(permission: string) {
    return userInfo.value?.permissions.includes(permission) ?? false
  }
  
  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
    hasPermission
  }
})