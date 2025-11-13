import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { storage } from '@/utils/storage'
import router from '@/router'

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.get('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    
    // 如果返回的是二进制数据
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response
    }
    
    // FastAPI默认直接返回数据，不包装在code/message中
    // 如果后端返回了code字段，则按原有逻辑处理
    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code !== 200) {
        ElMessage.error(res.message || '请求失败')
        
        // 未登录或token过期
        if (res.code === 401) {
          storage.remove('token')
          storage.remove('refreshToken')
          router.push('/login')
        }
        
        return Promise.reject(new Error(res.message || '请求失败'))
      }
      return res
    }
    
    // 直接返回数据（FastAPI标准格式）
    return { data: res }
  },
  (error) => {
    console.error('响应错误:', error)
    
    // 处理HTTP错误状态码
    if (error.response) {
      const { status, data } = error.response
      
      // 401 未授权
      if (status === 401) {
        storage.remove('token')
        storage.remove('refreshToken')
        ElMessage.error('登录已过期，请重新登录')
        router.push('/login')
        return Promise.reject(error)
      }
      
      // 403 禁止访问
      if (status === 403) {
        ElMessage.error('没有权限访问')
        return Promise.reject(error)
      }
      
      // 500 服务器错误
      if (status === 500) {
        ElMessage.error(data?.detail || '服务器内部错误')
        return Promise.reject(error)
      }
      
      // 422 验证错误
      if (status === 422) {
        // FastAPI 验证错误格式
        if (Array.isArray(data?.detail)) {
          const errorMsg = data.detail.map((err: any) => {
            const field = err.loc?.slice(1).join('.') || '未知字段'
            return `${field}: ${err.msg}`
          }).join('; ')
          ElMessage.error(`数据验证失败: ${errorMsg}`)
        } else {
          ElMessage.error(data?.detail || data?.message || '数据验证失败')
        }
        return Promise.reject(error)
      }
      
      // 其他错误
      const errorMessage = data?.detail || data?.message || error.message || '请求失败'
      ElMessage.error(errorMessage)
    } else {
      ElMessage.error(error.message || '网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default service