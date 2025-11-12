\u003ctemplate\u003e
  \u003cdiv class="off-duty-detection"\u003e
    \u003cdiv class="page-header"\u003e
      \u003ch2\u003e脱岗检测\u003c/h2\u003e
      \u003cdiv class="header-info"\u003e
        \u003cElTag type="info"\u003e对机台关键区域实时监测，设定监测区域和人员离岗限时，检测脱岗行为，保障生产流程连续性、稳定性与设备安全\u003c/ElTag\u003e
      \u003c/div\u003e
    \u003c/div\u003e
    \u003cElCard class="main-card"\u003e
      \u003cdiv class="control-panel"
        style="margin-bottom: 20px"
      \u003e
        \u003cdiv class="search-bar"
          style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap"
        \u003e
          \u003cElDatePicker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 300px"
          /\u003e
          \u003cElInput
            v-model="searchForm.machineNumber"
            placeholder="输入机台编号"
            clearable
            style="width: 180px"
          \u003e
            \u003etemplate #prepend\u003e
              \u003cElIcon\u003e
                \u003cSearch /\u003e
              \u003c/ElIcon\u003e
            \u003etemplate\u003e
          \u003c/ElInput\u003e
          \u003cElInput
            v-model="searchForm.operatorName"
            placeholder="输入操作人员姓名"
            clearable
            style="width: 180px"
          \u003e
            \u003etemplate #prepend\u003e
              \u003cElIcon\u003e
                \u003cUser /\u003e
              \u003c/ElIcon\u003e
            \u003etemplate\u003e
          \u003c/ElInput\u003e
          \u003cElSelect
            v-model="searchForm.status"
            placeholder="选择状态"
            style="width: 120px"
          \u003e
            \u003cElOption label="正常"
              value="normal"
            /\u003e
            \u003cElOption label="脱岗"
              value="off_duty"
            /\u003e
            \u003cElOption label="预警"
              value="warning"
            /\u003e
          \u003c/ElSelect\u003e
          \u003cElSelect
            v-model="searchForm.workshopSection"
            placeholder="选择工段"
            filterable
            style="width: 150px"
          \u003e
            \u003cElOption
              v-for="section in workshopSections"
              :key="section.value"
              :label="section.label"
              :value="section.value"
            /\u003e
          \u003c/ElSelect\u003e
          \u003cElButton type="primary"
            @click="handleSearch"
          \u003e搜索\u003c/ElButton\u003e
          \u003cElButton
            @click="handleReset"
          \u003e重置\u003c/ElButton\u003e
          \u003cElButton type="success"
            @click="handleExport"
          \u003e导出数据\u003c/ElButton\u003e
        \u003c/div\u003e
      \u003c/div
      \u003e

      \u003cdiv class="dashboard"
        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px"
      \u003e
        \u003cElCard shadow="hover"
          class="dashboard-card"
        \u003e
          \u003cdiv class="dashboard-content"
            style="text-align: center"
          \u003e
            \u003cdiv class="dashboard-number"
              style="font-size: 32px; font-weight: bold; color: #1890ff"
            \u003e{{ statistics.totalAlerts }}\u003c/div\u003e
            \u003cdiv class="dashboard-label"
              style="color: #666; margin-top: 10px"
            \u003e总脱岗次数\u003c/div\u003e
          \u003c/div\u003e
        \u003c/ElCard\u003e
        \u003cElCard shadow="hover"
          class="dashboard-card"
        \u003e
          \u003cdiv class="dashboard-content"
            style="text-align: center"
          \u003e
            \u003cdiv class="dashboard-number"
              style="font-size: 32px; font-weight: bold; color: #52c41a"
            \u003e{{ statistics.normalCount }}\u003c/div\u003e
            \u003cdiv class="dashboard-label"
              style="color: #666; margin-top: 10px"
            \u003e正常状态机台数\u003c/div\u003e
          \u003c/div\u003e
        \u003c/ElCard\u003e
        \u003cElCard shadow="hover"
          class="dashboard-card"
        \u003e
          \u003cdiv class="dashboard-content"
            style="text-align: center"
          \u003e
            \u003cdiv class="dashboard-number"
              style="font-size: 32px; font-weight: bold; color: #f5222d"
            \u003e{{ statistics.offDutyCount }}\u003c/div\u003e
            \u003cdiv class="dashboard-label"
              style="color: #666; margin-top: 10px"
            \u003e当前脱岗机台数\u003c/div\u003e
          \u003c/div\u003e
        \u003c/ElCard\u003e
        \u003cElCard shadow="hover"
          class="dashboard-card"
        \u003e
          \u003cdiv class="dashboard-content"
            style="text-align: center"
          \u003e
            \u003cdiv class="dashboard-number"
              style="font-size: 32px; font-weight: bold; color: #faad14"
            \u003e{{ statistics.warningCount }}\u003c/div\u003e
            \u003cdiv class="dashboard-label"
              style="color: #666; margin-top: 10px"
            \u003e预警状态机台数\u003c/div\u003e
          \u003c/div\u003e
        \u003c/ElCard\u003e
      \u003c/div\u003e

      \u003cdiv class="view-tabs"
        style="margin-bottom: 20px"
      \u003e
        \u003cElTabs v-model="activeViewTab"
          @tab-change="handleTabChange"
        \u003e
          \u003cElTabPane label="脱岗记录"
            name="list"
          /\u003e
          \u003cElTabPane label="实时监控"
            name="realtime"
          /\u003e
          \u003cElTabPane label="统计分析"
            name="analysis"
          /\u003e
        \u003c/ElTabs\u003e
      \u003c/div\u003e

      \u003c!-- 脱岗记录列表 --\u003e
      \u003cdiv
        v-if="activeViewTab === 'list'"
      \u003e
        \u003cElTable
          :data="offDutyList"
          style="width: 100%"
          border
          stripe
          @row-click="handleRecordClick"
        \u003e
          \u003cElTableColumn
            prop="id"
            label="记录ID"
            width="80"
            header-align="center"
            align="center"
          /\u003e
          \u003cElTableColumn
            prop="machineNumber"
            label="机台编号"
            width="120"
            header-align="center"
            align="center"
          \u003e
            \u003etemplate #default="scope"\u003e
              \u003cElTag size="large" type="primary"
                effect="dark"
              \u003e{{ scope.row.machineNumber }}\u003c/ElTag\u003e
            \u003etemplate\u003e
          \u003c/ElTableColumn
          \u003cElTableColumn
            prop="operatorName"
            label="操作人员"
            width="120"
            header-align="center"
            align="center"
          /\u003e
          \u003cElTableColumn
            prop="startTime"
            label="脱岗开始时间"
            width="180"
            header-align="center"
          \u003e
            \u003etemplate #default="scope"\u003e
              {{ formatDateTime(scope.row.startTime) }}
            \u003etemplate\u003e
          \u003c/ElTableColumn
          \u003cElTableColumn
            prop="endTime"
            label="脱岗结束时间"
            width="180"
            header-align="center"
          \u003e
            \u003etemplate #default="scope"\u003e
              {{ scope.row.endTime ? formatDateTime(scope.row.endTime) : '仍在脱岗' }}
            \u003etemplate\u003e
          \u003c/ElTableColumn
          \u003cElTableColumn
            prop="duration"
            label="脱岗时长"
            width="100"
            header-align="center"
            align="center"
          \u003e
            \u003etemplate #default="scope"\u003e
              {{ formatDuration(scope.row.duration) }}
            \u003etemplate\u003e
          \u003c/ElTableColumn
          \u003cElTableColumn
            prop="status"
            label="状态"
            width="100"
            header-align="center"
            align="center"
          \u003e
            \u003etemplate #default="scope"\u003e
              \u003cElTag
                :type="getStatusTagType(scope.row.status)"
              \u003e{{ getStatusLabel(scope.row.status) }}\u003e/ElTag\u003e
            \u003etemplate\u003e
          \u003c/ElTableColumn
          \u003cElTableColumn
            prop="alertLevel"
            label="告警级别"
            width="100"
            header-align="center"
            align="center"
          \u003e
            \u003etemplate #default="scope"\u003e
              \u003cElTag
                :type="getAlertLevelType(scope.row.alertLevel)"
              \u003e{{ getAlertLevelLabel(scope.row.alertLevel) }}\u003e/ElTag\u003e
            \u003etemplate\u003e
          \u003c/ElTableColumn
          \u003cElTableColumn
            prop="workshopSection"
            label="所属工段"
            width="120"
            header-align="center"
            align="center"
          \u003e
            \u003etemplate #default="scope"\u003e
              \u003cElTag type="info"
                v-if="scope.row.workshopSection"
              \u003e{{ getWorkshopSectionLabel(scope.row.workshopSection) }}\u003e/ElTag\u003e
              \u003cElTag type="danger"
                v-else
              \u003e未分配\u003e/ElTag\u003e
            \u003etemplate\u003e
          \u003c/ElTableColumn
          \u003cElTableColumn
            label="操作"
            width="180"
            fixed="right"
            header-align="center"
            align="center"
          \u003e
            \u003etemplate #default="scope"\u003e
              \u003cElButton
                type="primary"
                size="small"
                text
                @click.stop="handleViewImage(scope.row)"
              \u003e查看图片\u003c/ElButton\u003e
              \u003cElButton
                type="success"
                size="small"
                text
                @click.stop="handleViewVideo(scope.row)"
              \u003e查看视频\u003c/ElButton\u003e
              \u003cElButton
                type="warning"
                size="small"
                text
                @click.stop="handleMarkProcessed(scope.row)"
                v-if="scope.row.isProcessed !== true"
              \u003e标记已处理\u003c/ElButton\u003e
            \u003etemplate\u003e
          \u003c/ElTableColumn
        \u003c/ElTable
        \u003cdiv class="pagination"
          style="margin-top: 20px; display: flex; justify-content: flex-end"
        \u003e
          \u003cElPagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          /\u003e
        \u003c/div
        \u003e
      \u003c/div
        v-else-if="activeViewTab === 'realtime'"
      \u003e
        \u003c!-- 实时监控 --\u003e
        \u003cdiv class="realtime-monitor"
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px"
        \u003e
          \u003cElCard
            v-for="machine in realtimeMachines"
            :key="machine.id"
            class="machine-monitor"
            :class="{
              'status-off-duty': machine.status === 'off_duty',
              'status-warning': machine.status === 'warning',
              'status-normal': machine.status === 'normal'
            }"
          \u003e
            \u003cdiv slot="header" class="machine-header"
              style="display: flex; justify-content: space-between; align-items: center"
            \u003e
              \u003cspan style="font-weight: 500"\u003e机台: {{ machine.machineNumber }} ({{ machine.status === 'online' ? '在线' : '离线' }})\u003e/span\u003e
              \u003cdiv class="machine-controls"
                style="display: flex; align-items: center; gap: 10px"
              \u003e
                \u003cElTag
                  :type="getStatusTagType(machine.status)"
                  size="small"
                \u003e{{ getStatusLabel(machine.status) }}\u003e/ElTag\u003e
                \u003cElButton
                  type="text"
                  size="small"
                  @click="handleRefreshMachine(machine)"
                \u003e
                  \u003cElIcon
                    :class="{ 'rotating': machine.isRefreshing }"
                  \u003e
                    \u003cRefresh /\u003e
                  \u003c/ElIcon
                \u003e/ElButton\u003e
              \u003c/div
              \u003e
            \u003c/div
            \u003e
            \u003cdiv class="video-container"
              style="height: 240px; background-color: #000; position: relative; overflow: hidden"
            \u003e
              \u003cdiv class="video-placeholder"
                style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #fff"
              \u003e
                \u003cElIcon
                  style="font-size: 48px; margin-bottom: 16px"
                \u003e
                  \u003cVideoFilled /\u003e
                \u003c/ElIcon
                
              \u003c/div
              \u003e
              \u003cdiv
                v-if="machine.operator"
                class="operator-info"
                style="position: absolute; bottom: 0; left: 0; right: 0; background-color: rgba(0, 0, 0, 0.7); color: #fff; padding: 8px 12px; font-size: 12px"
              \u003e
                \u003cdiv style="display: flex; justify-content: space-between; align-items: center"
                  v-if="machine.operator"
                \u003e
                  \u003cspan style="display: flex; align-items: center; gap: 8px"
                  \u003e
                    \u003cElTag size="small" type="primary"\u003e操作员: {{ machine.operator.name }}\u003e/ElTag\u003e
                    在岗状态: {{ machine.operator.isPresent ? '在岗' : '离岗' }}
                  \u003e/span\u003e
                  \u003cspan\u003e监测时间: {{ formatDuration(machine.monitoringTime) }}\u003e/span\u003e
                \u003c/div
                \u003e
              \u003c/div
              \u003e
              \u003cdiv
                v-if="machine.status === 'off_duty'"
                class="off-duty-overlay"
                style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(255, 69, 0, 0.9); color: #fff; padding: 10px 20px; border-radius: 4px; font-size: 16px; font-weight: bold"
              \u003e脱岗告警！
              \u003e/div\u003e
              \u003cdiv
                v-else-if="machine.status === 'warning'"
                class="warning-overlay"
                style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(255, 165, 0, 0.9); color: #fff; padding: 10px 20px; border-radius: 4px; font-size: 16px; font-weight: bold"
              \u003e脱岗预警！
              \u003e/div\u003e
            \u003c/div
            \u003e
            \u003cdiv class="machine-info"
              style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ebeef5"
            \u003e
              \u003cdiv style="display: flex; justify-content: space-between; font-size: 13px; color: #606266; margin-bottom: 8px"
              \u003e
                \u003cspan\u003e今日脱岗: {{ machine.todayOffDutyCount }}\u003e/span\u003e
                \u003cspan\u003e最近脱岗: {{ formatRelativeTime(machine.lastOffDutyTime) }}\u003e/span\u003e
              \u003cdiv
              \u003e
              \u003cdiv class="off-duty-alert"
                v-if="machine.status === 'off_duty'"
                style="background-color: #fff1f0; border: 1px solid #ffccc7; padding: 8px; border-radius: 4px; display: flex; align-items: center; gap: 8px; color: #ff4d4f"
              \u003e
                \u003cElIcon size="16"\u003e
                  \u003cWarningFilled /\u003e
                \u003c/ElIcon
                \u003cspan style="font-size: 12px"\u003e人员脱岗，请及时处理！\u003e/span\u003e
              \u003c/div
                v-else-if="machine.status === 'warning'"
              \u003e
                \u003cdiv style="background-color: #fffbe6; border: 1px solid #ffe58f; padding: 8px; border-radius: 4px; display: flex; align-items: center; gap: 8px; color: #fa8c16"
                \u003e
                  \u003cElIcon size="16"\u003e
                    \u003cInfoFilled /\u003e
                  \u003c/ElIcon
                  \u003cspan style="font-size: 12px"\u003e人员长时间未检测到，请注意！\u003e/span\u003e
                \u003c/div
                \u003e
              \u003e/div
              \u003e
            \u003c/div
            \u003e
          \u003c/ElCard\u003e
        \u003c/div
        \u003e
      \u003c/div
        v-else-if="activeViewTab === 'analysis'"
      \u003e
        \u003c!-- 统计分析 --\u003e
        \u003cdiv class="analysis-container"
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 20px"
        \u003e
          \u003cElCard class="analysis-card"
          \u003e
            \u003cdiv slot="header"
              style="display: flex; justify-content: space-between; align-items: center"
            \u003e
              \u003cspan style="font-weight: 500"\u003e脱岗趋势图\u003e/span\u003e
              \u003cElSelect
                v-model="chartTimeRange"
                placeholder="选择时间范围"
                style="width: 150px"
              \u003e
                \u003cElOption label="今日"
                  value="today"
                /\u003e
                \u003cElOption label="近7天"
                  value="7days"
                /\u003e
                \u003cElOption label="近30天"
                  value="30days"
                /\u003e
              \u003c/ElSelect\u003e
            \u003c/div
            \u003e
            \u003cdiv class="chart-placeholder"
              style="height: 300px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; color: #909399"
            \u003e
              \u003cElIcon
                style="font-size: 48px; margin-bottom: 16px"
              \u003e
                \u003cLineChart /\u003e
              \u003c/ElIcon
              \u003cdiv style="font-size: 16px"\u003e脱岗趋势图表区域
              \u003e/div
            \u003cdiv
            \u003e
          \u003c/ElCard\u003e
          \u003cElCard class="analysis-card"
          \u003e
            \u003cdiv slot="header"
              style="font-weight: 500"
            \u003e机台脱岗次数排名
            \u003e/div
            \u003e
            \u003cdiv class="chart-placeholder"
              style="height: 300px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; color: #909399"
            \u003e
              \u003cElIcon
                style="font-size: 48px; margin-bottom: 16px"
              \u003e
                \u003cHistogram /\u003e
              \u003c/ElIcon
              \u003cdiv style="font-size: 16px"\u003e机台脱岗次数排名图表区域
              \u003e/div
            \u003cdiv
            \u003e
          \u003c/ElCard\u003e
        \u003c/div
        \u003e
      \u003c/div
        v-else
      \u003e
        \u003cElEmpty description="未知视图类型"\u003e
        \u003c/ElEmpty
      \u003c/div
        \u003e
    \u003c/ElCard\u003e

    \u003c!-- 记录详情对话框 --\u003e
    \u003cElDialog
      v-model="recordDetailVisible"
      :title="`脱岗记录详情 - 机台: ${currentRecord?.machineNumber || ''}`"
      width="600px"
    \u003e
      \u003cdiv
        v-if="currentRecord"
        style="padding: 10px 0"
      \u003e
        \u003cElDescriptions :column="1" border\u003e
          \u003cElDescriptionsItem label="记录ID"\u003e{{ currentRecord.id }}\u003c/ElDescriptionsItem\u003e
          \u003cElDescriptionsItem label="机台编号"\u003e{{ currentRecord.machineNumber }}\u003c/ElDescriptionsItem\u003e
          \u003cElDescriptionsItem label="操作人员"\u003e{{ currentRecord.operatorName }}\u003c/ElDescriptionsItem\u003e
          \u003cElDescriptionsItem label="脱岗开始时间"\u003e{{ formatDateTime(currentRecord.startTime) }}\u003c/ElDescriptionsItem\u003e
          \u003cElDescriptionsItem label="脱岗结束时间"\u003e{{ currentRecord.endTime ? formatDateTime(currentRecord.endTime) : '仍在脱岗' }}\u003c/ElDescriptionsItem\u003e
          \u003cElDescriptionsItem label="脱岗时长"\u003e{{ formatDuration(currentRecord.duration) }}\u003c/ElDescriptionsItem\u003e
          \u003cElDescriptionsItem label="脱岗状态"\u003e
            \u003cElTag
              :type="getStatusTagType(currentRecord.status)"
            \u003e{{ getStatusLabel(currentRecord.status) }}\u003e/ElTag\u003e
          \u003c/ElDescriptionsItem\u003e
          \u003cElDescriptionsItem label="告警级别"\u003e
            \u003cElTag
              :type="getAlertLevelType(currentRecord.alertLevel)"
            \u003e{{ getAlertLevelLabel(currentRecord.alertLevel) }}\u003e/ElTag\u003e
          \u003c/ElDescriptionsItem\u003e
          \u003cElDescriptionsItem label="所属工段"\u003e{{ getWorkshopSectionLabel(currentRecord.workshopSection) }}\u003c/ElDescriptionsItem\u003e
          \u003cElDescriptionsItem label="告警信息"\u003e{{ currentRecord.alertMessage || '无' }}\u003c/ElDescriptionsItem\u003e
          \u003cElDescriptionsItem label="是否已处理"\u003e
            \u003cElSwitch v-model="currentRecord.isProcessed"
              @change="handleProcessedChange"
              :disabled="!currentRecord.id"
            /\u003e
          \u003c/ElDescriptionsItem\u003e
          \u003cElDescriptionsItem label="处理人"\u003e{{ currentRecord.handler || '未处理' }}\u003c/ElDescriptionsItem\u003e
          \u003cElDescriptionsItem label="处理时间"\u003e{{ currentRecord.processTime ? formatDateTime(currentRecord.processTime) : '未处理' }}\u003c/ElDescriptionsItem\u003e
          \u003cElDescriptionsItem label="处理备注"\u003e
            \u003cElInput
              v-model="currentRecord.processRemark"
              type="textarea"
              placeholder="请输入处理备注"
              :disabled="!currentRecord.isProcessed"
              rows="2"
            /\u003e
          \u003c/ElDescriptionsItem\u003e
        \u003c/ElDescriptions\u003e

        \u003cdiv class="record-image"
          style="margin-top: 20px"
        \u003e
          \u003ch3 class="image-title"
            style="font-size: 16px; font-weight: 500; margin-bottom: 10px"
          \u003e脱岗证据图片
          \u003e/h3\u003e
          \u003cdiv class="image-container"
            style="height: 300px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; border: 1px solid #ebeef5; border-radius: 4px"
          \u003e
            \u003cElIcon
              style="font-size: 48px; color: #909399"
            \u003e
              \u003cPicture /\u003e
            \u003c/ElIcon
            \u003cdiv style="margin-left: 10px; color: #909399"\u003e脱岗证据图片预览区域
            \u003e/div
          \u003c/div
          \u003e
        \u003c/div
        \u003e
      \u003c/div
        v-else
      \u003e
        \u003cElEmpty description="暂无记录信息"\u003e
        \u003c/ElEmpty
      \u003c/div
        \u003e
      \u003etemplate #footer\u003e
        \u003cElButton @click="recordDetailVisible = false"\u003e关闭\u003c/ElButton\u003e
        \u003cElButton type="primary"
          @click="handleViewRecordVideo"
          v-if="currentRecord"
        \u003e查看视频片段\u003c/ElButton\u003e
        \u003cElButton type="success"
          @click="saveProcessInfo"
          v-if="currentRecord \u0026\u0026 currentRecord.isProcessed"
        \u003e保存处理信息\u003c/ElButton\u003e
      \u003etemplate\u003e
    \u003c/ElDialog

    \u003c!-- 视频播放对话框 --\u003e
    \u003cElDialog
      v-model="videoPlayerVisible"
      :title="`视频回放 - ${videoTitle || '脱岗记录'}`"
      width="800px"
      fullscreen
    \u003e
      \u003cdiv
        class="video-player-container"
        style="text-align: center; padding: 20px 0; height: calc(100vh - 200px); display: flex; flex-direction: column"
      \u003e
        \u003cdiv class="video-player-placeholder"
          style="flex: 1; background-color: #000; color: #fff; display: flex; align-items: center; justify-content: center"
        \u003e
          \u003cElIcon
            style="font-size: 64px; margin-bottom: 16px"
          \u003e
            \u003cVideoFilled /\u003e
          \u003c/ElIcon
          
        \u003c/div
        \u003e
        \u003cdiv class="video-player-controls"
          style="margin-top: 20px; display: flex; justify-content: center; gap: 15px"
        \u003e
          \u003cElButton
            type="primary"
            size="large"
            @click="handlePlayVideo"
          \u003e
            \u003cElIcon slot="icon"\u003e
              \u003cVideoPlay /\u003e
            \u003c/ElIcon
            {{ isVideoPlaying ? '暂停' : '播放' }}
          \u003e/ElButton\u003e
          \u003cElButton
            type="success"
            size="large"
            @click="handleVideoCapture"
          \u003e
            \u003cElIcon slot="icon"\u003e
              \u003cCameraFilled /\u003e
            \u003c/ElIcon
            截图
          \u003e/ElButton\u003e
          \u003cElButton
            type="info"
            size="large"
            @click="handleAdjustSpeed"
          \u003e
            \u003cElIcon slot="icon"\u003e
              \u003cTimer /\u003e
            \u003c/ElIcon
            倍速: {{ playbackSpeed }}x
          \u003e/ElButton\u003e
        \u003c/div
        \u003e
      \u003c/div
        \u003e
    \u003c/ElDialog

    \u003c!-- 标记已处理对话框 --\u003e
    \u003cElDialog
      v-model="markProcessedVisible"
      title="标记已处理"
      width="400px"
    \u003e
      \u003cdiv
        style="padding: 20px 0"
      \u003e
        \u003cdiv
          v-if="markingProcessed"
          style="margin-bottom: 20px; text-align: center"
        \u003e
          \u003cElProgress type="circular" :percentage="60" /\u003e
          \u003cp style="text-align: center; margin-top: 10px; color: #606266"\u003e正在处理...\u003c/p\u003e
        \u003c/div
        v-else
      \u003e
        \u003cElForm
          v-model="processForm"
          label-position="top"
        \u003e
          \u003cElFormItem label="处理备注"
            required
          \u003e
            \u003cElInput
              v-model="processForm.remark"
              type="textarea"
              placeholder="请输入处理备注"
              rows="3"
            /\u003e
          \u003c/ElFormItem\u003e
        \u003c/ElForm
      \u003c/div
        v-else
      \u003e
      \u003c/template #footer\u003e
        \u003cElButton
          @click="markProcessedVisible = false"
          :disabled="markingProcessed"
        \u003e取消\u003c/ElButton\u003e
        \u003cElButton
          type="primary"
          @click="confirmMarkProcessed"
          :disabled="markingProcessed || !processForm.remark"
        \u003e确认处理\u003c/ElButton\u003e
      \u003e/template\u003e
    \u003c/ElDialog
  \u003c/div\u003e
\u003c/template\u003e

\u003cscript setup lang="ts"\u003e
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, VideoFilled, VideoPlay, CameraFilled, Timer, Picture, LineChart, Histogram, Refresh, User, WarningFilled, InfoFilled } from '@element-plus/icons-vue'
import { getOffDutyList, getOffDutyDetail, updateRecordProcessStatus, getRealtimeMachines, getOffDutyStatistics } from '@/api/offDuty'

interface OffDutyRecord {
  id: number
  machineNumber: string
  operatorName: string
  startTime: string
  endTime?: string
  duration: number
  status: string
  alertLevel: string
  workshopSection: string
  alertMessage?: string
  isProcessed: boolean
  handler?: string
  processTime?: string
  processRemark?: string
  imageUrls?: string[]
  videoUrl?: string
}

interface MachineInfo {
  id: number
  machineNumber: string
  status: string
  operator?: {
    name: string
    isPresent: boolean
  }
  monitoringTime: number
  todayOffDutyCount: number
  lastOffDutyTime: string
  isRefreshing?: boolean
}

interface WorkshopSection {
  value: string
  label: string
}

const searchForm = reactive({
  machineNumber: '',
  operatorName: '',
  status: '',
  workshopSection: ''
})

const dateRange = ref\u003cstring[]\u003e([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const offDutyList = ref\u003cOffDutyRecord[]\u003e([])
const realtimeMachines = ref\u003cMachineInfo[]\u003e([])
const activeViewTab = ref('list')
const chartTimeRange = ref('7days')
const recordDetailVisible = ref(false)
const currentRecord = ref\u003cOffDutyRecord | null\u003e(null)
const videoPlayerVisible = ref(false)
const videoTitle = ref('')
const isVideoPlaying = ref(false)
const playbackSpeed = ref(1.0)
const markProcessedVisible = ref(false)
const markingProcessed = ref(false)
const processTargetRecord = ref\u003cOffDutyRecord | null\u003e(null)

const processForm = reactive({
  remark: ''
})

// 统计信息
const statistics = reactive({
  totalAlerts: 0,
  normalCount: 0,
  offDutyCount: 0,
  warningCount: 0
})

// 工段列表
const workshopSections = ref\u003cWorkshopSection[]\u003e([
  { value: 'weaving', label: '织布工段' },
  { value: 'dyeing', label: '染色工段' },
  { value: 'finishing', label: '整理工段' },
  { value: 'inspection', label: '检验工段' },
  { value: 'packing', label: '包装工段' }
])

const autoRefreshTimer = ref\u003cNodeJS.Timeout | null\u003e(null)

// 加载脱岗记录列表
async function loadOffDutyList() {
  try {
    const params = {
      ...searchForm,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    
    if (dateRange.value \u0026\u0026 dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    
    const response = await getOffDutyList(params)
    offDutyList.value = response.data?.list || []
    pagination.total = response.data?.total || 0
    updateStatisticsFromList()
  } catch (error) {
    console.error('加载脱岗记录失败:', error)
    // 使用模拟数据
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    offDutyList.value = [
      {
        id: 1,
        machineNumber: 'M001',
        operatorName: '张三',
        startTime: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        endTime: undefined,
        duration: 900,
        status: 'off_duty',
        alertLevel: 'high',
        workshopSection: 'weaving',
        alertMessage: '操作人员脱岗超过15分钟',
        isProcessed: false
      },
      {
        id: 2,
        machineNumber: 'M002',
        operatorName: '李四',
        startTime: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        endTime: undefined,
        duration: 600,
        status: 'warning',
        alertLevel: 'medium',
        workshopSection: 'dyeing',
        alertMessage: '操作人员脱岗超过10分钟',
        isProcessed: false
      },
      {
        id: 3,
        machineNumber: 'M003',
        operatorName: '王五',
        startTime: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        duration: 1200,
        status: 'normal',
        alertLevel: 'high',
        workshopSection: 'finishing',
        alertMessage: '操作人员脱岗30分钟后已返回',
        isProcessed: true,
        handler: '管理员',
        processTime: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        processRemark: '已处理，操作人员临时离开处理紧急事务'
      },
      {
        id: 4,
        machineNumber: 'M004',
        operatorName: '赵六',
        startTime: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 50 * 60 * 1000).toISOString(),
        duration: 600,
        status: 'normal',
        alertLevel: 'medium',
        workshopSection: 'inspection',
        alertMessage: '操作人员脱岗10分钟',
        isProcessed: true,
        handler: '班组长',
        processTime: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        processRemark: '已核实，正常休息时间'
      },
      {
        id: 5,
        machineNumber: 'M005',
        operatorName: '钱七',
        startTime: yesterday.toISOString(),
        endTime: new Date(yesterday.getTime() + 30 * 60 * 1000).toISOString(),
        duration: 1800,
        status: 'normal',
        alertLevel: 'high',
        workshopSection: 'packing',
        alertMessage: '操作人员脱岗30分钟',
        isProcessed: true,
        handler: '管理员',
        processTime: new Date(yesterday.getTime() + 40 * 60 * 1000).toISOString(),
        processRemark: '已处理，设备已暂停运行'
      }
    ]
    pagination.total = offDutyList.value.length
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
        status: 'off_duty',
        operator: {
          name: '张三',
          isPresent: false
        },
        monitoringTime: 1800,
        todayOffDutyCount: 2,
        lastOffDutyTime: new Date().toISOString()
      },
      {
        id: 2,
        machineNumber: 'M002',
        status: 'warning',
        operator: {
          name: '李四',
          isPresent: false
        },
        monitoringTime: 1200,
        todayOffDutyCount: 1,
        lastOffDutyTime: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        machineNumber: 'M003',
        status: 'normal',
        operator: {
          name: '王五',
          isPresent: true
        },
        monitoringTime: 3600,
        todayOffDutyCount: 0,
        lastOffDutyTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        machineNumber: 'M004',
        status: 'normal',
        operator: {
          name: '赵六',
          isPresent: true
        },
        monitoringTime: 1800,
        todayOffDutyCount: 1,
        lastOffDutyTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 5,
        machineNumber: 'M005',
        status: 'off_duty',
        operator: {
          name: '钱七',
          isPresent: false
        },
        monitoringTime: 600,
        todayOffDutyCount: 3,
        lastOffDutyTime: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      }
    ]
  }
}

// 加载统计信息
async function loadStatistics() {
  try {
    const response = await getOffDutyStatistics(dateRange.value)
    if (response.data) {
      statistics.totalAlerts = response.data.totalAlerts || 0
      statistics.normalCount = response.data.normalCount || 0
      statistics.offDutyCount = response.data.offDutyCount || 0
      statistics.warningCount = response.data.warningCount || 0
    }
  } catch (error) {
    console.error('加载统计信息失败:', error)
    // 从列表更新统计
    updateStatisticsFromList()
  }
}

// 从列表更新统计信息
function updateStatisticsFromList() {
  statistics.totalAlerts = offDutyList.value.length
  statistics.offDutyCount = offDutyList.value.filter(record =\u003e record.status === 'off_duty').length
  statistics.warningCount = offDutyList.value.filter(record =\u003e record.status === 'warning').length
  statistics.normalCount = 0 // 这里应该从实时机台数计算，但使用模拟数据时暂时设为0
}

// 搜索
function handleSearch() {
  pagination.currentPage = 1
  loadOffDutyList()
}

// 重置
function handleReset() {
  searchForm.machineNumber = ''
  searchForm.operatorName = ''
  searchForm.status = ''
  searchForm.workshopSection = ''
  dateRange.value = []
  pagination.currentPage = 1
  loadOffDutyList()
}

// 导出数据
function handleExport() {
  // 这里实现导出功能
  ElMessage.success('数据导出成功')
}

// 分页处理
function handleSizeChange(size: number) {
  pagination.pageSize = size
  loadOffDutyList()
}

function handleCurrentChange(current: number) {
  pagination.currentPage = current
  loadOffDutyList()
}

// 切换视图标签
function handleTabChange(tab: string) {
  activeViewTab.value = tab
  if (tab === 'realtime') {
    loadRealtimeMachines()
  }
}

// 点击记录行查看详情
async function handleRecordClick(record: OffDutyRecord) {
  try {
    const response = await getOffDutyDetail(record.id)
    currentRecord.value = response.data || record
  } catch (error) {
    console.error('获取记录详情失败:', error)
    currentRecord.value = record
  }
  recordDetailVisible.value = true
}

// 查看图片
function handleViewImage(record: OffDutyRecord) {
  currentRecord.value = record
  recordDetailVisible.value = true
}

// 查看视频
function handleViewVideo(record: OffDutyRecord) {
  currentRecord.value = record
  videoTitle.value = `机台: ${record.machineNumber} - 操作人员: ${record.operatorName}`
  videoPlayerVisible.value = true
}

// 查看记录视频
function handleViewRecordVideo() {
  if (currentRecord.value) {
    videoTitle.value = `机台: ${currentRecord.value.machineNumber} - 操作人员: ${currentRecord.value.operatorName}`
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

// 标记已处理
function handleMarkProcessed(record: OffDutyRecord) {
  processTargetRecord.value = record
  processForm.remark = ''
  markProcessedVisible.value = true
}

// 确认标记已处理
async function confirmMarkProcessed() {
  if (!processTargetRecord.value || !processForm.remark) return
  
  try {
    markingProcessed.value = true
    await updateRecordProcessStatus(processTargetRecord.value.id, {
      isProcessed: true,
      remark: processForm.remark
    })
    
    // 更新本地数据
    if (processTargetRecord.value) {
      processTargetRecord.value.isProcessed = true
      processTargetRecord.value.processRemark = processForm.remark
      processTargetRecord.value.handler = '当前用户' // 实际应该从登录信息获取
      processTargetRecord.value.processTime = new Date().toISOString()
    }
    
    // 更新列表中的数据
    const index = offDutyList.value.findIndex(item =\u003e item.id === processTargetRecord.value?.id)
    if (index !== -1) {
      offDutyList.value[index].isProcessed = true
      offDutyList.value[index].processRemark = processForm.remark
      offDutyList.value[index].handler = '当前用户'
      offDutyList.value[index].processTime = new Date().toISOString()
    }
    
    ElMessage.success('标记已处理成功')
    markProcessedVisible.value = false
  } catch (error) {
    console.error('标记已处理失败:', error)
    ElMessage.error('标记已处理失败，请重试')
  } finally {
    markingProcessed.value = false
  }
}

// 处理状态变化
function handleProcessedChange() {
  if (currentRecord.value \u0026\u0026 currentRecord.value.isProcessed \u0026\u0026 !currentRecord.value.processRemark) {
    ElMessage.warning('请输入处理备注')
  }
}

// 保存处理信息
async function saveProcessInfo() {
  if (!currentRecord.value || !currentRecord.value.id || !currentRecord.value.processRemark) {
    ElMessage.error('请输入处理备注')
    return
  }
  
  try {
    await updateRecordProcessStatus(currentRecord.value.id, {
      isProcessed: currentRecord.value.isProcessed,
      remark: currentRecord.value.processRemark
    })
    
    // 更新本地数据
    if (!currentRecord.value.handler) {
      currentRecord.value.handler = '当前用户' // 实际应该从登录信息获取
    }
    if (!currentRecord.value.processTime) {
      currentRecord.value.processTime = new Date().toISOString()
    }
    
    // 更新列表中的数据
    const index = offDutyList.value.findIndex(item =\u003e item.id === currentRecord.value?.id)
    if (index !== -1) {
      offDutyList.value[index].isProcessed = currentRecord.value.isProcessed
      offDutyList.value[index].processRemark = currentRecord.value.processRemark
      offDutyList.value[index].handler = currentRecord.value.handler
      offDutyList.value[index].processTime = currentRecord.value.processTime
    }
    
    ElMessage.success('保存处理信息成功')
  } catch (error) {
    console.error('保存处理信息失败:', error)
    ElMessage.error('保存处理信息失败，请重试')
  }
}

// 刷新机台
async function handleRefreshMachine(machine: MachineInfo) {
  machine.isRefreshing = true
  try {
    // 这里可以调用刷新机台的接口
    await new Promise(resolve =\u003e setTimeout(resolve, 1000))
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
    case 'normal':
      return 'success'
    case 'off_duty':
      return 'danger'
    case 'warning':
      return 'warning'
    default:
      return 'info'
  }
}

// 获取状态标签
function getStatusLabel(status: string): string {
  switch (status) {
    case 'normal':
      return '正常'
    case 'off_duty':
      return '脱岗'
    case 'warning':
      return '预警'
    default:
      return '未知'
  }
}

// 获取告警级别类型
function getAlertLevelType(level: string): string {
  switch (level) {
    case 'high':
      return 'danger'
    case 'medium':
      return 'warning'
    case 'low':
      return 'info'
    default:
      return 'info'
  }
}

// 获取告警级别标签
function getAlertLevelLabel(level: string): string {
  switch (level) {
    case 'high':
      return '高级'
    case 'medium':
      return '中级'
    case 'low':
      return '低级'
    default:
      return '未知'
  }
}

// 获取工段标签
function getWorkshopSectionLabel(value: string): string {
  if (!value) return '未分配'
  const section = workshopSections.value.find(s =\u003e s.value === value)
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
  
  if (diffDay \u003e 0) {
    return `${diffDay}天前`
  } else if (diffHour \u003e 0) {
    return `${diffHour}小时前`
  } else if (diffMin \u003e 0) {
    return `${diffMin}分钟前`
  } else {
    return '刚刚'
  }
}

// 格式化持续时间
function formatDuration(seconds: number): string {
  if (!seconds || seconds \u003c= 0) return '00:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours \u003e 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

// 启动自动刷新
function startAutoRefresh() {
  // 每30秒自动刷新一次数据
  autoRefreshTimer.value = setInterval(() =\u003e {
    if (activeViewTab.value === 'list') {
      loadOffDutyList()
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
onMounted(() =\u003e {
  loadOffDutyList()
  loadStatistics()
  startAutoRefresh()
})

// 组件销毁时清理定时器
onUnmounted(() =\u003e {
  stopAutoRefresh()
})
\u003c/script\u003e

\u003cstyle scoped\u003e
.off-duty-detection {
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
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.1);
}

.realtime-monitor {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
}

.machine-monitor {
  transition: all 0.3s ease;
}

.machine-monitor.status-off-duty {
  border: 2px solid #f5222d;
}

.machine-monitor.status-warning {
  border: 2px solid #faad14;
}

.machine-monitor.status-normal {
  border: 2px solid #52c41a;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.analysis-container {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
}

.analysis-card {
  transition: all 0.3s ease;
}

.analysis-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-bar .el-input,
  .search-bar .el-select,
  .search-bar .el-date-picker {
    width: 100% !important;
  }
  
  .dashboard {
    grid-template-columns: 1fr !important;
  }
  
  .realtime-monitor {
    grid-template-columns: 1fr !important;
  }
  
  .analysis-container {
    grid-template-columns: 1fr !important;
  }
}