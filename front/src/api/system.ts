import request from '@/utils/request'

// 系统配置相关接口
export interface SystemConfig {
  id?: string
  configKey: string
  configValue: any
  description?: string
  configType?: string
  groupName?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

// 分页参数
export interface SystemConfigQueryParams {
  configKey?: string
  groupName?: string
  page?: number
  pageSize?: number
}

// 配置组
export interface ConfigGroup {
  name: string
  label: string
  description?: string
  order?: number
}

// 用户管理接口
export const userApi = {
  // 获取用户列表
  getList(params?: any) {
    return request.get('/system/users', { params })
  },
  // 创建用户
  create(data: any) {
    return request.post('/system/users', data)
  },
  // 更新用户
  update(id: string, data: any) {
    return request.put(`/system/users/${id}`, data)
  },
  // 删除用户
  delete(id: string) {
    return request.delete(`/system/users/${id}`)
  },
  // 重置密码
  resetPassword(id: string, password: string) {
    return request.post(`/system/users/${id}/reset-password`, { password })
  }
}

// 角色管理接口
export const roleApi = {
  // 获取角色列表
  getList() {
    return request.get('/system/roles')
  },
  // 创建角色
  create(data: any) {
    return request.post('/system/roles', data)
  },
  // 更新角色
  update(id: string, data: any) {
    return request.put(`/system/roles/${id}`, data)
  },
  // 删除角色
  delete(id: string) {
    return request.delete(`/system/roles/${id}`)
  },
  // 获取角色权限
  getPermissions(id: string) {
    return request.get(`/system/roles/${id}/permissions`)
  },
  // 更新角色权限
  updatePermissions(id: string, permissions: string[]) {
    return request.put(`/system/roles/${id}/permissions`, { permissions })
  }
}

// 参数设置接口
export const parameterApi = {
  // 获取参数列表
  getList(params?: SystemConfigQueryParams) {
    return request.get('/system/parameters', { params })
  },
  // 更新参数
  update(id: string, value: any) {
    return request.put(`/system/parameters/${id}`, { value })
  },
  // 批量更新参数
  batchUpdate(data: { id: string; value: any }[]) {
    return request.put('/system/parameters/batch', data)
  },
  // 获取参数分组
  getGroups() {
    return request.get('/system/parameters/groups')
  },
  // 根据分组获取参数
  getByGroup(groupName: string) {
    return request.get(`/system/parameters/group/${groupName}`)
  }
}

// 摄像头管理接口
export const cameraApi = {
  // 获取摄像头列表
  getList(params?: any) {
    return request.get('/system/cameras', { params })
  },
  // 创建摄像头
  create(data: any) {
    return request.post('/system/cameras', data)
  },
  // 更新摄像头
  update(id: string, data: any) {
    return request.put(`/system/cameras/${id}`, data)
  },
  // 删除摄像头
  delete(id: string) {
    return request.delete(`/system/cameras/${id}`)
  },
  // 获取摄像头实时流
  getStreamUrl(id: string) {
    return request.get(`/system/cameras/${id}/stream-url`)
  },
  // 获取摄像头状态
  getStatus(id: string) {
    return request.get(`/system/cameras/${id}/status`)
  },
  // 测试摄像头连接
  testConnection(data: any) {
    return request.post('/system/cameras/test-connection', data)
  },
  // 批量导入摄像头
  importCameras(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/system/cameras/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  // 导出摄像头配置
  exportCameras() {
    return request.get('/system/cameras/export', { responseType: 'blob' })
  }
}

// 事件推送设置接口
export const eventPushApi = {
  // 获取推送配置
  getConfig() {
    return request.get('/system/event-push')
  },
  // 更新推送配置
  update(data: any) {
    return request.put('/system/event-push', data)
  },
  // 测试推送
  testPush() {
    return request.post('/system/event-push/test')
  },
  // 获取推送历史
  getHistory(params?: { page?: number; pageSize?: number }) {
    return request.get('/system/event-push/history', { params })
  },
  // 清除推送历史
  clearHistory() {
    return request.delete('/system/event-push/history')
  }
}

// 系统配置管理接口
export const systemConfigApi = {
  // 获取系统配置列表
  getConfigList(params?: SystemConfigQueryParams) {
    return request.get('/api/system/config/list', { params })
  },
  // 获取系统配置详情
  getConfig(configKey: string) {
    return request.get(`/api/system/config/${configKey}`)
  },
  // 更新系统配置
  updateConfig(data: SystemConfig) {
    return request.put('/api/system/config/update', data)
  },
  // 批量更新系统配置
  batchUpdateConfig(data: SystemConfig[]) {
    return request.put('/api/system/config/batch-update', data)
  },
  // 获取配置组列表
  getConfigGroups() {
    return request.get('/api/system/config/groups')
  },
  // 获取系统信息
  getSystemInfo() {
    return request.get('/api/system/info')
  },
  // 获取系统运行状态
  getSystemStatus() {
    return request.get('/api/system/status')
  },
  // 重启系统
  restartSystem() {
    return request.post('/api/system/restart')
  },
  // 清理缓存
  clearCache() {
    return request.post('/api/system/cache/clear')
  },
  // 备份系统配置
  backupConfig() {
    return request.post('/api/system/config/backup')
  },
  // 恢复系统配置
  restoreConfig(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/api/system/config/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  // 导出系统配置
  exportConfig() {
    return request.get('/api/system/config/export', { responseType: 'blob' })
  },
  // 导入系统配置
  importConfig(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/api/system/config/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// 日志管理接口
export const logApi = {
  // 获取系统日志列表
  getSystemLogs(params?: { 
    level?: string; 
    keyword?: string; 
    startTime?: string; 
    endTime?: string;
    page?: number;
    pageSize?: number;
  }) {
    return request.get('/system/logs', { params })
  },
  // 获取操作日志列表
  getOperationLogs(params?: { 
    operatorId?: string; 
    operation?: string; 
    startTime?: string; 
    endTime?: string;
    page?: number;
    pageSize?: number;
  }) {
    return request.get('/system/logs/operation', { params })
  },
  // 清除系统日志
  clearSystemLogs() {
    return request.delete('/system/logs')
  },
  // 清除操作日志
  clearOperationLogs() {
    return request.delete('/system/logs/operation')
  }
}

// 通知管理接口
export const notificationApi = {
  // 获取通知设置
  getSettings() {
    return request.get('/system/notification/settings')
  },
  // 更新通知设置
  updateSettings(data: any) {
    return request.put('/system/notification/settings', data)
  },
  // 测试通知
  testNotification(type: string) {
    return request.post('/system/notification/test', { type })
  }
}

// 兼容历史按函数名导入的写法（系统管理）
export const getUserList = (params?: any) => userApi.getList(params)
export const createUser = (data: any) => userApi.create(data)
export const updateUser = (id: string, data: any) => userApi.update(id, data)
export const deleteUser = (id: string) => userApi.delete(id)
export const updateUserStatus = (id: string, status: string) => request.put(`/system/users/${id}/status`, { status })

// 角色管理函数别名
export const getRoleList = () => roleApi.getList()
export const createRole = (data: any) => roleApi.create(data)
export const updateRole = (id: string, data: any) => roleApi.update(id, data)
export const deleteRole = (id: string) => roleApi.delete(id)
export const getPermissionTree = (id: string) => roleApi.getPermissions(id)
export const saveRolePermissions = (id: string, permissions: string[]) => roleApi.updatePermissions(id, permissions)

// 参数设置函数别名
export const getSystemParameters = (params?: SystemConfigQueryParams) => parameterApi.getList(params)
export const updateSystemParameters = (data: { id: string; value: any }[]) => parameterApi.batchUpdate(data)

// 摄像头管理函数别名
export const getCameraList = (params?: any) => cameraApi.getList(params)
export const createCamera = (data: any) => cameraApi.create(data)
export const updateCamera = (id: string, data: any) => cameraApi.update(id, data)
export const deleteCamera = (id: string) => cameraApi.delete(id)
export const testCameraConnection = (data: any) => cameraApi.testConnection(data)

// 事件推送设置函数别名
export const getEventPushSettings = () => eventPushApi.getConfig()
export const updateEventPushSettings = (data: any) => eventPushApi.update(data)
export const testEventPushConnection = () => eventPushApi.testPush()