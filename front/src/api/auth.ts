import request from '@/utils/request'

// 后端返回的登录响应格式（优化后：包含用户信息）
interface LoginTokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user?: {
    id: number
    username: string
    email: string | null
    is_active: boolean
    is_superuser: boolean
    created_at?: string
  }
}

// 用户信息响应格式
interface UserInfoResponse {
  id: number
  username: string
  email: string | null
  is_active: boolean
  is_superuser: boolean
  created_at: string
}

// 前端使用的登录响应格式
interface LoginResponse {
  token: string
  refreshToken: string
  userInfo: {
    id: number
    username: string
    email: string | null
    role: string
    isActive: boolean
  }
}

/**
 * 用户登录
 * @param username 用户名或邮箱
 * @param password 密码
 */
export async function loginApi(username: string, password: string): Promise<{ data: LoginResponse }> {
  // 使用 URLSearchParams 格式发送（OAuth2PasswordRequestForm 要求）
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)
  
  // 调用后端登录接口（优化后：一次请求返回token和用户信息）
  const loginRes = await request.post<LoginTokenResponse>('/auth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  
  // 如果后端返回了用户信息，直接使用；否则调用 /auth/me 获取（向后兼容）
  let userInfo
  if (loginRes.data.user) {
    // 使用后端返回的用户信息（推荐）
    userInfo = {
      id: loginRes.data.user.id,
      username: loginRes.data.user.username,
      email: loginRes.data.user.email,
      role: loginRes.data.user.is_superuser ? 'admin' : 'user',
      isActive: loginRes.data.user.is_active
    }
  } else {
    // 向后兼容：如果后端没有返回用户信息，主动获取
    const userRes = await request.get<UserInfoResponse>('/auth/me', {
      headers: {
        'Authorization': `Bearer ${loginRes.data.access_token}`
      }
    })
    userInfo = {
      id: userRes.data.id,
      username: userRes.data.username,
      email: userRes.data.email,
      role: userRes.data.is_superuser ? 'admin' : 'user',
      isActive: userRes.data.is_active
    }
  }
  
  // 组合返回数据
  return {
    data: {
      token: loginRes.data.access_token,
      refreshToken: loginRes.data.refresh_token,
      userInfo
    }
  }
}

/**
 * 用户登出
 */
export function logoutApi() {
  // 后端可能没有专门的登出接口，这里只是清除本地token
  return Promise.resolve({ data: { message: '登出成功' } })
}

/**
 * 获取当前用户信息
 */
export function getUserInfoApi() {
  return request.get<UserInfoResponse>('/auth/me')
}

/**
 * 刷新Token
 * @param refreshToken 刷新令牌
 */
export function refreshTokenApi(refreshToken: string) {
  return request.post<LoginTokenResponse>('/auth/refresh', {
    refresh_token: refreshToken
  })
}