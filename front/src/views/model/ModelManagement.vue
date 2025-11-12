<template>
  <div class="model-management">
    <div class="page-header">
      <h2>布车、脱岗等模型文件的管理</h2>
    </div>
    <ElCard class="main-card">
      <div class="search-bar">
        <ElSelect v-model="searchForm.modelType" placeholder="选择模型类型" class="search-select"
          filterable
        >
          <ElOption
            v-for="type in modelTypeList"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </ElSelect>
        <ElInput
          v-model="searchForm.modelName"
          placeholder="模型名称"
          class="search-input"
          clearable
        />
        <ElSelect v-model="searchForm.status" placeholder="状态" class="search-select"
          filterable
        >
          <ElOption label="启用" value="1" />
          <ElOption label="禁用" value="0" />
        </ElSelect>
        <ElButton type="primary" @click="handleSearch">搜索</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
        <ElButton type="success" @click="handleUpload">上传模型</ElButton>
      </div>
      <ElTable :data="modelList" style="width: 100%">
        <ElTableColumn prop="id" label="模型ID" width="80" />
        <ElTableColumn prop="modelName" label="模型名称" />
        <ElTableColumn prop="modelType" label="模型类型" width="120">
          >template #default="scope">
            <ElTag
              v-if="scope.row.modelType === 1"
              type="primary"
            >布车识别</ElTag>
            <ElTag
              v-else-if="scope.row.modelType === 2"
              type="success"
            >脱岗检测</ElTag>
            <ElTag
              v-else-if="scope.row.modelType === 3"
              type="warning"
            >危险检测</ElTag>
            <ElTag
              v-else-if="scope.row.modelType === 4"
              type="info"
            >其他模型</ElTag>
          >template>
        </ElTableColumn>
        <ElTableColumn prop="version" label="版本号" width="100" />
        <ElTableColumn prop="accuracy" label="准确率" width="100">
          >template #default="scope">
            {{ (scope.row.accuracy || 0) * 100 }}%
          >template>
        </ElTableColumn>
        <ElTableColumn prop="fileSize" label="文件大小" width="120">
          >template #default="scope">
            {{ formatFileSize(scope.row.fileSize || 0) }}
          >template>
        </ElTableColumn>
        <ElTableColumn prop="createTime" label="上传时间" width="180">
          >template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          >template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="状态" width="100">
          >template #default="scope">
            <ElTag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </ElTag>
          >template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="200" fixed="right">
          >template #default="scope">
            <ElButton type="primary" text @click="handleDetail(scope.row)">详情>/ElButton>
            <ElButton type="warning" text @click="handleToggleStatus(scope.row)">
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </ElButton>
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

    <!-- 模型上传对话框 -->
    <ElDialog
      v-model="uploadDialogVisible"
      title="上传模型"
      width="600px"
      @close="handleUploadDialogClose"
    >
      <ElForm
        ref="uploadFormRef"
        :model="uploadFormData"
        :rules="uploadFormRules"
        label-width="100px"
      >
        <ElFormItem label="模型类型" prop="modelType">
          <ElSelect v-model="uploadFormData.modelType" placeholder="请选择模型类型"
            filterable
          >
            <ElOption
              v-for="type in modelTypeList"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="模型名称" prop="modelName">
          <ElInput v-model="uploadFormData.modelName" placeholder="请输入模型名称" />
        </ElFormItem>
        <ElFormItem label="版本号" prop="version">
          <ElInput v-model="uploadFormData.version" placeholder="请输入版本号，如 v1.0.0" />
        </ElFormItem>
        <ElFormItem label="模型文件" prop="file"
          v-if="!uploading"
        >
          <ElUpload
            ref="uploadRef"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            :file-list="fileList"
            accept=".onnx,.pt,.pth,.trt"
            class="upload-demo"
          >
            <ElIcon class="el-icon--upload">
              <UploadFilled />
            </ElIcon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <div class="el-upload__tip" slot="tip">
              支持上传 .onnx、.pt、.pth、.trt 格式的模型文件，单个文件不超过 100MB
            </div>
          </ElUpload>
        </ElFormItem>
        <ElFormItem
          v-else
        >
          <ElProgress
            :percentage="uploadProgress"
            :status="uploadProgress === 100 ? 'success' : 'primary'"
          />
          <p class="uploading-text">正在上传文件...</p>
        </ElFormItem>
      </ElForm>
      >template #footer>
        <ElButton @click="uploadDialogVisible = false"
          :disabled="uploading"
        >取消</ElButton>
        <ElButton
          type="primary"
          @click="handleUploadSubmit"
          :disabled="uploading || fileList.length === 0"
        >上传</ElButton>
      >template>
    </ElDialog>

    <!-- 模型详情对话框 -->
    <ElDialog
      v-model="detailDialogVisible"
      title="模型详情"
      width="600px"
    >
      <div class="model-detail"
        v-if="currentModel"
      >
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem label="模型名称">{{ currentModel.modelName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="模型类型">
            <ElTag
              v-if="currentModel.modelType === 1"
              type="primary"
            >布车识别</ElTag>
            <ElTag
              v-else-if="currentModel.modelType === 2"
              type="success"
            >脱岗检测</ElTag>
            <ElTag
              v-else-if="currentModel.modelType === 3"
              type="warning"
            >危险检测</ElTag>
            <ElTag
              v-else-if="currentModel.modelType === 4"
              type="info"
            >其他模型</ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="版本号">{{ currentModel.version }}</ElDescriptionsItem>
          <ElDescriptionsItem label="文件大小">{{ formatFileSize(currentModel.fileSize || 0) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="准确率">{{ (currentModel.accuracy || 0) * 100 }}%</ElDescriptionsItem>
          <ElDescriptionsItem label="推理速度">{{ (currentModel.inferenceTime || 0) }} ms/帧</ElDescriptionsItem>
          <ElDescriptionsItem label="文件路径">{{ currentModel.filePath || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="上传时间">{{ formatDate(currentModel.createTime) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="上传用户">{{ currentModel.createUser || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="状态">
            <ElTag :type="currentModel.status === 1 ? 'success' : 'danger'">
              {{ currentModel.status === 1 ? '启用' : '禁用' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="描述">{{ currentModel.description || '-' }}</ElDescriptionsItem>
        </ElDescriptions>

        <div class="performance-charts"
          v-if="performanceData.length > 0"
        >
          <h3 class="chart-title">性能指标趋势图</h3>
          <ElCard>
            <!- 这里应该是性能指标图表 -!>
            <div class="chart-placeholder">性能指标可视化图表区域
              
            </div>
          </ElCard>
        </div
          v-else
        >
          <ElEmpty description="暂无性能数据" />
        </div
        >
      </div
        v-else
      >
        <ElEmpty description="暂无模型数据" />
      </div
      >
      >template #footer>
        <ElButton @click="detailDialogVisible = false">关闭</ElButton>
        <ElButton type="primary" @click="handleDownloadModel"
          v-if="currentModel"
        >下载模型</ElButton>
      >template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { getModelList, getModelDetail, deleteModel, activateModel, uploadModelFile, downloadModelFile } from '@/api/model'

interface Model {
  id: number
  modelName: string
  modelType: number
  version: string
  fileSize: number
  accuracy: number
  inferenceTime: number
  filePath: string
  status: number
  createTime: string
  createUser: string
  description: string
}

interface ModelType {
  value: number
  label: string
}

const modelTypeList: ModelType[] = [
  { value: 1, label: '布车识别' },
  { value: 2, label: '脱岗检测' },
  { value: 3, label: '危险检测' },
  { value: 4, label: '其他模型' }
]

const modelList = ref<Model[]>([])
const searchForm = reactive({
  modelType: '',
  modelName: '',
  status: ''
})
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 上传相关
const uploadDialogVisible = ref(false)
const uploadFormRef = ref()
const uploadRef = ref()
const fileList = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadFormData = reactive({
  modelType: 1,
  modelName: '',
  version: 'v1.0.0',
  file: null
})
const uploadFormRules = {
  modelType: [
    { required: true, message: '请选择模型类型', trigger: 'change' }
  ],
  modelName: [
    { required: true, message: '请输入模型名称', trigger: 'blur' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' }
  ],
  file: [
    { required: true, message: '请选择文件', trigger: 'change' }
  ]
}

// 详情相关
const detailDialogVisible = ref(false)
const currentModel = ref<Model | null>(null)
const performanceData = ref([])

// 加载模型列表
async function loadModelList() {
  try {
    const response = await getModelList({
      ...searchForm,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    })
    modelList.value = response.data?.list || []
    pagination.total = response.data?.total || 0
  } catch (error) {
    console.error('加载模型列表失败:', error)
    // 暂时使用模拟数据
    modelList.value = [
      {
        id: 1,
        modelName: '布车识别模型',
        modelType: 1,
        version: 'v1.2.3',
        fileSize: 25600000,
        accuracy: 0.95,
        inferenceTime: 50,
        filePath: '/models/car_detection_v1.2.3.onnx',
        status: 1,
        createTime: '2024-01-15 10:30:00',
        createUser: 'admin',
        description: '用于识别车间布车的模型'
      },
      {
        id: 2,
        modelName: '脱岗检测模型',
        modelType: 2,
        version: 'v2.0.1',
        fileSize: 18500000,
        accuracy: 0.92,
        inferenceTime: 35,
        filePath: '/models/absence_detection_v2.0.1.onnx',
        status: 1,
        createTime: '2024-01-10 14:20:00',
        createUser: 'admin',
        description: '用于检测人员脱岗的模型'
      },
      {
        id: 3,
        modelName: '危险区域检测',
        modelType: 3,
        version: 'v1.5.0',
        fileSize: 32000000,
        accuracy: 0.98,
        inferenceTime: 65,
        filePath: '/models/danger_detection_v1.5.0.onnx',
        status: 1,
        createTime: '2024-01-08 09:15:00',
        createUser: 'admin',
        description: '用于检测危险区域的模型'
      }
    ]
    pagination.total = modelList.value.length
  }
}

// 搜索
function handleSearch() {
  pagination.currentPage = 1
  loadModelList()
}

// 重置
function handleReset() {
  searchForm.modelType = ''
  searchForm.modelName = ''
  searchForm.status = ''
  pagination.currentPage = 1
  loadModelList()
}

// 分页处理
function handleSizeChange(size: number) {
  pagination.pageSize = size
  loadModelList()
}

function handleCurrentChange(current: number) {
  pagination.currentPage = current
  loadModelList()
}

// 打开上传对话框
function handleUpload() {
  resetUploadForm()
  uploadDialogVisible.value = true
}

// 关闭上传对话框
function handleUploadDialogClose() {
  resetUploadForm()
}

// 重置上传表单
function resetUploadForm() {
  if (uploadFormRef.value) {
    uploadFormRef.value.resetFields()
  }
  uploadFormData.modelType = 1
  uploadFormData.modelName = ''
  uploadFormData.version = 'v1.0.0'
  uploadFormData.file = null
  fileList.value = []
  uploading.value = false
  uploadProgress.value = 0
}

// 文件变化处理
function handleFileChange(file: any) {
  uploadFormData.file = file.raw
  fileList.value = [file]
}

// 提交上传
async function handleUploadSubmit() {
  if (!uploadFormRef.value) return
  
  try {
    await uploadFormRef.value.validate()
    
    uploading.value = true
    uploadProgress.value = 0
    
    // 创建FormData对象
    const formData = new FormData()
    formData.append('modelType', uploadFormData.modelType.toString())
    formData.append('modelName', uploadFormData.modelName)
    formData.append('version', uploadFormData.version)
    formData.append('file', uploadFormData.file)
    
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 95) {
        uploadProgress.value += 5
      }
    }, 200)
    
    // 调用上传接口
    await uploadModelFile(formData)
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    setTimeout(() => {
      ElMessage.success('模型上传成功')
      uploadDialogVisible.value = false
      resetUploadForm()
      loadModelList()
    }, 500)
  } catch (error) {
    uploading.value = false
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  }
}

// 查看模型详情
async function handleDetail(model: Model) {
  try {
    const response = await getModelDetail(model.id)
    currentModel.value = response.data || model
    // 模拟性能数据
    performanceData.value = [
      { date: '2024-01-10', accuracy: 0.92, speed: 40 },
      { date: '2024-01-12', accuracy: 0.93, speed: 38 },
      { date: '2024-01-14', accuracy: 0.95, speed: 35 }
    ]
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取模型详情失败:', error)
    currentModel.value = model
    detailDialogVisible.value = true
  }
}

// 下载模型
function handleDownloadModel() {
  if (!currentModel.value) return
  
  try {
    downloadModelFile(currentModel.value.id)
    ElMessage.success('开始下载模型文件')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请重试')
  }
}

// 切换模型状态
async function handleToggleStatus(model: Model) {
  try {
    await ElMessageBox.confirm(
      `确定要${model.status === 1 ? '禁用' : '启用'}模型「${model.modelName}」吗？`,
      '确认操作',
      { type: 'warning' }
    )
    
    await activateModel(model.id, model.status === 1 ? 0 : 1)
    model.status = model.status === 1 ? 0 : 1
    ElMessage.success('状态更新成功')
  } catch (error) {
    // 用户取消操作不提示错误
  }
}

// 删除模型
async function handleDelete(model: Model) {
  try {
    await ElMessageBox.confirm(
      `确定要删除模型「${model.modelName}」吗？此操作不可恢复。`,
      '确认删除',
      { type: 'warning' }
    )
    
    await deleteModel(model.id)
    ElMessage.success('删除成功')
    loadModelList()
  } catch (error) {
    // 用户取消删除不提示错误
  }
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 初始化
onMounted(() => {
  loadModelList()
})
</script>

<style scoped>
.model-management {
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
  flex-wrap: wrap;
}

.search-select,
.search-input {
  width: 200px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.upload-demo {
  width: 100%;
}

.uploading-text {
  margin-top: 10px;
  text-align: center;
  color: #606266;
}

.model-detail {
  padding: 10px 0;
}

.performance-charts {
  margin-top: 20px;
}

.chart-title {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.chart-placeholder {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  background-color: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}
</style>