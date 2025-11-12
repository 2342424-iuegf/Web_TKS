import request from '@/utils/request'

interface LoginResponse {
  token: string
  userInfo: {
    id: string
    username: string
    role: string
    permissions: string[]
  }
}

// 登录（模拟实现，硬编码用户）
export function loginApi(username: string, password: string) {
  // 模拟延迟
  return new Promise<{ data: LoginResponse }>((resolve, reject) => {
    setTimeout(() => {
      // 硬编码的用户名和密码
      if (username === 'admin' && password === 'admin123') {
        resolve({
          data: {
            token: 'mock-token-' + Date.now(),
            userInfo: {
              id: '1',
              username: 'admin',
              role: 'admin',
              permissions: ['all']
            }
          }
        })
      } else if (username === 'user' && password === 'user123') {
        resolve({
          data: {
            token: 'mock-token-' + Date.now(),
            userInfo: {
              id: '2',
              username: 'user',
              role: 'user',
              permissions: ['view']
            }
          }
        })
      } else {
        reject(new Error('用户名或密码错误'))
      }
    }, 500)
  })
}

// 登出
export function logoutApi() {
  return request.post('/auth/logout')
}

// 获取用户信息
export function getUserInfoApi() {
  return request.get('/auth/user-info')
}

// 刷新token
export function refreshTokenApi() {
  return request.post('/auth/refresh-token')
}