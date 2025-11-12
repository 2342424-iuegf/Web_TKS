import request from '@/utils/request'

// 检测区域设置接口
export const areaApi = {
  // 获取换车区域列表
  getCarExchangeAreas(params?: any) {
    return request.get('/detection/areas/car-exchange', { params })
  },
  // 创建换车区域
  createCarExchangeArea(data: any) {
    return request.post('/detection/areas/car-exchange', data)
  },
  // 更新换车区域
  updateCarExchangeArea(id: string, data: any) {
    return request.put(`/detection/areas/car-exchange/${id}`, data)
  },
  // 删除换车区域
  deleteCarExchangeArea(id: string) {
    return request.delete(`/detection/areas/car-exchange/${id}`)
  },
  // 切换换车区域状态
  toggleCarExchangeAreaStatus(id: string, status: number) {
    return request.patch(`/detection/areas/car-exchange/${id}/status`, { status })
  },
  
  // 获取脱岗区域列表
  getOffDutyAreas(params?: any) {
    return request.get('/detection/areas/off-duty', { params })
  },
  // 创建脱岗区域
  createOffDutyArea(data: any) {
    return request.post('/detection/areas/off-duty', data)
  },
  // 更新脱岗区域
  updateOffDutyArea(id: string, data: any) {
    return request.put(`/detection/areas/off-duty/${id}`, data)
  },
  // 删除脱岗区域
  deleteOffDutyArea(id: string) {
    return request.delete(`/detection/areas/off-duty/${id}`)
  },
  // 切换脱岗区域状态
  toggleOffDutyAreaStatus(id: string, status: number) {
    return request.patch(`/detection/areas/off-duty/${id}/status`, { status })
  },
  
  // 获取危险区域列表
  getDangerAreas(params?: any) {
    return request.get('/detection/areas/danger', { params })
  },
  // 创建危险区域
  createDangerArea(data: any) {
    return request.post('/detection/areas/danger', data)
  },
  // 更新危险区域
  updateDangerArea(id: string, data: any) {
    return request.put(`/detection/areas/danger/${id}`, data)
  },
  // 删除危险区域
  deleteDangerArea(id: string) {
    return request.delete(`/detection/areas/danger/${id}`)
  },
  // 切换危险区域状态
  toggleDangerAreaStatus(id: string, status: number) {
    return request.patch(`/detection/areas/danger/${id}/status`, { status })
  }
}

// 布车分布检测接口
export const clothCarApi = {
  // 获取布车列表
  getList(params?: any) {
    return request.get('/detection/cloth-cars', { params })
  },
  // 搜索布车
  search(carNumber: string) {
    return request.get('/detection/cloth-cars/search', { params: { carNumber } })
  },
  // 获取布车详细信息
  getDetail(id: string) {
    return request.get(`/detection/cloth-cars/${id}`)
  },
  // 获取布车实时位置
  getRealTimePosition(id: string) {
    return request.get(`/detection/cloth-cars/${id}/position`)
  }
}

// 通道出入检测接口
export const channelApi = {
  // 获取通道检测记录
  getRecords(params?: any) {
    return request.get('/detection/channels/records', { params })
  },
  // 获取通道状态
  getStatus() {
    return request.get('/detection/channels/status')
  },
  // 获取统计数据
  getStatistics(params?: any) {
    return request.get('/detection/channels/statistics', { params })
  }
}

// 落布换车检测接口
export const clothChangeApi = {
  // 获取换车记录
  getRecords(params?: any) {
    return request.get('/detection/cloth-change/records', { params })
  },
  // 获取实时换车信息
  getRealTimeInfo() {
    return request.get('/detection/cloth-change/realtime')
  }
}

// 脱岗检测接口
export const offDutyApi = {
  // 获取脱岗记录
  getRecords(params?: any) {
    return request.get('/detection/off-duty/records', { params })
  },
  // 获取当前脱岗状态
  getCurrentStatus() {
    return request.get('/detection/off-duty/current')
  },
  // 获取统计数据
  getStatistics(params?: any) {
    return request.get('/detection/off-duty/statistics', { params })
  }
}

// 危险检测接口
export const dangerApi = {
  // 获取危险事件记录
  getRecords(params?: any) {
    return request.get('/detection/danger/records', { params })
  },
  // 获取当前危险区域状态
  getCurrentStatus() {
    return request.get('/detection/danger/current')
  },
  // 获取统计数据
  getStatistics(params?: any) {
    return request.get('/detection/danger/statistics', { params })
  }
}

// 通用检测管理接口
export const detectionApi = {
  // 获取当前检测状态
  getDetectionStatus() {
    return request.get('/detection/status')
  },
  // 手动触发检测
  triggerDetection(type: string, params?: any) {
    return request.post('/detection/trigger', { type, ...params })
  },
  // 停止检测
  stopDetection(type: string) {
    return request.post('/detection/stop', { type })
  }
}

// 导出独立函数接口，保持兼容性
export function getCarExchangeAreaList(params: any) {
  return areaApi.getCarExchangeAreas(params)
}

export function createCarExchangeArea(data: any) {
  return areaApi.createCarExchangeArea(data)
}

export function updateCarExchangeArea(data: any) {
  return areaApi.updateCarExchangeArea(data.id, data)
}

export function deleteCarExchangeArea(id: number) {
  return areaApi.deleteCarExchangeArea(String(id))
}

export function toggleCarExchangeAreaStatus(id: number, status: number) {
  return areaApi.toggleCarExchangeAreaStatus(String(id), status)
}

export function getWorkAbsenceAreaList(params: any) {
  return areaApi.getOffDutyAreas(params)
}

export function createWorkAbsenceArea(data: any) {
  return areaApi.createOffDutyArea(data)
}

export function updateWorkAbsenceArea(data: any) {
  return areaApi.updateOffDutyArea(data.id, data)
}

export function deleteWorkAbsenceArea(id: number) {
  return areaApi.deleteOffDutyArea(String(id))
}

export function toggleWorkAbsenceAreaStatus(id: number, status: number) {
  return areaApi.toggleOffDutyAreaStatus(String(id), status)
}

export function getDangerAreaList(params: any) {
  return areaApi.getDangerAreas(params)
}

export function createDangerArea(data: any) {
  return areaApi.createDangerArea(data)
}

export function updateDangerArea(data: any) {
  return areaApi.updateDangerArea(data.id, data)
}

export function deleteDangerArea(id: number) {
  return areaApi.deleteDangerArea(String(id))
}

export function toggleDangerAreaStatus(id: number, status: number) {
  return areaApi.toggleDangerAreaStatus(String(id), status)
}

export function getCarDistributionList(params: any) {
  return clothCarApi.getList(params)
}

export function getCarDetail(carId: string) {
  return clothCarApi.getDetail(carId)
}

export function searchCarPosition(carId: string) {
  return clothCarApi.search(carId)
}

export function getChannelAccessList(params: any) {
  return channelApi.getRecords(params)
}

export function getChannelAccessStatistics(params: any) {
  return channelApi.getStatistics(params)
}

export function getFallingClothList(params: any) {
  return clothChangeApi.getRecords(params)
}

export function getFallingClothStatistics(params: any) {
  return request.get('/detection/cloth-change/statistics', { params })
}

export function getAbsenceEventList(params: any) {
  return offDutyApi.getRecords(params)
}

export function getAbsenceStatistics(params: any) {
  return offDutyApi.getStatistics(params)
}

export function getDangerEventList(params: any) {
  return dangerApi.getRecords(params)
}

export function getDangerStatistics(params: any) {
  return dangerApi.getStatistics(params)
}

export function getDetectionStatus() {
  return detectionApi.getDetectionStatus()
}

export function triggerDetection(type: string, params?: any) {
  return detectionApi.triggerDetection(type, params)
}

export function stopDetection(type: string) {
  return detectionApi.stopDetection(type)
}