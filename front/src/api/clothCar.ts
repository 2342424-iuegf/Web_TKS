import request from '@/utils/request'

/**
 * 获取布车列表
 */
export async function getClothCarList(params: any) {
  return request({
    url: '/api/cloth-car/list',
    method: 'get',
    params
  })
}

/**
 * 根据布车号搜索布车
 */
export async function searchCarByNumber(carNumber: string) {
  return request({
    url: '/api/cloth-car/search',
    method: 'get',
    params: {
      carNumber
    }
  })
}

/**
 * 获取布车详情
 */
export async function getCarDetail(id: number) {
  return request({
    url: `/api/cloth-car/detail/${id}`,
    method: 'get'
  })
}

/**
 * 获取布车历史记录
 */
export async function getCarHistory(id: number) {
  return request({
    url: `/api/cloth-car/history/${id}`,
    method: 'get'
  })
}

/**
 * 获取视频摄像头列表
 */
export async function getVideoCameras() {
  return request({
    url: '/api/cameras/video',
    method: 'get'
  })
}

/**
 * 获取布车统计信息
 */
export async function getClothCarStatistics() {
  return request({
    url: '/api/cloth-car/statistics',
    method: 'get'
  })
}

/**
 * 获取布车实时位置
 */
export async function getCarRealtimeLocation(carNumber: string) {
  return request({
    url: '/api/cloth-car/location',
    method: 'get',
    params: {
      carNumber
    }
  })
}

/**
 * 获取区域布车分布
 */
export async function getLocationDistribution() {
  return request({
    url: '/api/cloth-car/distribution',
    method: 'get'
  })
}

/**
 * 导出布车数据
 */
export async function exportClothCarData(params: any) {
  return request({
    url: '/api/cloth-car/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 播放摄像头视频流
 */
export async function getVideoStreamUrl(cameraId: number) {
  return request({
    url: `/api/cameras/stream/${cameraId}`,
    method: 'get'
  })
}

/**
 * 对布车进行手动定位
 */
export async function manuallyLocateCar(id: number, location: string) {
  return request({
    url: `/api/cloth-car/locate/${id}`,
    method: 'put',
    data: {
      location
    }
  })
}

/**
 * 标记布车状态
 */
export async function markCarStatus(id: number, status: string, remark?: string) {
  return request({
    url: `/api/cloth-car/mark/${id}`,
    method: 'put',
    data: {
      status,
      remark
    }
  })
}

// 导出独立函数接口，保持兼容性
export const clothCarApi = {
  getList: getClothCarList,
  search: searchCarByNumber,
  getDetail: getCarDetail,
  getHistory: getCarHistory,
  getStatistics: getClothCarStatistics,
  getLocation: getCarRealtimeLocation,
  getDistribution: getLocationDistribution,
  exportData: exportClothCarData,
  getVideoCameras: getVideoCameras,
  getVideoStream: getVideoStreamUrl,
  locateCar: manuallyLocateCar,
  markStatus: markCarStatus
}

export default clothCarApi