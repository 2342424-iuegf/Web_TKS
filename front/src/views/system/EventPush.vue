<template>
  <div class="event-push-management">
    <div class="page-header">
      <h2>事件推送设置</h2>
    </div>
    <ElCard class="main-card">
      <ElForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="150px"
      >
        <ElFormItem label="推送模式" prop="pushMode">
          <ElRadioGroup v-model="formData.pushMode"
            class="radio-group"
          >
            <ElRadio :label="'mqtt'">MQTT推送</ElRadio>
            <ElRadio :label="'http'">HTTP回调</ElRadio>
            <ElRadio :label="'both'">两者同时推送</ElRadio>
          </ElRadioGroup>
        </ElFormItem>

        <ElDivider />
        <h3 class="section-title">MQTT推送配置</h3>

        <ElFormItem label="MQTT服务器地址" prop="mqttServer">
          <ElInput v-model="formData.mqttServer" placeholder="请输入MQTT服务器地址" />
        </ElFormItem>

        <ElFormItem label="MQTT服务器端口" prop="mqttPort">
          <ElInputNumber v-model="formData.mqttPort" :min="1" :max="65535" />
        </ElFormItem>

        <ElFormItem label="MQTT用户名" prop="mqttUsername">
          <ElInput v-model="formData.mqttUsername" placeholder="请输入MQTT用户名" />
        </ElFormItem>

        <ElFormItem label="MQTT密码" prop="mqttPassword">
          <ElInput
            v-model="formData.mqttPassword"
            type="password"
            placeholder="请输入MQTT密码"
            show-password
          />
        </ElFormItem>

        <ElFormItem label="MQTT客户端ID" prop="mqttClientId">
          <ElInput v-model="formData.mqttClientId" placeholder="请输入MQTT客户端ID" />
        </ElFormItem>

        <ElFormItem label="MQTT主题前缀" prop="mqttTopicPrefix">
          <ElInput v-model="formData.mqttTopicPrefix" placeholder="请输入MQTT主题前缀" />
          <div class="form-tip">最终推送主题格式：主题前缀 + 事件类型</div>
        </ElFormItem>

        <ElFormItem label="MQTT推送事件类型" prop="mqttEventTypes">
          <ElCheckboxGroup v-model="formData.mqttEventTypes"
            :options="eventTypeOptions"
            class="checkbox-group"
          />
        </ElFormItem>

        <ElDivider />
        <h3 class="section-title">HTTP回调配置</h3>

        <ElFormItem label="HTTP回调URL" prop="httpCallbackUrl">
          <ElInput v-model="formData.httpCallbackUrl" placeholder="请输入HTTP回调URL" />
        </ElFormItem>

        <ElFormItem label="HTTP请求方法" prop="httpMethod">
          <ElSelect v-model="formData.httpMethod" placeholder="请选择HTTP请求方法"
            filterable
          >
            <ElOption label="POST" value="POST" />
            <ElOption label="GET" value="GET" />
            <ElOption label="PUT" value="PUT" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="HTTP请求头" prop="httpHeaders">
          <ElTable
            v-model:data="formData.httpHeaders"
            border
            style="width: 100%"
          >
            <ElTableColumn prop="key" label="Key" min-width="120">
              >template #default="{ row, $index }">
                <ElInput v-model="row.key" placeholder="Header Key" />
              >template>
            </ElTableColumn>
            <ElTableColumn prop="value" label="Value" min-width="200">
              >template #default="{ row }">
                <ElInput v-model="row.value" placeholder="Header Value" />
              >template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="80">
              >template #default="{ $index }">
                <ElButton
                  type="danger"
                  text
                  @click="handleRemoveHeader($index)"
                >
                  删除
                </ElButton>
              >template>
            </ElTableColumn>
          </ElTable>
          <ElButton type="primary" text @click="handleAddHeader">添加Header</ElButton>
        </ElFormItem>

        <ElFormItem label="HTTP推送事件类型" prop="httpEventTypes">
          <ElCheckboxGroup v-model="formData.httpEventTypes"
            :options="eventTypeOptions"
            class="checkbox-group"
          />
        </ElFormItem>

        <ElFormItem label="推送数据格式" prop="dataFormat">
          <ElSelect v-model="formData.dataFormat" placeholder="请选择数据格式"
            filterable
          >
            <ElOption label="JSON" value="json" />
            <ElOption label="XML" value="xml" />
            <ElOption label="CSV" value="csv" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem>
          <ElButton type="primary" @click="handleSubmit">保存设置</ElButton>
          <ElButton type="success" @click="handleTestConnection">测试连接</ElButton>
          <ElButton @click="handleReset">重置默认值</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getEventPushSettings, updateEventPushSettings, testEventPushConnection } from '@/api/system'

interface HttpHeader {
  key: string
  value: string
}

const formRef = ref()

const formData = reactive({
  pushMode: 'mqtt',
  mqttServer: '',
  mqttPort: 1883,
  mqttUsername: '',
  mqttPassword: '',
  mqttClientId: '',
  mqttTopicPrefix: 'web_tks/event/',
  mqttEventTypes: ['offDuty', 'danger'],
  httpCallbackUrl: '',
  httpMethod: 'POST',
  httpHeaders: [] as HttpHeader[],
  httpEventTypes: ['offDuty', 'danger'],
  dataFormat: 'json'
})

const formRules = {
  pushMode: [
    { required: true, message: '请选择推送模式', trigger: 'change' }
  ],
  mqttServer: [
    { required: true, message: '请输入MQTT服务器地址', trigger: 'blur', validator: validateMqttServer }
  ],
  mqttPort: [
    { required: true, message: '请输入MQTT服务器端口', trigger: 'change' }
  ],
  httpCallbackUrl: [
    { required: true, message: '请输入HTTP回调URL', trigger: 'blur', validator: validateHttpUrl }
  ]
}

const eventTypeOptions = [
  { label: '脱岗检测', value: 'offDuty' },
  { label: '危险区域入侵', value: 'danger' },
  { label: '布车分布异常', value: 'clothCarAnomaly' },
  { label: '通道出入异常', value: 'channelAnomaly' },
  { label: '落布换车检测', value: 'clothChange' }
]

// 验证MQTT服务器地址
function validateMqttServer(rule: any, value: string, callback: Function) {
  if (!value) {
    callback(new Error('请输入MQTT服务器地址'))
  } else if (!value.startsWith('mqtt://') && !value.startsWith('mqtts://')) {
    callback(new Error('MQTT服务器地址必须以mqtt://或mqtts://开头'))
  } else {
    callback()
  }
}

// 验证HTTP URL
function validateHttpUrl(rule: any, value: string, callback: Function) {
  if (!value) {
    callback(new Error('请输入HTTP回调URL'))
  } else if (!value.startsWith('http://') && !value.startsWith('https://')) {
    callback(new Error('HTTP URL必须以http://或https://开头'))
  } else {
    callback()
  }
}

// 加载推送设置
async function loadSettings() {
  try {
    const response = await getEventPushSettings()
    const data = response.data || {}
    
    // 合并设置
    Object.assign(formData, data)
    
    // 确保httpHeaders是数组
    if (!Array.isArray(formData.httpHeaders)) {
      formData.httpHeaders = []
    }
  } catch (error) {
    console.error('加载推送设置失败:', error)
  }
}

// 添加HTTP头
function handleAddHeader() {
  formData.httpHeaders.push({ key: '', value: '' })
}

// 删除HTTP头
function handleRemoveHeader(index: number) {
  formData.httpHeaders.splice(index, 1)
}

// 测试连接
async function handleTestConnection() {
  try {
    const result = await testEventPushConnection(formData)
    ElMessage.success('连接测试成功')
  } catch (error) {
    ElMessage.error('连接测试失败，请检查配置')
  }
}

// 保存设置
async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    await updateEventPushSettings(formData)
    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

// 重置默认值
function handleReset() {
  const defaultValues = {
    pushMode: 'mqtt',
    mqttServer: '',
    mqttPort: 1883,
    mqttUsername: '',
    mqttPassword: '',
    mqttClientId: '',
    mqttTopicPrefix: 'web_tks/event/',
    mqttEventTypes: ['offDuty', 'danger'],
    httpCallbackUrl: '',
    httpMethod: 'POST',
    httpHeaders: [] as HttpHeader[],
    httpEventTypes: ['offDuty', 'danger'],
    dataFormat: 'json'
  }
  Object.assign(formData, defaultValues)
  ElMessage.info('已重置为默认值')
}

// 初始化
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.event-push-management {
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

.section-title {
  margin-top: 20px;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.checkbox-group,
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.checkbox-group .el-checkbox,
.radio-group .el-radio {
  margin-right: 0;
  margin-bottom: 10px;
}

.form-tip {
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
}

:deep(.el-table__row .el-input) {
  width: 100%;
}

:deep(.el-divider) {
  margin: 30px 0 20px 0;
}
</style>