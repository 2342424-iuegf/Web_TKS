<template>
  <div class="monitoring-home" style="height: 100%; display: flex; flex-direction: column;">
    <!-- 页面标题 -->
    <div class="page-header" style="margin-bottom: 30px;">
      <h2>监控中心</h2>
      <div class="header-info" style="margin-top: 8px; font-size: 14px; color: #606266;">
        集中管理所有检测模块，实时监控车间生产状态
      </div>
    </div>

    <!-- 总体统计卡片 -->
    <div class="dashboard-section" style="margin-bottom: 30px;">
      <h3 style="margin-bottom: 16px; font-weight: 500;">系统概览</h3>
      <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
        <ElCard class="stats-card" :body-style="{ padding: '20px' }">
          <div style="text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: #409eff; margin-bottom: 8px;">{{ totalEvents }}</div>
            <div style="color: #606266;">今日告警总数</div>
          </div>
        </ElCard>
        <ElCard class="stats-card" :body-style="{ padding: '20px' }">
          <div style="text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: #f56c6c; margin-bottom: 8px;">{{ urgentAlerts }}</div>
            <div style="color: #606266;">紧急告警</div>
          </div>
        </ElCard>
        <ElCard class="stats-card" :body-style="{ padding: '20px' }">
          <div style="text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: #e6a23c; margin-bottom: 8px;">{{ clothCarCount }}</div>
            <div style="color: #606266;">布车总数</div>
          </div>
        </ElCard>
        <ElCard class="stats-card" :body-style="{ padding: '20px' }">
          <div style="text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: #67c23a; margin-bottom: 8px;">{{ onlineCameras }}</div>
            <div style="color: #606266;">在线摄像头</div>
          </div>
        </ElCard>
      </div>
    </div>

    <!-- 模块快速入口 -->
    <div class="modules-section" style="flex: 1; overflow: auto;">
      <h3 style="margin-bottom: 20px; font-weight: 500;">监控模块</h3>
      <div class="modules-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
        <!-- 布车分布检测 -->
        <ElCard class="module-card" hoverable @click="navigateTo('/monitoring/cloth-car')">
          <div class="module-content" style="display: flex; align-items: center; gap: 20px;">
            <div class="module-icon" style="width: 60px; height: 60px; border-radius: 50%; background-color: #ecf5ff; display: flex; align-items: center; justify-content: center;">
              <Car :size="32" style="color: #409eff;" />
            </div>
            <div class="module-info">
              <div style="font-size: 18px; font-weight: 500; margin-bottom: 4px;">布车分布检测</div>
              <div style="color: #909399; font-size: 14px;">实时监控布车分布、状态和位置</div>
            </div>
            <ArrowRight :size="20" style="color: #c0c4cc; margin-left: auto;" />
          </div>
          <div class="module-stats" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #ebeef5; display: flex; justify-content: space-around;">
            <div class="stat-item">
              <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #409eff;">{{ clothCarStats.total || 0 }}</div>
              <div class="stat-label" style="color: #909399; font-size: 12px;">布车总数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #67c23a;">{{ clothCarStats.loaded || 0 }}</div>
              <div class="stat-label" style="color: #909399; font-size: 12px;">已装载</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #e6a23c;">{{ clothCarStats.empty || 0 }}</div>
              <div class="stat-label" style="color: #909399; font-size: 12px;">空车</div>
            </div>
          </div>
        </ElCard>

        <!-- 通道出入检测 -->
        <ElCard class="module-card" hoverable @click="navigateTo('/monitoring/channel-access')">
          <div class="module-content" style="display: flex; align-items: center; gap: 20px;">
            <div class="module-icon" style="width: 60px; height: 60px; border-radius: 50%; background-color: #f0f9eb; display: flex; align-items: center; justify-content: center;">
              <SwitchButton :size="32" style="color: #67c23a;" />
            </div>
            <div class="module-info">
              <div style="font-size: 18px; font-weight: 500; margin-bottom: 4px;">通道出入检测</div>
              <div style="color: #909399; font-size: 14px;">监控通道布车进出，对接MES系统</div>
            </div>
            <ArrowRight :size="20" style="color: #c0c4cc; margin-left: auto;" />
          </div>
          <div class="module-stats" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #ebeef5; display: flex; justify-content: space-around;">
            <div class="stat-item">
              <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #409eff;">{{ channelStats.total || 0 }}</div>
              <div class="stat-label" style="color: #909399; font-size: 12px;">今日记录</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #67c23a;">{{ channelStats.normal || 0 }}</div>
              <div class="stat-label" style="color: #909399; font-size: 12px;">正常</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #f56c6c;">{{ channelStats.exception || 0 }}</div>
              <div class="stat-label" style="color: #909399; font-size: 12px;">异常</div>
            </div>
          </div>
        </ElCard>

        <!-- 落布换车检测 -->
        <ElCard class="module-card" hoverable @click="navigateTo('/monitoring/cloth-change')">
          <div class="module-content" style="display: flex; align-items: center; gap: 20px;">
            <div class="module-icon" style="width: 60px; height: 60px; border-radius: 50%; background-color: #fdf6ec; display: flex; align-items: center; justify-content: center;">
              <Refresh :size="32" style="color: #e6a23c;" />
            </div>
            <div class="module-info">
              <div style="font-size: 18px; font-weight: 500; margin-bottom: 4px;">落布换车检测</div>
              <div style="color: #909399; font-size: 14px;">监控落布时布车切换，自动同步MES</div>
            </div>
            <ArrowRight :size="20" style="color: #c0c4cc; margin-left: auto;" />
          </div>
          <div class="module-stats" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #ebeef5; display: flex; justify-content: space-around;">
            <div class="stat-item">
              <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #409eff;">{{ clothChangeStats.today || 0 }}</div>
              <div class="stat-label" style="color: #909399; font-size: 12px;">今日换车</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #67c23a;">{{ clothChangeStats.synced || 0 }}</div>
              <div class="stat-label" style="color: #909399; font-size: 12px;">已同步</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #f56c6c;">{{ clothChangeStats.error || 0 }}</div>
              <div class="stat-label" style="color: #909399; font-size: 12px;">同步失败</div>
            </div>
          </div>
        </ElCard>

        <!-- 脱岗检测 -->
        <ElCard class="module-card" hoverable @click="navigateTo('/monitoring/off-duty')">
          <div class="module-content" style="display: flex; align-items: center; gap: 20px;">
            <div class="module-icon" style="width: 60px; height: 60px; border-radius: 50%; background-color: #fef0f0; display: flex; align-items: center; justify-content: center;">
              <UserFilled :size="32" style="color: #f56c6c;" />
            </div>
            <div class="module-info">
              <div style="font-size: 18px; font-weight: 500; margin-bottom: 4px;">脱岗检测</div>
              <div style="color: #909399; font-size: 14px;">实时监测人员脱岗行为，保障安全生产</div>
            </div>
            <ArrowRight :size="20" style="color: #c0c4cc; margin-left: auto;" />
          </div>
          <div class="module-stats" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #ebeef5; display: flex; justify-content: space-around;">
            <div class="stat-item">
              <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #409eff;">{{ offDutyStats.total || 0 }}</div>
              <div class="stat-label" style="color: #909399; font-size: 12px;">脱岗事件</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #e6a23c;">{{ offDutyStats.processing || 0 }}</div>
              <div class="stat-label" style="color: #909399; font-size: 12px;">处理中</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #67c23a;">{{ offDutyStats.processed || 0 }}</div>
              <div class="stat-label" style="color: #909399; font-size: 12px;">已处理</div>
            </div>
          </div>
        </ElCard>

        <!-- 危险检测 -->
        <ElCard class="module-card" hoverable @click="navigateTo('/monitoring/danger')">
          <div class="module-content" style="display: flex; align-items: center; gap: 20px;">
            <div class="module-icon" style="width: 60px; height: 60px; border-radius: 50%; background-color: #fef0f0; display: flex; align-items: center; justify-content: center;">
              <WarningFilled :size="32" style="color: #f56c6c;" />
            </div>
            <div class="module-info">
              <div style="font-size: 18px; font-weight: 500; margin-bottom: 4px;">危险检测</div>
              <div style="color: #909399; font-size: 14px;">监控危险区域，设置电子围栏，记录闯入信息</div>
            </div>
            <ArrowRight :size="20" style="color: #c0c4cc; margin-left: auto;" />
          </div>
          <div class="module-stats" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #ebeef5; display: flex; justify-content: space-around;">
            <div class="stat-item">
              <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #409eff;">{{ dangerStats.zones || 0 }}</div>
              <div class="stat-label" style="color: #909399; font-size: 12px;">危险区域</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #f56c6c;">{{ dangerStats.intrusions || 0 }}</div>
              <div class="stat-label" style="color: #909399; font-size: 12px;">入侵次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #e6a23c;">{{ dangerStats.active || 0 }}</div>
              <div class="stat-label" style="color: #909399; font-size: 12px;">活跃告警</div>
            </div>
          </div>
        </ElCard>

        <!-- 事件查询 -->
        <ElCard class="module-card" hoverable @click="navigateTo('/event')">
          <div class="module-content" style="display: flex; align-items: center; gap: 20px;">
            <div class="module-icon" style="width: 60px; height: 60px; border-radius: 50%; background-color: #f0f2f5; display: flex; align-items: center; justify-content: center;">
              <Document :size="32" style="color: #606266;" />
            </div>
            <div class="module-info">
              <div style="font-size: 18px; font-weight: 500; margin-bottom: 4px;">事件查询</div>
              <div style="color: #909399; font-size: 14px;">查询所有检测到的事件记录和告警信息</div>
            </div>
            <ArrowRight :size="20" style="color: #c0c4cc; margin-left: auto;" />
          </div>
        </ElCard>

        <!-- 视频查询 -->
        <ElCard class="module-card" hoverable @click="navigateTo('/video/live')">
          <div class="module-content" style="display: flex; align-items: center; gap: 20px;">
            <div class="module-icon" style="width: 60px; height: 60px; border-radius: 50%; background-color: #f0f2f5; display: flex; align-items: center; justify-content: center;">
              <VideoCameraFilled :size="32" style="color: #606266;" />
            </div>
            <div class="module-info">
              <div style="font-size: 18px; font-weight: 500; margin-bottom: 4px;">视频监控</div>
              <div style="color: #909399; font-size: 14px;">实时观看和回放车间监控视频</div>
            </div>
            <ArrowRight :size="20" style="color: #c0c4cc; margin-left: auto;" />
          </div>
        </ElCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElCard } from 'element-plus'
import {
  Car,
  SwitchButton,
  Refresh,
  UserFilled,
  WarningFilled,
  Document,
  VideoCameraFilled,
  ArrowRight
} from '@element-plus/icons-vue'
import { getClothCarList } from '@/api/clothCar'
import { getIntrusionList, getDangerZoneStatistics } from '@/api/danger'
import { getOffDutyList } from '@/api/offDuty'
import { getChannelAccessList } from '@/api/channelAccess'
import { getClothChangeList } from '@/api/clothChange'

const router = useRouter()

// 总体统计数据
const totalEvents = ref(0)
const urgentAlerts = ref(0)
const clothCarCount = ref(0)
const onlineCameras = ref(0)

// 各模块统计数据
const clothCarStats = ref({
  total: 0,
  loaded: 0,
  empty: 0
})

const channelStats = ref({
  total: 0,
  normal: 0,
  exception: 0
})

const clothChangeStats = ref({
  today: 0,
  synced: 0,
  error: 0
})

const offDutyStats = ref({
  total: 0,
  processing: 0,
  processed: 0
})

const dangerStats = ref({
  zones: 0,
  intrusions: 0,
  active: 0
})

// 页面跳转
const navigateTo = (path: string) => {
  router.push(path)
}

// 加载各模块统计数据
const loadAllStats = async () => {
  try {
    // 加载布车统计
    const clothCarRes = await getClothCarList({ pageSize: 1000 })
    if (clothCarRes.code === 200) {
      const cars = clothCarRes.data?.list || []
      clothCarStats.value.total = cars.length
      clothCarStats.value.loaded = cars.filter(car => car.loadingStatus === 'loaded').length
      clothCarStats.value.empty = cars.filter(car => car.loadingStatus === 'empty').length
      clothCarCount.value = cars.length
    }

    // 加载通道统计
    const today = new Date().toISOString().split('T')[0]
    const channelRes = await getChannelAccessList({
      startDate: today,
      endDate: today,
      pageSize: 1000
    })
    if (channelRes.code === 200) {
      const records = channelRes.data?.list || []
      channelStats.value.total = records.length
      channelStats.value.normal = records.filter(r => r.status === 'normal').length
      channelStats.value.exception = records.filter(r => r.status === 'exception').length
    }

    // 加载落布换车统计
    const clothChangeRes = await getClothChangeList({
      startDate: today,
      endDate: today,
      pageSize: 1000
    })
    if (clothChangeRes.code === 200) {
      const records = clothChangeRes.data?.list || []
      clothChangeStats.value.today = records.length
      clothChangeStats.value.synced = records.filter(r => r.syncStatus === 'success').length
      clothChangeStats.value.error = records.filter(r => r.syncStatus === 'failed').length
    }

    // 加载脱岗统计
    const offDutyRes = await getOffDutyList({
      startDate: today,
      endDate: today,
      pageSize: 1000
    })
    if (offDutyRes.code === 200) {
      const records = offDutyRes.data?.list || []
      offDutyStats.value.total = records.length
      offDutyStats.value.processing = records.filter(r => r.status === 'processing').length
      offDutyStats.value.processed = records.filter(r => r.status === 'processed').length
    }

    // 加载危险检测统计
    const dangerStatsRes = await getDangerZoneStatistics()
    if (dangerStatsRes.code === 200) {
      const stats = dangerStatsRes.data
      dangerStats.value.intrusions = stats.todayIntrusions || 0
      dangerStats.value.active = stats.currentAlerts || 0
    }
    
    const dangerZonesRes = await getIntrusionList({ pageSize: 100 })
    if (dangerZonesRes.code === 200) {
      dangerStats.value.zones = dangerZonesRes.data?.list?.length || 0
    }

    // 计算总体统计
    totalEvents.value = channelStats.value.exception + offDutyStats.value.total + dangerStats.value.intrusions
    urgentAlerts.value = dangerStats.value.intrusions + offDutyStats.value.total
    onlineCameras.value = Math.floor(Math.random() * 10) + 20 // 模拟数据

  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

onMounted(() => {
  loadAllStats()
  // 定时刷新统计数据
  const interval = setInterval(loadAllStats, 30000)
  
  // 组件卸载时清理定时器
  return () => clearInterval(interval)
})
</script>

<style scoped>
.monitoring-home {
  padding: 20px;
  box-sizing: border-box;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.module-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.stats-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modules-grid {
    grid-template-columns: 1fr !important;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr !important;
  }
  
  .module-content {
    flex-direction: column !important;
    text-align: center;
  }
  
  .module-icon {
    margin-bottom: 12px;
  }
}
</style>