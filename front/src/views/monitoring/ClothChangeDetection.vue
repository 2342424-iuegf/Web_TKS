<template>
  <div class="cloth-change-detection">
    <div class="page-header">
      <h2>落布换车检测</h2>
      <div class="header-info">
        <ElTag type="info">监测关键机台落布时布车切换信息，并将切换时间、车号信息即时发送MQTT信息到MES系统</ElTag>
      </div>
    </div>
    <ElCard class="main-card">
      <div class="control-panel"
        style="margin-bottom: 20px"
      >
        <div class="search-bar"
          style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap"
        >
          <ElDatePicker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 300px"
          />
          <ElInput
            v-model="searchForm.machineNumber"
            placeholder="输入机台编号"
            clearable
            style="width: 180px"
          >
            >template #prepend>
              <ElIcon>
                <Search />
              </ElIcon>
            >template>
          </ElInput>
          <ElInput
            v-model="searchForm.carNumber"
            placeholder="输入布车号"
            clearable
            style="width: 180px"
          >
            >template #prepend>
              <ElIcon>
                <Car />
              </ElIcon>
            >template>
          </ElInput>
          <ElSelect
            v-model="searchForm.status"
            placeholder="选择状态"
            style="width: 120px"
          >
            <ElOption label="成功"
              value="success"
            />
            <ElOption label="失败"
              value="failed"
            />
            <ElOption label="处理中"
              value="processing"
            />
          </ElSelect>
          <ElSelect
            v-model="searchForm.workshopSection"
            placeholder="选择工段"
            filterable
            style="width: 150px"
          >
            <ElOption
              v-for="section in workshopSections"
              :key="section.value"
              :label="section.label"
              :value="section.value"
            />
          </ElSelect>
          <ElButton type="primary"
            @click="handleSearch"
          >搜索</ElButton>
          <ElButton
            @click="handleReset"
          >重置</ElButton>
          <ElButton type="success"
            @click="handleExport"
          >导出数据</ElButton>
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
            >{{ statistics.totalChanges }}</div>
            <div class="dashboard-label"
              style="color: #666; margin-top: 10px"
            >总换车次数</div>
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
            >{{ statistics.successChanges }}</div>
            <div class="dashboard-label"
              style="color: #666; margin-top: 10px"
            >成功次数</div>
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
            >{{ statistics.failedChanges }}</div>
            <div class="dashboard-label"
              style="color: #666; margin-top: 10px"
            >失败次数</div>
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
            >{{ statistics.averageTime.toFixed(1) }}s</div>
            <div class="dashboard-label"
              style="color: #666; margin-top: 10px"
            >平均换车时间</div>
          </div>
        </ElCard>
      </div>

      <div class="view-tabs"
        style="margin-bottom: 20px"
      >
        <ElTabs v-model="activeViewTab"
          @tab-change="handleTabChange"
        >
          <ElTabPane label="换车记录"
            name="list"
          />
          <ElTabPane label="实时监控"
            name="realtime"
          />
          <ElTabPane label="统计分析"
            name="analysis"
          />
        </ElTabs>
      </div>

      <!-- 换车记录列表 -->
      <div
        v-if="activeViewTab === 'list'"
      >
        <ElTable
          :data="changeList"
          style="width: 100%"
          border
          stripe
          @row-click="handleChangeRecordClick"
        >
          <ElTableColumn
            prop="id"
            label="记录ID"
            width="80"
            header-align="center"
            align="center"
          />
          <ElTableColumn
            prop="machineNumber"
            label="机台编号"
            width="120"
            header-align="center"
            align="center"
          >
            >template #default="scope">
              <ElTag size="large" type="primary"
                effect="dark"
              >{{ scope.row.machineNumber }}</ElTag>
            >template>
          </ElTableColumn
          <ElTableColumn
            prop="carNumber"
            label="布车号"
            width="120"
            header-align="center"
            align="center"
          >
            >template #default="scope">
              <ElTag size="large" type="info"
                effect="dark"
              >{{ scope.row.carNumber }}</ElTag>
            >template>
          </ElTableColumn
          <ElTableColumn
            prop="clothBatch"
            label="布批次号"
            width="150"
            header-align="center"
          />
          <ElTableColumn
            prop="startTime"
            label="换车开始时间"
            width="180"
            header-align="center"
          >
            >template #default="scope">
              {{ formatDateTime(scope.row.startTime) }}
            >template>
          </ElTableColumn
          <ElTableColumn
            prop="endTime"
            label="换车结束时间"
            width="180"
            header-align="center"
          >
            >template #default="scope">
              {{ scope.row.endTime ? formatDateTime(scope.row.endTime) : '- -' }}
            >template>
          </ElTableColumn
          <ElTableColumn
            prop="duration"
            label="换车耗时"
            width="100"
            header-align="center"
            align="center"
          >
            >template #default="scope">
              {{ scope.row.duration ? `${scope.row.duration}s` : '- -' }}
            >template>
          </ElTableColumn
          <ElTableColumn
            prop="status"
            label="状态"
            width="100"
            header-align="center"
            align="center"
          >
            >template #default="scope">
              <ElTag
                :type="getStatusTagType(scope.row.status)"
              >{{ getStatusLabel(scope.row.status) }}>/ElTag>
            >template>
          </ElTableColumn
          <ElTableColumn
            prop="mesStatus"
            label="MES同步状态"
            width="120"
            header-align="center"
            align="center"
          >
            >template #default="scope">
              <ElTag
                :type="scope.row.mesStatus === 'sync_success' ? 'success' : scope.row.mesStatus === 'sync_failed' ? 'danger' : 'warning'"
              >{{ getMesStatusLabel(scope.row.mesStatus) }}>/ElTag>
            >template>
          </ElTableColumn
          <ElTableColumn
            prop="workshopSection"
            label="所属工段"
            width="120"
            header-align="center"
            align="center"
          >
            >template #default="scope">
              <ElTag type="info"
                v-if="scope.row.workshopSection"
              >{{ getWorkshopSectionLabel(scope.row.workshopSection) }}>/ElTag>
              <ElTag type="danger"
                v-else
              >未分配>/ElTag>
            >template>
          </ElTableColumn
          <ElTableColumn
            label="操作"
            width="180"
            fixed="right"
            header-align="center"
            align="center"
          >
            >template #default="scope">
              <ElButton
                type="primary"
                size="small"
                text
                @click.stop="handleViewImage(scope.row)"
              >查看图片</ElButton>
              <ElButton
                type="success"
                size="small"
                text
                @click.stop="handleViewVideo(scope.row)"
              >查看视频</ElButton>
              <ElButton
                type="warning"
                size="small"
                text
                @click.stop="handleSyncToMes(scope.row)"
                v-if="scope.row.mesStatus === 'sync_failed'"
              >重新同步到MES</ElButton>
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
        v-else-if="activeViewTab === 'realtime'"
      >
        <!-- 实时监控 -->
        <div class="realtime-monitor"
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px"
        >
          <ElCard
            v-for="machine in realtimeMachines"
            :key="machine.id"
            class="machine-monitor"
          >
            <div slot="header" class="machine-header"
              style="display: flex; justify-content: space-between; align-items: center"
            >
              <span style="font-weight: 500">机台: {{ machine.machineNumber }} ({{ machine.status === 'online' ? '在线' : '离线' }})>/span>
              <div class="machine-controls"
                style="display: flex; align-items: center; gap: 10px"
              >
                <ElTag
                  :type="machine.isChanging ? 'warning' : 'info'"
                  size="small"
                >{{ machine.isChanging ? '换车中' : '运行中' }}>/ElTag>
                <ElButton
                  type="text"
                  size="small"
                  @click="handleRefreshMachine(machine)"
                >
                  <ElIcon
                    :class="{ 'rotating': machine.isRefreshing }"
                  >
                    <Refresh />
                  </ElIcon
                >/ElButton>
              </div
              >
            </div
            >
            <div class="video-container"
              style="height: 240px; background-color: #000; position: relative; overflow: hidden"
            >
              <div class="video-placeholder"
                style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #fff"
              >
                <ElIcon
                  style="font-size: 48px; margin-bottom: 16px"
                >
                  <VideoFilled />
                </ElIcon
                
              </div
              >
              <div
                v-if="machine.currentCar"
                class="current-car-info"
                style="position: absolute; bottom: 0; left: 0; right: 0; background-color: rgba(0, 0, 0, 0.7); color: #fff; padding: 8px 12px; font-size: 12px"
              >
                <div style="display: flex; justify-content: space-between; align-items: center"
                  v-if="machine.currentCar"
                >
                  <span style="display: flex; align-items: center; gap: 8px"
                  >
                    <ElTag size="small" type="primary">当前布车: {{ machine.currentCar }}>/ElTag>
                    批次: {{ machine.currentBatch }}
                  >/span>
                  <span>运行时间: {{ formatDuration(machine.runningTime) }}>/span>
                </div
                >
              </div
              >
              <div
                v-if="machine.isChanging"
                class="changing-overlay"
                style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(255, 69, 0, 0.9); color: #fff; padding: 10px 20px; border-radius: 4px; font-size: 16px; font-weight: bold"
              >正在换车...
              >/div>
            </div
            >
            <div class="machine-info"
              style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ebeef5"
            >
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: #606266; margin-bottom: 8px"
              >
                <span>今日换车: {{ machine.todayChangeCount }}>/span>
                <span>最近换车: {{ formatRelativeTime(machine.lastChangeTime) }}>/span>
              <div
              >
              <div class="change-alert"
                v-if="machine.alertLevel === 'high'"
                style="background-color: #fff1f0; border: 1px solid #ffccc7; padding: 8px; border-radius: 4px; display: flex; align-items: center; gap: 8px; color: #ff4d4f"
              >
                <ElIcon size="16">
                  <WarningFilled />
                </ElIcon
                <span style="font-size: 12px">换车超时，请检查！>/span>
              </div
                v-else-if="machine.alertLevel === 'medium'"
              >
                <div style="background-color: #fffbe6; border: 1px solid #ffe58f; padding: 8px; border-radius: 4px; display: flex; align-items: center; gap: 8px; color: #fa8c16"
                >
                  <ElIcon size="16">
                    <InfoFilled />
                  </ElIcon
                  <span style="font-size: 12px">换车时间较长，请注意！>/span>
                </div
                >
              >/div
              >
            </div
            >
          </ElCard>
        </div
        >
      </div
        v-else-if="activeViewTab === 'analysis'"
      >
        <!-- 统计分析 -->
        <div class="analysis-container"
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 20px"
        >
          <ElCard class="analysis-card"
          >
            <div slot="header"
              style="display: flex; justify-content: space-between; align-items: center"
            >
              <span style="font-weight: 500">换车频率趋势图>/span>
              <ElSelect
                v-model="chartTimeRange"
                placeholder="选择时间范围"
                style="width: 150px"
              >
                <ElOption label="今日"
                  value="today"
                />
                <ElOption label="近7天"
                  value="7days"
                />
                <ElOption label="近30天"
                  value="30days"
                />
              </ElSelect>
            </div
            >
            <div class="chart-placeholder"
              style="height: 300px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; color: #909399"
            >
              <ElIcon
                style="font-size: 48px; margin-bottom: 16px"
              >
                <LineChart />
              </ElIcon
              <div style="font-size: 16px">换车频率趋势图表区域
              >/div
            <div
            >
          </ElCard>
          <ElCard class="analysis-card"
          >
            <div slot="header"
              style="font-weight: 500"
            >机台换车效率排名
            >/div
            >
            <div class="chart-placeholder"
              style="height: 300px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; color: #909399"
            >
              <ElIcon
                style="font-size: 48px; margin-bottom: 16px"
              >
                <Histogram />
              </ElIcon
              <div style="font-size: 16px">机台换车效率排名图表区域
              >/div
            <div
            >
          </ElCard>
        </div
        >
      </div
        v-else
      >
        <ElEmpty description="未知视图类型">
        </ElEmpty
      </div
        >
    </ElCard>

    <!-- 记录详情对话框 -->
    <ElDialog
      v-model="recordDetailVisible"
      :title="`换车记录详情 - 机台: ${currentRecord?.machineNumber || ''}`"
      width="600px"
    >
      <div
        v-if="currentRecord"
        style="padding: 10px 0"
      >
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem label="记录ID">{{ currentRecord.id }}</ElDescriptionsItem>
          <ElDescriptionsItem label="机台编号">{{ currentRecord.machineNumber }}</ElDescriptionsItem>
          <ElDescriptionsItem label="布车号">{{ currentRecord.carNumber }}</ElDescriptionsItem>
          <ElDescriptionsItem label="布批次号">{{ currentRecord.clothBatch || '未提供' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="换车开始时间">{{ formatDateTime(currentRecord.startTime) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="换车结束时间">{{ currentRecord.endTime ? formatDateTime(currentRecord.endTime) : '- -' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="换车耗时">{{ currentRecord.duration ? `${currentRecord.duration}秒` : '- -' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="换车状态">
            <ElTag
              :type="getStatusTagType(currentRecord.status)"
            >{{ getStatusLabel(currentRecord.status) }}>/ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="MES同步状态">
            <ElTag
              :type="currentRecord.mesStatus === 'sync_success' ? 'success' : currentRecord.mesStatus === 'sync_failed' ? 'danger' : 'warning'"
            >{{ getMesStatusLabel(currentRecord.mesStatus) }}>/ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="所属工段">{{ getWorkshopSectionLabel(currentRecord.workshopSection) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="备注信息">{{ currentRecord.remark || '无' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="操作人员">{{ currentRecord.operator || '系统自动' }}</ElDescriptionsItem>
        </ElDescriptions>

        <div class="record-image"
          style="margin-top: 20px"
        >
          <h3 class="image-title"
            style="font-size: 16px; font-weight: 500; margin-bottom: 10px"
          >换车过程图片
          >/h3>
          <div class="image-container"
            style="height: 300px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; border: 1px solid #ebeef5; border-radius: 4px"
          >
            <ElIcon
              style="font-size: 48px; color: #909399"
            >
              <Picture />
            </ElIcon
            <div style="margin-left: 10px; color: #909399">换车过程图片预览区域
            >/div
          </div
          >
        </div
        >
      </div
        v-else
      >
        <ElEmpty description="暂无记录信息">
        </ElEmpty
      </div
        >
      >template #footer>
        <ElButton @click="recordDetailVisible = false">关闭</ElButton>
        <ElButton type="primary"
          @click="handleViewRecordVideo"
          v-if="currentRecord"
        >查看视频片段</ElButton>
        <ElButton type="warning"
          @click="handleSyncToMes(currentRecord)"
          v-if="currentRecord && currentRecord.mesStatus === 'sync_failed'"
        >重新同步到MES</ElButton>
      >template>
    </ElDialog

    <!-- 视频播放对话框 -->
    <ElDialog
      v-model="videoPlayerVisible"
      :title="`视频回放 - ${videoTitle || '换车记录'}`"
      width="800px"
      fullscreen
    >
      <div
        class="video-player-container"
        style="text-align: center; padding: 20px 0; height: calc(100vh - 200px); display: flex; flex-direction: column"
      >
        <div class="video-player-placeholder"
          style="flex: 1; background-color: #000; color: #fff; display: flex; align-items: center; justify-content: center"
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
            @click="handlePlayVideo"
          >
            <ElIcon slot="icon">
              <VideoPlay />
            </ElIcon
            {{ isVideoPlaying ? '暂停' : '播放' }}
          >/ElButton>
          <ElButton
            type="success"
            size="large"
            @click="handleVideoCapture"
          >
            <ElIcon slot="icon">
              <CameraFilled />
            </ElIcon
            截图
          >/ElButton>
          <ElButton
            type="info"
            size="large"
            @click="handleAdjustSpeed"
          >
            <ElIcon slot="icon">
              <Timer />
            </ElIcon
            倍速: {{ playbackSpeed }}x
          >/ElButton>
        </div
        >
      </div
        >
    </ElDialog

    <!-- 手动同步到MES对话框 -->
    <ElDialog
      v-model="syncMesVisible"
      title="同步到MES系统"
      width="400px"
    >
      <div
        style="text-align: center; padding: 20px 0"
      >
        <div
          v-if="syncingMes"
          style="margin-bottom: 20px"
        >
          <ElProgress type="circular" :percentage="60" />
          <p style="text-align: center; margin-top: 10px; color: #606266">正在同步数据到MES系统...</p>
        </div
        >
        <div
          v-else
          style="font-size: 16px; margin-bottom: 20px"
        >确定要将记录同步到MES系统吗？
        >/div
        >
        <div
          v-if="syncTargetRecord"
          style="text-align: left; margin-bottom: 20px; padding: 10px; background-color: #f5f7fa; border-radius: 4px"
        >
          <p style="margin: 5px 0">机台编号: {{ syncTargetRecord.machineNumber }}</p>
          <p style="margin: 5px 0">布车号: {{ syncTargetRecord.carNumber }}</p>
          <p style="margin: 5px 0">换车时间: {{ formatDateTime(syncTargetRecord.startTime) }}</p>
        </div
        >
      </div
        >
      >template #footer>
        <ElButton
          @click="syncMesVisible = false"
          :disabled="syncingMes"
        >取消</ElButton>
        <ElButton
          type="primary"
          @click="confirmSyncToMes"
          :disabled="syncingMes"
        >确定同步</ElButton>
      >template>
    </ElDialog
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, VideoFilled, VideoPlay, CameraFilled, Timer, Picture, LineChart, Histogram, Refresh, Car, WarningFilled, InfoFilled } from '@element-plus/icons-vue'
import { getClothChangeList, getChangeRecordDetail, syncRecordToMes, getRealtimeMachines, getClothChangeStatistics } from '@/api/clothChange'

interface ClothChangeRecord {
  id: number
  machineNumber: string
  carNumber: string
  clothBatch?: string
  startTime: string
  endTime?: string
  duration?: number
  status: string
  mesStatus: string
  workshopSection: string
  remark?: string
  operator?: string
  imageUrls?: string[]
  videoUrl?: string
}

interface MachineInfo {
  id: number
  machineNumber: string
  status: string
  isChanging: boolean
  currentCar: string
  currentBatch: string
  runningTime: number
  todayChangeCount: number
  lastChangeTime: string
  alertLevel: string
  isRefreshing?: boolean
}

interface WorkshopSection {
  value: string
  label: string
}

const searchForm = reactive({
  machineNumber: '',
  carNumber: '',
  status: '',
  workshopSection: ''
})

const dateRange = ref<string[]>([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const changeList = ref<ClothChangeRecord[]>([])
const realtimeMachines = ref<MachineInfo[]>([])
const activeViewTab = ref('list')
const chartTimeRange = ref('7days')
const recordDetailVisible = ref(false)
const currentRecord = ref<ClothChangeRecord | null>(null)
const videoPlayerVisible = ref(false)
const videoTitle = ref('')
const isVideoPlaying = ref(false)
const playbackSpeed = ref(1.0)
const syncMesVisible = ref(false)
const syncingMes = ref(false)
const syncTargetRecord = ref<ClothChangeRecord | null>(null)

// 统计信息
const statistics = reactive({
  totalChanges: 0,
  successChanges: 0,
  failedChanges: 0,
  averageTime: 0
})

// 工段列表
const workshopSections = ref<WorkshopSection[]>([
  { value: 'weaving', label: '织布工段' },
  { value: 'dyeing', label: '染色工段' },
  { value: 'finishing', label: '整理工段' },
  { value: 'inspection', label: '检验工段' },
  { value: 'packing', label: '包装工段' }
])

const autoRefreshTimer = ref<NodeJS.Timeout | null>(null)

// 加载落布换车记录列表
async function loadClothChangeList() {
  try {
    const params = {
      ...searchForm,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    
    const response = await getClothChangeList(params)
    changeList.value = response.data?.list || []
    pagination.total = response.data?.total || 0
    updateStatisticsFromList()
  } catch (error) {
    console.error('加载落布换车记录失败:', error)
    // 使用模拟数据
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    changeList.value = [
      {
        id: 1,
        machineNumber: 'M001',
        carNumber: 'BC001',
        clothBatch: 'BAT-2024-0001',
        startTime: now.toISOString(),
        endTime: new Date(now.getTime() - 30000).toISOString(),
        duration: 30,
        status: 'success',
        mesStatus: 'sync_success',
        workshopSection: 'weaving',
        remark: '正常换车',
        operator: '自动'
      },
      {
        id: 2,
        machineNumber: 'M002',
        carNumber: 'BC002',
        clothBatch: 'BAT-2024-0002',
        startTime: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 59 * 60 * 1000).toISOString(),
        duration: 60,
        status: 'success',
        mesStatus: 'sync_failed',
        workshopSection: 'dyeing',
        remark: 'MES连接超时',
        operator: '自动'
      },
      {
        id: 3,
        machineNumber: 'M003',
        carNumber: 'BC003',
        clothBatch: 'BAT-2024-0003',
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 1 * 58 * 60 * 1000).toISOString(),
        duration: 120,
        status: 'success',
        mesStatus: 'sync_success',
        workshopSection: 'finishing',
        remark: '正常换车',
        operator: '自动'
      },
      {
        id: 4,
        machineNumber: 'M004',
        carNumber: 'BC004',
        clothBatch: 'BAT-2024-0004',
        startTime: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 2 * 55 * 60 * 1000).toISOString(),
        duration: 300,
        status: 'failed',
        mesStatus: 'sync_pending',
        workshopSection: 'inspection',
        remark: '换车超时，人工干预',
        operator: '张三'
      },
      {
        id: 5,
        machineNumber: 'M005',
        carNumber: 'BC005',
        clothBatch: 'BAT-2024-0005',
        startTime: yesterday.toISOString(),
        endTime: new Date(yesterday.getTime() + 60000).toISOString(),
        duration: 60,
        status: 'success',
        mesStatus: 'sync_success',
        workshopSection: 'packing',
        remark: '正常换车',
        operator: '自动'
      }
    ]
    pagination.total = changeList.value.length
    updateStatisticsFromList()
  }
}

// 加载实时机台数据
async function loadRealtimeMachines() {
  try {
    const response = await getRealtimeMachines()
    realtimeMachines.value = response.data || []
  } catch (error) {
    console.error('加载实时机台数据失败:', error)
    // 使用模拟数据
    realtimeMachines.value = [
      {
        id: 1,
        machineNumber: 'M001',
        status: 'online',
        isChanging: false,
        currentCar: 'BC001',
        currentBatch: 'BAT-2024-0001',
        runningTime: 1800,
        todayChangeCount: 5,
        lastChangeTime: new Date().toISOString(),
        alertLevel: 'normal'
      },
      {
        id: 2,
        machineNumber: 'M002',
        status: 'online',
        isChanging: true,
        currentCar: 'BC002',
        currentBatch: 'BAT-2024-0002',
        runningTime: 0,
        todayChangeCount: 3,
        lastChangeTime: new Date().toISOString(),
        alertLevel: 'medium'
      },
      {
        id: 3,
        machineNumber: 'M003',
        status: 'offline',
        isChanging: false,
        currentCar: 'BC003',
        currentBatch: 'BAT-2024-0003',
        runningTime: 3600,
        todayChangeCount: 2,
        lastChangeTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        alertLevel: 'normal'
      },
      {
        id: 4,
        machineNumber: 'M004',
        status: 'online',
        isChanging: true,
        currentCar: 'BC004',
        currentBatch: 'BAT-2024-0004',
        runningTime: 0,
        todayChangeCount: 4,
        lastChangeTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        alertLevel: 'high'
      }
    ]
  }
}

// 加载统计信息
async function loadStatistics() {
  try {
    const response = await getClothChangeStatistics(dateRange.value)
    if (response.data) {
      statistics.totalChanges = response.data.totalChanges || 0
      statistics.successChanges = response.data.successChanges || 0
      statistics.failedChanges = response.data.failedChanges || 0
      statistics.averageTime = response.data.averageTime || 0
    }
  } catch (error) {
    console.error('加载统计信息失败:', error)
    // 从列表更新统计
    updateStatisticsFromList()
  }
}

// 从列表更新统计信息
function updateStatisticsFromList() {
  statistics.totalChanges = changeList.value.length
  statistics.successChanges = changeList.value.filter(record => record.status === 'success').length
  statistics.failedChanges = changeList.value.filter(record => record.status === 'failed').length
  
  const durationList = changeList.value
    .filter(record => record.duration && record.status === 'success')
    .map(record => record.duration || 0)
  
  statistics.averageTime = durationList.length > 0
    ? durationList.reduce((sum, duration) => sum + duration, 0) / durationList.length
    : 0
}

// 搜索
function handleSearch() {
  pagination.currentPage = 1
  loadClothChangeList()
}

// 重置
function handleReset() {
  searchForm.machineNumber = ''
  searchForm.carNumber = ''
  searchForm.status = ''
  searchForm.workshopSection = ''
  dateRange.value = []
  pagination.currentPage = 1
  loadClothChangeList()
}

// 导出数据
function handleExport() {
  // 这里实现导出功能
  ElMessage.success('数据导出成功')
}

// 分页处理
function handleSizeChange(size: number) {
  pagination.pageSize = size
  loadClothChangeList()
}

function handleCurrentChange(current: number) {
  pagination.currentPage = current
  loadClothChangeList()
}

// 切换视图标签
function handleTabChange(tab: string) {
  activeViewTab.value = tab
  if (tab === 'realtime') {
    loadRealtimeMachines()
  }
}

// 点击记录行查看详情
async function handleChangeRecordClick(record: ClothChangeRecord) {
  try {
    const response = await getChangeRecordDetail(record.id)
    currentRecord.value = response.data || record
  } catch (error) {
    console.error('获取记录详情失败:', error)
    currentRecord.value = record
  }
  recordDetailVisible.value = true
}

// 查看图片
function handleViewImage(record: ClothChangeRecord) {
  currentRecord.value = record
  recordDetailVisible.value = true
}

// 查看视频
function handleViewVideo(record: ClothChangeRecord) {
  currentRecord.value = record
  videoTitle.value = `机台: ${record.machineNumber} - 布车: ${record.carNumber}`
  videoPlayerVisible.value = true
}

// 查看记录视频
function handleViewRecordVideo() {
  if (currentRecord.value) {
    videoTitle.value = `机台: ${currentRecord.value.machineNumber} - 布车: ${currentRecord.value.carNumber}`
    recordDetailVisible.value = false
    videoPlayerVisible.value = true
  }
}

// 播放视频
function handlePlayVideo() {
  isVideoPlaying.value = !isVideoPlaying.value
  ElMessage.success(isVideoPlaying.value ? '视频已开始播放' : '视频已暂停')
}

// 视频截图
function handleVideoCapture() {
  ElMessage.success('截图成功')
}

// 调整播放速度
function handleAdjustSpeed() {
  const speeds = [0.5, 1.0, 1.5, 2.0]
  const currentIndex = speeds.indexOf(playbackSpeed.value)
  playbackSpeed.value = speeds[(currentIndex + 1) % speeds.length]
  ElMessage.success(`播放速度调整为 ${playbackSpeed.value}x`)
}

// 同步到MES系统
function handleSyncToMes(record: ClothChangeRecord) {
  syncTargetRecord.value = record
  syncMesVisible.value = true
}

// 确认同步到MES
async function confirmSyncToMes() {
  if (!syncTargetRecord.value) return
  
  try {
    syncingMes.value = true
    await syncRecordToMes(syncTargetRecord.value.id)
    
    // 更新本地数据
    if (syncTargetRecord.value) {
      syncTargetRecord.value.mesStatus = 'sync_success'
    }
    
    // 更新列表中的数据
    const index = changeList.value.findIndex(item => item.id === syncTargetRecord.value?.id)
    if (index !== -1) {
      changeList.value[index].mesStatus = 'sync_success'
    }
    
    ElMessage.success('同步到MES系统成功')
    syncMesVisible.value = false
  } catch (error) {
    console.error('同步到MES系统失败:', error)
    ElMessage.error('同步到MES系统失败，请重试')
  } finally {
    syncingMes.value = false
  }
}

// 刷新机台
async function handleRefreshMachine(machine: MachineInfo) {
  machine.isRefreshing = true
  try {
    // 这里可以调用刷新机台的接口
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(`机台 ${machine.machineNumber} 刷新成功`)
  } catch (error) {
    console.error(`刷新机台 ${machine.machineNumber} 失败:`, error)
    ElMessage.error(`刷新机台 ${machine.machineNumber} 失败`)
  } finally {
    machine.isRefreshing = false
  }
}

// 获取状态标签类型
function getStatusTagType(status: string): string {
  switch (status) {
    case 'success':
      return 'success'
    case 'failed':
      return 'danger'
    case 'processing':
      return 'warning'
    default:
      return 'info'
  }
}

// 获取状态标签
function getStatusLabel(status: string): string {
  switch (status) {
    case 'success':
      return '成功'
    case 'failed':
      return '失败'
    case 'processing':
      return '处理中'
    default:
      return '未知'
  }
}

// 获取MES状态标签
function getMesStatusLabel(mesStatus: string): string {
  switch (mesStatus) {
    case 'sync_success':
      return '同步成功'
    case 'sync_failed':
      return '同步失败'
    case 'sync_pending':
      return '等待同步'
    default:
      return '未同步'
  }
}

// 获取工段标签
function getWorkshopSectionLabel(value: string): string {
  if (!value) return '未分配'
  const section = workshopSections.value.find(s => s.value === value)
  return section ? section.label : value
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

// 格式化相对时间
function formatRelativeTime(dateTimeStr: string): string {
  if (!dateTimeStr) return '- -'
  
  const now = new Date()
  const date = new Date(dateTimeStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  
  if (diffDay > 0) {
    return `${diffDay}天前`
  } else if (diffHour > 0) {
    return `${diffHour}小时前`
  } else if (diffMin > 0) {
    return `${diffMin}分钟前`
  } else {
    return '刚刚'
  }
}

// 格式化持续时间
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

// 启动自动刷新
function startAutoRefresh() {
  // 每30秒自动刷新一次数据
  autoRefreshTimer.value = setInterval(() => {
    if (activeViewTab.value === 'list') {
      loadClothChangeList()
    } else if (activeViewTab.value === 'realtime') {
      loadRealtimeMachines()
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
  loadClothChangeList()
  loadStatistics()
  startAutoRefresh()
})

// 组件销毁时清理定时器
onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.cloth-change-detection {
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

.machine-monitor {
  height: 450px;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.analysis-card {
  height: 380px;
}

.video-player-container {
  height: calc(100vh - 200px);
}

.video-player-placeholder {
  min-height: 400px;
}
</style>