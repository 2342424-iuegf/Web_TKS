import request from '@/utils/request'

// 入侵记录相关接口
interface IntrusionRecordQuery {
  areaName?: string
  personName?: string
  warningLevel?: string
  workshopSection?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
  status?: string
}

interface IntrusionRecord {
  id: number
  dangerZone: {
    id: number
    areaName: string
    workshopSection: string
    warningLevel: string
  }
  personName: string
  intrusionTime: string
  leaveTime?: string
  duration: number
  warningLevel: string
  alertMessage?: string
  status: 'pending' | 'processing' | 'processed'
  handler?: string
  processTime?: string
  processRemark?: string
  imageUrls?: string[]
  videoUrl?: string
}

interface IntrusionRecordResponse {
  data: {
    list: IntrusionRecord[]
    total: number
    page: number
    pageSize: number
  }
  message: string
  code: number
}

// 获取入侵记录列表
export const getIntrusionList = async (params: IntrusionRecordQuery) => {
  return request<IntrusionRecordResponse>({ 
    url: '/api/monitoring/danger/intrusion/list', 
    method: 'get', 
    params 
  })
}

// 获取入侵记录详情
export const getIntrusionDetail = async (id: number) => {
  return request<{ data: IntrusionRecord; message: string; code: number }>({
    url: `/api/monitoring/danger/intrusion/${id}`,
    method: 'get'
  })
}

// 更新记录处理状态
interface UpdateProcessStatusParams {
  id: number
  status: 'pending' | 'processing' | 'processed'
  processRemark?: string
  handler?: string
  processTime?: string
}

export const updateRecordProcessStatus = async (params: UpdateProcessStatusParams) => {
  return request<{ message: string; code: number }>({
    url: '/api/monitoring/danger/intrusion/update-status',
    method: 'put',
    data: params
  })
}

// 危险区域相关接口
interface DangerZone {
  id: number
  areaName: string
  workshopSection: string
  warningLevel: string
  description?: string
  isActive: boolean
  isAlerting: boolean
  todayIntrusionCount: number
  createdAt: string
  currentIntrusion?: IntrusionRecord
}

interface CreateDangerZoneParams {
  areaName: string
  workshopSection: string
  warningLevel: string
  description?: string
  isActive: boolean
}

interface UpdateDangerZoneParams extends CreateDangerZoneParams {
  id: number
}

// 获取危险区域列表
export const getDangerZones = async () => {
  return request<{ data: DangerZone[]; message: string; code: number }>({
    url: '/api/monitoring/danger/zone/list',
    method: 'get'
  })
}

// 获取危险区域详情
export const getDangerZoneDetail = async (id: number) => {
  return request<{ data: DangerZone; message: string; code: number }>({
    url: `/api/monitoring/danger/zone/${id}`,
    method: 'get'
  })
}

// 新增危险区域
export const addDangerZone = async (data: CreateDangerZoneParams) => {
  return request<{ data: DangerZone; message: string; code: number }>({
    url: '/api/monitoring/danger/zone',
    method: 'post',
    data
  })
}

// 更新危险区域
export const updateDangerZone = async (data: UpdateDangerZoneParams) => {
  return request<{ message: string; code: number }>({
    url: '/api/monitoring/danger/zone',
    method: 'put',
    data
  })
}

// 删除危险区域
export const deleteDangerZone = async (id: number) => {
  return request<{ message: string; code: number }>({
    url: `/api/monitoring/danger/zone/${id}`,
    method: 'delete'
  })
}

// 切换危险区域状态
interface ToggleZoneStatusParams {
  id: number
  isActive: boolean
}

export const toggleDangerZoneStatus = async (params: ToggleZoneStatusParams) => {
  return request<{ message: string; code: number }>({
    url: '/api/monitoring/danger/zone/toggle-status',
    method: 'put',
    params
  })
}

// 统计相关接口
interface DangerStatistics {
  totalIntrusions: number
  activeDangerZones: number
  currentAlerts: number
  todayIntrusions: number
}

// 获取危险区域统计信息
export const getDangerZoneStatistics = async () => {
  return request<{ data: DangerStatistics; message: string; code: number }>({
    url: '/api/monitoring/danger/statistics',
    method: 'get'
  })
}

// 获取趋势数据
interface TrendData {
  date: string
  intrusionCount: number
}

interface TrendQuery {
  timeRange: 'today' | '7days' | '30days'
}

export const getIntrusionTrend = async (params: TrendQuery) => {
  return request<{ data: TrendData[]; message: string; code: number }>({
    url: '/api/monitoring/danger/trend',
    method: 'get',
    params
  })
}

// 导出入侵记录
export const exportIntrusionRecords = async (params: IntrusionRecordQuery) => {
  return request<{ data: string; message: string; code: number }>({
    url: '/api/monitoring/danger/intrusion/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 获取视频流地址
export const getVideoStreamUrl = async (zoneId: number) => {
  return request<{ data: { streamUrl: string }; message: string; code: number }>({
    url: `/api/monitoring/danger/zone/${zoneId}/video-stream`,
    method: 'get'
  })
}

// 获取区域分布图数据
export const getZoneDistributionData = async () => {
  return request<{ 
    data: { 
      zones: Array<{ id: number; areaName: string; intrusionCount: number }>
    }; 
    message: string; 
    code: number 
  }>({
    url: '/api/monitoring/danger/zone/distribution',
    method: 'get'
  })
}

// 创建API对象，方便在非ES模块环境中使用
const dangerApi = {
  getIntrusionList,
  getIntrusionDetail,
  updateRecordProcessStatus,
  getDangerZones,
  getDangerZoneDetail,
  addDangerZone,
  updateDangerZone,
  deleteDangerZone,
  toggleDangerZoneStatus,
  getDangerZoneStatistics,
  getIntrusionTrend,
  exportIntrusionRecords,
  getVideoStreamUrl,
  getZoneDistributionData
}

export default dangerApi
