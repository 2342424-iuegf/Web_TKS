import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginApi, logoutApi, getUserInfoApi } from '@/api/auth'
import { storage } from '@/utils/storage'

interface UserInfo {
  id: number
  username: string
  email: string | null
  role: string
  isActive: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(storage.get('token'))
  const refreshToken = ref<string | null>(storage.get('refreshToken'))
  const userInfo = ref<UserInfo | null>(null)
  const tokenValidated = ref<boolean>(false) // token是否已验证过
  
  const isLoggedIn = computed(() => !!token.value)
  
  /**
   * 用户登录
   */
  async function login(loginData: { username: string, password: string }) {
    try {
      const res = await loginApi(loginData.username, loginData.password)
      
      // 保存token
      token.value = res.data.token
      refreshToken.value = res.data.refreshToken
      storage.set('token', token.value)
      storage.set('refreshToken', refreshToken.value)
      
      // 保存用户信息
      userInfo.value = res.data.userInfo
      storage.set('userInfo', userInfo.value)
      tokenValidated.value = true // 登录时token已验证
    } catch (error: any) {
      // 处理登录错误
      const errorMessage = error?.response?.data?.detail || error?.message || '登录失败'
      throw new Error(errorMessage)
    }
  }
  
  /**
   * 用户登出
   */
  async function logout() {
    try {
      await logoutApi()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 清除本地数据
      token.value = null
      refreshToken.value = null
      userInfo.value = null
      tokenValidated.value = false
      storage.remove('token')
      storage.remove('refreshToken')
      storage.remove('userInfo')
    }
  }
  
  /**
   * 获取用户信息（从服务器）
   */
  async function fetchUserInfo() {
    try {
      const res = await getUserInfoApi()
      userInfo.value = {
        id: res.data.id,
        username: res.data.username,
        email: res.data.email,
        role: res.data.is_superuser ? 'admin' : 'user',
        isActive: res.data.is_active
      }
      storage.set('userInfo', userInfo.value)
      tokenValidated.value = true // 标记token已验证
      return userInfo.value
    } catch (error) {
      console.error('获取用户信息失败:', error)
      tokenValidated.value = false
      throw error
    }
  }
  
  /**
   * 初始化用户信息（从本地存储）
   * 注意：这里只恢复用户信息显示，不验证token有效性
   * token有效性在路由守卫中验证
   */
  function initUserInfo() {
    const storedUserInfo = storage.get('userInfo')
    if (storedUserInfo) {
      userInfo.value = storedUserInfo
    }
  }
  
  /**
   * 验证token是否有效
   * 通过调用获取用户信息接口来验证
   */
  async function validateToken(): Promise<boolean> {
    if (!token.value) {
      return false
    }
    
    try {
      await fetchUserInfo()
      return true
    } catch {
      // token无效，清除本地数据
      await logout()
      return false
    }
  }
  
  /**
   * 检查权限（基于角色）
   */
  function hasPermission(permission: string) {
    if (!userInfo.value) return false
    
    // 管理员拥有所有权限
    if (userInfo.value.role === 'admin') {
      return true
    }
    
    // 可以根据需要扩展权限检查逻辑
    return false
  }
  
  /**
   * 检查是否为管理员
   */
  const isAdmin = computed(() => userInfo.value?.role === 'admin')
  
  return {
    token,
    refreshToken,
    userInfo,
    isLoggedIn,
    isAdmin,
    tokenValidated,
    login,
    logout,
    fetchUserInfo,
    initUserInfo,
    validateToken,
    hasPermission
  }
})