import request from '@/utils/request'

// 摄像头信息接口
export interface Camera {
  camera_id: string
  camera_name: string | null
  rstp: string | null
}

// 图像信息接口
export interface ImageInfo {
  width: number
  height: number
  path?: string
}

// 标注配置接口
export interface Annotation {
  area_no?: number
  machine_id?: string
  [key: string]: any // 允许其他动态字段
}

export interface CameraAnnotations {
  camera_id: string
  annotations: Annotation[]
}

// 标注工具API
export const annotationApi = {
  /**
   * 获取所有启用了detect_leave功能的摄像头列表
   */
  async getCameras(): Promise<Camera[]> {
    const res = await request.get('/detection/off-duty/cameras')
    // request 返回格式可能是 { data: [...] } 或直接是数组
    return Array.isArray(res) ? res : (res.data || res)
  },

  /**
   * 获取指定摄像头的图像
   * @param cameraId 摄像头ID
   */
  async getCameraImage(cameraId: string): Promise<Blob> {
    // 对于 blob 响应，request 拦截器会直接返回 response 对象
    // 图像获取可能需要较长时间（FFmpeg处理RTSP流），设置60秒超时
    const response = await request.get(`/detection/off-duty/cameras/${cameraId}/image`, {
      responseType: 'blob',
      timeout: 60000  // 60秒超时
    })
    // response 是 AxiosResponse，需要返回 response.data (Blob)
    return response.data
  },

  /**
   * 获取摄像头图像的尺寸信息
   * @param cameraId 摄像头ID
   */
  async getCameraImageInfo(cameraId: string): Promise<ImageInfo> {
    const res = await request.get(`/detection/off-duty/cameras/${cameraId}/image_info`)
    // request 返回格式可能是 { data: {...} } 或直接是对象
    return res.data || res
  },

  /**
   * 获取指定摄像头的标注配置
   * @param cameraId 摄像头ID
   */
  async getAnnotations(cameraId: string): Promise<CameraAnnotations> {
    const res = await request.get(`/detection/off-duty/cameras/${cameraId}/annotations`)
    // request 返回格式可能是 { data: {...} } 或直接是对象
    return res.data || res
  },

  /**
   * 保存指定摄像头的标注配置
   * @param cameraId 摄像头ID
   * @param annotations 标注配置列表
   */
  async saveAnnotations(cameraId: string, annotations: Annotation[]): Promise<{ success: boolean }> {
    const res = await request.post(`/detection/off-duty/cameras/${cameraId}/annotations`, {
      annotations
    })
    return res.data || res
  }
}

