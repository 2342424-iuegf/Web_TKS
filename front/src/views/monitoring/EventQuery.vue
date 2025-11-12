<template>
  <div class="event-query-container">
    <el-card shadow="never" class="mb-4">
      <div class="event-statistics">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.totalEvents || 0 }}</div>
              <div class="stat-label">总事件数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item warning">
              <div class="stat-value">{{ statistics.pendingEvents || 0 }}</div>
              <div class="stat-label">待处理事件</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item processing">
              <div class="stat-value">{{ statistics.processingEvents || 0 }}</div>
              <div class="stat-label">处理中事件</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item success">
              <div class="stat-value">{{ statistics.processedEvents || 0 }}</div>
              <div class="stat-label">已处理事件</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card shadow="never">
      <div class="query-section">
        <el-form :model="queryParams" label-width="100px" class="mb-4">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="事件类型">
                <el-select v-model="queryParams.eventType" placeholder="请选择" clearable>
                  <el-option
                    v-for="type in eventTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="事件级别">
                <el-select v-model="queryParams.eventLevel" placeholder="请选择" clearable>
                  <el-option
                    v-for="level in eventLevels"
                    :key="level.value"
                    :label="level.label"
                    :value="level.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="源模块">
                <el-select v-model="queryParams.sourceModule" placeholder="请选择" clearable>
                  <el-option
                    v-for="source in sourceModules"
                    :key="source.value"
                    :label="source.label"
                    :value="source.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="处理状态">
                <el-select v-model="queryParams.status" placeholder="请选择" clearable>
                  <el-option label="待处理" value="pending"></el-option>
                  <el-option label="处理中" value="processing"></el-option>
                  <el-option label="已处理" value="processed"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="发生时间">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  format="YYYY-MM-DD HH:mm:ss"
                  class="w-full"
                ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="关键词搜索">
                <el-input
                  v-model="queryParams.keyword"
                  placeholder="请输入机台号、布车号或位置"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row justify="end">
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
            <el-button @click="openBatchProcess">批量处理</el-button>
            <el-button @click="handleExport">导出数据</el-button>
          </el-row>
        </el-form>

        <el-table
          v-loading="loading"
          :data="eventList"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column prop="eventTime" label="发生时间" width="180"></el-table-column>
          <el-table-column prop="eventType" label="事件类型" width="120">
            <template #default="scope">
              <span>{{ getEventTypeLabel(scope.row.eventType) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="eventLevel" label="事件级别" width="100">
            <template #default="scope">
              <el-tag
                :type="
                  scope.row.eventLevel === 'high'
                    ? 'danger'
                    : scope.row.eventLevel === 'medium'
                    ? 'warning'
                    : 'info'
                "
              >
                {{ getEventLevelLabel(scope.row.eventLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="workshopSection" label="车间区域" width="120"></el-table-column>
          <el-table-column prop="machineNumber" label="机台号" width="100" show-overflow-tooltip></el-table-column>
          <el-table-column prop="clothCarNumber" label="布车号" width="100" show-overflow-tooltip></el-table-column>
          <el-table-column prop="location" label="位置" width="120" show-overflow-tooltip></el-table-column>
          <el-table-column prop="description" label="事件描述" show-overflow-tooltip></el-table-column>
          <el-table-column prop="sourceModule" label="来源模块" width="120">
            <template #default="scope">
              <span>{{ getSourceModuleLabel(scope.row.sourceModule) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="处理状态" width="100">
            <template #default="scope">
              <el-tag
                :type="
                  scope.row.status === 'pending'
                    ? 'warning'
                    : scope.row.status === 'processing'
                    ? 'primary'
                    : 'success'
                "
              >
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="viewEventDetail(scope.row)"
                plain
                style="margin-right: 5px"
              >
                详情
              </el-button>
              <el-button
                v-if="scope.row.status !== 'processed'"
                type="success"
                size="small"
                @click="handleProcess(scope.row)"
                plain
              >
                处理
              </el-button>
            </template>
          </el-table-column>
        </el-table>

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

    <!-- 事件详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="事件详情"
      width="80%"
      @close="resetDetailDialog"
    >
      <div class="event-detail">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="事件ID">{{ currentEvent?.id }}</el-descriptions-item>
              <el-descriptions-item label="事件类型">{{ getEventTypeLabel(currentEvent?.eventType) }}</el-descriptions-item>
              <el-descriptions-item label="事件级别">{{ getEventLevelLabel(currentEvent?.eventLevel) }}</el-descriptions-item>
              <el-descriptions-item label="发生时间">{{ currentEvent?.eventTime }}</el-descriptions-item>
              <el-descriptions-item label="车间区域">{{ currentEvent?.workshopSection }}</el-descriptions-item>
              <el-descriptions-item label="机台号">{{ currentEvent?.machineNumber || '-' }}</el-descriptions-item>
              <el-descriptions-item label="布车号">{{ currentEvent?.clothCarNumber || '-' }}</el-descriptions-item>
              <el-descriptions-item label="位置">{{ currentEvent?.location || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="12">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="来源模块">{{ getSourceModuleLabel(currentEvent?.sourceModule) }}</el-descriptions-item>
              <el-descriptions-item label="处理状态">
                <el-tag
                  :type="
                    currentEvent?.status === 'pending'
                      ? 'warning'
                      : currentEvent?.status === 'processing'
                      ? 'primary'
                      : 'success'
                  "
                >
                  {{ getStatusLabel(currentEvent?.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="处理人">{{ currentEvent?.handler || '-' }}</el-descriptions-item>
              <el-descriptions-item label="处理时间">{{ currentEvent?.processTime || '-' }}</el-descriptions-item>
              <el-descriptions-item label="处理备注" :span="2">{{ currentEvent?.processRemark || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
        
        <div class="mt-4">
          <el-divider content-position="left">事件描述</el-divider>
          <div class="event-description">{{ currentEvent?.description }}</div>
        </div>

        <div v-if="currentEvent?.imageUrls && currentEvent.imageUrls.length > 0" class="mt-4">
          <el-divider content-position="left">现场图片</el-divider>
          <div class="image-gallery">
            <el-image
              v-for="(img, index) in currentEvent.imageUrls"
              :key="index"
              :src="img"
              class="event-image"
              :preview-src-list="currentEvent.imageUrls"
              fit="cover"
            ></el-image>
          </div>
        </div>

        <div v-if="currentEvent?.videoUrl" class="mt-4">
          <el-divider content-position="left">相关视频</el-divider>
          <video
            :src="currentEvent.videoUrl"
            controls
            class="event-video"
            width="100%"
            height="auto"
          >
            您的浏览器不支持视频播放
          </video>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button
            v-if="currentEvent?.status !== 'processed'"
            type="primary"
            @click="handleProcess(currentEvent)"
          >
            处理事件
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 事件处理对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      title="处理事件"
      width="50%"
      @close="resetProcessDialog"
    >
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="事件ID">
          <el-input v-model="processForm.eventId" disabled></el-input>
        </el-form-item>
        <el-form-item label="事件类型">
          <el-input v-model="processForm.eventType" disabled></el-input>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="processForm.status" placeholder="请选择">
            <el-option label="处理中" value="processing"></el-option>
            <el-option label="已处理" value="processed"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理备注" required>
          <el-input
            v-model="processForm.processRemark"
            type="textarea"
            :rows="4"
            placeholder="请输入处理备注"
          ></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProcess">提交处理</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量处理对话框 -->
    <el-dialog
      v-model="batchProcessDialogVisible"
      title="批量处理事件"
      width="50%"
      @close="resetBatchProcessDialog"
    >
      <el-form :model="batchProcessForm" label-width="100px">
        <el-form-item label="选中数量">
          <el-input v-model="batchProcessForm.count" disabled></el-input>
        </el-form-item>
        <el-form-item label="处理状态" required>
          <el-select v-model="batchProcessForm.status" placeholder="请选择">
            <el-option label="处理中" value="processing"></el-option>
            <el-option label="已处理" value="processed"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理备注" required>
          <el-input
            v-model="batchProcessForm.processRemark"
            type="textarea"
            :rows="4"
            placeholder="请输入处理备注"
          ></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchProcessDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBatchProcess">提交处理</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getEventList,
  getEventDetail,
  updateEventStatus,
  getEventStatistics,
  getEventTypes,
  getEventLevels,
  getEventSourceModules,
  exportEventRecords,
  batchProcessEvents
} from '@/api/event'

// 响应式数据
const loading = ref(false)
const eventList = ref<any[]>([])
const total = ref(0)
const selectedRows = ref<any[]>([])

// 查询参数
const queryParams = reactive({
  eventType: '',
  eventLevel: '',
  workshopSection: '',
  startTime: '',
  endTime: '',
  status: '',
  keyword: '',
  sourceModule: '',
  page: 1,
  pageSize: 20
})

const dateRange = ref<[string, string] | null>(null)

// 统计数据
const statistics = reactive({
  totalEvents: 0,
  pendingEvents: 0,
  processingEvents: 0,
  processedEvents: 0
})

// 字典数据
const eventTypes = ref<any[]>([])
const eventLevels = ref<any[]>([])
const sourceModules = ref<any[]>([])

// 详情对话框
const detailDialogVisible = ref(false)
const currentEvent = ref<any>(null)

// 处理对话框
const processDialogVisible = ref(false)
const processForm = reactive({
  eventId: '',
  eventType: '',
  status: 'processed' as 'processing' | 'processed',
  processRemark: ''
})

// 批量处理对话框
const batchProcessDialogVisible = ref(false)
const batchProcessForm = reactive({
  count: 0,
  status: 'processed' as 'processing' | 'processed',
  processRemark: ''
})

// 生命周期
onMounted(async () => {
  await loadDictData()
  await loadStatistics()
  await loadEventList()
})

// 加载字典数据
const loadDictData = async () => {
  try {
    const [typesRes, levelsRes, sourcesRes] = await Promise.all([
      getEventTypes(),
      getEventLevels(),
      getEventSourceModules()
    ])
    
    if (typesRes.code === 200) {
      eventTypes.value = typesRes.data
    }
    
    if (levelsRes.code === 200) {
      eventLevels.value = levelsRes.data
    }
    
    if (sourcesRes.code === 200) {
      sourceModules.value = sourcesRes.data
    }
  } catch (error) {
    ElMessage.error('加载字典数据失败')
    console.error('加载字典数据失败:', error)
  }
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await getEventStatistics()
    if (res.code === 200) {
      Object.assign(statistics, res.data)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载事件列表
const loadEventList = async () => {
  loading.value = true
  try {
    // 设置时间范围
    if (dateRange.value) {
      queryParams.startTime = dateRange.value[0]
      queryParams.endTime = dateRange.value[1]
    } else {
      queryParams.startTime = ''
      queryParams.endTime = ''
    }

    const res = await getEventList(queryParams)
    if (res.code === 200) {
      eventList.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '获取事件列表失败')
    }
  } catch (error) {
    ElMessage.error('获取事件列表失败')
    console.error('获取事件列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  queryParams.page = 1
  loadEventList()
}

// 重置
const resetQuery = () => {
  Object.keys(queryParams).forEach(key => {
    queryParams[key as keyof typeof queryParams] = ''
  })
  queryParams.page = 1
  queryParams.pageSize = 20
  dateRange.value = null
}

// 分页变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  loadEventList()
}

const handleCurrentChange = (current: number) => {
  queryParams.page = current
  loadEventList()
}

// 导出数据
const handleExport = async () => {
  try {
    const exportParams = { ...queryParams }
    if (dateRange.value) {
      exportParams.startTime = dateRange.value[0]
      exportParams.endTime = dateRange.value[1]
    }
    
    const res = await exportEventRecords(exportParams)
    
    // 创建下载链接
    const blob = new Blob([res as BlobPart], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `事件记录_${new Date().getTime()}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
    console.error('导出失败:', error)
  }
}

// 选择变化
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

// 查看详情
const viewEventDetail = async (row: any) => {
  try {
    const res = await getEventDetail(row.id)
    if (res.code === 200) {
      currentEvent.value = res.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(res.message || '获取事件详情失败')
    }
  } catch (error) {
    ElMessage.error('获取事件详情失败')
    console.error('获取事件详情失败:', error)
  }
}

// 处理事件
const handleProcess = (event: any) => {
  processForm.eventId = event.id.toString()
  processForm.eventType = getEventTypeLabel(event.eventType)
  processForm.status = 'processed'
  processForm.processRemark = ''
  processDialogVisible.value = true
}

// 提交处理
const submitProcess = async () => {
  try {
    await updateEventStatus({
      id: Number(processForm.eventId),
      status: processForm.status,
      processRemark: processForm.processRemark
    })
    
    ElMessage.success('处理成功')
    processDialogVisible.value = false
    loadEventList()
    loadStatistics()
    
    // 更新当前详情
    if (currentEvent.value && currentEvent.value.id === Number(processForm.eventId)) {
      currentEvent.value.status = processForm.status
      currentEvent.value.processRemark = processForm.processRemark
      currentEvent.value.processTime = new Date().toISOString()
    }
  } catch (error) {
    ElMessage.error('处理失败')
    console.error('处理失败:', error)
  }
}

// 打开批量处理
const openBatchProcess = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要处理的事件')
    return
  }
  
  batchProcessForm.count = selectedRows.value.length
  batchProcessForm.status = 'processed'
  batchProcessForm.processRemark = ''
  batchProcessDialogVisible.value = true
}

// 提交批量处理
const submitBatchProcess = async () => {
  try {
    await batchProcessEvents({
      ids: selectedRows.value.map(row => row.id),
      status: batchProcessForm.status,
      processRemark: batchProcessForm.processRemark
    })
    
    ElMessage.success('批量处理成功')
    batchProcessDialogVisible.value = false
    selectedRows.value = []
    loadEventList()
    loadStatistics()
  } catch (error) {
    ElMessage.error('批量处理失败')
    console.error('批量处理失败:', error)
  }
}

// 重置详情对话框
const resetDetailDialog = () => {
  currentEvent.value = null
}

// 重置处理对话框
const resetProcessDialog = () => {
  processForm.eventId = ''
  processForm.eventType = ''
  processForm.status = 'processed'
  processForm.processRemark = ''
}

// 重置批量处理对话框
const resetBatchProcessDialog = () => {
  batchProcessForm.count = 0
  batchProcessForm.status = 'processed'
  batchProcessForm.processRemark = ''
}

// 获取类型标签
const getEventTypeLabel = (value?: string) => {
  if (!value) return ''
  const type = eventTypes.value.find(t => t.value === value)
  return type ? type.label : value
}

// 获取级别标签
const getEventLevelLabel = (value?: string) => {
  if (!value) return ''
  const level = eventLevels.value.find(l => l.value === value)
  return level ? level.label : value
}

// 获取源模块标签
const getSourceModuleLabel = (value?: string) => {
  if (!value) return ''
  const source = sourceModules.value.find(s => s.value === value)
  return source ? source.label : value
}

// 获取状态标签
const getStatusLabel = (status?: string) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    processed: '已处理'
  }
  return statusMap[status as keyof typeof statusMap] || status || ''
}
</script>

<style scoped>
.event-query-container {
  padding: 20px;
}

.event-statistics {
  padding: 20px 0;
}

.stat-item {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s;
}

.stat-item.warning {
  background-color: #fdf6ec;
}

.stat-item.processing {
  background-color: #ecf5ff;
}

.stat-item.success {
  background-color: #f0f9eb;
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

.query-section {
  padding: 20px 0;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.event-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.event-description {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  white-space: pre-wrap;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.event-image {
  width: 200px;
  height: 150px;
  border-radius: 4px;
  cursor: pointer;
}

.event-video {
  max-height: 400px;
  border-radius: 4px;
}
</style>