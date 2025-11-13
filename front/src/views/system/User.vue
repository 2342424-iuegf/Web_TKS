<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
    </div>
    <ElCard class="main-card">
      <div class="search-bar">
        <ElInput
          v-model="searchForm.username"
          placeholder="请输入用户名"
          prefix-icon="Search"
          class="search-input"
          clearable
        />
        <ElButton type="primary" @click="handleSearch">搜索</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
        <ElButton type="success" @click="handleCreate">新增用户</ElButton>
      </div>
      <div class="table-wrapper">
        <ElTable :data="userList" style="width: 100%">
          <ElTableColumn prop="id" label="用户ID" width="80" />
          <ElTableColumn prop="username" label="用户名" />
          <ElTableColumn prop="email" label="邮箱" />
          <ElTableColumn prop="roleName" label="角色" />
          <ElTableColumn prop="status" label="状态" width="100">
            <template #default="scope">
              <ElSwitch
                v-model="scope.row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="createTime" label="创建时间" />
          <ElTableColumn label="操作" width="150" fixed="right">
            <template #default="scope">
              <ElButton type="primary" text @click="handleEdit(scope.row)">编辑</ElButton>
              <ElButton type="danger" text @click="handleDelete(scope.row)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
      <div class="pagination">
        <ElPagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <ElForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <ElFormItem label="用户名" prop="username">
          <ElInput v-model="formData.username" placeholder="请输入用户名" :disabled="isEdit" />
        </ElFormItem>
        <ElFormItem label="密码" :required="!isEdit" prop="password">
          <ElInput
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            :show-password="true"
            :disabled="isEdit"
          />
        </ElFormItem>
        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="formData.email" placeholder="请输入邮箱" />
        </ElFormItem>
        <ElFormItem label="角色" prop="role">
          <ElSelect v-model="formData.role" placeholder="请选择角色">
            <ElOption label="管理员" value="admin" />
            <ElOption label="普通用户" value="user" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElSelect v-model="formData.status" placeholder="请选择状态">
            <ElOption label="启用" :value="1" />
            <ElOption label="禁用" :value="0" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, createUser, updateUser, deleteUser, updateUserStatus } from '@/api/system'

interface User {
  id: number
  username: string
  email: string
  role: string
  roleName: string
  status: number
  createTime: string
}

interface Role {
  id: number
  name: string
}

const userList = ref<User[]>([])
const searchForm = reactive({
  username: ''
})
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const formRef = ref()
const isEdit = ref(false)
const roleList = ref<Role[]>([])
const formData = reactive({ 
  id: 0, 
  username: '', 
  password: '', 
  email: '', 
  role: 'user', 
  status: 1 
})

const formRules = { 
  username: [ 
    { required: true, message: '请输入用户名', trigger: 'blur' } 
  ], 
  password: [ 
    { required: true, message: '请输入密码', trigger: 'blur' }, 
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' } 
  ], 
  email: [ 
    { required: false, message: '请输入邮箱', trigger: 'blur' }, 
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' } 
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 加载用户列表
async function loadUserList() {
  try {
    const response = await getUserList({
      ...searchForm,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    })
    userList.value = response.data?.list || []
    pagination.total = response.data?.total || 0
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

// 搜索
function handleSearch() {
  pagination.currentPage = 1
  loadUserList()
}

// 重置
function handleReset() {
  searchForm.username = ''
  pagination.currentPage = 1
  loadUserList()
}

// 分页处理
function handleSizeChange(size: number) {
  pagination.pageSize = size
  loadUserList()
}

function handleCurrentChange(current: number) {
  pagination.currentPage = current
  loadUserList()
}

// 新增用户
function handleCreate() {
  dialogTitle.value = '新增用户'
  isEdit.value = false
  resetFormData()
  dialogVisible.value = true
}

// 编辑用户
function handleEdit(row: User) {
  dialogTitle.value = '编辑用户'
  isEdit.value = true
  formData.id = row.id
  formData.username = row.username
  formData.email = row.email
  formData.role = row.role
  formData.status = row.status
  dialogVisible.value = true
}

// 删除用户
async function handleDelete(row: User) {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户「${row.username}」吗？`,
      '确认删除',
      { type: 'warning' }
    )
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    loadUserList()
  } catch (error) {
    // 用户取消删除不提示错误
  }
}

// 修改用户状态
async function handleStatusChange(row: User) {
  try {
    await updateUserStatus(row.id, row.status)
    ElMessage.success('更新成功')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1 // 恢复原状态
    console.error('更新状态失败:', error)
  }
}

// 加载角色列表
async function loadRoles() {
  if (roleList.value.length > 0) return
  // 这里应该调用API获取角色列表
  // 暂时使用模拟数据
  roleList.value = [
    { id: 1, name: '管理员' },
    { id: 2, name: '操作员' },
    { id: 3, name: '查看员' }
  ]
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      // 编辑时，排除密码字段（如果为空）和id字段
      const updateData: any = {
        role: formData.role,
        status: formData.status
      }
      // 只有当邮箱不为空时才发送
      if (formData.email && formData.email.trim()) {
        updateData.email = formData.email.trim()
      }
      // 如果密码不为空，则更新密码
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password.trim()
      }
      await updateUser(formData.id.toString(), updateData)
    } else {
      // 创建时，只发送必要的字段，排除id
      const createData: any = {
        username: formData.username,
        password: formData.password,
        role: formData.role,
        status: formData.status
      }
      // 只有当邮箱不为空时才发送
      if (formData.email && formData.email.trim()) {
        createData.email = formData.email.trim()
      }
      await createUser(createData)
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    loadUserList()
  } catch (error: any) {
    console.error('提交失败:', error)
    // 显示详细的错误信息
    if (error?.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        // FastAPI 验证错误格式
        const errorMsg = error.response.data.detail.map((err: any) => {
          return `${err.loc?.join('.')}: ${err.msg}`
        }).join('; ')
        ElMessage.error(errorMsg)
      } else {
        ElMessage.error(error.response.data.detail)
      }
    }
  }
}

// 关闭对话框
function handleDialogClose() {
  resetFormData()
}

// 重置表单数据
function resetFormData() {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  formData.id = 0
  formData.username = ''
  formData.password = ''
  formData.email = ''
  formData.role = 'user'
  formData.status = 1
}

// 初始化
onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.user-management {
  height: 100%;
  overflow: hidden;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.main-card {
  height: calc(100% - 60px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.search-input {
  width: 200px;
}

.table-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}
</style>