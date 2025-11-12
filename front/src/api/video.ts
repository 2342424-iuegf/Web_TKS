import request from '@/utils/request'

// 摄像头信息接口
interface CameraInfo {
  id: number
  cameraName: string
  cameraId: string
  rtspUrl: string
  rtmpUrl?: string
  hlsUrl?: string
  status: 'online' | 'offline'
  location: string
  workshopSection: string
  position: string
  description?: string
  createTime: string
  updateTime: string
}

interface CameraListResponse {
  data: {
    list: CameraInfo[]
    total: number
    page: number
    pageSize: number
  }
  message: string
  code: number
}

interface CameraQueryParams {
  cameraName?: string
  location?: string
  workshopSection?: string
  status?: string
  page?: number
  pageSize?: number
}

// 获取摄像头列表
export const getCameraList = async (params: CameraQueryParams) => {
  return request<CameraListResponse>({
    url: '/api/monitoring/video/camera/list',
    method: 'get',
    params
  })
}

// 获取摄像头详情
export const getCameraDetail = async (id: number) => {
  return request<{ data: CameraInfo; message: string; code: number }>({
    url: `/api/monitoring/video/camera/${id}`,
    method: 'get'
  })
}

// 实时视频流接口
interface LiveStreamParams {
  cameraId: string
  protocol?: 'rtsp' | 'rtmp' | 'hls'
  quality?: 'high' | 'medium' | 'low'
}

interface LiveStreamUrl {
  url: string
  protocol: string
  expireTime: string
}

export const getLiveStreamUrl = async (params: LiveStreamParams) => {
  return request<{ data: LiveStreamUrl; message: string; code: number }>({
    url: '/api/monitoring/video/live/stream',
    method: 'get',
    params
  })
}

// 历史视频查询接口
interface VideoRecordQueryParams {
  cameraId: string
  startTime: string
  endTime: string
  page?: number
  pageSize?: number
}

interface VideoRecord {
  id: number
  cameraId: string
  cameraName: string
  startTime: string
  endTime: string
  duration: number
  size: number
  filePath: string
  coverUrl?: string
  resolution: string
}

interface VideoRecordResponse {
  data: {
    list: VideoRecord[]
    total: number
    page: number
    pageSize: number
  }
  message: string
  code: number
}

// 获取历史视频记录列表
export const getVideoRecordList = async (params: VideoRecordQueryParams) => {
  return request<VideoRecordResponse>({
    url: '/api/monitoring/video/record/list',
    method: 'get',
    params
  })
}

// 兼容旧命名
export const getVideoList = getVideoRecordList

// 获取历史视频播放URL
export const getVideoPlayUrl = async (recordId: number) => {
  return request<{ data: { url: string; expireTime: string }; message: string; code: number }>({
    url: `/api/monitoring/video/record/${recordId}/play`,
    method: 'get'
  })
}

// 兼容旧命名
export const getVideoPlaybackUrl = getVideoPlayUrl

// 视频截图接口
export const captureVideoImage = async (cameraId: string) => {
  return request<{ data: { imageUrl: string }; message: string; code: number }>({
    url: '/api/monitoring/video/capture',
    method: 'post',
    data: { cameraId }
  })
}

// 获取视频统计信息
export interface VideoStatistics {
  onlineCameras: number
  offlineCameras: number
  totalCameras: number
  todayRecordCount: number
  todayRecordSize: number
  diskUsage: number
  diskTotal: number
  diskFree: number
}

export const getVideoStatistics = async () => {
  return request<{ data: VideoStatistics; message: string; code: number }>({
    url: '/api/monitoring/video/statistics',
    method: 'get'
  })
}

// 视频录制控制接口
export const startRecording = async (cameraId: string) => {
  return request<{ message: string; code: number }>({
    url: '/api/monitoring/video/record/start',
    method: 'post',
    data: { cameraId }
  })
}

export const stopRecording = async (cameraId: string) => {
  return request<{ message: string; code: number }>({
    url: '/api/monitoring/video/record/stop',
    method: 'post',
    data: { cameraId }
  })
}

// 视频导出接口
export const exportVideo = async (recordIds: number[]) => {
  return request({
    url: '/api/monitoring/video/export',
    method: 'post',
    data: { recordIds },
    responseType: 'blob'
  })
}

// 视频PTZ控制接口
interface PTZControlParams {
  cameraId: string
  action: 'up' | 'down' | 'left' | 'right' | 'zoomIn' | 'zoomOut' | 'stop'
  speed?: number
}

export const controlPTZ = async (params: PTZControlParams) => {
  return request<{ message: string; code: number }>({
    url: '/api/monitoring/video/ptz',
    method: 'post',
    data: params
  })
}

// 创建API对象，保持向后兼容
export const videoApi = {
  // 原有接口保持兼容
  getLiveStream(cameraId: string) {
    return getLiveStreamUrl({ cameraId })
  },
  getPlaybackList(params?: any) {
    return getVideoRecordList(params as VideoRecordQueryParams)
  },
  getPlaybackUrl(videoId: string) {
    return getVideoPlayUrl(Number(videoId))
  },
  downloadVideo(videoId: string) {
    return exportVideo([Number(videoId)])
  },
  getCameras() {
    return getCameraList({})
  },
  controlCamera(cameraId: string, action: string, params?: any) {
    return controlPTZ({ cameraId, action: action as PTZControlParams['action'], ...params })
  },
  captureImage(cameraId: string) {
    return captureVideoImage(cameraId)
  },
  // 新增接口
  getCameraList,
  getCameraDetail,
  getLiveStreamUrl,
  getVideoRecordList,
  getVideoPlayUrl,
  captureVideoImage,
  getVideoStatistics,
  startRecording,
  stopRecording,
  exportVideo,
  controlPTZ
}

// 默认导出
export default videoApi