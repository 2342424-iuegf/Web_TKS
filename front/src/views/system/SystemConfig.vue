<template>
  <div class="system-config-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>系统配置</h2>
      <div class="header-actions">
        <el-button type="primary" @click="refreshConfig" icon="el-icon-refresh" size="small">
          刷新配置
        </el-button>
        <el-button type="success" @click="exportConfig" icon="el-icon-download" size="small">
          导出配置
        </el-button>
        <el-upload
          class="upload-button"
          action=""
          :before-upload="handleImportConfig"
          :show-file-list="false"
          accept=".json"
          :auto-upload="false"
        >
          <el-button type="warning" icon="el-icon-upload2" size="small">
            导入配置
          </el-button>
        </el-upload>
      </div>
    </div>

    <!-- 系统信息卡片 -->
    <el-row :gutter="20" class="system-info-cards">
      <el-col :span="6">
        <el-card class="info-card">
          <div slot="header" class="card-header">
            <span>系统信息</span>
          </div>
          <div class="info-content">
            <p><strong>版本:</strong> {{ systemInfo.version || '未知' }}</p>
            <p><strong>运行环境:</strong> {{ systemInfo.env || '未知' }}</p>
            <p><strong>启动时间:</strong> {{ systemInfo.startTime ? formatDate(systemInfo.startTime) : '未知' }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="info-card">
          <div slot="header" class="card-header">
            <span>系统状态</span>
          </div>
          <div class="info-content">
            <p><strong>CPU使用率:</strong> {{ systemStatus.cpuUsage || '0' }}%</p>
            <p><strong>内存使用率:</strong> {{ systemStatus.memoryUsage || '0' }}%</p>
            <p><strong>磁盘使用率:</strong> {{ systemStatus.diskUsage || '0' }}%</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="info-card">
          <div slot="header" class="card-header">
            <span>在线状态</span>
          </div>
          <div class="info-content">
            <p><strong>摄像头在线:</strong> {{ systemStatus.onlineCameras || 0 }}/全部</p>
            <p><strong>服务状态:</strong> 
              <el-tag :type="systemStatus.isHealthy ? 'success' : 'danger'" size="small">
                {{ systemStatus.isHealthy ? '正常' : '异常' }}
              </el-tag>
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="info-card">
          <div slot="header" class="card-header">
            <span>操作</span>
          </div>
          <div class="info-content">
            <el-button type="primary" size="small" @click="backupConfig" icon="el-icon-document-copy" style="margin-right: 10px; margin-bottom: 10px;">
              备份配置
            </el-button>
            <el-button type="warning" size="small" @click="clearCache" icon="el-icon-delete" style="margin-right: 10px; margin-bottom: 10px;">
              清理缓存
            </el-button>
            <el-button type="danger" size="small" @click="showRestartDialog" icon="el-icon-setting">
              重启系统
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 配置查询和操作区域 -->
    <el-row class="config-query-area">
      <el-col :span="24">
        <el-card>
          <div slot="header" class="card-header">
            <span>配置管理</span>
          </div>
          <!-- 查询表单 -->
          <el-form :inline="true" :model="queryParams" class="query-form">
            <el-form-item label="配置键名">
              <el-input v-model="queryParams.configKey" placeholder="请输入配置键名" clearable size="small" />
            </el-form-item>
            <el-form-item label="配置分组">
              <el-select v-model="queryParams.groupName" placeholder="请选择配置分组" clearable size="small">
                <el-option
                  v-for="group in configGroups"
                  :key="group.name"
                  :label="group.label"
                  :value="group.name"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery" size="small" icon="el-icon-search">
                查询
              </el-button>
              <el-button @click="resetQuery" size="small" icon="el-icon-refresh-right">
                重置
              </el-button>
              <el-button @click="showAddDialog" type="success" size="small" icon="el-icon-plus">
                添加配置
              </el-button>
              <el-button @click="batchUpdateDialogVisible = true" type="warning" size="small" icon="el-icon-edit">
                批量编辑
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 配置列表 -->
          <el-table
            v-loading="loading"
            :data="configList"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="configKey" label="配置键名" min-width="180" />
            <el-table-column prop="configValue" label="配置值" min-width="200">
              <template slot-scope="scope">
                <div v-if="typeof scope.row.configValue === 'object'" class="json-value">
                  <pre>{{ JSON.stringify(scope.row.configValue, null, 2) }}</pre>
                </div>
                <div v-else>{{ scope.row.configValue }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="150" />
            <el-table-column prop="configType" label="类型" width="100">
              <template slot-scope="scope">
                <el-tag :size="'small'" :type="getTypeTagType(scope.row.configType)">
                  {{ scope.row.configType || '未知' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="groupName" label="分组" width="120" />
            <el-table-column prop="isActive" label="是否启用" width="100">
              <template slot-scope="scope">
                <el-switch
                  v-model="scope.row.isActive"
                  @change="toggleConfigStatus(scope.row)"
                  :active-text="'是'"
                  :inactive-text="'否'"
                />
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" width="180" :formatter="formatDate" />
            <el-table-column label="操作" width="150" fixed="right">
              <template slot-scope="scope">
                <el-button type="primary" size="small" @click="editConfig(scope.row)" icon="el-icon-edit">
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="deleteConfig(scope.row.configKey)" icon="el-icon-delete">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-if="total > 0"
              :current-page="queryParams.page"
              :page-size="queryParams.pageSize"
              :total="total"
              :page-sizes="[10, 20, 50, 100]"
              background
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加配置对话框 -->
    <el-dialog
      :title="'添加配置'"
      :visible.sync="addDialogVisible"
      width="600px"
      @close="resetAddForm"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="配置键名" prop="configKey">
          <el-input v-model="addForm.configKey" placeholder="请输入配置键名" />
        </el-form-item>
        <el-form-item label="配置值" prop="configValue">
          <el-input v-model="addForm.configValue" type="textarea" :rows="4" placeholder="请输入配置值" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="addForm.description" placeholder="请输入配置描述" />
        </el-form-item>
        <el-form-item label="配置类型" prop="configType">
          <el-select v-model="addForm.configType" placeholder="请选择配置类型">
            <el-option label="字符串" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="布尔值" value="boolean" />
            <el-option label="JSON对象" value="json" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置分组" prop="groupName">
          <el-select v-model="addForm.groupName" placeholder="请选择配置分组">
            <el-option
              v-for="group in configGroups"
              :key="group.name"
              :label="group.label"
              :value="group.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="addForm.isActive" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetAddForm">取消</el-button>
        <el-button type="primary" @click="submitAddForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑配置对话框 -->
    <el-dialog
      :title="'编辑配置'"
      :visible.sync="editDialogVisible"
      width="600px"
      @close="resetEditForm"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="配置键名" prop="configKey">
          <el-input v-model="editForm.configKey" disabled />
        </el-form-item>
        <el-form-item label="配置值" prop="configValue">
          <el-input v-model="editForm.configValue" type="textarea" :rows="4" placeholder="请输入配置值" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="editForm.description" placeholder="请输入配置描述" />
        </el-form-item>
        <el-form-item label="配置类型" prop="configType">
          <el-select v-model="editForm.configType" placeholder="请选择配置类型">
            <el-option label="字符串" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="布尔值" value="boolean" />
            <el-option label="JSON对象" value="json" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置分组" prop="groupName">
          <el-select v-model="editForm.groupName" placeholder="请选择配置分组">
            <el-option
              v-for="group in configGroups"
              :key="group.name"
              :label="group.label"
              :value="group.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="editForm.isActive" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetEditForm">取消</el-button>
        <el-button type="primary" @click="submitEditForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 批量编辑对话框 -->
    <el-dialog
      title="批量编辑配置"
      :visible.sync="batchUpdateDialogVisible"
      width="800px"
    >
      <el-alert
        title="提示"
        type="warning"
        description="请选择需要批量编辑的配置项，修改值后点击确定保存。"
        show-icon
        :closable="false"
      />
      <el-table
        :data="selectedConfigs"
        style="width: 100%"
        border
      >
        <el-table-column prop="configKey" label="配置键名" width="200" />
        <el-table-column prop="configValue" label="配置值" min-width="300">
          <template slot-scope="scope">
            <el-input v-model="scope.row.configValue" type="textarea" :rows="2" placeholder="请输入配置值" />
          </template>
        </el-table-column>
        <el-table-column prop="groupName" label="配置分组" width="150" />
        <el-table-column prop="isActive" label="是否启用" width="100">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.isActive" />
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer">
        <el-button @click="batchUpdateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatchUpdateForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 重启系统对话框 -->
    <el-dialog
      title="重启系统确认"
      :visible.sync="restartDialogVisible"
      width="400px"
    >
      <div class="warning-message">
        <el-alert
          title="警告"
          type="warning"
          description="重启系统将会导致服务短暂不可用，请确保在适当的时间执行此操作！"
          show-icon
          :closable="false"
        />
        <el-input
          v-model="restartPassword"
          placeholder="请输入管理员密码"
          show-password
          type="password"
          style="margin-top: 20px;"
        />
      </div>
      <div slot="footer">
        <el-button @click="restartDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmRestart">确认重启</el-button>
      </div>
    </el-dialog>

    <!-- 恢复配置对话框 -->
    <el-dialog
      title="恢复配置"
      :visible.sync="restoreDialogVisible"
      width="400px"
    >
      <div class="restore-content">
        <p>请选择要恢复的配置备份文件：</p>
        <el-upload
          class="upload-demo"
          action=""
          :auto-upload="false"
          :on-change="handleBackupFileChange"
          :show-file-list="true"
          accept=".zip,.bak"
          :multiple="false"
        >
          <el-button slot="trigger" type="primary">选择文件</el-button>
          <div slot="tip" class="el-upload__tip">
            只能上传 zip/bak 格式文件，且不超过 20MB
          </div>
        </el-upload>
      </div>
      <div slot="footer">
        <el-button @click="restoreDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRestoreConfig">确认恢复</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { systemConfigApi, SystemConfig, SystemConfigQueryParams } from '@/api/system'

// 获取当前实例，用于替代this.$message等
const instance = getCurrentInstance()

// 系统信息
const systemInfo = reactive({
  version: '',
  env: '',
  startTime: ''
})

// 系统状态
const systemStatus = reactive({
  cpuUsage: 0,
  memoryUsage: 0,
  diskUsage: 0,
  onlineCameras: 0,
  isHealthy: true
})

// 配置列表
const configList = ref<SystemConfig[]>([])
// 配置分组
const configGroups = ref<any[]>([])
// 选中的配置
const selectedConfigs = ref<SystemConfig[]>([])

// 查询参数
const queryParams = reactive<SystemConfigQueryParams>({
  configKey: '',
  groupName: '',
  page: 1,
  pageSize: 20
})

// 加载状态
const loading = ref(false)
// 总条数
const total = ref(0)

// 对话框状态
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const batchUpdateDialogVisible = ref(false)
const restartDialogVisible = ref(false)
const restoreDialogVisible = ref(false)

// 添加表单
const addForm = reactive<SystemConfig>({
  configKey: '',
  configValue: '',
  description: '',
  configType: 'string',
  groupName: '',
  isActive: true
})

// 编辑表单
const editForm = reactive<SystemConfig>({
  configKey: '',
  configValue: '',
  description: '',
  configType: 'string',
  groupName: '',
  isActive: true
})

// 重启密码
const restartPassword = ref('')
// 备份文件
const backupFile = ref<File | null>(null)

// 表单引用
const addFormRef = ref()
const editFormRef = ref()

// 添加表单验证规则
const addFormRules = {
  configKey: [
    { required: true, message: '请输入配置键名', trigger: 'blur' }
  ],
  configValue: [
    { required: true, message: '请输入配置值', trigger: 'blur' }
  ],
  configType: [
    { required: true, message: '请选择配置类型', trigger: 'change' }
  ]
}

// 编辑表单验证规则
const editFormRules = {
  configValue: [
    { required: true, message: '请输入配置值', trigger: 'blur' }
  ],
  configType: [
    { required: true, message: '请选择配置类型', trigger: 'change' }
  ]
}

// 初始化
onMounted(async () => {
  await loadSystemInfo()
  await loadSystemStatus()
  await loadConfigGroups()
  await getConfigList()
})

// 加载系统信息
async function loadSystemInfo() {
  try {
    const response = await systemConfigApi.getSystemInfo()
    if (response.code === 200) {
      Object.assign(systemInfo, response.data)
    }
  } catch (error) {
    ElMessage.error('获取系统信息失败')
    console.error('获取系统信息失败:', error)
  }
}

// 加载系统状态
async function loadSystemStatus() {
  try {
    const response = await systemConfigApi.getSystemStatus()
    if (response.code === 200) {
      Object.assign(systemStatus, response.data)
    }
  } catch (error) {
    ElMessage.error('获取系统状态失败')
    console.error('获取系统状态失败:', error)
  }
}

// 加载配置分组
async function loadConfigGroups() {
  try {
    const response = await systemConfigApi.getConfigGroups()
    if (response.code === 200) {
      configGroups.value = response.data
    }
  } catch (error) {
    ElMessage.error('获取配置分组失败')
    console.error('获取配置分组失败:', error)
  }
}

// 获取配置列表
async function getConfigList() {
  loading.value = true
  try {
    const response = await systemConfigApi.getConfigList(queryParams)
    if (response.code === 200) {
      configList.value = response.data.list || []
      total.value = response.data.total || 0
    }
  } catch (error) {
    ElMessage.error('获取配置列表失败')
    console.error('获取配置列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 刷新配置
async function refreshConfig() {
  await Promise.all([
    loadSystemInfo(),
    loadSystemStatus(),
    getConfigList()
  ])
  ElMessage.success('配置已刷新')
}

// 导出配置
async function exportConfig() {
  try {
    const response = await systemConfigApi.exportConfig()
    handleFileDownload(response, 'system-config.json')
  } catch (error) {
    ElMessage.error('导出配置失败')
    console.error('导出配置失败:', error)
  }
}

// 导入配置
async function handleImportConfig(file: File) {
  try {
    const response = await systemConfigApi.importConfig(file)
    if (response.code === 200) {
      ElMessage.success('导入配置成功')
      await getConfigList()
    }
  } catch (error) {
    ElMessage.error('导入配置失败')
    console.error('导入配置失败:', error)
  }
  return false // 阻止自动上传
}

// 备份配置
async function backupConfig() {
  try {
    const response = await systemConfigApi.backupConfig()
    if (response.code === 200) {
      ElMessage.success('配置备份成功')
      handleFileDownload(response.data, `system-config-backup-${formatDate(new Date())}.zip`)
    }
  } catch (error) {
    ElMessage.error('配置备份失败')
    console.error('配置备份失败:', error)
  }
}

// 显示恢复配置对话框
function showRestoreDialog() {
  backupFile.value = null
  restoreDialogVisible.value = true
}

// 处理备份文件选择
function handleBackupFileChange(file: any) {
  backupFile.value = file.raw
}

// 恢复配置
async function submitRestoreConfig() {
  if (!backupFile.value) {
    ElMessage.warning('请选择备份文件')
    return
  }

  try {
    await ElMessageBox.confirm('确定要恢复配置吗？这将覆盖当前配置！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await systemConfigApi.restoreConfig(backupFile.value!)
    if (response.code === 200) {
      ElMessage.success('配置恢复成功')
      restoreDialogVisible.value = false
      await getConfigList()
    }
  } catch (error) {
    // 忽略取消操作的错误
    if (error !== 'cancel') {
      ElMessage.error('配置恢复失败')
      console.error('配置恢复失败:', error)
    }
  }
}

// 清理缓存
async function clearCache() {
  try {
    await ElMessageBox.confirm('确定要清理系统缓存吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await systemConfigApi.clearCache()
    if (response.code === 200) {
      ElMessage.success('缓存清理成功')
    }
  } catch (error) {
    // 忽略取消操作的错误
    if (error !== 'cancel') {
      ElMessage.error('缓存清理失败')
      console.error('缓存清理失败:', error)
    }
  }
}

// 显示重启对话框
function showRestartDialog() {
  restartPassword.value = ''
  restartDialogVisible.value = true
}

// 确认重启
async function confirmRestart() {
  if (!restartPassword.value) {
    ElMessage.warning('请输入管理员密码')
    return
  }

  try {
    const response = await systemConfigApi.restartSystem()
    if (response.code === 200) {
      ElMessage.success('系统重启中，请稍候...')
      restartDialogVisible.value = false
      // 可以在这里添加定时器，定期检查系统是否已重启完成
    }
  } catch (error) {
    ElMessage.error('重启系统失败')
    console.error('重启系统失败:', error)
  }
}

// 查询
function handleQuery() {
  queryParams.page = 1
  getConfigList()
}

// 重置查询
function resetQuery() {
  Object.assign(queryParams, {
    configKey: '',
    groupName: '',
    page: 1,
    pageSize: 20
  })
  getConfigList()
}

// 分页大小改变
function handleSizeChange(pageSize: number) {
  queryParams.pageSize = pageSize
  getConfigList()
}

// 当前页改变
function handleCurrentChange(page: number) {
  queryParams.page = page
  getConfigList()
}

// 显示添加对话框
function showAddDialog() {
  resetAddForm()
  addDialogVisible.value = true
}

// 重置添加表单
function resetAddForm() {
  Object.assign(addForm, {
    configKey: '',
    configValue: '',
    description: '',
    configType: 'string',
    groupName: '',
    isActive: true
  })
  if (addFormRef.value) {
    addFormRef.value.resetFields()
  }
}

// 提交添加表单
async function submitAddForm() {
  if (addFormRef.value) {
    await addFormRef.value.validate(async (valid: boolean) => {
      if (valid) {
        try {
          // 根据配置类型转换值
          const formData = { ...addForm }
          formData.configValue = convertConfigValue(formData.configValue, formData.configType)
          
          const response = await systemConfigApi.updateConfig(formData)
          if (response.code === 200) {
            ElMessage.success('添加配置成功')
            addDialogVisible.value = false
            await getConfigList()
          }
        } catch (error) {
          ElMessage.error('添加配置失败')
          console.error('添加配置失败:', error)
        }
      }
    })
  }
}

// 编辑配置
function editConfig(row: SystemConfig) {
  // 克隆配置项，避免直接修改表格数据
  Object.assign(editForm, { ...row })
  // 确保配置值是字符串格式
  if (typeof editForm.configValue !== 'string') {
    editForm.configValue = JSON.stringify(editForm.configValue)
  }
  editDialogVisible.value = true
}

// 重置编辑表单
function resetEditForm() {
  Object.assign(editForm, {
    configKey: '',
    configValue: '',
    description: '',
    configType: 'string',
    groupName: '',
    isActive: true
  })
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
}

// 提交编辑表单
async function submitEditForm() {
  if (editFormRef.value) {
    await editFormRef.value.validate(async (valid: boolean) => {
      if (valid) {
        try {
          // 根据配置类型转换值
          const formData = { ...editForm }
          formData.configValue = convertConfigValue(formData.configValue, formData.configType)
          
          const response = await systemConfigApi.updateConfig(formData)
          if (response.code === 200) {
            ElMessage.success('编辑配置成功')
            editDialogVisible.value = false
            await getConfigList()
          }
        } catch (error) {
          ElMessage.error('编辑配置失败')
          console.error('编辑配置失败:', error)
        }
      }
    })
  }
}

// 批量更新配置
async function submitBatchUpdateForm() {
  if (!selectedConfigs.value || selectedConfigs.value.length === 0) {
    ElMessage.warning('请选择要批量编辑的配置项')
    return
  }

  try {
    // 处理配置值类型转换
    const updateData = selectedConfigs.value.map(config => {
      const item = { ...config }
      item.configValue = convertConfigValue(item.configValue, item.configType)
      return item
    })
    
    const response = await systemConfigApi.batchUpdateConfig(updateData)
    if (response.code === 200) {
      ElMessage.success('批量更新配置成功')
      batchUpdateDialogVisible.value = false
      await getConfigList()
    }
  } catch (error) {
    ElMessage.error('批量更新配置失败')
    console.error('批量更新配置失败:', error)
  }
}

// 删除配置
async function deleteConfig(configKey: string) {
  try {
    await ElMessageBox.confirm(`确定要删除配置项「${configKey}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 这里使用updateConfig接口，将配置设置为非激活状态
    // 实际项目中可能需要专门的删除接口
    const response = await systemConfigApi.updateConfig({
      configKey,
      isActive: false
    })
    if (response.code === 200) {
      ElMessage.success('删除配置成功')
      await getConfigList()
    }
  } catch (error) {
    // 忽略取消操作的错误
    if (error !== 'cancel') {
      ElMessage.error('删除配置失败')
      console.error('删除配置失败:', error)
    }
  }
}

// 切换配置状态
async function toggleConfigStatus(row: SystemConfig) {
  try {
    await systemConfigApi.updateConfig({
      configKey: row.configKey,
      isActive: row.isActive
    })
    ElMessage.success('状态更新成功')
  } catch (error) {
    // 失败时恢复原状态
    row.isActive = !row.isActive
    ElMessage.error('状态更新失败')
    console.error('状态更新失败:', error)
  }
}

// 处理选择变化
function handleSelectionChange(selection: SystemConfig[]) {
  selectedConfigs.value = selection
}

// 根据类型获取标签样式
function getTypeTagType(type: string) {
  switch (type) {
    case 'string': return 'primary'
    case 'number': return 'success'
    case 'boolean': return 'warning'
    case 'json': return 'info'
    default: return 'default'
  }
}

// 转换配置值类型
function convertConfigValue(value: any, type: string) {
  if (value === null || value === undefined) return value
  
  const stringValue = String(value)
  
  switch (type) {
    case 'number':
      return Number(stringValue)
    case 'boolean':
      return stringValue.toLowerCase() === 'true' || stringValue === '1'
    case 'json':
      try {
        return JSON.parse(stringValue)
      } catch {
        return stringValue
      }
    default:
      return stringValue
  }
}

// 格式化日期
function formatDate(date: string | Date) {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const seconds = d.getSeconds().toString().padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 处理文件下载
function handleFileDownload(response: any, filename: string) {
  // 创建blob对象
  const blob = new Blob([response], { type: 'application/json' })
  
  // 创建下载链接
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  
  // 触发下载
  document.body.appendChild(link)
  link.click()
  
  // 清理
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

// 导出所有需要在模板中使用的变量和函数
defineExpose({
  refreshConfig,
  exportConfig,
  handleImportConfig,
  backupConfig,
  showRestoreDialog,
  clearCache,
  showRestartDialog,
  confirmRestart,
  handleQuery,
  resetQuery,
  showAddDialog,
  resetAddForm,
  submitAddForm,
  editConfig,
  resetEditForm,
  submitEditForm,
  submitBatchUpdateForm,
  deleteConfig,
  toggleConfigStatus,
  handleSelectionChange,
  getTypeTagType,
  convertConfigValue,
  formatDate,
  handleFileDownload
})
</script>

<style scoped>
.system-config-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.system-info-cards {
  margin-bottom: 20px;
}

.info-card {
  height: 100%;
}

.card-header {
  font-weight: 500;
  font-size: 14px;
}

.info-content p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
}

.info-content p strong {
  color: #303133;
  margin-right: 8px;
}

.config-query-area {
  margin-bottom: 20px;
}

.query-form {
  margin-bottom: 20px;
}

.json-value {
  max-height: 100px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.json-value pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.warning-message {
  padding: 20px 0;
}

.restore-content {
  padding: 20px 0;
}
</style>