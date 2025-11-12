<template>
  <div class="history-video-container">
    <el-card shadow="never" class="mb-4">
      <div class="video-statistics">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ formatStorage(statistics.totalStorage) }}</div>
              <div class="stat-label">总存储空间</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item success">
              <div class="stat-value">{{ formatStorage(statistics.usedStorage) }}</div>
              <div class="stat-label">已用存储空间</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item warning">
              <div class="stat-value">{{ statistics.storageRate }}%</div>
              <div class="stat-label">存储使用率</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.totalRecords }}</div>
              <div class="stat-label">视频记录数</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card shadow="never">
      <div class="search-section">
        <el-form :model="queryParams" label-width="100px" class="mb-4">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="摄像头名称">
                <el-select 
                  v-model="queryParams.cameraId" 
                  placeholder="请选择摄像头"
                  filterable
                  clearable
                  class="w-full"
                >
                  <el-option
                    v-for="camera in cameraOptions"
                    :key="camera.value"
                    :label="camera.label"
                    :value="camera.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="录制时间">
                <el-date-picker
                  v-model="queryParams.timeRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  class="w-full"
                ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="视频类型">
                <el-select v-model="queryParams.videoType" placeholder="请选择" clearable>
                  <el-option label="自动录制" value="auto"></el-option>
                  <el-option label="手动录制" value="manual"></el-option>
                  <el-option label="事件触发" value="event"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row justify="end">
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-row>
        </el-form>

        <!-- 时间轴视图 -->
        <div class="timeline-view mb-4" v-if="selectedCamera">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>{{ selectedCamera.cameraName }} - 录像时间轴</span>
                <el-button type="text" @click="showTimelineLegend = !showTimelineLegend">
                  <el-icon><InfoFilled /></el-icon>图例说明
                </el-button>
              </div>
            </template>
            
            <div v-if="showTimelineLegend" class="timeline-legend mb-4">
              <el-tag type="success">自动录制</el-tag>
              <el-tag type="warning">手动录制</el-tag>
              <el-tag type="danger">事件触发</el-tag>
              <el-tag type="info">普通时段</el-tag>
            </div>
            
            <div class="timeline-days">
              <div 
                v-for="day in timelineDays" 
                :key="day.date"
                class="timeline-day"
                @click="selectTimelineDay(day)"
              >
                <div class="day-header">
                  <span class="day-date">{{ day.date }}</span>
                  <span class="day-count">{{ day.count }}个录像</span>
                </div>
                <div class="timeline-slider">
                  <div 
                    v-for="segment in day.segments" 
                    :key="`${segment.startTime}-${segment.endTime}`"
                    class="timeline-segment"
                    :class="`type-${segment.type}`"
                    :style="{
                      left: segment.startPercent + '%',
                      width: segment.durationPercent + '%'
                    }"
                    @click.stop="selectVideoSegment(segment)"
                    :title="`${formatTime(segment.startTime)} - ${formatTime(segment.endTime)} (${getSegmentTypeText(segment.type)})`"
                  ></div>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 视频列表 -->
        <div class="video-list">
          <el-table
            v-loading="loading"
            :data="videoList"
            style="width: 100%"
            @row-click="handleVideoClick"
          >
            <el-table-column prop="videoId" label="视频ID" width="180"></el-table-column>
            <el-table-column prop="cameraName" label="摄像头名称" width="180"></el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="200">
              <template #default="scope">
                {{ formatDateTime(scope.row.startTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="endTime" label="结束时间" width="200">
              <template #default="scope">
                {{ formatDateTime(scope.row.endTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="时长" width="120">
              <template #default="scope">
                {{ formatDuration(scope.row.duration) }}
              </template>
            </el-table-column>
            <el-table-column prop="videoType" label="视频类型" width="120">
              <template #default="scope">
                <el-tag 
                  :type="getVideoTypeTag(scope.row.videoType)"
                  size="small"
                >
                  {{ getVideoTypeText(scope.row.videoType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="文件大小" width="120">
              <template #default="scope">
                {{ formatStorage(scope.row.size) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click.stop="playVideo(scope.row)"
                >
                  播放
                </el-button>
                <el-button 
                  size="small" 
                  @click.stop="downloadVideo(scope.row)"
                >
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[10, 20, 50, 100]"
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
      :title="`视频回放 - ${currentVideo?.cameraName || ''}`"
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
            <el-icon :size="64" class="error-icon"><WarningFilled /></el-icon>
            <span class="error-text">无法加载视频文件</span>
          </div>
        </div>

        <div class="video-info">
          <el-descriptions :column="4" :size="'small'">
            <el-descriptions-item label="视频ID">{{ currentVideo?.videoId || '-' }}</el-descriptions-item>
            <el-descriptions-item label="摄像头">{{ currentVideo?.cameraName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ formatDateTime(currentVideo?.startTime) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ formatDateTime(currentVideo?.endTime) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="时长">{{ formatDuration(currentVideo?.duration) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="文件大小">{{ formatStorage(currentVideo?.size) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="视频类型">
              <el-tag 
                v-if="currentVideo" 
                :type="getVideoTypeTag(currentVideo.videoType)"
                size="small"
              >
                {{ getVideoTypeText(currentVideo.videoType) }}
              </el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="清晰度">
              <el-select v-model="playbackQuality" @change="changePlaybackQuality" size="small">
                <el-option label="高清" value="high"></el-option>
                <el-option label="标清" value="medium"></el-option>
                <el-option label="流畅" value="low"></el-option>
              </el-select>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled, WarningFilled } from '@element-plus/icons-vue'
import {
  getVideoList,
  getVideoStatistics,
  getVideoPlaybackUrl,
  getCameraList as fetchCameraList
} from '@/api/video'

// 响应式数据
const loading = ref(false)
const videoList = ref<any[]>([])
const total = ref(0)
const cameraOptions = ref<any[]>([])
const selectedCamera = ref<any>(null)
const showTimelineLegend = ref(false)
const timelineDays = ref<any[]>([])

// 查询参数
const queryParams = reactive({
  cameraId: '',
  timeRange: null,
  videoType: '',
  page: 1,
  pageSize: 20
})

// 统计数据
const statistics = reactive({
  totalStorage: 0,
  usedStorage: 0,
  storageRate: 0,
  totalRecords: 0
})

// 视频播放相关
const videoDialogVisible = ref(false)
const currentVideo = ref<any>(null)
const videoPlayer = ref<HTMLVideoElement | null>(null)
const videoUrl = ref('')
const videoLoading = ref(false)
const playbackQuality = ref('high')

// 生命周期
onMounted(async () => {
  await loadStatistics()
  await loadCameraOptions()
})

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await getVideoStatistics()
    if (res.code === 200) {
      statistics.totalStorage = res.data.diskTotal || 0
      statistics.usedStorage = res.data.diskUsage || 0
      statistics.storageRate = res.data.diskUsage && res.data.diskTotal 
        ? Math.round((res.data.diskUsage / res.data.diskTotal) * 100) 
        : 0
      statistics.totalRecords = res.data.totalRecords || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载摄像头选项
const loadCameraOptions = async () => {
  try {
    const res = await fetchCameraList({ pageSize: 100 })
    if (res.code === 200) {
      cameraOptions.value = res.data.list.map((camera: any) => ({
        label: camera.cameraName,
        value: camera.cameraId
      }))
    }
  } catch (error) {
    console.error('加载摄像头列表失败:', error)
  }
}

// 查询
const handleQuery = async () => {
  queryParams.page = 1
  await loadVideoList()
  
  // 如果选择了摄像头，加载时间轴数据
  if (queryParams.cameraId) {
    await loadTimelineData()
  }
}

// 重置
const resetQuery = () => {
  Object.keys(queryParams).forEach(key => {
    queryParams[key as keyof typeof queryParams] = ''
  })
  queryParams.page = 1
  queryParams.pageSize = 20
  timelineDays.value = []
  selectedCamera.value = null
}

// 分页变化
const handleSizeChange = async (size: number) => {
  queryParams.pageSize = size
  await loadVideoList()
}

const handleCurrentChange = async (current: number) => {
  queryParams.page = current
  await loadVideoList()
}

// 加载视频列表
const loadVideoList = async () => {
  loading.value = true
  try {
    const params = {
      ...queryParams,
      startTime: queryParams.timeRange?.[0] || '',
      endTime: queryParams.timeRange?.[1] || ''
    }
    delete params.timeRange

    const res = await getVideoList(params)
    if (res.code === 200) {
      videoList.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '获取视频列表失败')
    }
  } catch (error) {
    ElMessage.error('获取视频列表失败')
    console.error('获取视频列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载时间轴数据
const loadTimelineData = async () => {
  try {
    // 找到选中的摄像头信息
    const camera = cameraOptions.value.find(opt => opt.value === queryParams.cameraId)
    if (camera) {
      selectedCamera.value = {
        cameraId: camera.value,
        cameraName: camera.label
      }
    }
    
    // 生成模拟的时间轴数据（在实际项目中应该从API获取）
    generateMockTimelineData()
  } catch (error) {
    console.error('加载时间轴数据失败:', error)
  }
}

// 生成模拟时间轴数据
const generateMockTimelineData = () => {
  const days = []
  const today = new Date()
  
  // 生成最近7天的数据
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toLocaleDateString('zh-CN')
    
    const segments = []
    const segmentCount = Math.floor(Math.random() * 10) + 5 // 每天5-14个录像
    
    for (let j = 0; j < segmentCount; j++) {
      const startHour = Math.floor(Math.random() * 24)
      const startMinute = Math.floor(Math.random() * 60)
      const duration = Math.floor(Math.random() * 60) + 10 // 10-70分钟
      
      const types = ['auto', 'manual', 'event']
      const type = types[Math.floor(Math.random() * types.length)]
      
      const startTime = new Date(date)
      startTime.setHours(startHour, startMinute, 0, 0)
      
      const endTime = new Date(startTime)
      endTime.setMinutes(startTime.getMinutes() + duration)
      
      // 计算百分比位置
      const startMinutes = startHour * 60 + startMinute
      const startPercent = (startMinutes / (24 * 60)) * 100
      const durationPercent = (duration / (24 * 60)) * 100
      
      segments.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        startPercent,
        durationPercent,
        type,
        duration
      })
    }
    
    // 按开始时间排序
    segments.sort((a, b) => a.startPercent - b.startPercent)
    
    days.push({
      date: dateStr,
      count: segments.length,
      segments
    })
  }
  
  timelineDays.value = days
}

// 选择时间轴日期
const selectTimelineDay = (day: any) => {
  // 可以在这里实现日期选择后的逻辑
  console.log('选择日期:', day)
}

// 选择视频时间段
const selectVideoSegment = async (segment: any) => {
  // 根据时间段创建一个临时的视频记录
  const videoRecord = {
    videoId: `temp_${Date.now()}`,
    cameraId: queryParams.cameraId,
    cameraName: selectedCamera.value?.cameraName || '',
    startTime: segment.startTime,
    endTime: segment.endTime,
    duration: segment.duration,
    videoType: segment.type,
    size: Math.floor(Math.random() * 1000000000) + 100000000 // 模拟大小
  }
  
  await playVideo(videoRecord)
}

// 表格行点击
const handleVideoClick = (row: any) => {
  playVideo(row)
}

// 播放视频
const playVideo = async (video: any) => {
  currentVideo.value = video
  videoDialogVisible.value = true
  await loadVideoPlaybackUrl(video)
}

// 加载视频回放URL
const loadVideoPlaybackUrl = async (video: any) => {
  videoLoading.value = true
  videoUrl.value = ''
  try {
    const res = await getVideoPlaybackUrl({
      videoId: video.videoId,
      quality: playbackQuality.value as 'high' | 'medium' | 'low'
    })
    
    if (res.code === 200) {
      videoUrl.value = res.data.url
    } else {
      ElMessage.error(res.message || '获取视频播放地址失败')
      // 在演示环境下，使用模拟的视频URL
      videoUrl.value = 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
    }
  } catch (error) {
    ElMessage.error('获取视频播放地址失败')
    console.error('获取视频播放地址失败:', error)
    // 在演示环境下，使用模拟的视频URL
    videoUrl.value = 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  } finally {
    videoLoading.value = false
  }
}

// 改变回放画质
const changePlaybackQuality = async () => {
  if (currentVideo.value) {
    await loadVideoPlaybackUrl(currentVideo.value)
  }
}

// 下载视频
const downloadVideo = async (video: any) => {
  try {
    // 在实际项目中，应该调用API获取下载链接
    // 这里为了演示，直接模拟下载
    const link = document.createElement('a')
    link.href = 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
    link.download = `video_${video.videoId}_${new Date().getTime()}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('开始下载')
  } catch (error) {
    ElMessage.error('下载失败')
    console.error('下载视频失败:', error)
  }
}

// 重置视频对话框
const resetVideoDialog = () => {
  currentVideo.value = null
  videoUrl.value = ''
  videoLoading.value = false
}

// 格式化日期时间
const formatDateTime = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 格式化时间
const formatTime = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化时长
const formatDuration = (seconds?: number) => {
  if (!seconds) return '00:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 格式化存储大小
const formatStorage = (bytes?: number) => {
  if (!bytes || bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取视频类型标签
const getVideoTypeTag = (type?: string) => {
  switch (type) {
    case 'auto':
      return 'success'
    case 'manual':
      return 'warning'
    case 'event':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取视频类型文本
const getVideoTypeText = (type?: string) => {
  switch (type) {
    case 'auto':
      return '自动录制'
    case 'manual':
      return '手动录制'
    case 'event':
      return '事件触发'
    default:
      return '未知类型'
  }
}

// 获取时间段类型文本
const getSegmentTypeText = (type?: string) => {
  return getVideoTypeText(type)
}
</script>

<style scoped>
.history-video-container {
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

.search-section {
  padding: 20px 0;
}

.timeline-view {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-legend {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.timeline-days {
  max-height: 400px;
  overflow-y: auto;
}

.timeline-day {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.timeline-day:hover {
  background-color: #f5f7fa;
}

.day-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.day-date {
  font-weight: 500;
  color: #303133;
}

.day-count {
  color: #606266;
}

.timeline-slider {
  position: relative;
  height: 20px;
  background-color: #ecf5ff;
  border-radius: 10px;
  overflow: hidden;
}

.timeline-segment {
  position: absolute;
  height: 100%;
  cursor: pointer;
  transition: opacity 0.3s;
}

.timeline-segment:hover {
  opacity: 0.8;
}

.timeline-segment.type-auto {
  background-color: #67c23a;
}

.timeline-segment.type-manual {
  background-color: #e6a23c;
}

.timeline-segment.type-event {
  background-color: #f56c6c;
}

.video-list {
  margin-top: 20px;
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

.video-info {
  padding: 20px;
  background-color: #f5f7fa;
  border-top: 1px solid #ebeef5;
}
</style>