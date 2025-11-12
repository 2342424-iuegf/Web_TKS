import request from '@/utils/request'

/**
 * 获取模型列表
 */
export async function getModelList(params: any) {
  // 兼容现有的API路径
  return request.get('/models', { params })
}

/**
 * 获取模型详情
 */
export async function getModelDetail(id: number) {
  return request.get(`/models/${id}`)
}

/**
 * 上传模型文件
 */
export async function uploadModelFile(data: FormData) {
  return request.post('/models/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除模型
 */
export async function deleteModel(id: number) {
  return request.delete(`/models/${id}`)
}

/**
 * 激活/禁用模型
 */
export async function activateModel(id: number, status: number) {
  if (status === 1) {
    return request.post(`/models/${id}/activate`)
  } else {
    return request.post(`/models/${id}/deactivate`)
  }
}

/**
 * 下载模型文件
 */
export async function downloadModelFile(id: number) {
  // 创建一个临时的a标签来下载文件
  const link = document.createElement('a')
  link.href = `/models/${id}/download`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 获取模型类型列表
 */
export async function getModelTypes() {
  return request.get('/models/types')
}

/**
 * 获取模型性能指标
 */
export async function getModelPerformance(id: number) {
  return request.get(`/models/${id}/metrics`)
}

/**
 * 更新模型信息
 */
export async function updateModelInfo(id: number, data: any) {
  return request.put(`/models/${id}`, data)
}

/**
 * 批量删除模型
 */
export async function batchDeleteModels(ids: number[]) {
  return request.delete('/models/batch', {
    data: {
      ids
    }
  })
}

// 模型管理接口 - 保持原有接口兼容性
export const modelApi = {
  // 获取模型列表
  getList(params?: any) {
    return request.get('/models', { params })
  },
  // 获取模型详情
  getDetail(id: string) {
    return request.get(`/models/${id}`)
  },
  // 上传模型文件
  upload(data: FormData) {
    return request.post('/models/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  // 更新模型信息
  update(id: string, data: any) {
    return request.put(`/models/${id}`, data)
  },
  // 删除模型
  delete(id: string) {
    return request.delete(`/models/${id}`)
  },
  // 激活模型
  activate(id: string) {
    return request.post(`/models/${id}/activate`)
  },
  // 停用模型
  deactivate(id: string) {
    return request.post(`/models/${id}/deactivate`)
  },
  // 获取模型类型列表
  getTypes() {
    return request.get('/models/types')
  },
  // 获取模型性能指标
  getMetrics(id: string) {
    return request.get(`/models/${id}/metrics`)
  }
}

export default modelApi