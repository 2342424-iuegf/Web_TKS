import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/BasicLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // 系统管理
      { path: '/system/user', name: 'UserManagement', component: () => import('@/views/system/User.vue') },
      { path: '/system/role', name: 'RoleManagement', component: () => import('@/views/system/Role.vue') },
      { path: '/system/parameter', name: 'ParameterSetting', component: () => import('@/views/system/Parameter.vue') },
      { path: '/system/camera', name: 'CameraManagement', component: () => import('@/views/system/Camera.vue') },
      { path: '/system/event-push', name: 'EventPushSetting', component: () => import('@/views/system/EventPush.vue') },
      { path: '/system/config', name: 'SystemConfig', component: () => import('@/views/system/SystemConfig.vue') },
      // 检测区域设置
      { path: '/detection/car-exchange', name: 'CarExchangeArea', component: () => import('@/views/detection/CarExchange.vue') },
      { path: '/detection/off-duty', name: 'OffDutyArea', component: () => import('@/views/detection/WorkAbsence.vue') },
      { path: '/detection/danger', name: 'DangerArea', component: () => import('@/views/detection/DangerArea.vue') },
      // 模型管理
      { path: '/model', name: 'ModelManagement', component: () => import('@/views/model/ModelManagement.vue') },
      // 监控模块 - 统一管理所有检测功能
      { path: '/monitoring', name: 'MonitoringHome', component: () => import('@/views/monitoring/MonitoringHome.vue') },
      // 布车分布检测
      { path: '/monitoring/cloth-car', name: 'ClothCarDistribution', component: () => import('@/views/monitoring/ClothCarDistribution.vue') },
      // 通道出入检测
      { path: '/monitoring/channel-access', name: 'ChannelAccess', component: () => import('@/views/monitoring/ChannelAccess.vue') },
      // 落布换车检测
      { path: '/monitoring/cloth-change', name: 'ClothChangeDetection', component: () => import('@/views/monitoring/ClothChangeDetection.vue') },
      // 脱岗检测
      { path: '/monitoring/off-duty', name: 'OffDutyDetection', component: () => import('@/views/monitoring/OffDutyDetection.vue') },
      // 危险检测
      { path: '/monitoring/danger', name: 'DangerDetection', component: () => import('@/views/monitoring/DangerDetection.vue') },
      // 事件查询
      { path: '/monitoring/event-query', name: 'EventQuery', component: () => import('@/views/monitoring/EventQuery.vue') },
      // 视频查询
      { path: '/monitoring/live-video', name: 'LiveVideo', component: () => import('@/views/monitoring/LiveVideo.vue') },
      { path: '/monitoring/history-video', name: 'HistoryVideo', component: () => import('@/views/monitoring/HistoryVideo.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false
  
  // 如果访问登录页
  if (to.path === '/login') {
    // 如果已登录且token已验证，跳转到首页
    if (authStore.isLoggedIn && authStore.tokenValidated) {
      next('/')
      return
    }
    // 如果有token但未验证，验证一下
    if (authStore.isLoggedIn && !authStore.tokenValidated) {
      try {
        await authStore.fetchUserInfo()
        next('/')
      } catch {
        // token无效，清除并停留在登录页
        await authStore.logout()
        next()
      }
      return
    }
    // 没有token，停留在登录页
    next()
    return
  }
  
  // 需要认证的页面
  if (requiresAuth) {
    if (!authStore.isLoggedIn) {
      // 没有token，跳转登录页
      next('/login')
    } else if (!authStore.tokenValidated) {
      // 有token但未验证，验证token有效性
      try {
        await authStore.fetchUserInfo()
        next()
      } catch {
        // token无效，清除并跳转登录页
        await authStore.logout()
        next('/login')
      }
    } else {
      // token已验证，直接通过
      next()
    }
  } else {
    // 不需要认证的页面
    next()
  }
})

export default router
