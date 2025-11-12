<template>
  <div class="role-management">
    <div class="page-header">
      <h2>权限管理</h2>
    </div>
    <ElCard class="main-card">
      <div class="search-bar">
        <ElInput
          v-model="searchForm.name"
          placeholder="请输入角色名称"
          prefix-icon="Search"
          class="search-input"
          clearable
        />
        <ElButton type="primary" @click="handleSearch">搜索</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
        <ElButton type="success" @click="handleCreate">新增角色</ElButton>
      </div>
      <ElTable :data="roleList" style="width: 100%">
        <ElTableColumn prop="id" label="角色ID" width="80" />
        <ElTableColumn prop="name" label="角色名称" />
        <ElTableColumn prop="description" label="角色描述" />
        <ElTableColumn prop="createTime" label="创建时间" />
        <ElTableColumn label="操作" width="200" fixed="right">
          >template #default="scope">
            <ElButton type="primary" text @click="handleEdit(scope.row)">编辑</ElButton>
            <ElButton type="warning" text @click="handlePermissions(scope.row)">权限设置</ElButton>
            <ElButton type="danger" text @click="handleDelete(scope.row)">删除</ElButton>
          >template>
        </ElTableColumn>
      </ElTable>
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
        <ElFormItem label="角色名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入角色名称" />
        </ElFormItem>
        <ElFormItem label="角色描述" prop="description">
          <ElInput
            v-model="formData.description"
            placeholder="请输入角色描述"
            type="textarea"
            :rows="3"
          />
        </ElFormItem>
      </ElForm>
      >template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      >template>
    </ElDialog>

    <ElDialog
      v-model="permissionDialogVisible"
      title="权限设置"
      width="600px"
      @close="handlePermissionDialogClose"
    >
      <div class="permission-tree">
        <ElTree
          ref="treeRef"
          :data="permissionTree"
          show-checkbox
          node-key="id"
          default-expand-all
        />
      </div>
      >template #footer>
        <ElButton @click="permissionDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handlePermissionSubmit">确定</ElButton>
      >template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoleList, createRole, updateRole, deleteRole, getPermissionTree, saveRolePermissions } from '@/api/system'

interface Role {
  id: number
  name: string
  description: string
  createTime: string
}

interface PermissionNode {
  id: number
  label: string
  children?: PermissionNode[]
}

const roleList = ref<Role[]>([])
const searchForm = reactive({
  name: ''
})
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})
const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const formRef = ref()
const isEdit = ref(false)
const formData = reactive({
  id: 0,
  name: '',
  description: ''
})
const formRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ]
}

// 权限设置相关
const permissionDialogVisible = ref(false)
const treeRef = ref()
const permissionTree = ref<PermissionNode[]>([])
const currentRoleId = ref(0)

// 加载角色列表
async function loadRoleList() {
  try {
    const response = await getRoleList({
      ...searchForm,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    })
    roleList.value = response.data?.list || []
    pagination.total = response.data?.total || 0
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

// 搜索
function handleSearch() {
  pagination.currentPage = 1
  loadRoleList()
}

// 重置
function handleReset() {
  searchForm.name = ''
  pagination.currentPage = 1
  loadRoleList()
}

// 分页处理
function handleSizeChange(size: number) {
  pagination.pageSize = size
  loadRoleList()
}

function handleCurrentChange(current: number) {
  pagination.currentPage = current
  loadRoleList()
}

// 新增角色
function handleCreate() {
  dialogTitle.value = '新增角色'
  isEdit.value = false
  resetFormData()
  dialogVisible.value = true
}

// 编辑角色
function handleEdit(row: Role) {
  dialogTitle.value = '编辑角色'
  isEdit.value = true
  formData.id = row.id
  formData.name = row.name
  formData.description = row.description
  dialogVisible.value = true
}

// 删除角色
async function handleDelete(row: Role) {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色「${row.name}」吗？`,
      '确认删除',
      { type: 'warning' }
    )
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    loadRoleList()
  } catch (error) {
    // 用户取消删除不提示错误
  }
}

// 设置权限
async function handlePermissions(row: Role) {
  currentRoleId.value = row.id
  await loadPermissionTree()
  permissionDialogVisible.value = true
}

// 加载权限树
async function loadPermissionTree() {
  try {
    const response = await getPermissionTree(currentRoleId.value)
    permissionTree.value = response.data || []
  } catch (error) {
    console.error('加载权限树失败:', error)
    // 暂时使用模拟数据
    permissionTree.value = [
      {
        id: 1,
        label: '系统管理',
        children: [
          { id: 101, label: '用户管理' },
          { id: 102, label: '角色管理' },
          { id: 103, label: '参数设置' }
        ]
      },
      {
        id: 2,
        label: '检测管理',
        children: [
          { id: 201, label: '布车检测' },
          { id: 202, label: '通道检测' },
          { id: 203, label: '脱岗检测' }
        ]
      }
    ]
  }
}

// 提交权限设置
async function handlePermissionSubmit() {
  if (!treeRef.value) return
  
  try {
    const selectedKeys = treeRef.value.getCheckedKeys() as number[]
    await saveRolePermissions(currentRoleId.value, selectedKeys)
    ElMessage.success('权限设置成功')
    permissionDialogVisible.value = false
  } catch (error) {
    console.error('保存权限失败:', error)
  }
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      await updateRole(formData)
    } else {
      await createRole(formData)
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    loadRoleList()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

// 关闭对话框
function handleDialogClose() {
  resetFormData()
}

// 关闭权限对话框
function handlePermissionDialogClose() {
  currentRoleId.value = 0
  permissionTree.value = []
}

// 重置表单数据
function resetFormData() {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  formData.id = 0
  formData.name = ''
  formData.description = ''
}

// 初始化
onMounted(() => {
  loadRoleList()
})
</script>

<style scoped>
.role-management {
  height: 100%;
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
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  width: 200px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.permission-tree {
  max-height: 400px;
  overflow-y: auto;
}
</style>