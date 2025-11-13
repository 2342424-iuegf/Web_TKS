<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header text-center mb-5">
        <h2 class="text-primary">欢迎登录 Web_TKS 系统</h2>
      </div>
      
      <ElForm
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
        class="login-form"
      >
        <ElFormItem prop="username">
          <ElInput
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
            @keyup.enter="handleLogin"
            class="form-input"
          />
        </ElFormItem>
        
        <ElFormItem prop="password">
          <ElInput
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            @keyup.enter="handleLogin"
            show-password
            class="form-input"
          />
        </ElFormItem>
        
        <ElFormItem>
          <div class="login-options d-flex justify-content-between align-items-center mb-2">
            <ElCheckbox v-model="loginForm.rememberMe" class="remember-me">记住我</ElCheckbox>
            <a href="#" class="forgot-password">忘记密码?</a>
          </div>
        </ElFormItem>
        
        <ElFormItem>
          <ElButton
            type="primary"
            class="w-100 py-2 login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </ElButton>
        </ElFormItem>
      </ElForm>
      

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElCheckbox } from 'element-plus'
import { useAuthStore } from '@/store/modules/auth'

const router = useRouter()
const authStore = useAuthStore()
const loginFormRef = ref()
const loading = ref(false)

const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

async function handleLogin() {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    await authStore.login(loginForm.value)
    ElMessage.success('登录成功')
    router.push('/system/user')
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('登录失败，请检查用户名和密码')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style>
/* 全局重置样式，确保无滚动条 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
}
</style>

<style scoped>
/* 全局背景样式 */
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  overflow: hidden;
}

/* 登录卡片样式 */
.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  transition: transform 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
}

/* 标题样式 */
.login-header h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 0;
  color: #4a5568;
}

/* 表单样式 */
.login-form {
  width: 100%;
}

.form-input {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper) {
  box-shadow: none;
  border-radius: 8px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
}

:deep(.el-input__prefix-inner) {
  color: #94a3b8;
  font-size: 18px;
}

/* 登录选项样式 */
.login-options {
  font-size: 14px;
}

.remember-me :deep(.el-checkbox__label) {
  color: #64748b;
}

.forgot-password {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
}

.forgot-password:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* 登录按钮样式 */
.login-button {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  padding: 14px 0;
  margin-top: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.login-button:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
}

.login-button:deep(.el-button__text) {
  font-size: 16px;
}

/* 底部信息 */
.login-footer p {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

/* 响应式设计 */
@media (max-width: 576px) {
  .login-card {
    padding: 30px 20px;
  }
  
  .login-header h2 {
    font-size: 24px;
  }
}
</style>