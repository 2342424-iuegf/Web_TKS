<template>
  <div class="live-video-container">
    <el-card shadow="never" class="mb-4">
      <div class="video-statistics">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.totalCameras || 0 }}</div>
              <div class="stat-label">摄像头总数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item success">
              <div class="stat-value">{{ statistics.onlineCameras || 0 }}</div>
              <div class="stat-label">在线摄像头</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item warning">
              <div class="stat-value">{{ statistics.offlineCameras || 0 }}</div>
              <div class="stat-label">离线摄像头</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ formatStorage(statistics.diskUsage || 0) }} / {{ formatStorage(statistics.diskTotal || 0) }}</div>
              <div class="stat-label">存储使用</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card shadow="never">
      <div class="camera-section">
        <el-form :model="queryParams" label-width="100px" class="mb-4">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="摄像头名称">
                <el-input
                  v-model="queryParams.cameraName"
                  placeholder="请输入摄像头名称"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="车间区域">
                <el-select v-model="queryParams.workshopSection" placeholder="请选择" clearable>
                  <el-option
                    v-for="section in workshopSections"
                    :key="section"
                    :label="section"
                    :value="section"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="状态">
                <el-select v-model="queryParams.status" placeholder="请选择" clearable>
                  <el-option label="在线" value="online"></el-option>
                  <el-option label="离线" value="offline"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="视频协议">
                <el-select v-model="videoProtocol" placeholder="请选择">
                  <el-option label="HLS" value="hls"></el-option>
                  <el-option label="RTMP" value="rtmp"></el-option>
                  <el-option label="RTSP" value="rtsp"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row justify="end">
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-row>
        </el-form>

        <div class="camera-grid">
          <div
            v-for="camera in cameraList"
            :key="camera.id"
            class="camera-card"
            :class="{
              'online': camera.status === 'online',
              'offline': camera.status === 'offline'
            }"
            @click="openVideoDialog(camera)"
          >
            <div class="camera-status">
              <span
                class="status-dot"
                :class="camera.status"
              ></span>
              <span class="status-text">{{ camera.status === 'online' ? '在线' : '离线' }}</span>
            </div>
            <div class="camera-preview">
              <img
                v-if="camera.coverUrl"
                :src="camera.coverUrl"
                alt="摄像头预览"
                class="preview-image"
              >
              <div v-else class="no-preview">
                <el-icon :size="48" class="no-preview-icon">VideoCameraFilled</el-icon>
              </div>
              <div v-if="camera.status === 'online'" class="play-icon">
                <el-icon :size="32" class="el-icon-video-play">VideoPlay</el-icon>
              </div>
            </div>
            <div class="camera-info">
              <h3 class="camera-name">{{ camera.cameraName }}</h3>
              <p class="camera-location">{{ camera.workshopSection }} - {{ camera.location }}</p>
            </div>
          </div>
        </div>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[12, 24, 48, 96]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </div>
    </el-card>

    <!-- 视频播放对话框 -->
    <el-dialog
      v-model="videoDialogVisible"
      :title="currentCamera?.cameraName || '实时视频'"
      width="90%"
      top="1vh"
      fullscreen
      @close="resetVideoDialog"
    >
      <div class="video-player-container">
        <div class="video-player-wrapper">
          <div
            v-if="videoLoading"
            class="video-loading"
          >
            <el-spinner :size="64" type="dots"></el-spinner>
            <span class="loading-text">加载视频中...</span>
          </div>
          <video
            v-if="videoUrl && !videoLoading"
            ref="videoPlayer"
            :src="videoUrl"
            autoplay
            controls
            class="video-player"
            width="100%"
            height="auto"
          >
            您的浏览器不支持视频播放
          </video>
          <div
            v-if="!videoUrl && !videoLoading"
            class="video-error"
          >
            <el-icon :size="64" class="error-icon">WarningFilled</el-icon>
            <span class="error-text">无法获取视频流，请检查摄像头状态</span>
          </div>
        </div>

        <div class="video-controls">
          <el-form :model="videoControlForm" label-width="80px">
            <el-row :gutter="20">
              <el-col :span="4">
                <el-form-item label="协议">
                  <el-select v-model="videoControlForm.protocol" @change="changeProtocol">
                    <el-option label="HLS" value="hls"></el-option>
                    <el-option label="RTMP" value="rtmp"></el-option>
                    <el-option label="RTSP" value="rtsp"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="画质">
                  <el-select v-model="videoControlForm.quality" @change="changeQuality">
                    <el-option label="高清" value="high"></el-option>
                    <el-option label="标清" value="medium"></el-option>
                    <el-option label="流畅" value="low"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="录制控制">
                  <el-switch
                    v-model="isRecording"
                    @change="toggleRecording"
                    active-color="#13ce66"
                    active-text="录制中"
                    inactive-text="停止录制"
                  ></el-switch>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="操作">
                  <el-button type="primary" @click="captureImage">截图</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <div v-if="hasPTZControl" class="ptz-controls">
            <div class="ptz-grid">
              <el-button @mousedown="startPTZ('up')" @mouseup="stopPTZ" @mouseleave="stopPTZ"
                class="ptz-btn"
                icon="el-icon-top"
                circle
              ></el-button>
            </div>
            <div class="ptz-grid">
              <el-button @mousedown="startPTZ('left')" @mouseup="stopPTZ" @mouseleave="stopPTZ"
                class="ptz-btn"
                icon="el-icon-left"
                circle
              ></el-button>
              <el-button @click="stopPTZ"
                class="ptz-btn center"
                type="primary"
                circle
              >停止</el-button>
              <el-button @mousedown="startPTZ('right')" @mouseup="stopPTZ" @mouseleave="stopPTZ"
                class="ptz-btn"
                icon="el-icon-right"
                circle
              ></el-button>
            <div class="ptz-grid">
              <el-button @mousedown="startPTZ('down')" @mouseup="stopPTZ" @mouseleave="stopPTZ"
                class="ptz-btn"
                icon="el-icon-bottom"
                circle
              ></el-button>
            </div>
            <div class="ptz-grid zoom">
              <el-button @mousedown="startPTZ('zoomIn')" @mouseup="stopPTZ" @mouseleave="stopPTZ"
                class="ptz-btn"
                icon="el-icon-zoom-in"
                circle
              ></el-button>
              <el-button @mousedown="startPTZ('zoomOut')" @mouseup="stopPTZ" @mouseleave="stopPTZ"
                class="ptz-btn"
                icon="el-icon-zoom-out"
                circle
              ></el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 截图预览对话框 -->
    <el-dialog
      v-model="captureDialogVisible"
      title="截图预览"
      width="60%"
      @close="resetCaptureDialog"
    >
      <div class="capture-preview-container">
        <el-image
          v-if="captureImageUrl"
          :src="captureImageUrl"
          class="capture-image"
          fit="contain"
        ></el-image>
        <div v-else class="no-capture">
          <span>暂无截图</span>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="downloadCapture">下载截图</el-button>
          <el-button @click="captureDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElIcon } from 'element-plus'
import {
  getCameraList,
  getLiveStreamUrl,
  captureVideoImage,
  getVideoStatistics,
  startRecording,
  stopRecording,
  controlPTZ
} from '@/api/video'

// 响应式数据
const loading = ref(false)
const cameraList = ref<any[]>([])
const total = ref(0)

// 查询参数
const queryParams = reactive({
  cameraName: '',
  location: '',
  workshopSection: '',
  status: '',
  page: 1,
  pageSize: 12
})

const videoProtocol = ref('hls')
const workshopSections = ref(['前纺车间', '细纱车间', '络筒车间', '整经车间', '浆纱车间', '织布车间', '整理车间'])

// 统计数据
const statistics = reactive({
  onlineCameras: 0,
  offlineCameras: 0,
  totalCameras: 0,
  diskUsage: 0,
  diskTotal: 0,
  diskFree: 0
})

// 视频播放相关
const videoDialogVisible = ref(false)
const currentCamera = ref<any>null
const videoPlayer = ref<HTMLVideoElement | null>null
const videoUrl = ref('')
const videoLoading = ref(false)
const isRecording = ref(false)
const hasPTZControl = ref(true)

// 视频控制表单
const videoControlForm = reactive({
  protocol: 'hls',
  quality: 'high'
})

// 截图相关
const captureDialogVisible = ref(false)
const captureImageUrl = ref('')

// PTZ控制定时器
let ptzTimer: number | null = null
let ptzAction: string | null = null
let ptzInterval: number = 200 // PTZ控制间隔（毫秒）

// 生命周期
onMounted(async () => {
  await loadStatistics()
  await loadCameraList()
})

onUnmounted(() => {
  // 清理定时器
  if (ptzTimer) {
    clearInterval(ptzTimer)
    ptzTimer = null
  }
})

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await getVideoStatistics()
    if (res.code === 200) {
      Object.assign(statistics, res.data)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载摄像头列表
const loadCameraList = async () => {
  loading.value = true
  try {
    const res = await getCameraList(queryParams)
    if (res.code === 200) {
      cameraList.value = res.data.list
      total.value = res.data.total
      // 为每个摄像头生成模拟封面图
      cameraList.value.forEach(camera => {
        if (camera.status === 'online' && !camera.coverUrl) {
          camera.coverUrl = `https://picsum.photos/seed/${camera.id}/640/360`
        }
      })
    } else {
      ElMessage.error(res.message || '获取摄像头列表失败')
    }
  } catch (error) {
    ElMessage.error('获取摄像头列表失败')
    console.error('获取摄像头列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  queryParams.page = 1
  loadCameraList()
}

// 重置
const resetQuery = () => {
  Object.keys(queryParams).forEach(key => {
    queryParams[key as keyof typeof queryParams] = ''
  })
  queryParams.page = 1
  queryParams.pageSize = 12
}

// 分页变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  loadCameraList()
}

const handleCurrentChange = (current: number) => {
  queryParams.page = current
  loadCameraList()
}

// 打开视频对话框
const openVideoDialog = async (camera: any) => {
  currentCamera.value = camera
  videoDialogVisible.value = true
  
  if (camera.status === 'online') {
    await loadVideoStream(camera.cameraId)
  }
}

// 加载视频流
const loadVideoStream = async (cameraId: string) => {
  videoLoading.value = true
  videoUrl.value = ''
  try {
    const res = await getLiveStreamUrl({
      cameraId,
      protocol: videoControlForm.protocol as 'rtsp' | 'rtmp' | 'hls',
      quality: videoControlForm.quality as 'high' | 'medium' | 'low'
    })
    
    if (res.code === 200) {
      videoUrl.value = res.data.url
      await nextTick()
      // 如果视频元素已加载，尝试播放
      if (videoPlayer.value) {
        videoPlayer.value.play().catch(err => {
          console.warn('视频自动播放失败:', err)
        })
      }
    } else {
      ElMessage.error(res.message || '获取视频流失败')
    }
  } catch (error) {
    ElMessage.error('获取视频流失败')
    console.error('获取视频流失败:', error)
  } finally {
    videoLoading.value = false
  }
}

// 改变协议
const changeProtocol = async () => {
  if (currentCamera.value && currentCamera.value.status === 'online') {
    await loadVideoStream(currentCamera.value.cameraId)
  }
}

// 改变画质
const changeQuality = async () => {
  if (currentCamera.value && currentCamera.value.status === 'online') {
    await loadVideoStream(currentCamera.value.cameraId)
  }
}

// 切换录制状态
const toggleRecording = async () => {
  if (!currentCamera.value) return
  
  try {
    if (isRecording.value) {
      const res = await startRecording(currentCamera.value.cameraId)
      if (res.code === 200) {
        ElMessage.success('开始录制')
      } else {
        ElMessage.error(res.message || '开始录制失败')
        isRecording.value = false
      }
    } else {
      const res = await stopRecording(currentCamera.value.cameraId)
      if (res.code === 200) {
        ElMessage.success('停止录制')
      } else {
        ElMessage.error(res.message || '停止录制失败')
        isRecording.value = true
      }
    }
  } catch (error) {
    ElMessage.error(isRecording.value ? '开始录制失败' : '停止录制失败')
    isRecording.value = !isRecording.value
    console.error('录制控制失败:', error)
  }
}

// 截图
const captureImage = async () => {
  if (!currentCamera.value) return
  
  try {
    const res = await captureVideoImage(currentCamera.value.cameraId)
    if (res.code === 200) {
      captureImageUrl.value = res.data.imageUrl
      captureDialogVisible.value = true
      ElMessage.success('截图成功')
    } else {
      ElMessage.error(res.message || '截图失败')
    }
  } catch (error) {
    ElMessage.error('截图失败')
    console.error('截图失败:', error)
  }
}

// 下载截图
const downloadCapture = () => {
  if (!captureImageUrl.value) return
  
  const link = document.createElement('a')
  link.href = captureImageUrl.value
  link.download = `camera_${currentCamera.value?.cameraId}_${new Date().getTime()}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('下载成功')
}

// 开始PTZ控制
const startPTZ = (action: string) => {
  if (!currentCamera.value) return
  
  ptzAction = action
  
  // 立即执行一次
  doPTZControl(action)
  
  // 设置定时器持续执行
  if (!ptzTimer) {
    ptzTimer = window.setInterval(() => {
      if (ptzAction) {
        doPTZControl(ptzAction)
      }
    }, ptzInterval)
  }
}

// 停止PTZ控制
const stopPTZ = () => {
  if (ptzTimer) {
    clearInterval(ptzTimer)
    ptzTimer = null
  }
  
  if (ptzAction && currentCamera.value) {
    // 发送停止命令
    controlPTZ({
      cameraId: currentCamera.value.cameraId,
      action: 'stop'
    })
  }
  
  ptzAction = null
}

// 执行PTZ控制
const doPTZControl = async (action: string) => {
  if (!currentCamera.value) return
  
  try {
    await controlPTZ({
      cameraId: currentCamera.value.cameraId,
      action: action as any,
      speed: 50 // 控制速度
    })
  } catch (error) {
    console.error('PTZ控制失败:', error)
  }
}

// 重置视频对话框
const resetVideoDialog = () => {
  currentCamera.value = null
  videoUrl.value = ''
  videoLoading.value = false
  isRecording.value = false
  stopPTZ()
}

// 重置截图对话框
const resetCaptureDialog = () => {
  captureImageUrl.value = ''
}

// 格式化存储大小
const formatStorage = (bytes: number) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.live-video-container {
  padding: 20px;
}

.video-statistics {
  padding: 20px 0;
}

.stat-item {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s;
}

.stat-item.success {
  background-color: #f0f9eb;
}

.stat-item.warning {
  background-color: #fdf6ec;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.camera-section {
  padding: 20px 0;
}

.camera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.camera-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
}

.camera-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.camera-card.online {
  border-color: #67c23a;
}

.camera-card.offline {
  border-color: #909399;
  opacity: 0.7;
}

.camera-status {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  font-size: 12px;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.status-dot.online {
  background-color: #67c23a;
}

.status-dot.offline {
  background-color: #909399;
}

.status-text {
  color: #606266;
}

.camera-preview {
  position: relative;
  height: 200px;
  background-color: #f0f2f5;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.no-preview-icon {
  opacity: 0.5;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
}

.camera-card:hover .play-icon {
  opacity: 1;
}

.camera-info {
  padding: 12px;
}

.camera-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.camera-location {
  margin: 0;
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.video-player-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
}

.video-player-wrapper {
  flex: 1;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.video-player {
  max-width: 100%;
  max-height: 100%;
}

.video-loading, .video-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.loading-text, .error-text {
  margin-top: 16px;
  font-size: 14px;
}

.error-icon {
  color: #f56c6c;
}

.video-controls {
  padding: 20px;
  background-color: #f5f7fa;
  border-top: 1px solid #ebeef5;
}

.ptz-controls {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.ptz-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.ptz-grid.zoom {
  flex-direction: column;
  gap: 20px;
}

.ptz-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ptz-btn.center {
  width: 80px;
}

.capture-preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.capture-image {
  max-width: 100%;
  max-height: 500px;
  border: 1px solid #ebeef5;
}

.no-capture {
  color: #909399;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.el-icon-video-play {
  margin-left: 4px;
}
</style>