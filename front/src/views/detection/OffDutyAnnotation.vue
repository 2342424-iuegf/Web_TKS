<template>
  <div class="off-duty-annotation">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h2 class="page-title">
          <el-icon><EditPen /></el-icon>
          机台-脱岗区域设置
        </h2>
      </div>
      <div class="toolbar-center">
        <el-select
          v-model="selectedCameraId"
          placeholder="选择摄像头"
          class="camera-select"
          filterable
          @change="handleCameraChange"
          :loading="loadingCameras"
        >
          <el-option
            v-for="camera in cameras"
            :key="camera.camera_id"
            :label="camera.camera_name || camera.camera_id"
            :value="camera.camera_id"
          />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button
          type="primary"
          :icon="Check"
          @click="handleSave"
          :loading="saving"
          :disabled="!selectedCameraId || annotations.length === 0"
        >
          保存标注
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧：图像和Canvas -->
      <div class="canvas-area">
        <div class="canvas-container" v-loading="loadingImage">
          <AnnotationCanvas
            v-if="imageUrl"
            :image-url="imageUrl"
            :annotations="annotations"
            :is-drawing="isDrawing"
            :draw-color="drawColor"
            :current-area-no="currentAreaNo"
            :camera-id="selectedCameraId"
            :timestamp="currentTimestamp"
            @annotation-update="handleAnnotationUpdate"
            @drawing-complete="handleDrawingComplete"
            ref="canvasRef"
          />
          <div v-else class="empty-state">
            <el-empty description="请选择摄像头以加载图像" />
          </div>
        </div>
      </div>

      <!-- 右侧：控制面板 -->
      <div class="control-panel">
        <!-- 绘制工具 -->
        <el-card class="control-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Tools /></el-icon>
              <span>绘制工具</span>
            </div>
          </template>

          <div class="control-item">
            <label>绘制模式：</label>
            <el-select v-model="drawMode" size="small" style="width: 100%">
              <el-option label="多边形" value="polygon" />
            </el-select>
          </div>

          <div class="control-item">
            <label>标注颜色：</label>
            <div class="color-picker-wrapper">
              <el-color-picker v-model="drawColor" size="small" />
              <el-input
                v-model="drawColor"
                size="small"
                style="flex: 1; margin-left: 8px"
              />
            </div>
          </div>

          <div class="control-item">
            <label>区域ID：</label>
            <el-input-number
              v-model="currentAreaNo"
              :min="1"
              :max="100"
              size="small"
              style="width: 100%"
            />
          </div>

          <div class="control-item">
            <label>机器ID：</label>
            <el-input
              v-model="currentMachineId"
              placeholder="如：AUTO1"
              size="small"
            />
          </div>

          <div class="control-buttons">
            <el-button
              type="primary"
              :icon="Plus"
              @click="handleNewAnnotation"
              :disabled="!selectedCameraId || isDrawing"
            >
              新建标注
            </el-button>
            <el-button
              :icon="Close"
              @click="handleCancelDrawing"
              :disabled="!isDrawing"
            >
              取消绘制
            </el-button>
            <el-button
              type="success"
              :icon="Check"
              @click="handleCompleteDrawing"
              :disabled="!isDrawing"
            >
              完成绘制
            </el-button>
            <el-button
              type="danger"
              :icon="Delete"
              @click="handleClearAll"
              :disabled="annotations.length === 0"
            >
              清除所有
            </el-button>
          </div>
        </el-card>

        <!-- 标注列表 -->
        <el-card class="control-card annotation-list-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><List /></el-icon>
              <span>标注列表</span>
            </div>
          </template>

          <div v-if="annotations.length === 0" class="empty-annotations">
            <el-empty description="暂无标注数据" :image-size="80" />
          </div>

          <div v-else class="annotations">
            <div
              v-for="(annotation, index) in annotations"
              :key="index"
              class="annotation-item"
              :class="{ active: selectedAnnotationIndex === index }"
              @click="selectAnnotation(index)"
            >
              <div class="annotation-header">
                <div class="annotation-info">
                  <span class="annotation-color" :style="{ backgroundColor: annotation.color || drawColor }"></span>
                  <span class="annotation-label">区域 {{ annotation.area_no || index + 1 }}</span>
                </div>
                <el-button
                  type="danger"
                  :icon="Delete"
                  text
                  size="small"
                  @click.stop="handleDeleteAnnotation(index)"
                />
              </div>
              <div class="annotation-details">
                <div class="detail-item">
                  <span class="detail-label">机器ID：</span>
                  <span class="detail-value">{{ annotation.machine_id || '未设置' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">顶点数：</span>
                  <span class="detail-value">{{ annotation.points?.length || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  EditPen,
  Check,
  Plus,
  Close,
  Delete,
  Tools,
  List
} from '@element-plus/icons-vue'
import { annotationApi, type Camera, type Annotation } from '@/api/annotation'
import AnnotationCanvas from '@/components/annotation/AnnotationCanvas.vue'

const cameras = ref<Camera[]>([])
const selectedCameraId = ref<string>('')
const loadingCameras = ref(false)
const loadingImage = ref(false)
const saving = ref(false)

const imageUrl = ref<string>('')
const annotations = ref<Annotation[]>([])
const isDrawing = ref(false)
const drawMode = ref('polygon')
const drawColor = ref('#ff0000')
const currentAreaNo = ref(1)
const currentMachineId = ref('AUTO1')
const selectedAnnotationIndex = ref<number | null>(null)

const canvasRef = ref<InstanceType<typeof AnnotationCanvas>>()

const currentTimestamp = computed(() => {
  const now = new Date()
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

// 加载摄像头列表
async function loadCameras() {
  loadingCameras.value = true
  try {
    cameras.value = await annotationApi.getCameras()
    if (cameras.value.length > 0 && !selectedCameraId.value) {
      selectedCameraId.value = cameras.value[0].camera_id
      await loadCameraImage()
    }
  } catch (error) {
    console.error('加载摄像头列表失败:', error)
    ElMessage.error('加载摄像头列表失败')
  } finally {
    loadingCameras.value = false
  }
}

// 加载摄像头图像
async function loadCameraImage() {
  if (!selectedCameraId.value) return

  loadingImage.value = true
  // 释放之前的图像URL
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value)
    imageUrl.value = ''
  }
  
  try {
    // 获取图像（可能需要较长时间，FFmpeg处理RTSP流）
    const blob = await annotationApi.getCameraImage(selectedCameraId.value)
    imageUrl.value = URL.createObjectURL(blob)

    // 加载标注配置
    await loadAnnotations()
  } catch (error: any) {
    console.error('加载图像失败:', error)
    const errorMessage = error?.response?.data?.detail || error?.message || '加载图像失败'
    ElMessage.error(errorMessage)
    // 清空图像URL，显示空状态
    imageUrl.value = ''
  } finally {
    loadingImage.value = false
  }
}

// 加载标注配置
async function loadAnnotations() {
  if (!selectedCameraId.value) return

  try {
    const data = await annotationApi.getAnnotations(selectedCameraId.value)
    annotations.value = data.annotations || []
    // 更新当前区域编号
    if (annotations.value.length > 0) {
      const maxAreaNo = Math.max(
        ...annotations.value.map((ann) => ann.area_no || 0)
      )
      currentAreaNo.value = maxAreaNo + 1
    } else {
      currentAreaNo.value = 1
    }
  } catch (error) {
    console.error('加载标注配置失败:', error)
    // 如果加载失败，使用空数组
    annotations.value = []
  }
}

// 摄像头切换
async function handleCameraChange() {
  if (selectedCameraId.value) {
    // 释放之前的图像URL
    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value)
      imageUrl.value = ''
    }
    annotations.value = []
    await loadCameraImage()
  }
}

// 新建标注
function handleNewAnnotation() {
  if (!selectedCameraId.value) {
    ElMessage.warning('请先选择摄像头')
    return
  }
  isDrawing.value = true
  currentMachineId.value = `AUTO${currentAreaNo.value}`
  ElMessage.info('请在图像上点击绘制多边形区域，右键可删除最后一个点')
}

// 取消绘制
function handleCancelDrawing() {
  isDrawing.value = false
  if (canvasRef.value) {
    canvasRef.value.clearCurrentDrawing()
  }
  ElMessage.info('已取消绘制')
}

// 完成绘制
function handleCompleteDrawing() {
  if (canvasRef.value) {
    canvasRef.value.completeDrawing()
  }
}

// 标注更新
function handleAnnotationUpdate(newAnnotations: Annotation[]) {
  annotations.value = newAnnotations
}

// 绘制完成
function handleDrawingComplete() {
  isDrawing.value = false
  // 更新机器ID
  if (annotations.value.length > 0) {
    const lastAnnotation = annotations.value[annotations.value.length - 1]
    if (lastAnnotation) {
      lastAnnotation.machine_id = currentMachineId.value
    }
  }
  // 自动递增区域编号
  currentAreaNo.value++
  currentMachineId.value = `AUTO${currentAreaNo.value}`
  ElMessage.success('标注绘制完成')
}

// 选择标注
function selectAnnotation(index: number) {
  selectedAnnotationIndex.value = index
}

// 删除标注
async function handleDeleteAnnotation(index: number) {
  try {
    await ElMessageBox.confirm('确定要删除此标注吗？', '确认删除', {
      type: 'warning'
    })
    annotations.value.splice(index, 1)
    // 重新编号
    annotations.value.forEach((ann, idx) => {
      ann.area_no = idx + 1
    })
    if (annotations.value.length > 0) {
      currentAreaNo.value = annotations.value.length + 1
    } else {
      currentAreaNo.value = 1
    }
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

// 清除所有
async function handleClearAll() {
  try {
    await ElMessageBox.confirm('确定要清除所有标注吗？', '确认清除', {
      type: 'warning'
    })
    annotations.value = []
    currentAreaNo.value = 1
    currentMachineId.value = 'AUTO1'
    ElMessage.success('已清除所有标注')
  } catch {
    // 用户取消
  }
}

// 保存标注
async function handleSave() {
  if (!selectedCameraId.value) {
    ElMessage.warning('请先选择摄像头')
    return
  }

  if (annotations.value.length === 0) {
    ElMessage.warning('没有可保存的标注')
    return
  }

  // 确保每个标注都有必要的字段
  const annotationsToSave = annotations.value.map((ann, index) => ({
    ...ann,
    area_no: ann.area_no || index + 1,
    machine_id: ann.machine_id || `AUTO${index + 1}`,
    color: ann.color || drawColor.value
  }))

  saving.value = true
  try {
    await annotationApi.saveAnnotations(selectedCameraId.value, annotationsToSave)
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadCameras()
})
</script>

<style scoped>
.off-duty-annotation {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.toolbar-left {
  flex: 0 0 auto;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 24px;
}

.camera-select {
  width: 300px;
}

.toolbar-right {
  flex: 0 0 auto;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  position: relative;
  min-height: 0;
}

.empty-state {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-panel {
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.control-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.control-item {
  margin-bottom: 16px;
}

.control-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.control-buttons .el-button {
  width: 100%;
}

.annotation-list-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.annotation-list-card :deep(.el-card__body) {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-annotations {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.annotations {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.annotation-item {
  padding: 12px;
  background: #f5f7fa;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.annotation-item:hover {
  background: #ecf5ff;
  border-color: #409eff;
}

.annotation-item.active {
  background: #ecf5ff;
  border-color: #409eff;
}

.annotation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.annotation-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.annotation-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.annotation-label {
  font-weight: 600;
  color: #303133;
}

.annotation-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item {
  display: flex;
  font-size: 12px;
}

.detail-label {
  color: #909399;
  margin-right: 4px;
}

.detail-value {
  color: #606266;
}
</style>

