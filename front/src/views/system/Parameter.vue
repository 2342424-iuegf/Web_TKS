<template>
  <div class="parameter-management">
    <div class="page-header">
      <h2>参数设置</h2>
    </div>
    <ElCard class="main-card">
      <ElForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="150px"
      >
        <ElFormItem label="系统刷新间隔(秒)" prop="refreshInterval">
          <ElSlider
            v-model="formData.refreshInterval"
            :min="5"
            :max="60"
            :step="5"
            show-stops
          />
          <span class="param-value">{{ formData.refreshInterval }} 秒</span>
        </ElFormItem>

        <ElFormItem label="检测超时阈值(秒)" prop="detectionTimeout">
          <ElInputNumber
            v-model="formData.detectionTimeout"
            :min="10"
            :max="300"
            :step="5"
          />
        </ElFormItem>

        <ElFormItem label="布车编号识别精度" prop="carNumberAccuracy">
          <ElSlider
            v-model="formData.carNumberAccuracy"
            :min="0"
            :max="1"
            :step="0.05"
            :format-tooltip="formatAccuracy"
          />
          <span class="param-value">{{ (formData.carNumberAccuracy * 100).toFixed(0) }}%</span>
        </ElFormItem>

        <ElFormItem label="脱岗检测时间阈值(秒)" prop="offDutyThreshold">
          <ElInputNumber
            v-model="formData.offDutyThreshold"
            :min="30"
            :max="600"
            :step="10"
          />
        </ElFormItem>

        <ElFormItem label="告警推送方式" prop="alertPushMethods">
          <ElCheckboxGroup v-model="formData.alertPushMethods"
            :options="pushMethodOptions"
            class="checkbox-group"
          />
        </ElFormItem>

        <ElFormItem label="告警声音提示" prop="alertSound">
          <ElSwitch v-model="formData.alertSound" />
        </ElFormItem>

        <ElFormItem label="视频回放保留天数" prop="videoRetentionDays"</ElFormItem>
        <ElFormItem prop="videoRetentionDays">
          <ElSelect v-model="formData.videoRetentionDays" placeholder="请选择保留天数"
            filterable
          >
            <ElOption
              v-for="day in retentionDayOptions"
              :key="day.value"
              :label="day.label"
              :value="day.value"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="默认显示模式" prop="defaultDisplayMode">
          <ElRadioGroup v-model="formData.defaultDisplayMode"
            class="radio-group"
          >
            <ElRadio :label="'grid'">网格模式</ElRadio>
            <ElRadio :label="'list'">列表模式</ElRadio>
          </ElRadioGroup>
        </ElFormItem>

        <ElFormItem label="语言设置" prop="language">
          <ElSelect v-model="formData.language" placeholder="请选择语言"
            filterable
          >
            <ElOption label="简体中文" value="zh-CN" />
            <ElOption label="English" value="en-US" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="主题设置" prop="theme">
          <ElSelect v-model="formData.theme" placeholder="请选择主题"
            filterable
          >
            <ElOption label="默认主题" value="default" />
            <ElOption label="暗色主题" value="dark" />
            <ElOption label="蓝色主题" value="blue" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="日志级别" prop="logLevel">
          <ElSelect v-model="formData.logLevel" placeholder="请选择日志级别"
            filterable
          >
            <ElOption label="ERROR" value="error" />
            <ElOption label="WARNING" value="warning" />
            <ElOption label="INFO" value="info" />
            <ElOption label="DEBUG" value="debug" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="数据备份周期" prop="backupCycle">
          <ElRadioGroup v-model="formData.backupCycle"
            class="radio-group"
          >
            <ElRadio :label="'daily'">每日备份</ElRadio>
            <ElRadio :label="'weekly'">每周备份</ElRadio>
            <ElRadio :label="'monthly'">每月备份</ElRadio>
          </ElRadioGroup>
        </ElFormItem>

        <ElFormItem>
          <ElButton type="primary" @click="handleSubmit">保存设置</ElButton>
          <ElButton @click="handleReset">重置默认值</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemParameters, updateSystemParameters } from '@/api/system'
import { useSystemStore } from '@/store/modules/system'

const formRef = ref()
const systemStore = useSystemStore()

const formData = reactive({
  refreshInterval: 15,
  detectionTimeout: 60,
  carNumberAccuracy: 0.9,
  offDutyThreshold: 120,
  alertPushMethods: ['web', 'email'],
  alertSound: true,
  videoRetentionDays: 30,
  defaultDisplayMode: 'grid',
  language: 'zh-CN',
  theme: 'default',
  logLevel: 'info',
  backupCycle: 'weekly'
})

const formRules = {
  refreshInterval: [
    { required: true, message: '请设置刷新间隔', trigger: 'change' }
  ],
  detectionTimeout: [
    { required: true, message: '请设置检测超时阈值', trigger: 'change' }
  ]
}

const pushMethodOptions = [
  { label: 'Web通知', value: 'web' },
  { label: '邮件通知', value: 'email' },
  { label: '短信通知', value: 'sms' },
  { label: 'MQTT推送', value: 'mqtt' }
]

const retentionDayOptions = [
  { label: '7天', value: 7 },
  { label: '15天', value: 15 },
  { label: '30天', value: 30 },
  { label: '60天', value: 60 },
  { label: '90天', value: 90 }
]

// 格式化精度显示
function formatAccuracy(value: number): string {
  return `${(value * 100).toFixed(0)}%`
}

// 加载系统参数
async function loadParameters() {
  try {
    const response = await getSystemParameters()
    const data = response.data || {}
    Object.assign(formData, data)
    // 更新系统store
    systemStore.setRefreshInterval(formData.refreshInterval)
  } catch (error) {
    console.error('加载系统参数失败:', error)
  }
}

// 保存设置
async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    await updateSystemParameters(formData)
    // 更新系统store
    systemStore.setRefreshInterval(formData.refreshInterval)
    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

// 重置默认值
async function handleReset() {
  const defaultValues = {
    refreshInterval: 15,
    detectionTimeout: 60,
    carNumberAccuracy: 0.9,
    offDutyThreshold: 120,
    alertPushMethods: ['web', 'email'],
    alertSound: true,
    videoRetentionDays: 30,
    defaultDisplayMode: 'grid',
    language: 'zh-CN',
    theme: 'default',
    logLevel: 'info',
    backupCycle: 'weekly'
  }
  Object.assign(formData, defaultValues)
  ElMessage.info('已重置为默认值')
}

// 初始化
onMounted(() => {
  loadParameters()
})
</script>

<style scoped>
.parameter-management {
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
  overflow-y: auto;
}

.param-value {
  margin-left: 10px;
  color: #1890ff;
  font-weight: 500;
}

.checkbox-group,
.radio-group {
  display: flex;
  gap: 20px;
}

.checkbox-group .el-checkbox,
.radio-group .el-radio {
  margin-right: 0;
}

:deep(.el-slider__runway) {
  height: 6px;
}

:deep(.el-slider__bar) {
  height: 6px;
  background-color: #1890ff;
}

:deep(.el-slider__button) {
  width: 16px;
  height: 16px;
}
</style>