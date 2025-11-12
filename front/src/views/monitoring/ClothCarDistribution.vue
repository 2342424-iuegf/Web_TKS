<template>
  <div class="cloth-car-distribution">
    <div class="page-header">
      <h2>布车分布检测</h2>
      <div class="header-info">
        <ElTag type="info">实时监测布车分布信息，输出布车号、装载状态、位置信息</ElTag>
      </div>
    </div>
    <ElCard class="main-card">
      <div class="control-panel"
        style="margin-bottom: 20px"
      >
        <div class="search-bar"
          style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap"
        >
          <ElInput
            v-model="searchForm.carNumber"
            placeholder="输入布车号快速定位"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          >
            >template #prepend>
              <ElIcon>
                <Search />
              </ElIcon>
            >template>
          </ElInput>
          <ElSelect
            v-model="searchForm.location"
            placeholder="选择位置区域"
            filterable
            style="width: 180px"
          >
            <ElOption
              v-for="loc in locationList"
              :key="loc.value"
              :label="loc.label"
              :value="loc.value"
            />
          </ElSelect>
          <ElSelect
            v-model="searchForm.loadingStatus"
            placeholder="选择装载状态"
            style="width: 180px"
          >
            <ElOption label="空车"
              value="empty"
            />
            <ElOption label="满载"
              value="full"
            />
            <ElOption label="部分装载"
              value="partial"
            />
          </ElSelect>
          <ElSelect
            v-model="searchForm.status"
            placeholder="选择监测状态"
            style="width: 180px"
          >
            <ElOption label="在线"
              value="online"
            />
            <ElOption label="离线"
              value="offline"
            />
          </ElSelect>
          <ElButton type="primary"
            @click="handleSearch"
          >搜索</ElButton>
          <ElButton
            @click="handleReset"
          >重置</ElButton>
          <ElButton type="success"
            @click="handleRefresh"
          >刷新数据</ElButton>
        </div>
      </div>
      
      <div class="dashboard"
        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px"
      >
        <ElCard shadow="hover"
          class="dashboard-card"
        >
          <div class="dashboard-content"
            style="text-align: center"
          >
            <div class="dashboard-number"
              style="font-size: 32px; font-weight: bold; color: #1890ff"
            >{{ statistics.totalCars }}</div>
            <div class="dashboard-label"
              style="color: #666; margin-top: 10px"
            >布车总数</div>
          </div>
        </ElCard>
        <ElCard shadow="hover"
          class="dashboard-card"
        >
          <div class="dashboard-content"
            style="text-align: center"
          >
            <div class="dashboard-number"
              style="font-size: 32px; font-weight: bold; color: #52c41a"
            >{{ statistics.fullLoadCars }}</div>
            <div class="dashboard-label"
              style="color: #666; margin-top: 10px"
            >满载布车</div>
          </div>
        </ElCard>
        <ElCard shadow="hover"
          class="dashboard-card"
        >
          <div class="dashboard-content"
            style="text-align: center"
          >
            <div class="dashboard-number"
              style="font-size: 32px; font-weight: bold; color: #faad14"
            >{{ statistics.emptyCars }}</div>
            <div class="dashboard-label"
              style="color: #666; margin-top: 10px"
            >空车数量</div>
          </div>
        </ElCard>
        <ElCard shadow="hover"
          class="dashboard-card"
        >
          <div class="dashboard-content"
            style="text-align: center"
          >
            <div class="dashboard-number"
              style="font-size: 32px; font-weight: bold; color: #f5222d"
            >{{ statistics.offlineCars }}</div>
            <div class="dashboard-label"
              style="color: #666; margin-top: 10px"
            >离线布车</div>
          </div>
        </ElCard>
      </div>

      <div class="view-tabs"
        style="margin-bottom: 20px"
      >
        <ElTabs v-model="activeViewTab"
          @tab-change="handleTabChange"
        >
          <ElTabPane label="列表视图"
            name="list"
          />
          <ElTabPane label="地图视图"
            name="map"
          />
          <ElTabPane label="监控视频"
            name="video"
          />
        </ElTabs>
      </div>

      <!-- 列表视图 -->
      <div
        v-if="activeViewTab === 'list'"
      >
        <ElTable
          :data="carList"
          style="width: 100%"
          border
          stripe
          @row-click="handleCarClick"
        >
          <ElTableColumn
            prop="carNumber"
            label="布车号"
            width="120"
            fixed="left"
            header-align="center"
            align="center"
          >
            >template #default="scope">
              <ElTag size="large" type="primary"
                effect="dark"
              >{{ scope.row.carNumber }}</ElTag>
            >template>
          </ElTableColumn>
          <ElTableColumn
            prop="location"
            label="位置"
            width="180"
            header-align="center"
          />
          <ElTableColumn
            prop="loadingStatus"
            label="装载状态"
            width="120"
            header-align="center"
            align="center"
          >
            >template #default="scope">
              <ElTag
                :type="getLoadingStatusTagType(scope.row.loadingStatus)"
              >{{ getLoadingStatusText(scope.row.loadingStatus) }}</ElTag>
            >template>
          </ElTableColumn>
          <ElTableColumn
            prop="capacity"
            label="容量"
            width="100"
            header-align="center"
            align="center"
          />
          <ElTableColumn
            prop="currentLoad"
            label="当前装载量"
            width="120"
            header-align="center"
            align="center"
          />
          <ElTableColumn
            prop="status"
            label="状态"
            width="100"
            header-align="center"
            align="center"
          >
            >template #default="scope">
              <ElTag
                :type="scope.row.status === 'online' ? 'success' : 'danger'"
              >{{ scope.row.status === 'online' ? '在线' : '离线' }}</ElTag>
            >template>
          </ElTableColumn>
          <ElTableColumn
            prop="updateTime"
            label="更新时间"
            width="180"
            header-align="center"
          >
            >template #default="scope">
              {{ formatDateTime(scope.row.updateTime) }}
            >template>
          </ElTableColumn
          <ElTableColumn
            prop="camera"
            label="关联摄像头"
            width="150"
            header-align="center"
          />
          <ElTableColumn
            label="操作"
            width="150"
            fixed="right"
            header-align="center"
            align="center"
          >
            >template #default="scope">
              <ElButton
                type="primary"
                size="small"
                text
                @click.stop="handleViewLocation(scope.row)"
              >查看位置</ElButton>
              <ElButton
                type="success"
                size="small"
                text
                @click.stop="handleViewVideo(scope.row)"
              >查看视频</ElButton>
            >template>
          </ElTableColumn
        </ElTable
        <div class="pagination"
          style="margin-top: 20px; display: flex; justify-content: flex-end"
        >
          <ElPagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div
        >
      </div
        v-else-if="activeViewTab === 'map'"
      >
        <!-- 地图视图 -->
        <div class="map-container"
          style="height: 600px; border: 1px solid #e8e8e8; border-radius: 4px; position: relative"
        >
          <div class="map-placeholder"
            style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #f5f7fa; color: #909399"
          >
            <ElIcon
              style="font-size: 48px; margin-bottom: 16px"
            >
              <LocationFilled />
            </ElIcon
            <div style="font-size: 18px; margin-bottom: 8px">布车分布地图视图>/div>
            <div>显示车间平面图及布车实时位置分布>/div>
          </div>
          <div class="map-legend"
            style="position: absolute; bottom: 20px; right: 20px; background: white; padding: 10px; border-radius: 4px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)"
          >
            <div style="font-weight: 500; margin-bottom: 8px">图例</div>
            <div class="legend-item"
              style="display: flex; align-items: center; margin-bottom: 5px"
            >
              <div
                style="width: 16px; height: 16px; border-radius: 50%; background-color: #52c41a; margin-right: 8px"
              ></div>
              <span>满载布车>/span>
            </div>
            <div class="legend-item"
              style="display: flex; align-items: center; margin-bottom: 5px"
            >
              <div
                style="width: 16px; height: 16px; border-radius: 50%; background-color: #faad14; margin-right: 8px"
              ></div>
              <span>空车>/span>
            </div
            >
            <div class="legend-item"
              style="display: flex; align-items: center; margin-bottom: 5px"
            >
              <div
                style="width: 16px; height: 16px; border-radius: 50%; background-color: #1890ff; margin-right: 8px"
              ></div>
              <span>部分装载>/span>
            </div>
            <div class="legend-item"
              style="display: flex; align-items: center"
            >
              <div
                style="width: 16px; height: 16px; border-radius: 50%; background-color: #f5222d; margin-right: 8px"
              ></div>
              <span>离线布车>/span>
            </div>
          </div
          >
        </div>
      </div
        v-else-if="activeViewTab === 'video'"
      >
        <!-- 视频监控视图 -->
        <div class="video-container"
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 20px"
        >
          <ElCard
            v-for="camera in videoCameras"
            :key="camera.id"
            class="video-card"
          >
            <div slot="header" class="video-header"
              style="display: flex; justify-content: space-between; align-items: center"
            >
              <span>{{ camera.name }} - {{ camera.location }}</span>
              <ElTag
                :type="camera.status === 'online' ? 'success' : 'danger'"
                size="small"
              >{{ camera.status === 'online' ? '在线' : '离线' }}>/ElTag>
            </div
            >
            <div class="video-placeholder"
              style="height: 240px; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #f5f7fa; color: #909399"
            >
              <ElIcon
                style="font-size: 48px; margin-bottom: 16px"
              >
                <VideoFilled />
              </ElIcon
              <div>实时视频流预览区域>/div>
              <div style="margin-top: 8px">{{ camera.ipAddress }}>/div>
            </div
            >
            <div class="video-controls"
              style="margin-top: 12px; display: flex; gap: 8px; justify-content: center"
            >
              <ElButton
                type="primary"
                size="small"
                @click="handlePlayVideo(camera)"
              >
                <ElIcon slot="icon">
                  <VideoPlay />
                </ElIcon
                播放
              </ElButton>
              <ElButton
                type="info"
                size="small"
                @click="handleZoomVideo(camera)"
              >
                <ElIcon slot="icon">
                  <ZoomIn />
                </ElIcon
                放大
              >/ElButton>
            </div>
          </ElCard>
        </div>
      </div
        v-else
      >
        <ElEmpty description="未知视图类型">
        </ElEmpty
      </div
        >
    </ElCard>

    <!-- 布车详情对话框 -->
    <ElDialog
      v-model="carDetailVisible"
      :title="`布车详情 - ${currentCar?.carNumber || ''}`"
      width="600px"
    >
      <div
        v-if="currentCar"
        style="padding: 10px 0"
      >
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem label="布车号">{{ currentCar.carNumber }}</ElDescriptionsItem>
          <ElDescriptionsItem label="所在位置">{{ currentCar.location }}</ElDescriptionsItem>
          <ElDescriptionsItem label="装载状态">
            <ElTag
              :type="getLoadingStatusTagType(currentCar.loadingStatus)"
            >{{ getLoadingStatusText(currentCar.loadingStatus) }}>/ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="总容量">{{ currentCar.capacity }}</ElDescriptionsItem>
          <ElDescriptionsItem label="当前装载量">{{ currentCar.currentLoad }}</ElDescriptionsItem>
          <ElDescriptionsItem label="车辆状态">
            <ElTag
              :type="currentCar.status === 'online' ? 'success' : 'danger'"
            >{{ currentCar.status === 'online' ? '在线' : '离线' }}>/ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="关联摄像头">{{ currentCar.camera }}</ElDescriptionsItem>
          <ElDescriptionsItem label="最后更新时间">{{ formatDateTime(currentCar.updateTime) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="布车描述">{{ currentCar.description || '无' }}>/ElDescriptionsItem>
        </ElDescriptions>

        <div class="car-history"
          style="margin-top: 20px"
        >
          <h3 class="history-title"
            style="font-size: 16px; font-weight: 500; margin-bottom: 10px"
          >最近移动记录>/h3>
          <ElTimeline>
            <ElTimelineItem
              v-for="(item, index) in carHistory"
              :key="index"
              :timestamp="formatDateTime(item.timestamp)"
            >
              {{ item.location }} - {{ item.action }}
            </ElTimelineItem
          </ElTimeline
        </div
        >
      </div
        v-else
      >
        <ElEmpty description="暂无布车信息">
        </ElEmpty
      </div
        >
      >template #footer>
        <ElButton @click="carDetailVisible = false">关闭</ElButton>
        <ElButton type="primary"
          @click="handleViewLocation(currentCar)"
          v-if="currentCar"
        >查看位置地图</ElButton>
      >template>
    </ElDialog

    <!-- 视频播放对话框 -->
    <ElDialog
      v-model="videoPlayerVisible"
      :title="`视频监控 - ${selectedCamera?.name || ''}`"
      width="800px"
      fullscreen
    >
      <div
        v-if="selectedCamera"
        class="video-player-container"
        style="text-align: center; padding: 20px 0"
      >
        <div class="video-player-placeholder"
          style="height: 500px; display: flex; align-items: center; justify-content: center; background-color: #000; color: #fff"
        >
          <ElIcon
            style="font-size: 64px; margin-bottom: 16px"
          >
            <VideoFilled />
          </ElIcon
          
        </div
        >
        <div class="video-player-controls"
          style="margin-top: 20px; display: flex; justify-content: center; gap: 15px"
        >
          <ElButton
            type="primary"
            size="large"
            @click="handlePlayFullVideo"
          >
            <ElIcon slot="icon">
              <VideoPlay />
            </ElIcon
            {{ isPlaying ? '暂停' : '播放' }}
          >/ElButton>
          <ElButton
            type="success"
            size="large"
            @click="handleCapture"
          >
            <ElIcon slot="icon">
              <CameraFilled />
            </ElIcon
            截图
          >/ElButton>
          <ElButton
            type="info"
            size="large"
            @click="handleRecord"
          >
            <ElIcon slot="icon">
              <VideoCameraFilled />
            </ElIcon
            {{ isRecording ? '停止录制' : '录制' }}
          >/ElButton>
        </div
        >
      </div
        v-else
      >
        <ElEmpty description="未选择摄像头">
        </ElEmpty
      </div
        >
    </ElDialog
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, LocationFilled, VideoFilled, VideoPlay, ZoomIn, CameraFilled, VideoCameraFilled } from '@element-plus/icons-vue'
import { getClothCarList, getCarDetail, getCarHistory, searchCarByNumber, getVideoCameras } from '@/api/clothCar'

interface ClothCar {
  id: number
  carNumber: string
  location: string
  loadingStatus: string
  capacity: number
  currentLoad: number
  status: string
  updateTime: string
  camera: string
  description?: string
}

interface CarHistory {
  timestamp: string
  location: string
  action: string
}

interface Camera {
  id: number
  name: string
  location: string
  ipAddress: string
  status: string
}

interface Location {
  value: string
  label: string
}

const searchForm = reactive({
  carNumber: '',
  location: '',
  loadingStatus: '',
  status: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const carList = ref<ClothCar[]>([])
const videoCameras = ref<Camera[]>([])
const activeViewTab = ref('list')
const carDetailVisible = ref(false)
const currentCar = ref<ClothCar | null>(null)
const carHistory = ref<CarHistory[]>([])
const videoPlayerVisible = ref(false)
const selectedCamera = ref<Camera | null>(null)
const isPlaying = ref(false)
const isRecording = ref(false)
const autoRefreshTimer = ref<NodeJS.Timeout | null>(null)

// 统计信息
const statistics = reactive({
  totalCars: 0,
  fullLoadCars: 0,
  emptyCars: 0,
  offlineCars: 0
})

// 位置列表
const locationList = ref<Location[]>([
  { value: 'weaving-area', label: '织布区域' },
  { value: 'dyeing-area', label: '染色区域' },
  { value: 'warehouse', label: '仓库' },
  { value: 'inspection-area', label: '检验区域' },
  { value: 'packing-area', label: '包装区域' },
  { value: 'maintenance', label: '维修区' }
])

// 加载布车列表
async function loadClothCarList() {
  try {
    const response = await getClothCarList({
      ...searchForm,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    })
    carList.value = response.data?.list || []
    pagination.total = response.data?.total || 0
    updateStatistics()
  } catch (error) {
    console.error('加载布车列表失败:', error)
    // 使用模拟数据
    carList.value = [
      {
        id: 1,
        carNumber: 'BC001',
        location: '织布区域-机台12',
        loadingStatus: 'full',
        capacity: 1000,
        currentLoad: 1000,
        status: 'online',
        updateTime: new Date().toISOString(),
        camera: 'CAM-WH-012',
        description: '主要用于运输成品布料'
      },
      {
        id: 2,
        carNumber: 'BC002',
        location: '染色区域-染料1区',
        loadingStatus: 'partial',
        capacity: 800,
        currentLoad: 450,
        status: 'online',
        updateTime: new Date().toISOString(),
        camera: 'CAM-RS-001',
        description: '染料运输专用车'
      },
      {
        id: 3,
        carNumber: 'BC003',
        location: '仓库-存储区A',
        loadingStatus: 'empty',
        capacity: 1200,
        currentLoad: 0,
        status: 'online',
        updateTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        camera: 'CAM-ST-001',
        description: '大容量存储车'
      },
      {
        id: 4,
        carNumber: 'BC004',
        location: '检验区域-1号检验台',
        loadingStatus: 'full',
        capacity: 600,
        currentLoad: 600,
        status: 'online',
        updateTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        camera: 'CAM-QC-001',
        description: '检验用布车'
      },
      {
        id: 5,
        carNumber: 'BC005',
        location: '包装区域-打包台',
        loadingStatus: 'partial',
        capacity: 900,
        currentLoad: 320,
        status: 'offline',
        updateTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        camera: 'CAM-PK-001',
        description: '包装用布车'
      }
    ]
    pagination.total = carList.value.length
    updateStatistics()
  }
}

// 加载视频摄像头列表
async function loadVideoCameras() {
  try {
    const response = await getVideoCameras()
    videoCameras.value = response.data || []
  } catch (error) {
    console.error('加载摄像头列表失败:', error)
    // 使用模拟数据
    videoCameras.value = [
      {
        id: 1,
        name: '织布区域-12号机台摄像头',
        location: '织布区域',
        ipAddress: '192.168.1.101:8554',
        status: 'online'
      },
      {
        id: 2,
        name: '染色区域-染料1区摄像头',
        location: '染色区域',
        ipAddress: '192.168.1.102:8554',
        status: 'online'
      },
      {
        id: 3,
        name: '仓库-存储区A摄像头',
        location: '仓库',
        ipAddress: '192.168.1.103:8554',
        status: 'online'
      },
      {
        id: 4,
        name: '检验区域-1号检验台摄像头',
        location: '检验区域',
        ipAddress: '192.168.1.104:8554',
        status: 'online'
      },
      {
        id: 5,
        name: '包装区域-打包台摄像头',
        location: '包装区域',
        ipAddress: '192.168.1.105:8554',
        status: 'offline'
      }
    ]
  }
}

// 更新统计信息
function updateStatistics() {
  statistics.totalCars = carList.value.length
  statistics.fullLoadCars = carList.value.filter(car => car.loadingStatus === 'full').length
  statistics.emptyCars = carList.value.filter(car => car.loadingStatus === 'empty').length
  statistics.offlineCars = carList.value.filter(car => car.status === 'offline').length
}

// 搜索布车
async function handleSearch() {
  if (searchForm.carNumber) {
    try {
      const response = await searchCarByNumber(searchForm.carNumber)
      carList.value = response.data ? [response.data] : []
      pagination.total = carList.value.length
    } catch (error) {
      console.error('搜索布车失败:', error)
      ElMessage.error('搜索布车失败，请重试')
    }
  } else {
    pagination.currentPage = 1
    loadClothCarList()
  }
}

// 重置搜索
function handleReset() {
  searchForm.carNumber = ''
  searchForm.location = ''
  searchForm.loadingStatus = ''
  searchForm.status = ''
  pagination.currentPage = 1
  loadClothCarList()
}

// 刷新数据
function handleRefresh() {
  loadClothCarList()
  loadVideoCameras()
}

// 分页处理
function handleSizeChange(size: number) {
  pagination.pageSize = size
  loadClothCarList()
}

function handleCurrentChange(current: number) {
  pagination.currentPage = current
  loadClothCarList()
}

// 切换视图标签
function handleTabChange(tab: string) {
  activeViewTab.value = tab
  if (tab === 'video') {
    loadVideoCameras()
  }
}

// 点击布车行查看详情
async function handleCarClick(car: ClothCar) {
  try {
    const response = await getCarDetail(car.id)
    currentCar.value = response.data || car
    // 加载历史记录
    const historyResponse = await getCarHistory(car.id)
    carHistory.value = historyResponse.data || generateMockHistory(car)
    carDetailVisible.value = true
  } catch (error) {
    console.error('获取布车详情失败:', error)
    currentCar.value = car
    carHistory.value = generateMockHistory(car)
    carDetailVisible.value = true
  }
}

// 生成模拟历史记录
function generateMockHistory(car: ClothCar): CarHistory[] {
  const now = Date.now()
  return [
    {
      timestamp: new Date(now).toISOString(),
      location: car.location,
      action: '当前位置'
    },
    {
      timestamp: new Date(now - 30 * 60 * 1000).toISOString(),
      location: '中转区-2号通道',
      action: '移动到此位置'
    },
    {
      timestamp: new Date(now - 60 * 60 * 1000).toISOString(),
      location: '生产区-05号线',
      action: '装载完成'
    },
    {
      timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      location: '生产区-05号线',
      action: '开始装载'
    }
  ]
}

// 查看位置
function handleViewLocation(car: ClothCar | null) {
  if (car) {
    activeViewTab.value = 'map'
    carDetailVisible.value = false
    // 这里可以添加定位到地图上的代码
    ElMessage.success(`已定位到布车${car.carNumber}的位置`)
  }
}

// 查看视频
function handleViewVideo(car: ClothCar) {
  // 查找关联的摄像头
  const camera = videoCameras.value.find(cam => cam.name.includes(car.location.split('-')[0]))
  if (camera) {
    selectedCamera.value = camera
    videoPlayerVisible.value = true
  } else {
    ElMessage.warning('未找到关联的摄像头')
  }
}

// 播放视频
function handlePlayVideo(camera: Camera) {
  selectedCamera.value = camera
  videoPlayerVisible.value = true
}

// 放大视频
function handleZoomVideo(camera: Camera) {
  selectedCamera.value = camera
  videoPlayerVisible.value = true
  // 这里可以添加放大的逻辑
}

// 播放/暂停全屏视频
function handlePlayFullVideo() {
  isPlaying.value = !isPlaying.value
  ElMessage.success(isPlaying.value ? '视频已开始播放' : '视频已暂停')
}

// 截图
function handleCapture() {
  ElMessage.success('截图成功')
}

// 录制
function handleRecord() {
  isRecording.value = !isRecording.value
  ElMessage.success(isRecording.value ? '开始录制' : '停止录制')
}

// 获取装载状态标签类型
function getLoadingStatusTagType(status: string): string {
  switch (status) {
    case 'full': return 'success'
    case 'empty': return 'warning'
    case 'partial': return 'primary'
    default: return 'info'
  }
}

// 获取装载状态文本
function getLoadingStatusText(status: string): string {
  switch (status) {
    case 'full': return '满载'
    case 'empty': return '空车'
    case 'partial': return '部分装载'
    default: return '未知'
  }
}

// 格式化日期时间
function formatDateTime(dateTimeStr: string): string {
  if (!dateTimeStr) return ''
  
  const date = new Date(dateTimeStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 启动自动刷新
function startAutoRefresh() {
  // 每30秒自动刷新一次数据
  autoRefreshTimer.value = setInterval(() => {
    if (activeViewTab.value === 'list') {
      loadClothCarList()
    } else if (activeViewTab.value === 'video') {
      loadVideoCameras()
    }
  }, 30000)
}

// 停止自动刷新
function stopAutoRefresh() {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value)
    autoRefreshTimer.value = null
  }
}

// 初始化
onMounted(() => {
  loadClothCarList()
  startAutoRefresh()
})

// 组件销毁时清理定时器
onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.cloth-car-distribution {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.header-info {
  margin-top: 8px;
}

.main-card {
  height: calc(100% - 80px);
  display: flex;
  flex-direction: column;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  transition: transform 0.3s ease;
}

.video-card {
  height: 360px;
}

.video-player-container {
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.video-player-placeholder {
  flex: 1;
  min-height: 400px;
}
</style>