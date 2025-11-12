import request from '@/utils/request';

// 通道出入检测相关API接口定义

// 通道进出记录接口参数类型定义
export interface ChannelAccessParams {
  carNumber?: string;        // 布车号
  channel?: string;          // 通道ID
  direction?: string;        // 方向(in/out)
  workshopSection?: string;  // 工段
  startDate?: string;        // 开始日期
  endDate?: string;          // 结束日期
  page?: number;             // 当前页码
  pageSize?: number;         // 每页大小
}

// 通道进出记录数据类型定义
export interface ChannelAccessRecord {
  id: number;               // 记录ID
  carNumber: string;        // 布车号
  channelName: string;      // 通道名称
  direction: string;        // 方向(in/out)
  workshopSection: string;  // 所属工段
  accessTime: string;       // 进出时间
  status: string;           // 状态(normal/abnormal)
  camera: string;           // 摄像头
  remark?: string;          // 备注
  imageUrl?: string;        // 图片URL
  videoUrl?: string;        // 视频URL
}

// 通道信息类型定义
export interface ChannelInfo {
  id: number;               // 通道ID
  name: string;             // 通道名称
  status: string;           // 状态(online/offline)
  cameraId: number;         // 摄像头ID
  cameraIp: string;         // 摄像头IP
  todayEnterCount: number;  // 今日进入次数
  todayExitCount: number;   // 今日离开次数
  occupancyRate: number;    // 占用率
  lastAccessRecord?: ChannelAccessRecord; // 最近一次进出记录
}

// 统计信息类型定义
export interface AccessStatistics {
  totalAccess: number;      // 总进出次数
  enterCount: number;       // 进入次数
  exitCount: number;        // 离开次数
  abnormalCount: number;    // 异常次数
}

// 通道出入记录列表响应类型
export interface ChannelAccessListResponse {
  code: number;
  message: string;
  data: {
    list: ChannelAccessRecord[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// 获取通道进出记录列表
export async function getChannelAccessList(params: ChannelAccessParams): Promise<ChannelAccessListResponse> {
  return request({
    url: '/api/detection/channel-access/list',
    method: 'get',
    params
  });
}

// 获取通道进出记录详情
export async function getAccessRecordDetail(recordId: number): Promise<{ code: number; message: string; data: ChannelAccessRecord }> {
  return request({
    url: `/api/detection/channel-access/detail/${recordId}`,
    method: 'get'
  });
}

// 更新通道进出记录备注
export async function updateAccessRecordRemark(recordId: number, remark: string): Promise<{ code: number; message: string }> {
  return request({
    url: `/api/detection/channel-access/remark/${recordId}`,
    method: 'put',
    data: { remark }
  });
}

// 获取实时通道列表
export async function getRealtimeChannels(): Promise<{ code: number; message: string; data: ChannelInfo[] }> {
  return request({
    url: '/api/detection/channel-access/realtime',
    method: 'get'
  });
}

// 获取通道进出统计信息
export async function getStatistics(dateRange?: string[]): Promise<{ code: number; message: string; data: AccessStatistics }> {
  return request({
    url: '/api/detection/channel-access/statistics',
    method: 'get',
    params: dateRange ? { startDate: dateRange[0], endDate: dateRange[1] } : {}
  });
}

// 导出通道进出记录
export async function exportChannelAccessData(params: ChannelAccessParams): Promise<Blob> {
  return request({
    url: '/api/detection/channel-access/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
}

// 获取通道历史占用统计
export async function getChannelOccupancyStats(channelId: number, timeRange: string): Promise<{ code: number; message: string; data: any }> {
  return request({
    url: '/api/detection/channel-access/occupancy-stats',
    method: 'get',
    params: { channelId, timeRange }
  });
}

// 获取布车轨迹记录
export async function getCarTrack(carNumber: string, date?: string): Promise<{ code: number; message: string; data: ChannelAccessRecord[] }> {
  return request({
    url: '/api/detection/channel-access/car-track',
    method: 'get',
    params: { carNumber, date }
  });
}

// 手动标记布车进出
export async function manualMarkAccess(data: {
  carNumber: string;
  channelId: number;
  direction: string;
  remark?: string;
}): Promise<{ code: number; message: string }> {
  return request({
    url: '/api/detection/channel-access/manual-mark',
    method: 'post',
    data
  });
}

// 获取通道出入异常记录
export async function getAbnormalRecords(params: Omit<ChannelAccessParams, 'page' | 'pageSize'>): Promise<{
  code: number;
  message: string;
  data: ChannelAccessRecord[];
}> {
  return request({
    url: '/api/detection/channel-access/abnormal-records',
    method: 'get',
    params
  });
}

// 批量更新记录状态
export async function batchUpdateRecordStatus(recordIds: number[], status: string): Promise<{ code: number; message: string }> {
  return request({
    url: '/api/detection/channel-access/batch-update-status',
    method: 'put',
    data: { recordIds, status }
  });
}

// 通道出入检测模块API对象
export const channelAccessApi = {
  // 获取通道进出记录列表
  getList: (params: ChannelAccessParams) => getChannelAccessList(params),
  
  // 获取通道进出记录详情
  getDetail: (recordId: number) => getAccessRecordDetail(recordId),
  
  // 更新通道进出记录备注
  updateRemark: (recordId: number, remark: string) => updateAccessRecordRemark(recordId, remark),
  
  // 获取实时通道列表
  getRealtimeChannels: () => getRealtimeChannels(),
  
  // 获取通道进出统计信息
  getStatistics: (dateRange?: string[]) => getStatistics(dateRange),
  
  // 导出通道进出记录
  exportData: (params: ChannelAccessParams) => exportChannelAccessData(params),
  
  // 获取通道历史占用统计
  getOccupancyStats: (channelId: number, timeRange: string) => getChannelOccupancyStats(channelId, timeRange),
  
  // 获取布车轨迹记录
  getCarTrack: (carNumber: string, date?: string) => getCarTrack(carNumber, date),
  
  // 手动标记布车进出
  manualMarkAccess: (data: any) => manualMarkAccess(data),
  
  // 获取通道出入异常记录
  getAbnormalRecords: (params: Omit<ChannelAccessParams, 'page' | 'pageSize'>) => getAbnormalRecords(params),
  
  // 批量更新记录状态
  batchUpdateStatus: (recordIds: number[], status: string) => batchUpdateRecordStatus(recordIds, status)
};

// 默认导出export default channelAccessApi;