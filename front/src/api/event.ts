import request from '@/utils/request'

// 事件记录查询接口
interface EventQueryParams {
  eventType?: string
  eventLevel?: string
  workshopSection?: string
  startTime?: string
  endTime?: string
  status?: string
  keyword?: string
  page?: number
  pageSize?: number
}

interface EventRecord {
  id: number
  eventType: string
  eventTypeName: string
  eventLevel: string
  eventTime: string
  workshopSection: string
  machineNumber?: string
  clothCarNumber?: string
  location?: string
  description: string
  status: 'pending' | 'processing' | 'processed'
  handler?: string
  processTime?: string
  processRemark?: string
  sourceModule: string
  imageUrls?: string[]
  videoUrl?: string
  alarmData?: any
}

interface EventRecordResponse {
  data: {
    list: EventRecord[]
    total: number
    page: number
    pageSize: number
  }
  message: string
  code: number
}

// 获取事件记录列表
export const getEventList = async (params: EventQueryParams) => {
  return request<EventRecordResponse>({
    url: '/api/monitoring/event/list',
    method: 'get',
    params
  })
}

// 获取事件详情
export const getEventDetail = async (id: number) => {
  return request<{ data: EventRecord; message: string; code: number }>({
    url: `/api/monitoring/event/${id}`,
    method: 'get'
  })
}

// 更新事件处理状态
interface UpdateEventStatusParams {
  id: number
  status: 'pending' | 'processing' | 'processed'
  processRemark?: string
  handler?: string
}

export const updateEventStatus = async (params: UpdateEventStatusParams) => {
  return request<{ message: string; code: number }>({
    url: '/api/monitoring/event/update-status',
    method: 'put',
    data: params
  })
}

// 统计接口
interface EventStatistics {
  totalEvents: number
  pendingEvents: number
  processingEvents: number
  processedEvents: number
  eventTypeDistribution: Array<{ name: string; value: number }>
  eventLevelDistribution: Array<{ name: string; value: number }>
  recentEvents: EventRecord[]
}

// 获取事件统计信息
export const getEventStatistics = async () => {
  return request<{ data: EventStatistics; message: string; code: number }>({
    url: '/api/monitoring/event/statistics',
    method: 'get'
  })
}

// 获取事件趋势数据
interface EventTrendParams {
  timeRange: 'today' | '7days' | '30days'
  eventType?: string
}

interface TrendData {
  date: string
  count: number
}

export const getEventTrend = async (params: EventTrendParams) => {
  return request<{ data: TrendData[]; message: string; code: number }>({
    url: '/api/monitoring/event/trend',
    method: 'get',
    params
  })
}

// 导出事件记录
export const exportEventRecords = async (params: EventQueryParams) => {
  return request({
    url: '/api/monitoring/event/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 批量处理事件
interface BatchProcessParams {
  ids: number[]
  status: 'pending' | 'processing' | 'processed'
  processRemark?: string
}

export const batchProcessEvents = async (params: BatchProcessParams) => {
  return request<{ message: string; code: number }>({
    url: '/api/monitoring/event/batch-process',
    method: 'put',
    data: params
  })
}

// 获取事件类型列表
export const getEventTypes = async () => {
  return request<{ 
    data: Array<{ value: string; label: string }>; 
    message: string; 
    code: number 
  }>({
    url: '/api/monitoring/event/types',
    method: 'get'
  })
}

// 获取事件级别列表
export const getEventLevels = async () => {
  return request<{ 
    data: Array<{ value: string; label: string }>; 
    message: string; 
    code: number 
  }>({
    url: '/api/monitoring/event/levels',
    method: 'get'
  })
}

// 获取事件源模块列表
export const getEventSourceModules = async () => {
  return request<{ 
    data: Array<{ value: string; label: string }>; 
    message: string; 
    code: number 
  }>({
    url: '/api/monitoring/event/sources',
    method: 'get'
  })
}

// 创建API对象，方便在非ES模块环境中使用
export const eventApi = {
  getList: getEventList,
  getDetail: getEventDetail,
  getTypes: getEventTypes,
  getStatistics: getEventStatistics,
  export: exportEventRecords,
  markAsProcessed: (id: string) => updateEventStatus({ id: Number(id), status: 'processed' }),
  batchMarkAsProcessed: (ids: string[]) => batchProcessEvents({ ids: ids.map(Number), status: 'processed' })
}