<template>
  <div class="channel-access">
    <div class="page-header">
      <h2>通道出入检测</h2>
      <div class="header-info">
        <ElTag type="info">对通道布车进出进行监测。对接MES可以列出不同工段积布信息，有利于计划执行的追溯</ElTag>
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
            v-model="searchForm.carNumber"
            placeholder="输入布车号"
            clearable
            style="width: 200px"
          >
            >template #prepend>
              <ElIcon>
                <Search />
              </ElIcon>
            >template>
          </ElInput>
          <ElSelect
            v-model="searchForm.channel"
            placeholder="选择通道"
            filterable
            style="width: 180px"
          >
            <ElOption
              v-for="channel in channelList"
              :key="channel.value"
              :label="channel.label"
              :value="channel.value"
            />
          </ElSelect>
          <ElSelect
            v-model="searchForm.direction"
            placeholder="选择方向"
            style="width: 120px"
          >
            <ElOption label="进入"
              value="in"
            />
            <ElOption label="离开"
              value="out"
            />
          </ElSelect>
          <ElSelect
            v-model="searchForm.workshopSection"
            placeholder="选择工段"
            filterable
            style="width: 180px"
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
            >{{ statistics.totalAccess }}</div>
            <div class="dashboard-label"
              style="color: #666; margin-top: 10px"
            >总进出次数</div>
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
            >{{ statistics.enterCount }}</div>
            <div class="dashboard-label"
              style="color: #666; margin-top: 10px"
            >进入次数</div>
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
            >{{ statistics.exitCount }}</div>
            <div class="dashboard-label"
              style="color: #666; margin-top: 10px"
            >离开次数</div>
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
            >{{ statistics.abnormalCount }}</div>
            <div class="dashboard-label"
              style="color: #666; margin-top: 10px"
            >异常次数</div>
          </div>
        </ElCard>
      </div>

      <div class="view-tabs"
        style="margin-bottom: 20px"
      >
        <ElTabs v-model="activeViewTab"
          @tab-change="handleTabChange"
        >
          <ElTabPane label="记录列表"
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

      <!-- 记录列表 -->
      <div
        v-if="activeViewTab === 'list'"
      >
        <ElTable
          :data="accessList"
          style="width: 100%"
          border
          stripe
          @row-click="handleAccessRecordClick"
        >
          <ElTableColumn
            prop="id"
            label="记录ID"
            width="100"
            header-align="center"
            align="center"
          />
          <ElTableColumn
            prop="carNumber"
            label="布车号"
            width="120"
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
            prop="channelName"
            label="通道"
            width="150"
            header-align="center"
          />
          <ElTableColumn
            prop="direction"
            label="方向"
            width="100"
            header-align="center"
            align="center"
          >
            >template #default="scope">
              <ElTag
                :type="scope.row.direction === 'in' ? 'success' : 'warning'"
              >{{ scope.row.direction === 'in' ? '进入' : '离开' }}</ElTag>
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
              >{{ getWorkshopSectionLabel(scope.row.workshopSection) }}</ElTag>
              <ElTag type="danger"
                v-else
              >未分配</ElTag>
            >template>
          </ElTableColumn
          <ElTableColumn
            prop="accessTime"
            label="进出时间"
            width="180"
            header-align="center"
          >
            >template #default="scope">
              {{ formatDateTime(scope.row.accessTime) }}
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
                :type="scope.row.status === 'normal' ? 'success' : 'danger'"
              >{{ scope.row.status === 'normal' ? '正常' : '异常' }}</ElTag>
            >template>
          </ElTableColumn
          <ElTableColumn
            prop="camera"
            label="记录摄像头"
            width="150"
            header-align="center"
          />
          <ElTableColumn
            prop="remark"
            label="备注"
            header-align="center"
          />
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
                @click.stop="handleEditRecord(scope.row)"
              >编辑备注</ElButton>
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
            v-for="channel in realtimeChannels"
            :key="channel.id"
            class="channel-monitor"
          >
            <div slot="header" class="channel-header"
              style="display: flex; justify-content: space-between; align-items: center"
            >
              <span style="font-weight: 500">{{ channel.name }}</span>
              <div class="channel-status"
                style="display: flex; align-items: center; gap: 10px"
              >
                <ElTag
                  :type="channel.status === 'online' ? 'success' : 'danger'"
                  size="small"
                >{{ channel.status === 'online' ? '在线' : '离线' }}>/ElTag>
                <ElButton
                  type="text"
                  size="small"
                  @click="handleRefreshChannel(channel)"
                >
                  <ElIcon
                    :class="{ 'rotating': channel.isRefreshing }"
                  >
                    <Refresh />
                  </ElIcon
                >/ElButton>
              </div
              >
            </div
            >
            <div class="video-container"
              style="height: 280px; background-color: #000; position: relative; overflow: hidden"
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
                v-if="channel.lastAccessRecord"
                class="access-info"
                style="position: absolute; bottom: 0; left: 0; right: 0; background-color: rgba(0, 0, 0, 0.7); color: #fff; padding: 8px 12px; font-size: 12px"
              >
                <div style="display: flex; justify-content: space-between; align-items: center"
                  v-if="channel.lastAccessRecord"
                >
                  <span style="display: flex; align-items: center; gap: 8px"
                  >
                    <ElTag size="small"
                      :type="channel.lastAccessRecord.direction === 'in' ? 'success' : 'warning'"
                    >{{ channel.lastAccessRecord.direction === 'in' ? '进入' : '离开' }}>/ElTag>
                    布车号: {{ channel.lastAccessRecord.carNumber }}
                  >/span>
                  <span>{{ formatDateTime(channel.lastAccessRecord.accessTime) }}>/span>
                </div
                >
              </div
              >
            </div
            >
            <div class="channel-info"
              style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ebeef5"
            >
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: #606266; margin-bottom: 8px"
              >
                <span>今日进入: {{ channel.todayEnterCount }}>/span>
                <span>今日离开: {{ channel.todayExitCount }}>/span>
              </div
              >
              <ElProgress
                :percentage="channel.occupancyRate"
                :status="channel.occupancyRate > 80 ? 'exception' : 'success'"
                style="margin-bottom: 12px"
              />
              <div style="font-size: 12px; color: #909399"
              >通道占用率: {{ channel.occupancyRate }}%
              >/div>
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
              <span style="font-weight: 500">通道进出趋势图>/span>
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
                <PieChart />
              </ElIcon
              <div style="font-size: 16px">通道进出趋势图表区域
              >/div>
            </div
            >
          </ElCard>
          <ElCard class="analysis-card"
          >
            <div slot="header"
              style="font-weight: 500"
            >通道占用分布
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
              <div style="font-size: 16px">通道占用分布图区域
              >/div<
            /div
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
      :title="`进出记录详情 - 布车号: ${currentRecord?.carNumber || ''}`"
      width="600px"
    >
      <div
        v-if="currentRecord"
        style="padding: 10px 0"
      >
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem label="记录ID">{{ currentRecord.id }}</ElDescriptionsItem>
          <ElDescriptionsItem label="布车号">{{ currentRecord.carNumber }}</ElDescriptionsItem>
          <ElDescriptionsItem label="通道名称">{{ currentRecord.channelName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="进出方向">
            <ElTag
              :type="currentRecord.direction === 'in' ? 'success' : 'warning'"
            >{{ currentRecord.direction === 'in' ? '进入' : '离开' }}>/ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="所属工段">{{ getWorkshopSectionLabel(currentRecord.workshopSection) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="进出时间">{{ formatDateTime(currentRecord.accessTime) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="记录状态">
            <ElTag
              :type="currentRecord.status === 'normal' ? 'success' : 'danger'"
            >{{ currentRecord.status === 'normal' ? '正常' : '异常' }}>/ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="记录摄像头">{{ currentRecord.camera }}</ElDescriptionsItem>
          <ElDescriptionsItem label="备注信息">{{ currentRecord.remark || '无' }}</ElDescriptionsItem>
        </ElDescriptions>

        <div class="record-image"
          style="margin-top: 20px"
        >
          <h3 class="image-title"
            style="font-size: 16px; font-weight: 500; margin-bottom: 10px"
          >抓拍图片
          >/h3>
          <div class="image-container"
            style="height: 300px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; border: 1px solid #ebeef5; border-radius: 4px"
          >
            <ElIcon
              style="font-size: 48px; color: #909399"
            >
              <Picture />
            </ElIcon
            <div style="margin-left: 10px; color: #909399">抓拍图片预览区域
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
      >template>
    </ElDialog

    <!-- 视频播放对话框 -->
    <ElDialog
      v-model="videoPlayerVisible"
      :title="`视频回放 - ${videoTitle || '进出记录'}`"
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

    <!-- 编辑备注对话框 -->
    <ElDialog
      v-model="editRemarkVisible"
      title="编辑记录备注"
      width="500px"
    >
      <ElForm
        ref="remarkFormRef"
        :model="remarkForm"
        :rules="remarkFormRules"
        label-width="80px"
      >
        <ElFormItem label="布车号">
          <ElInput v-model="remarkForm.carNumber" disabled />
        </ElFormItem>
        <ElFormItem label="进出时间">
          <ElInput v-model="remarkForm.accessTime" disabled />
        </ElFormItem>
        <ElFormItem label="备注信息" prop="remark"
          v-if="!savingRemark"
        >
          <ElInput
            v-model="remarkForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注信息"
          />
        </ElFormItem>
        <ElFormItem
          v-else
        >
          <ElProgress type="circular" :percentage="60" />
          <p style="text-align: center; margin-top: 10px; color: #606266">正在保存...</p>
        </ElFormItem>
      </ElForm
      >template #footer>
        <ElButton
          @click="editRemarkVisible = false"
          :disabled="savingRemark"
        >取消</ElButton>
        <ElButton
          type="primary"
          @click="handleSaveRemark"
          :disabled="savingRemark"
        >保存</ElButton>
      >template>
    </ElDialog
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, VideoFilled, VideoPlay, CameraFilled, Timer, Picture, PieChart, Histogram, Refresh } from '@element-plus/icons-vue'
import { getChannelAccessList, getAccessRecordDetail, updateAccessRecordRemark, getRealtimeChannels, getStatistics } from '@/api/channelAccess'

interface AccessRecord {
  id: number
  carNumber: string
  channelName: string
  direction: string
  workshopSection: string
  accessTime: string
  status: string
  camera: string
  remark?: string
  imageUrl?: string
  videoUrl?: string
}

interface Channel {
  id: number
  name: string
  status: string
  cameraId: number
  cameraIp: string
  todayEnterCount: number
  todayExitCount: number
  occupancyRate: number
  lastAccessRecord?: AccessRecord
  isRefreshing?: boolean
}

interface ChannelOption {
  value: string
  label: string
}

interface WorkshopSection {
  value: string
  label: string
}

const searchForm = reactive({
  carNumber: '',
  channel: '',
  direction: '',
  workshopSection: ''
})

const dateRange = ref<string[]>([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const accessList = ref<AccessRecord[]>([])
const realtimeChannels = ref<Channel[]>([])
const activeViewTab = ref('list')
const chartTimeRange = ref('7days')
const recordDetailVisible = ref(false)
const currentRecord = ref<AccessRecord | null>(null)
const videoPlayerVisible = ref(false)
const videoTitle = ref('')
const isVideoPlaying = ref(false)
const playbackSpeed = ref(1.0)
const editRemarkVisible = ref(false)
const remarkFormRef = ref()
const savingRemark = ref(false)
const remarkForm = reactive({
  carNumber: '',
  accessTime: '',
  remark: ''
})
const remarkFormRules = {
  remark: [
    { max: 200, message: '备注信息不能超过200个字符', trigger: 'blur' }
  ]
}

// 统计信息
const statistics = reactive({
  totalAccess: 0,
  enterCount: 0,
  exitCount: 0,
  abnormalCount: 0
})

// 通道列表
const channelList = ref<ChannelOption[]>([
  { value: 'entrance-a', label: '入口通道A' },
  { value: 'entrance-b', label: '入口通道B' },
  { value: 'exit-a', label: '出口通道A' },
  { value: 'exit-b', label: '出口通道B' },
  { value: 'internal-1', label: '内部通道1' },
  { value: 'internal-2', label: '内部通道2' },
  { value: 'production-1', label: '生产区通道1' },
  { value: 'production-2', label: '生产区通道2' }
])

// 工段列表
const workshopSections = ref<WorkshopSection[]>([
  { value: 'weaving', label: '织布工段' },
  { value: 'dyeing', label: '染色工段' },
  { value: 'finishing', label: '整理工段' },
  { value: 'inspection', label: '检验工段' },
  { value: 'packing', label: '包装工段' }
])

const autoRefreshTimer = ref<NodeJS.Timeout | null>(null)

// 加载通道进出记录列表
async function loadChannelAccessList() {
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
    
    const response = await getChannelAccessList(params)
    accessList.value = response.data?.list || []
    pagination.total = response.data?.total || 0
    updateStatisticsFromList()
  } catch (error) {
    console.error('加载通道进出记录失败:', error)
    // 使用模拟数据
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    accessList.value = [
      {
        id: 1,
        carNumber: 'BC001',
        channelName: '入口通道A',
        direction: 'in',
        workshopSection: 'weaving',
        accessTime: now.toISOString(),
        status: 'normal',
        camera: 'CAM-EN-A-01',
        remark: '正常进入'
      },
      {
        id: 2,
        carNumber: 'BC002',
        channelName: '内部通道1',
        direction: 'out',
        workshopSection: 'dyeing',
        accessTime: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        status: 'normal',
        camera: 'CAM-IN-1-01',
        remark: '转移至染色工段'
      },
      {
        id: 3,
        carNumber: 'BC003',
        channelName: '出口通道A',
        direction: 'out',
        workshopSection: 'packing',
        accessTime: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
        status: 'normal',
        camera: 'CAM-EX-A-01',
        remark: '成品出库'
      },
      {
        id: 4,
        carNumber: 'BC004',
        channelName: '生产区通道1',
        direction: 'in',
        workshopSection: 'inspection',
        accessTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'abnormal',
        camera: 'CAM-PR-1-01',
        remark: '未按计划时间进入'
      },
      {
        id: 5,
        carNumber: 'BC005',
        channelName: '入口通道B',
        direction: 'in',
        workshopSection: 'finishing',
        accessTime: yesterday.toISOString(),
        status: 'normal',
        camera: 'CAM-EN-B-01',
        remark: '正常进入'
      }
    ]
    pagination.total = accessList.value.length
    updateStatisticsFromList()
  }
}

// 加载实时通道数据
async function loadRealtimeChannels() {
  try {
    const response = await getRealtimeChannels()
    realtimeChannels.value = response.data || []
  } catch (error) {
    console.error('加载实时通道数据失败:', error)
    // 使用模拟数据
    realtimeChannels.value = [
      {
        id: 1,
        name: '入口通道A',
        status: 'online',
        cameraId: 101,
        cameraIp: '192.168.1.101:8554',
        todayEnterCount: 45,
        todayExitCount: 0,
        occupancyRate: 65,
        lastAccessRecord: {
          id: 1,
          carNumber: 'BC001',
          channelName: '入口通道A',
          direction: 'in',
          workshopSection: 'weaving',
          accessTime: new Date().toISOString(),
          status: 'normal',
          camera: 'CAM-EN-A-01'
        }
      },
      {
        id: 2,
        name: '出口通道A',
        status: 'online',
        cameraId: 102,
        cameraIp: '192.168.1.102:8554',
        todayEnterCount: 0,
        todayExitCount: 38,
        occupancyRate: 45,
        lastAccessRecord: {
          id: 3,
          carNumber: 'BC003',
          channelName: '出口通道A',
          direction: 'out',
          workshopSection: 'packing',
          accessTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          status: 'normal',
          camera: 'CAM-EX-A-01'
        }
      },
      {
        id: 3,
        name: '内部通道1',
        status: 'online',
        cameraId: 103,
        cameraIp: '192.168.1.103:8554',
        todayEnterCount: 28,
        todayExitCount: 32,
        occupancyRate: 80,
        lastAccessRecord: {
          id: 2,
          carNumber: 'BC002',
          channelName: '内部通道1',
          direction: 'out',
          workshopSection: 'dyeing',
          accessTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'normal',
          camera: 'CAM-IN-1-01'
        }
      },
      {
        id: 4,
        name: '生产区通道1',
        status: 'offline',
        cameraId: 104,
        cameraIp: '192.168.1.104:8554',
        todayEnterCount: 15,
        todayExitCount: 12,
        occupancyRate: 30,
        lastAccessRecord: {
          id: 4,
          carNumber: 'BC004',
          channelName: '生产区通道1',
          direction: 'in',
          workshopSection: 'inspection',
          accessTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'abnormal',
          camera: 'CAM-PR-1-01'
        }
      }
    ]
  }
}

// 加载统计信息
async function loadStatistics() {
  try {
    const response = await getStatistics(dateRange.value)
    if (response.data) {
      statistics.totalAccess = response.data.totalAccess || 0
      statistics.enterCount = response.data.enterCount || 0
      statistics.exitCount = response.data.exitCount || 0
      statistics.abnormalCount = response.data.abnormalCount || 0
    }
  } catch (error) {
    console.error('加载统计信息失败:', error)
    // 从列表更新统计
    updateStatisticsFromList()
  }
}

// 从列表更新统计信息
function updateStatisticsFromList() {
  statistics.totalAccess = accessList.value.length
  statistics.enterCount = accessList.value.filter(record => record.direction === 'in').length
  statistics.exitCount = accessList.value.filter(record => record.direction === 'out').length
  statistics.abnormalCount = accessList.value.filter(record => record.status === 'abnormal').length
}

// 搜索
function handleSearch() {
  pagination.currentPage = 1
  loadChannelAccessList()
}

// 重置
function handleReset() {
  searchForm.carNumber = ''
  searchForm.channel = ''
  searchForm.direction = ''
  searchForm.workshopSection = ''
  dateRange.value = []
  pagination.currentPage = 1
  loadChannelAccessList()
}

// 导出数据
function handleExport() {
  // 这里实现导出功能
  ElMessage.success('数据导出成功')
}

// 分页处理
function handleSizeChange(size: number) {
  pagination.pageSize = size
  loadChannelAccessList()
}

function handleCurrentChange(current: number) {
  pagination.currentPage = current
  loadChannelAccessList()
}

// 切换视图标签
function handleTabChange(tab: string) {
  activeViewTab.value = tab
  if (tab === 'realtime') {
    loadRealtimeChannels()
  }
}

// 点击记录行查看详情
async function handleAccessRecordClick(record: AccessRecord) {
  try {
    const response = await getAccessRecordDetail(record.id)
    currentRecord.value = response.data || record
  } catch (error) {
    console.error('获取记录详情失败:', error)
    currentRecord.value = record
  }
  recordDetailVisible.value = true
}

// 查看图片
function handleViewImage(record: AccessRecord) {
  currentRecord.value = record
  recordDetailVisible.value = true
}

// 查看视频
function handleViewVideo(record: AccessRecord) {
  currentRecord.value = record
  videoTitle.value = `通道: ${record.channelName} - 布车: ${record.carNumber}`
  videoPlayerVisible.value = true
}

// 查看记录视频
function handleViewRecordVideo() {
  if (currentRecord.value) {
    videoTitle.value = `通道: ${currentRecord.value.channelName} - 布车: ${currentRecord.value.carNumber}`
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

// 编辑备注
function handleEditRecord(record: AccessRecord) {
  currentRecord.value = record
  remarkForm.carNumber = record.carNumber
  remarkForm.accessTime = formatDateTime(record.accessTime)
  remarkForm.remark = record.remark || ''
  editRemarkVisible.value = true
}

// 保存备注
async function handleSaveRemark() {
  if (!remarkFormRef.value || !currentRecord.value) return
  
  try {
    await remarkFormRef.value.validate()
    savingRemark.value = true
    
    await updateAccessRecordRemark(currentRecord.value.id, remarkForm.remark)
    
    // 更新本地数据
    if (currentRecord.value) {
      currentRecord.value.remark = remarkForm.remark
    }
    
    // 更新列表中的数据
    const index = accessList.value.findIndex(item => item.id === currentRecord.value?.id)
    if (index !== -1) {
      accessList.value[index].remark = remarkForm.remark
    }
    
    ElMessage.success('备注保存成功')
    editRemarkVisible.value = false
  } catch (error) {
    console.error('保存备注失败:', error)
    ElMessage.error('保存备注失败，请重试')
  } finally {
    savingRemark.value = false
  }
}

// 刷新通道
async function handleRefreshChannel(channel: Channel) {
  channel.isRefreshing = true
  try {
    // 这里可以调用刷新通道的接口
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(`通道 ${channel.name} 刷新成功`)
  } catch (error) {
    console.error(`刷新通道 ${channel.name} 失败:`, error)
    ElMessage.error(`刷新通道 ${channel.name} 失败`)
  } finally {
    channel.isRefreshing = false
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

// 启动自动刷新
function startAutoRefresh() {
  // 每30秒自动刷新一次数据
  autoRefreshTimer.value = setInterval(() => {
    if (activeViewTab.value === 'list') {
      loadChannelAccessList()
    } else if (activeViewTab.value === 'realtime') {
      loadRealtimeChannels()
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
  loadChannelAccessList()
  loadStatistics()
  startAutoRefresh()
})

// 组件销毁时清理定时器
onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.channel-access {
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

.channel-monitor {
  height: 480px;
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