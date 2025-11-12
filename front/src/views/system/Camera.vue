<template>
  <div class="camera-management">
    <div class="page-header">
      <h2>摄像头管理</h2>
    </div>
    <ElCard class="main-card">
      <div class="search-bar">
        <ElInput
          v-model="searchForm.name"
          placeholder="请输入摄像头名称"
          prefix-icon="Search"
          class="search-input"
          clearable
        />
        <ElSelect v-model="searchForm.status" placeholder="状态筛选"
          class="search-select"
        >
          <ElOption label="全部" value="" />
          <ElOption label="在线" value="1" />
          <ElOption label="离线" value="0" />
        </ElSelect>
        <ElButton type="primary" @click="handleSearch">搜索</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
        <ElButton type="success" @click="handleCreate">添加摄像头</ElButton>
      </div>
      <ElTable :data="cameraList" style="width: 100%">
        <ElTableColumn prop="id" label="摄像头ID" width="80" />
        <ElTableColumn prop="name" label="摄像头名称" />
        <ElTableColumn prop="ip" label="IP地址" />
        <ElTableColumn prop="port" label="端口" width="80" />
        <ElTableColumn prop="channel" label="通道号" width="80" />
        <ElTableColumn prop="location" label="安装位置" />
        <ElTableColumn prop="type" label="摄像头类型" />
        <ElTableColumn prop="status" label="状态" width="100">
          >template #default="scope">
            <ElTag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '在线' : '离线' }}
            </ElTag>
          >template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="250" fixed="right">
          >template #default="scope">
            <ElButton type="primary" text @click="handleTestConnection(scope.row)">测试连接</ElButton>
            <ElButton type="info" text @click="handleView(scope.row)">查看视频</ElButton>
            <ElButton type="warning" text @click="handleEdit(scope.row)">编辑</ElButton>
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
      width="600px"
      @close="handleDialogClose"
    >
      <ElForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <ElFormItem label="摄像头名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入摄像头名称" />
        </ElFormItem>
        <ElFormItem label="IP地址" prop="ip">
          <ElInput v-model="formData.ip" placeholder="请输入IP地址" />
        </ElFormItem>
        <ElFormItem label="端口" prop="port">
          <ElInputNumber v-model="formData.port" :min="1" :max="65535" />
        </ElFormItem>
        <ElFormItem label="通道号" prop="channel">
          <ElInputNumber v-model="formData.channel" :min="1" />
        </ElFormItem>
        <ElFormItem label="用户名" prop="username">
          <ElInput v-model="formData.username" placeholder="请输入用户名" />
        </ElFormItem>
        <ElFormItem label="密码" prop="password">
          <ElInput
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </ElFormItem>
        <ElFormItem label="摄像头类型" prop="type">
          <ElSelect v-model="formData.type" placeholder="请选择摄像头类型"
            filterable
          >
            <ElOption label="海康威视" value="hikvision" />
            <ElOption label="大华" value="dahua" />
            <ElOption label="宇视" value="uniview" />
            <ElOption label="其他" value="other" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="安装位置" prop="location">
          <ElInput v-model="formData.location" placeholder="请输入安装位置" />
        </ElFormItem>
        <ElFormItem label="备注" prop="remark">
          <ElInput
            v-model="formData.remark"
            placeholder="请输入备注信息"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCameraList, createCamera, updateCamera, deleteCamera, testCameraConnection } from '@/api/system'

interface Camera {
  id: number
  name: string
  ip: string
  port: number
  channel: number
  username: string
  password: string
  type: string
  location: string
  status: number
  remark: string
}

const router = useRouter()
const cameraList = ref<Camera[]>([])
const searchForm = reactive({
  name: '',
  status: ''
})
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})
const dialogVisible = ref(false)
const dialogTitle = ref('添加摄像头')
const formRef = ref()
const isEdit = ref(false)
const formData = reactive({
  id: 0,
  name: '',
  ip: '',
  port: 80,
  channel: 1,
  username: '',
  password: '',
  type: '',
  location: '',
  remark: ''
})

const formRules = {
  name: [
    { required: true, message: '请输入摄像头名称', trigger: 'blur' }
  ],
  ip: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/, message: '请输入有效的IP地址', trigger: 'blur' }
  ],
  port: [
    { required: true, message: '请输入端口号', trigger: 'change' }
  ],
  channel: [
    { required: true, message: '请输入通道号', trigger: 'change' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择摄像头类型', trigger: 'change' }
  ]
}

// 加载摄像头列表
async function loadCameraList() {
  try {
    const response = await getCameraList({
      ...searchForm,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    })
    cameraList.value = response.data?.list || []
    pagination.total = response.data?.total || 0
  } catch (error) {
    console.error('加载摄像头列表失败:', error)
    // 暂时使用模拟数据
    cameraList.value = [
      {
        id: 1,
        name: '车间1-摄像头1',
        ip: '192.168.1.101',
        port: 80,
        channel: 1,
        username: 'admin',
        password: '123456',
        type: 'hikvision',
        location: '车间1号入口',
        status: 1,
        remark: ''
      },
      {
        id: 2,
        name: '车间2-摄像头1',
        ip: '192.168.1.102',
        port: 80,
        channel: 1,
        username: 'admin',
        password: '123456',
        type: 'dahua',
        location: '车间2号入口',
        status: 1,
        remark: ''
      }
    ]
    pagination.total = cameraList.value.length
  }
}

// 搜索
function handleSearch() {
  pagination.currentPage = 1
  loadCameraList()
}

// 重置
function handleReset() {
  searchForm.name = ''
  searchForm.status = ''
  pagination.currentPage = 1
  loadCameraList()
}

// 分页处理
function handleSizeChange(size: number) {
  pagination.pageSize = size
  loadCameraList()
}

function handleCurrentChange(current: number) {
  pagination.currentPage = current
  loadCameraList()
}

// 新增摄像头
function handleCreate() {
  dialogTitle.value = '添加摄像头'
  isEdit.value = false
  resetFormData()
  dialogVisible.value = true
}

// 编辑摄像头
function handleEdit(row: Camera) {
  dialogTitle.value = '编辑摄像头'
  isEdit.value = true
  formData.id = row.id
  formData.name = row.name
  formData.ip = row.ip
  formData.port = row.port
  formData.channel = row.channel
  formData.username = row.username
  formData.password = row.password
  formData.type = row.type
  formData.location = row.location
  formData.remark = row.remark
  dialogVisible.value = true
}

// 删除摄像头
async function handleDelete(row: Camera) {
  try {
    await ElMessageBox.confirm(
      `确定要删除摄像头「${row.name}」吗？`,
      '确认删除',
      { type: 'warning' }
    )
    await deleteCamera(row.id)
    ElMessage.success('删除成功')
    loadCameraList()
  } catch (error) {
    // 用户取消删除不提示错误
  }
}

// 测试连接
async function handleTestConnection(row: Camera) {
  try {
    await testCameraConnection(row.id)
    ElMessage.success('连接成功')
  } catch (error) {
    ElMessage.error('连接失败，请检查配置')
  }
}

// 查看视频
function handleView(row: Camera) {
  router.push(`/video/live?cameraId=${row.id}`)
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      await updateCamera(formData)
    } else {
      await createCamera(formData)
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    loadCameraList()
  } catch (error) {
    console.error('提交失败:', error)
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
  formData.name = ''
  formData.ip = ''
  formData.port = 80
  formData.channel = 1
  formData.username = ''
  formData.password = ''
  formData.type = ''
  formData.location = ''
  formData.remark = ''
}

// 初始化
onMounted(() => {
  loadCameraList()
})
</script>

<style scoped>
.camera-management {
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

.search-select {
  width: 120px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>