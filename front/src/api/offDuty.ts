/**
 * 脱岗检测模块 API
 * 对机台关键区域实时监测，设定监测区域和人员离岗限时，检测脱岗行为
 */
import request from '@/utils/request'

// 类型定义
export interface OffDutyRecord {
  id: number
  machineNumber: string
  operatorName: string
  startTime: string
  endTime?: string
  duration: number
  status: 'normal' | 'off_duty' | 'warning'
  alertLevel: 'low' | 'medium' | 'high'
  workshopSection: string
  alertMessage?: string
  isProcessed: boolean
  handler?: string
  processTime?: string
  processRemark?: string
  imageUrls?: string[]
  videoUrl?: string
  detectionConfidence?: number
  createdAt?: string
  updatedAt?: string
}

export interface MachineMonitorInfo {
  id: number
  machineNumber: string
  status: 'normal' | 'off_duty' | 'warning' | 'offline'
  operator?: {
    name: string
    isPresent: boolean
    lastSeenTime?: string
  }
  monitoringTime: number
  todayOffDutyCount: number
  lastOffDutyTime?: string
  detectionArea?: string
  cameraUrl?: string
  alertThreshold?: number
  warningThreshold?: number
  isActive: boolean
}

export interface OffDutyStatistics {
  totalAlerts: number
  normalCount: number
  offDutyCount: number
  warningCount: number
  todayAlerts: number
  yesterdayAlerts: number
  weekAlerts: number
  monthAlerts: number
  workshopSectionStats?: WorkshopSectionStat[]
  machineTopStats?: MachineStat[]
  timeDistributionStats?: TimeDistributionStat[]
}

export interface WorkshopSectionStat {
  workshopSection: string
  alertCount: number
  percentage: number
}

export interface MachineStat {
  machineNumber: string
  alertCount: number
  workshopSection: string
  rank: number
}

export interface TimeDistributionStat {
  timeRange: string
  alertCount: number
}

export interface OffDutyQueryParams {
  page?: number
  pageSize?: number
  machineNumber?: string
  operatorName?: string
  status?: string
  workshopSection?: string
  startDate?: string
  endDate?: string
  alertLevel?: string
  isProcessed?: boolean
  handler?: string
}

export interface ProcessStatusParams {
  isProcessed: boolean
  remark?: string
  handler?: string
}

/**
 * 获取脱岗记录列表
 */
export async function getOffDutyList(params: OffDutyQueryParams = {}) {
  return request({
    url: '/api/off-duty/records',
    method: 'GET',
    params
  })
}

/**
 * 获取脱岗记录详情
 */
export async function getOffDutyDetail(id: number) {
  return request({
    url: `/api/off-duty/records/${id}`,
    method: 'GET'
  })
}

/**
 * 更新记录处理状态
 */
export async function updateRecordProcessStatus(id: number, data: ProcessStatusParams) {
  return request({
    url: `/api/off-duty/records/${id}/process`,
    method: 'PUT',
    data
  })
}

/**
 * 获取实时机台监控数据
 */
export async function getRealtimeMachines() {
  return request({
    url: '/api/off-duty/realtime/machines',
    method: 'GET'
  })
}

/**
 * 获取机台实时监控详情
 */
export async function getMachineMonitorDetail(id: number) {
  return request({
    url: `/api/off-duty/realtime/machines/${id}`,
    method: 'GET'
  })
}

/**
 * 刷新机台监控状态
 */
export async function refreshMachineStatus(id: number) {
  return request({
    url: `/api/off-duty/realtime/machines/${id}/refresh`,
    method: 'POST'
  })
}

/**
 * 获取脱岗统计数据
 */
export async function getOffDutyStatistics(dateRange?: string[]) {
  return request({
    url: '/api/off-duty/statistics',
    method: 'GET',
    params: {
      startDate: dateRange?.[0],
      endDate: dateRange?.[1]
    }
  })
}

/**
 * 获取趋势统计数据
 */
export async function getOffDutyTrend(timeRange: 'today' | '7days' | '30days' | '90days') {
  return request({
    url: '/api/off-duty/statistics/trend',
    method: 'GET',
    params: { timeRange }
  })
}

/**
 * 导出脱岗记录数据
 */
export async function exportOffDutyRecords(params: OffDutyQueryParams = {}) {
  return request({
    url: '/api/off-duty/records/export',
    method: 'GET',
    params,
    responseType: 'blob'
  })
}

/**
 * 获取脱岗告警配置
 */
export async function getAlertConfig() {
  return request({
    url: '/api/off-duty/config',
    method: 'GET'
  })
}

/**
 * 更新脱岗告警配置
 */
export async function updateAlertConfig(config: any) {
  return request({
    url: '/api/off-duty/config',
    method: 'PUT',
    data: config
  })
}

// 导出API对象（兼容旧版调用方式）
export const offDutyApi = {
  getOffDutyList,
  getOffDutyDetail,
  updateRecordProcessStatus,
  getRealtimeMachines,
  getMachineMonitorDetail,
  refreshMachineStatus,
  getOffDutyStatistics,
  getOffDutyTrend,
  exportOffDutyRecords,
  getAlertConfig,
  updateAlertConfig
}

// 默认导出
export default offDutyApi