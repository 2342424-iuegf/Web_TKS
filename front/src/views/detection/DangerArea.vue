<template>
  <div class="danger-area-management">
    <div class="page-header">
      <h2>危险区域设置</h2>
    </div>
    <ElCard class="main-card">
      <div class="search-bar">
        <ElSelect v-model="searchForm.cameraId" placeholder="选择摄像头"
          class="search-select"
          filterable
        >
          <ElOption
            v-for="camera in cameraList"
            :key="camera.id"
            :label="camera.name"
            :value="camera.id"
          />
        </ElSelect>
        <ElInput
          v-model="searchForm.areaName"
          placeholder="区域名称"
          class="search-input"
        />
        <ElButton type="primary" @click="handleSearch">搜索</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
        <ElButton type="success" @click="handleCreate">新增危险区域</ElButton>
      </div>
      <ElTable :data="areaList" style="width: 100%">
        <ElTableColumn prop="id" label="区域ID" width="80" />
        <ElTableColumn prop="cameraName" label="摄像头" />
        <ElTableColumn prop="areaName" label="区域名称" />
        <ElTableColumn prop="areaType" label="危险类型" width="120">
          >template #default="scope">
            <ElTag
              v-if="scope.row.areaType === 1"
              type="danger"
            >机械危险</ElTag>
            <ElTag
              v-else-if="scope.row.areaType === 2"
              type="warning"
            >电气危险</ElTag>
            <ElTag
              v-else-if="scope.row.areaType === 3"
              type="success"
            >高温危险</ElTag>
            <ElTag
              v-else-if="scope.row.areaType === 4"
              type="info"
            >其他危险</ElTag>
          >template>
        </ElTableColumn>
        <ElTableColumn prop="alarmLevel" label="告警等级" width="100">
          >template #default="scope">
            <ElTag
              :type="
                scope.row.alarmLevel === 1
                  ? 'danger'
                  : scope.row.alarmLevel === 2
                    ? 'warning'
                    : 'info'
              "
            >
              {{ getAlarmLevelText(scope.row.alarmLevel) }}
            </ElTag>
          >template>
        </ElTableColumn>
        <ElTableColumn prop="description" label="区域描述" />
        <ElTableColumn prop="status" label="状态" width="100">
          >template #default="scope">
            <ElTag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </ElTag>
          >template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="200" fixed="right">
          >template #default="scope">
            <ElButton type="primary" text @click="handleEdit(scope.row)">编辑</ElButton>
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

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <div class="dialog-content">
        <ElForm
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
          class="left-form"
        >
          <ElFormItem label="选择摄像头" prop="cameraId">
            <ElSelect v-model="formData.cameraId" placeholder="请选择摄像头"
              filterable
              @change="handleCameraChange"
            >
              <ElOption
                v-for="camera in cameraList"
                :key="camera.id"
                :label="camera.name"
                :value="camera.id"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="区域名称" prop="areaName">
            <ElInput v-model="formData.areaName" placeholder="请输入区域名称" />
          </ElFormItem>
          <ElFormItem label="危险类型" prop="areaType">
            <ElRadioGroup v-model="formData.areaType"
              class="radio-group"
            >
              <ElRadio :label="1">机械危险</ElRadio>
              <ElRadio :label="2">电气危险</ElRadio>
              <ElRadio :label="3">高温危险</ElRadio>
              <ElRadio :label="4">其他危险</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
          <ElFormItem label="告警等级" prop="alarmLevel">
            <ElRadioGroup v-model="formData.alarmLevel"
              class="radio-group"
            >
              <ElRadio :label="1">一级（严重）</ElRadio>
              <ElRadio :label="2">二级（一般）</ElRadio>
              <ElRadio :label="3">三级（提示）</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
          <ElFormItem label="区域描述" prop="description">
            <ElInput
              v-model="formData.description"
              placeholder="请输入区域描述"
              type="textarea"
              :rows="3"
            />
          </ElFormItem>
          <ElFormItem label="检测灵敏度" prop="sensitivity">
            <ElSlider
              v-model="formData.sensitivity"
              :min="1"
              :max="10"
              :step="1"
              show-stops
            />
            <span class="param-value">{{ formData.sensitivity }}/10</span>
          </ElFormItem>
          <ElFormItem label="检测频率(秒)" prop="checkInterval">
            <ElSlider
              v-model="formData.checkInterval"
              :min="1"
              :max="10"
              :step="1"
              show-stops
            />
            <span class="param-value">{{ formData.checkInterval }}秒</span>
          </ElFormItem>
        </ElForm
        <div class="preview-container"
          v-if="formData.cameraId"
        >
          <div class="preview-title">摄像头预览与区域绘制</div>
          <div class="video-preview">
            <!-- 这里应该放摄像头预览视频 -->
            <div class="video-placeholder">摄像头预览区域
              
            </div>
          </div>
          <div class="draw-controls">
            <ElButton type="primary" @click="startDrawing">开始绘制区域</ElButton>
            <ElButton @click="cancelDrawing">取消绘制</ElButton>
            <ElButton type="success" @click="saveDrawing">保存区域
              
            </ElButton>
          </div>
        </div>
        <div v-if="!formData.cameraId">
          <div class="no-camera-tip">请先选择摄像头</div>
        </div>
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
import { getDangerAreaList, createDangerArea, updateDangerArea, deleteDangerArea, toggleDangerAreaStatus } from '@/api/detection'
import { getCameraList } from '@/api/system'

interface DangerArea {
  id: number
  cameraId: number
  cameraName: string
  areaName: string
  areaType: number
  alarmLevel: number
  description: string
  areaPoints: string
  sensitivity: number
  checkInterval: number
  status: number
}

interface Camera {
  id: number
  name: string
}

const areaList = ref<DangerArea[]>([])
const cameraList = ref<Camera[]>([])
const searchForm = reactive({
  cameraId: '',
  areaName: ''
})
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})
const dialogVisible = ref(false)
const dialogTitle = ref('新增危险区域')
const formRef = ref()
const isEdit = ref(false)
const isDrawing = ref(false)

const formData = reactive({
  id: 0,
  cameraId: 0,
  areaName: '',
  areaType: 1,
  alarmLevel: 1,
  description: '',
  areaPoints: '',
  sensitivity: 8,
  checkInterval: 2
})

const formRules = {
  cameraId: [
    { required: true, message: '请选择摄像头', trigger: 'change' }
  ],
  areaName: [
    { required: true, message: '请输入区域名称', trigger: 'blur' }
  ],
  areaType: [
    { required: true, message: '请选择危险类型', trigger: 'change' }
  ],
  alarmLevel: [
    { required: true, message: '请选择告警等级', trigger: 'change' }
  ],
  areaPoints: [
    { required: true, message: '请绘制区域', trigger: 'blur' }
  ]
}

// 获取告警等级文本
function getAlarmLevelText(level: number): string {
  switch (level) {
    case 1:
      return '一级'
    case 2:
      return '二级'
    case 3:
      return '三级'
    default:
      return '未知'
  }
}

// 加载摄像头列表
async function loadCameras() {
  try {
    // 这里应该调用API获取摄像头列表
    // 暂时使用模拟数据
    cameraList.value = [
      { id: 1, name: '车间1-摄像头1' },
      { id: 2, name: '车间2-摄像头1' },
      { id: 3, name: '车间3-摄像头1' }
    ]
  } catch (error) {
    console.error('加载摄像头列表失败:', error)
  }
}

// 加载区域列表
async function loadAreaList() {
  try {
    const response = await getDangerAreaList({
      ...searchForm,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    })
    areaList.value = response.data?.list || []
    pagination.total = response.data?.total || 0
  } catch (error) {
    console.error('加载区域列表失败:', error)
    // 暂时使用模拟数据
    areaList.value = [
      {
        id: 1,
        cameraId: 1,
        cameraName: '车间1-摄像头1',
        areaName: '机械危险区域A',
        areaType: 1,
        alarmLevel: 1,
        description: '织机1#机械危险区域',
        areaPoints: '',
        sensitivity: 8,
        checkInterval: 2,
        status: 1
      },
      {
        id: 2,
        cameraId: 2,
        cameraName: '车间2-摄像头1',
        areaName: '电气危险区域B',
        areaType: 2,
        alarmLevel: 2,
        description: '电控柜附近危险区域',
        areaPoints: '',
        sensitivity: 7,
        checkInterval: 3,
        status: 1
      },
      {
        id: 3,
        cameraId: 3,
        cameraName: '车间3-摄像头1',
        areaName: '高温危险区域C',
        areaType: 3,
        alarmLevel: 1,
        description: '高温设备周围危险区域',
        areaPoints: '',
        sensitivity: 9,
        checkInterval: 1,
        status: 1
      }
    ]
    pagination.total = areaList.value.length
  }
}

// 搜索
function handleSearch() {
  pagination.currentPage = 1
  loadAreaList()
}

// 重置
function handleReset() {
  searchForm.cameraId = ''
  searchForm.areaName = ''
  pagination.currentPage = 1
  loadAreaList()
}

// 分页处理
function handleSizeChange(size: number) {
  pagination.pageSize = size
  loadAreaList()
}

function handleCurrentChange(current: number) {
  pagination.currentPage = current
  loadAreaList()
}

// 新增区域
function handleCreate() {
  dialogTitle.value = '新增危险区域'
  isEdit.value = false
  resetFormData()
  dialogVisible.value = true
}

// 编辑区域
function handleEdit(row: DangerArea) {
  dialogTitle.value = '编辑危险区域'
  isEdit.value = true
  formData.id = row.id
  formData.cameraId = row.cameraId
  formData.areaName = row.areaName
  formData.areaType = row.areaType
  formData.alarmLevel = row.alarmLevel
  formData.description = row.description
  formData.areaPoints = row.areaPoints
  formData.sensitivity = row.sensitivity
  formData.checkInterval = row.checkInterval
  dialogVisible.value = true
}

// 删除区域
async function handleDelete(row: DangerArea) {
  try {
    await ElMessageBox.confirm(
      `确定要删除危险区域「${row.areaName}」吗？`,
      '确认删除',
      { type: 'warning' }
    )
    await deleteDangerArea(row.id)
    ElMessage.success('删除成功')
    loadAreaList()
  } catch (error) {
    // 用户取消删除不提示错误
  }
}

// 切换区域状态
async function handleToggleStatus(row: DangerArea) {
  try {
    await toggleDangerAreaStatus(row.id, row.status === 1 ? 0 : 1)
    row.status = row.status === 1 ? 0 : 1
    ElMessage.success('更新成功')
  } catch (error) {
    console.error('更新状态失败:', error)
  }
}

// 摄像头切换处理
function handleCameraChange() {
  // 清除已绘制的区域
  formData.areaPoints = ''
}

// 开始绘制区域
function startDrawing() {
  isDrawing.value = true
  ElMessage.info('请在预览区域点击绘制多边形区域，完成后点击保存')
}

// 取消绘制
function cancelDrawing() {
  isDrawing.value = false
  formData.areaPoints = ''
  ElMessage.info('已取消绘制')
}

// 保存绘制的区域
function saveDrawing() {
  if (isDrawing.value) {
    isDrawing.value = false
    // 这里应该保存实际绘制的点坐标
    // 暂时使用模拟数据
    formData.areaPoints = '模拟区域数据'
    ElMessage.success('区域绘制完成')
  }
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      await updateDangerArea(formData)
    } else {
      await createDangerArea(formData)
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    loadAreaList()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

// 关闭对话框
function handleDialogClose() {
  resetFormData()
  isDrawing.value = false
}

// 重置表单数据
function resetFormData() {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  formData.id = 0
  formData.cameraId = 0
  formData.areaName = ''
  formData.areaType = 1
  formData.alarmLevel = 1
  formData.description = ''
  formData.areaPoints = ''
  formData.sensitivity = 8
  formData.checkInterval = 2
}

// 初始化
onMounted(() => {
  loadCameras()
  loadAreaList()
})
</script>

<style scoped>
.danger-area-management {
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

.dialog-content {
  display: flex;
  gap: 20px;
}

.left-form {
  flex: 1;
  max-width: 350px;
}

.preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #333;
}

.video-preview {
  width: 100%;
  height: 300px;
  background-color: #f0f2f5;
  border-radius: 4px;
  margin-bottom: 15px;
  overflow: hidden;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  background-color: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.draw-controls {
  display: flex;
  gap: 10px;
}

.no-camera-tip {
  flex: 1;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  background-color: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.param-value {
  margin-left: 10px;
  color: #1890ff;
  font-weight: 500;
}
</style>