import request from '@/utils/request';

/**
 * 落布换车检测模块API
 * 监测关键机台落布时布车切换信息，并将切换时间、车号信息即时发送MQTT信息到MES系统
 */

// 落布换车记录参数接口
export interface ClothChangeListParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  machineNumber?: string;
  carNumber?: string;
  status?: string;
  workshopSection?: string;
  clothBatch?: string;
}

// 落布换车记录接口
export interface ClothChangeRecord {
  id: number;
  machineNumber: string;
  carNumber: string;
  clothBatch?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: string;
  mesStatus: string;
  workshopSection: string;
  remark?: string;
  operator?: string;
  imageUrls?: string[];
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 机台实时状态接口
export interface MachineRealtimeStatus {
  id: number;
  machineNumber: string;
  status: string;
  isChanging: boolean;
  currentCar: string;
  currentBatch: string;
  runningTime: number;
  todayChangeCount: number;
  lastChangeTime: string;
  alertLevel: string;
}

// 统计数据接口
export interface ClothChangeStatistics {
  totalChanges: number;
  successChanges: number;
  failedChanges: number;
  averageTime: number;
  todayChanges: number;
  weekChanges: number;
  monthChanges: number;
  byWorkshopSection?: {
    section: string;
    count: number;
    successRate: number;
  }[];
}

// 图表数据接口
export interface ChartData {
  labels: string[];
  data: number[];
}

// 落布换车记录列表
export async function getClothChangeList(params: ClothChangeListParams = {}) {
  return request({
    url: '/api/detection/cloth-change/list',
    method: 'get',
    params: {
      page: 1,
      pageSize: 10,
      ...params
    }
  });
}

// 落布换车记录详情
export async function getChangeRecordDetail(id: number) {
  return request({
    url: `/api/detection/cloth-change/detail/${id}`,
    method: 'get'
  });
}

// 获取实时机台状态
export async function getRealtimeMachines() {
  return request({
    url: '/api/detection/cloth-change/realtime-machines',
    method: 'get'
  });
}

// 获取换车统计信息
export async function getClothChangeStatistics(dateRange?: string[]) {
  return request({
    url: '/api/detection/cloth-change/statistics',
    method: 'get',
    params: {
      startDate: dateRange?.[0],
      endDate: dateRange?.[1]
    }
  });
}

// 重新同步到MES系统
export async function syncRecordToMes(recordId: number) {
  return request({
    url: `/api/detection/cloth-change/sync-to-mes/${recordId}`,
    method: 'post'
  });
}

// 获取换车趋势图表数据
export async function getChangeTrendChart(timeRange: string) {
  return request({
    url: '/api/detection/cloth-change/trend-chart',
    method: 'get',
    params: {
      timeRange
    }
  });
}

// 获取机台换车效率排名
export async function getMachineEfficiencyRanking(topN = 10) {
  return request({
    url: '/api/detection/cloth-change/efficiency-ranking',
    method: 'get',
    params: {
      topN
    }
  });
}

// 导出换车记录数据
export async function exportClothChangeData(params: ClothChangeListParams = {}) {
  return request({
    url: '/api/detection/cloth-change/export',
    method: 'get',
    responseType: 'blob',
    params
  });
}

// 获取布车在机台的停留时间记录
export async function getCarStayRecords(params: {
  machineNumber?: string;
  carNumber?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  return request({
    url: '/api/detection/cloth-change/stay-records',
    method: 'get',
    params: {
      page: 1,
      pageSize: 20,
      ...params
    }
  });
}

// 手动触发换车记录
export async function manuallyTriggerChange(params: {
  machineNumber: string;
  carNumber: string;
  clothBatch?: string;
  remark?: string;
}) {
  return request({
    url: '/api/detection/cloth-change/manual-trigger',
    method: 'post',
    data: params
  });
}

// 获取换车异常告警列表
export async function getChangeAlerts(params: {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  return request({
    url: '/api/detection/cloth-change/alerts',
    method: 'get',
    params: {
      page: 1,
      pageSize: 20,
      ...params
    }
  });
}

// 处理换车异常
export async function handleChangeAlert(alertId: number, params: {
  status: string;
  remark?: string;
}) {
  return request({
    url: `/api/detection/cloth-change/alerts/${alertId}/handle`,
    method: 'put',
    data: params
  });
}

// 落布换车检测API对象
export const clothChangeApi = {
  getClothChangeList,
  getChangeRecordDetail,
  getRealtimeMachines,
  getClothChangeStatistics,
  syncRecordToMes,
  getChangeTrendChart,
  getMachineEfficiencyRanking,
  exportClothChangeData,
  getCarStayRecords,
  manuallyTriggerChange,
  getChangeAlerts,
  handleChangeAlert
};

export default clothChangeApi;