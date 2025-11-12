\u003ctemplate\u003e
  \u003cdiv class="danger-detection"
    style="height: 100%; display: flex; flex-direction: column"
  \u003e
    \u003cdiv class="page-header"
      style="margin-bottom: 20px"
    \u003e
      \u003ch2\u003e危险检测\u003c/h2\u003e
      \u003cdiv class="header-info"
        style="margin-top: 8px"
      \u003e
        \u003cElTag type="warning"\u003e在有限空间等危险区域设置电子围栏，记录人员闯入信息并推送\u003c/ElTag\u003e
      \u003c/div\u003e
    \u003c/div\u003e

    \u003cElCard class="main-card"
      style="height: calc(100% - 80px); display: flex; flex-direction: column"
    \u003e
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
            v-model="searchForm.areaName"
            placeholder="输入危险区域名称"
            clearable
            style="width: 180px"
          \u003e
            \u003etemplate #prepend\u003e
              \u003cElIcon\u003e
                \u003cLocation /\u003e
              \u003c/ElIcon\u003e
            \u003etemplate\u003e
          \u003c/ElInput\u003e
          \u003cElInput
            v-model="searchForm.personName"
            placeholder="输入人员姓名"
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
            v-model="searchForm.warningLevel"
            placeholder="选择告警级别"
            style="width: 120px"
          \u003e
            \u003cElOption label="低级"
              value="low"
            /\u003e
            \u003cElOption label="中级"
              value="medium"
            /\u003e
            \u003cElOption label="高级"
              value="high"
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
      \u003c/div\u003e

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
              style="font-size: 32px; font-weight: bold; color: #f5222d"
            \u003e{{ statistics.totalIntrusions }}\u003c/div\u003e
            \u003cdiv class="dashboard-label"
              style="color: #666; margin-top: 10px"
            \u003e总闯入次数\u003c/div\u003e
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
            \u003e{{ statistics.activeDangerZones }}\u003c/div\u003e
            \u003cdiv class="dashboard-label"
              style="color: #666; margin-top: 10px"
            \u003e活跃危险区域数\u003c/div\u003e
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
            \u003e{{ statistics.currentAlerts }}\u003c/div\u003e
            \u003cdiv class="dashboard-label"
              style="color: #666; margin-top: 10px"
            \u003e当前告警数\u003c/div\u003e
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
            \u003e{{ statistics.todayIntrusions }}\u003c/div\u003e
            \u003cdiv class="dashboard-label"
              style="color: #666; margin-top: 10px"
            \u003e今日闯入次数\u003c/div\u003e
          \u003c/div\u003e
        \u003c/ElCard\u003e
      \u003c/div\u003e

      \u003cdiv class="view-tabs"
        style="margin-bottom: 20px"
      \u003e
        \u003cElTabs v-model="activeViewTab"
          @tab-change="handleTabChange"
        \u003e
          \u003cElTabPane label="闯入记录"
            name="list"
          /\u003e
          \u003cElTabPane label="实时监控"
            name="realtime"
          /\u003e
          \u003cElTabPane label="区域配置"
            name="zones"
          /\u003e
          \u003cElTabPane label="统计分析"
            name="analysis"
          /\u003e
        \u003c/ElTabs\u003e
      \u003c/div\u003e

      \u003c!-- 闯入记录列表 --\u003e
      \u003cdiv
        v-if="activeViewTab === 'list'"
        style="flex: 1; overflow: auto; margin-bottom: 20px"
      \u003e
        \u003cElTable
          :data="intrusionList"
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
            prop="dangerZone.areaName"
            label="危险区域"
            width="150"
            header-align="center"
            align="center"
          \u003e
            \u003etemplate #default="scope"\u003e
              \u003cElTag size="large" type="danger"
                effect="dark"
              \u003e{{ scope.row.dangerZone?.areaName || '未知区域' }}\u003c/ElTag\u003e
            \u003etemplate\u003e
          \u003c/ElTableColumn
          \u003cElTableColumn
            prop="personName"
            label="闯入人员"
            width="120"
            header-align="center"
            align="center"
          /\u003e
          \u003cElTableColumn
            prop="intrusionTime"
            label="闯入时间"
            width="180"
            header-align="center"
          \u003e
            \u003etemplate #default="scope"\u003e
              {{ formatDateTime(scope.row.intrusionTime) }}
            \u003etemplate\u003e
          \u003c/ElTableColumn
          \u003cElTableColumn
            prop="leaveTime"
            label="离开时间"
            width="180"
            header-align="center"
          \u003e
            \u003etemplate #default="scope"\u003e
              {{ scope.row.leaveTime ? formatDateTime(scope.row.leaveTime) : '仍在区域内' }}
            \u003etemplate\u003e
          \u003c/ElTableColumn
          \u003cElTableColumn
            prop="duration"
            label="停留时长"
            width="100"
            header-align="center"
            align="center"
          \u003e
            \u003etemplate #default="scope"\u003e
              {{ formatDuration(scope.row.duration) }}
            \u003etemplate\u003e
          \u003c/ElTableColumn
          \u003cElTableColumn
            prop="warningLevel"
            label="告警级别"
            width="100"
            header-align="center"
            align="center"
          \u003e
            \u003etemplate #default="scope"\u003e
              \u003cElTag
                :type="getWarningLevelType(scope.row.warningLevel)"
              \u003e{{ getWarningLevelLabel(scope.row.warningLevel) }}\u003e/ElTag\u003e
            \u003etemplate\u003e
          \u003c/ElTableColumn
          \u003cElTableColumn
            prop="dangerZone.workshopSection"
            label="所属工段"
            width="120"
            header-align="center"
            align="center"
          \u003e
            \u003etemplate #default="scope"\u003e
              \u003cElTag type="info"
                v-if="scope.row.dangerZone?.workshopSection"
              \u003e{{ getWorkshopSectionLabel(scope.row.dangerZone.workshopSection) }}\u003e/ElTag\u003e
              \u003cElTag type="danger"
                v-else
              \u003e未分配\u003e/ElTag\u003e
            \u003etemplate\u003e
          \u003c/ElTableColumn
          \u003cElTableColumn
            prop="status"
            label="处理状态"
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
            label="操作"
            width="200"
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
                v-if="scope.row.status !== 'processed'"
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
        \u003c/div\u003e
      \u003c/div\u003e

      \u003c!-- 实时监控 --\u003e
      \u003cdiv
        v-else-if="activeViewTab === 'realtime'"
        style="flex: 1; overflow: auto; margin-bottom: 20px"
      \u003e
        \u003cdiv class="realtime-monitor"
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px"
        \u003e
          \u003cElCard
            v-for="zone in dangerZones"
            :key="zone.id"
            class="zone-monitor"
            :class="{
              'alert-danger': zone.isAlerting,
              'no-alert': !zone.isAlerting
            }"
          \u003e
            \u003cdiv slot="header" class="zone-header"
              style="display: flex; justify-content: space-between; align-items: center"
            \u003e
              \u003cspan style="font-weight: 500; display: flex; align-items: center; gap: 8px"\u003e
                \u003cElIcon
                  v-if="zone.isAlerting"
                  style="color: #f5222d"
                \u003e
                  \u003cWarningFilled /\u003e
                \u003c/ElIcon\u003e
                {{ zone.areaName }}
                \u003cElTag size="small" type="info"
                  v-if="zone.workshopSection"
                \u003e{{ getWorkshopSectionLabel(zone.workshopSection) }}\u003e/ElTag\u003e
              \u003e/span\u003e
              \u003cdiv class="zone-controls"
                style="display: flex; align-items: center; gap: 10px"
              \u003e
                \u003cElTag
                  :type="zone.isAlerting ? 'danger' : 'success'"
                  size="small"
                \u003e{{ zone.isAlerting ? '告警中' : '正常' }}\u003e/ElTag\u003e
                \u003cElButton
                  type="text"
                  size="small"
                  @click="handleRefreshZone(zone)"
                \u003e
                  \u003cElIcon
                    :class="{ 'rotating': zone.isRefreshing }"
                  \u003e
                    \u003cRefresh /\u003e
                  \u003c/ElIcon
                \u003e/ElButton\u003e
                \u003cElSwitch
                  v-model="zone.isActive"
                  :active-text="'开启'"
                  :inactive-text="'关闭'"
                  @change="handleToggleZone(zone)"
                  style="--el-switch-on-color: #1890ff; --el-switch-off-color: #dcdfe6"
                /\u003e
              \u003c/div\u003e
            \u003c/div\u003e
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
                
              \u003c/div\u003e
              \u003cdiv
                v-if="zone.currentIntrusion"
                class="intrusion-overlay"
                style="position: absolute; bottom: 0; left: 0; right: 0; background-color: rgba(245, 34, 45, 0.8); color: #fff; padding: 8px 12px; font-size: 12px"
              \u003e
                \u003cdiv style="display: flex; justify-content: space-between; align-items: center"
                  v-if="zone.currentIntrusion"
                \u003e
                  \u003cspan style="display: flex; align-items: center; gap: 8px"
                  \u003e
                    \u003cElTag size="small" type="warning"\u003e入侵人员: {{ zone.currentIntrusion.personName }}\u003e/ElTag\u003e
                    已停留: {{ formatDuration(zone.currentIntrusion.duration) }}
                  \u003e/span\u003e
                  \u003cspan\u003e入侵时间: {{ formatRelativeTime(zone.currentIntrusion.intrusionTime) }}\u003e/span\u003e
                \u003c/div\u003e
              \u003c/div\u003e
              \u003cdiv
                v-if="zone.isAlerting"
                class="alert-badge"
                style="position: absolute; top: 10px; right: 10px; background-color: #f5222d; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; animation: flash 1s infinite"
              \u003e入侵告警！
              \u003e/div\u003e
            \u003c/div\u003e
            \u003cdiv class="zone-info"
              style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ebeef5"
            \u003e
              \u003cdiv style="display: flex; justify-content: space-between; font-size: 13px; color: #606266; margin-bottom: 8px"
              \u003e
                \u003cspan\u003e今日入侵: {{ zone.todayIntrusionCount }}次\u003e/span\u003e
                \u003cspan\u003e警告级别: {{ getWarningLevelLabel(zone.warningLevel) }}\u003e/span\u003e
              \u003c/div\u003e
              \u003cdiv
                v-if="zone.isAlerting"
                class="alert-info"
                style="background-color: #fff1f0; border: 1px solid #ffccc7; padding: 8px; border-radius: 4px; display: flex; align-items: center; gap: 8px; color: #ff4d4f"
              \u003e
                \u003cElIcon size="16"\u003e
                  \u003cWarningFilled /\u003e
                \u003c/ElIcon
                \u003cspan style="font-size: 12px"\u003e危险区域有人员入侵，请立即处理！\u003e/span\u003e
              \u003c/div\u003e
            \u003c/div\u003e
          \u003c/ElCard\u003e
        \u003c/div\u003e
      \u003c/div\u003e

      \u003e!-- 区域配置 --\u003e
      \u003cdiv
        v-else-if="activeViewTab === 'zones'"
        style="flex: 1; overflow: auto; margin-bottom: 20px"
      \u003e
        \u003cdiv class="zones-management"
          style="display: flex; flex-direction: column; height: 100%"
        \u003e
          \u003cdiv class="zones-actions"
            style="margin-bottom: 20px; display: flex; justify-content: flex-end; gap: 10px"
          \u003e
            \u003cElButton type="primary" @click="showAddZoneDialog"
              icon="Plus"
            \u003e新增危险区域\u003c/ElButton\u003e
            \u003cElButton type="success" @click="handleRefreshZones"
              icon="Refresh"
            \u003e刷新区域列表\u003c/ElButton\u003e
          \u003c/div\u003e
          \u003cElTable
            :data="dangerZones"
            style="width: 100%"
            border
            stripe
            @row-click="handleZoneClick"
          \u003e
            \u003cElTableColumn
              prop="id"
              label="区域ID"
              width="80"
              header-align="center"
              align="center"
            /\u003e
            \u003cElTableColumn
              prop="areaName"
              label="区域名称"
              width="150"
              header-align="center"
              align="center"
            \u003e
              \u003etemplate #default="scope"\u003e
                \u003cElTag size="large" type="danger"
                  effect="dark"
                \u003e{{ scope.row.areaName }}\u003c/ElTag\u003e
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
                \u003cElTag type="info"\u003e{{ getWorkshopSectionLabel(scope.row.workshopSection) }}\u003e/ElTag\u003e
              \u003etemplate\u003e
            \u003c/ElTableColumn
            \u003cElTableColumn
              prop="warningLevel"
              label="警告级别"
              width="100"
              header-align="center"
              align="center"
            \u003e
              \u003etemplate #default="scope"\u003e
                \u003cElTag :type="getWarningLevelType(scope.row.warningLevel)"\u003e{{ getWarningLevelLabel(scope.row.warningLevel) }}\u003e/ElTag\u003e
              \u003etemplate\u003e
            \u003c/ElTableColumn
            \u003cElTableColumn
              prop="description"
              label="区域描述"
              header-align="center"
            /\u003e
            \u003cElTableColumn
              prop="isActive"
              label="启用状态"
              width="100"
              header-align="center"
              align="center"
            \u003e
              \u003etemplate #default="scope"\u003e
                \u003cElSwitch
                  v-model="scope.row.isActive"
                  @change="handleToggleZone(scope.row)"
                  style="--el-switch-on-color: #1890ff; --el-switch-off-color: #dcdfe6"
                /\u003e
              \u003etemplate\u003e
            \u003c/ElTableColumn
            \u003cElTableColumn
              prop="createdAt"
              label="创建时间"
              width="180"
              header-align="center"
            \u003e
              \u003etemplate #default="scope"\u003e
                {{ formatDateTime(scope.row.createdAt) }}
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
                  @click.stop="handleEditZone(scope.row)"
                \u003e编辑\u003c/ElButton\u003e
                \u003cElButton
                  type="success"
                  size="small"
                  text
                  @click.stop="handleViewZoneIntrusion(scope.row)"
                \u003e查看入侵记录\u003c/ElButton\u003e
                \u003cElButton
                  type="danger"
                  size="small"
                  text
                  @click.stop="handleDeleteZone(scope.row)"
                \u003e删除\u003c/ElButton\u003e
              \u003etemplate\u003e
            \u003c/ElTableColumn
          \u003c/ElTable
        \u003c/div\u003e
      \u003c/div\u003e

      \u003e!-- 统计分析 --\u003e
      \u003cdiv
        v-else-if="activeViewTab === 'analysis'"
        style="flex: 1; overflow: auto; margin-bottom: 20px"
      \u003e
        \u003cdiv class="analysis-container"
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 20px"
        \u003e
          \u003cElCard class="analysis-card"
          \u003e
            \u003cdiv slot="header"
              style="display: flex; justify-content: space-between; align-items: center"
            \u003e
              \u003cspan style="font-weight: 500"\u003e入侵趋势图\u003e/span\u003e
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
            \u003c/div\u003e
            \u003cdiv class="chart-placeholder"
              style="height: 300px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; color: #909399"
            \u003e
              \u003cElIcon
                style="font-size: 48px; margin-bottom: 16px"
              \u003e
                \u003cLineChart /\u003e
              \u003c/ElIcon\u003e
              \u0003cdiv style="font-size: 16px"\u003e入侵趋势图表区域
              \u003e/div\u003e
            \u003c/div\u003e
          \u003c/ElCard\u003e
          \u003cElCard class="analysis-card"
          \u003e
            \u003cdiv slot="header"
              style="font-weight: 500"\u003e区域入侵次数排名
            \u003e/div\u003e
            \u003cdiv class="chart-placeholder"
              style="height: 300px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; color: #909399"
            \u003e
              \u003cElIcon
                style="font-size: 48px; margin-bottom: 16px"
              \u003e
                \u003cHistogram /\u003e
              \u003c/ElIcon\u003e
              \u003cdiv style="font-size: 16px"\u003e区域入侵次数排名图表区域
              \u003e/div\u003e
            \u003c/div\u003e
          \u003c/ElCard\u003e
          \u003cElCard class="analysis-card"
          \u003e
            \u003cdiv slot="header"
              style="font-weight: 500"\u003e告警级别分布
            \u003e/div\u003e
            \u003cdiv class="chart-placeholder"
              style="height: 300px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; color: #909399"
            \u003e
              \u003cElIcon
                style="font-size: 48px; margin-bottom: 16px"
              \u003e
                \u003cPieChart /\u003e
              \u003c/ElIcon\u003e
              \u003cdiv style="font-size: 16px"\u003e告警级别分布图表区域
              \u003e/div\u003e
            \u003c/div\u003e
          \u003c/ElCard\u003e
          \u003cElCard class="analysis-card"
          \u003e
            \u003cdiv slot="header"
              style="font-weight: 500"\u003e人员入侵统计
            \u003e/div\u003e
            \u003cdiv class="chart-placeholder"
              style="height: 300px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; color: #909399"
            \u003e
              \u003cElIcon
                style="font-size: 48px; margin-bottom: 16px"
              \u003e
                \u003cUserFilled /\u003e
              \u003c/ElIcon\u003e
              \u003cdiv style="font-size: 16px"\u003e人员入侵统计图表区域
              \u003e/div\u003e
            \u003c/div\u003e
          \u003c/ElCard\u003e
        \u003c/div\u003e
      \u003c/div\u003e

      \u003e!-- 记录详情对话框 --\u003e
      \u003cElDialog
        v-model="recordDetailVisible"
        :title="`入侵记录详情 - 区域: ${currentRecord?.dangerZone?.areaName || ''}`"
        width="600px"
      \u003e
        \u003cdiv
          v-if="currentRecord"
          style="padding: 10px 0"
        \u003e
          \u003cElDescriptions :column="1" border\u003e
            \u003cElDescriptionsItem label="记录ID"\u003e{{ currentRecord.id }}\u003c/ElDescriptionsItem\u003e
            \u003cElDescriptionsItem label="危险区域"\u003e{{ currentRecord.dangerZone?.areaName || '未知区域' }}\u003c/ElDescriptionsItem\u003e
            \u003cElDescriptionsItem label="闯入人员"\u003e{{ currentRecord.personName }}\u003c/ElDescriptionsItem\u003e
            \u003cElDescriptionsItem label="闯入时间"\u003e{{ formatDateTime(currentRecord.intrusionTime) }}\u003c/ElDescriptionsItem\u003e
            \u003cElDescriptionsItem label="离开时间"\u003e{{ currentRecord.leaveTime ? formatDateTime(currentRecord.leaveTime) : '仍在区域内' }}\u003c/ElDescriptionsItem\u003e
            \u003cElDescriptionsItem label="停留时长"\u003e{{ formatDuration(currentRecord.duration) }}\u003c/ElDescriptionsItem\u003e
            \u003cElDescriptionsItem label="告警级别"\u003e
              \u003cElTag :type="getWarningLevelType(currentRecord.warningLevel)"\u003e{{ getWarningLevelLabel(currentRecord.warningLevel) }}\u003e/ElTag\u003e
            \u003c/ElDescriptionsItem\u003e
            \u003cElDescriptionsItem label="所属工段"\u003e{{ currentRecord.dangerZone?.workshopSection ? getWorkshopSectionLabel(currentRecord.dangerZone.workshopSection) : '未分配' }}\u003c/ElDescriptionsItem\u003e
            \u003cElDescriptionsItem label="告警信息"\u003e{{ currentRecord.alertMessage || '无' }}\u003c/ElDescriptionsItem\u003e
            \u003cElDescriptionsItem label="处理状态"\u003e
              \u003cElTag :type="getStatusTagType(currentRecord.status)"\u003e{{ getStatusLabel(currentRecord.status) }}\u003e/ElTag\u003e
            \u003c/ElDescriptionsItem\u003e
            \u003cElDescriptionsItem label="处理人"\u003e{{ currentRecord.handler || '未处理' }}\u003c/ElDescriptionsItem\u003e
            \u003cElDescriptionsItem label="处理时间"\u003e{{ currentRecord.processTime ? formatDateTime(currentRecord.processTime) : '未处理' }}\u003c/ElDescriptionsItem\u003e
            \u003cElDescriptionsItem label="处理备注"\u003e
              \u003cElInput
                v-model="currentRecord.processRemark"
                type="textarea"
                placeholder="请输入处理备注"
                :disabled="currentRecord.status !== 'processing'"
                rows="2"
              /\u003e
            \u003c/ElDescriptionsItem\u003e
          \u003c/ElDescriptions\u003e

          \u003cdiv class="record-image"
            style="margin-top: 20px"
          \u003e
            \u003ch3 class="image-title"
              style="font-size: 16px; font-weight: 500; margin-bottom: 10px"
            \u003e入侵证据图片
            \u003e/h3\u003e
            \u003cdiv class="image-container"
              style="height: 300px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; border: 1px solid #ebeef5; border-radius: 4px"
            \u003e
              \u003cElIcon
                style="font-size: 48px; color: #909399"
              \u003e
                \u003cPicture /\u003e
              \u003c/ElIcon\u003e
              \u003cdiv style="margin-left: 10px; color: #909399"\u003e入侵证据图片预览区域
              \u003e/div\u003e
            \u003c/div\u003e
          \u003c/div\u003e
        \u003c/div\u003e
        v-else
      \u003e
        \u003cElEmpty description="暂无记录信息"\u003e
        \u003c/ElEmpty
      \u003c/div\u003e
        v-else
      \u003e
      \u003etemplate #footer\u003e
        \u003cElButton @click="recordDetailVisible = false"\u003e关闭\u003c/ElButton\u003e
        \u003cElButton type="primary"
          @click="handleViewRecordVideo"
          v-if="currentRecord"
        \u003e查看视频片段\u003c/ElButton\u003e
        \u003cElButton type="success"
          @click="saveProcessInfo"
          v-if="currentRecord && currentRecord.status === 'processing'"
        \u003e保存处理信息\u003c/ElButton\u003e
      \u003etemplate\u003e
    \u003c/ElDialog\u003e

    \u003e!-- 视频播放对话框 --\u003e
    \u003cElDialog
      v-model="videoPlayerVisible"
      :title="`视频回放 - ${videoTitle || '入侵记录'}`"
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
          \u003c/ElIcon\u003e
          
        \u003c/div\u003e
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
            \u003c/ElIcon\u003e
            {{ isVideoPlaying ? '暂停' : '播放' }}
          \u003e/ElButton\u003e
          \u003cElButton
            type="success"
            size="large"
            @click="handleVideoCapture"
          \u003e
            \u003cElIcon slot="icon"\u003e
              \u003cCameraFilled /\u003e
            \u003c/ElIcon\u003e
            截图
          \u003e/ElButton\u003e
          \u003cElButton
            type="info"
            size="large"
            @click="handleAdjustSpeed"
          \u003e
            \u003cElIcon slot="icon"\u003e
              \u003cTimer /\u003e
            \u003c/ElIcon\u003e
            倍速: {{ playbackSpeed }}x
          \u003e/ElButton\u003e
        \u003c/div\u003e
      \u003c/div\u003e
    \u003c/ElDialog\u003e

    \u003e!-- 标记已处理对话框 --\u003e
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
        \u003c/div\u003e
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
      \u003c/div\u003e
        v-else
      \u003e
      \u003etemplate #footer\u003e
        \u003cElButton
          @click="markProcessedVisible = false"
          :disabled="markingProcessed"
        \u003e取消\u003c/ElButton\u003e
        \u003cElButton
          type="primary"
          @click="confirmMarkProcessed"
          :disabled="markingProcessed || !processForm.remark"
        \u003e确认处理\u003c/ElButton\u003e
      \u003etemplate\u003e
    \u003c/ElDialog\u003e

    \u003e!-- 新增/编辑危险区域对话框 --\u003e
    \u003cElDialog
      v-model="zoneDialogVisible"
      :title="editingZone ? '编辑危险区域' : '新增危险区域'"
      width="600px"
    \u003e
      \u003cdiv
        style="padding: 20px 0"
      \u003e
        \u003cElForm
          v-model="zoneForm"
          label-position="top"
          :rules="zoneFormRules"
          ref="zoneFormRef"
        \u003e
          \u003cElFormItem label="区域名称" prop="areaName"
            required
          \u003e
            \u003cElInput
              v-model="zoneForm.areaName"
              placeholder="请输入危险区域名称"
            /\u003e
          \u003c/ElFormItem\u003e
          \u003cElFormItem label="所属工段" prop="workshopSection"
            required
          \u003e
            \u003cElSelect
              v-model="zoneForm.workshopSection"
              placeholder="选择所属工段"
              style="width: 100%"
            \u003e
              \u003cElOption
                v-for="section in workshopSections"
                :key="section.value"
                :label="section.label"
                :value="section.value"
              /\u003e
            \u003c/ElSelect\u003e
          \u003c/ElFormItem\u003e
          \u003cElFormItem label="警告级别" prop="warningLevel"
            required
          \u003e
            \u003cElSelect
              v-model="zoneForm.warningLevel"
              placeholder="选择警告级别"
              style="width: 100%"
            \u003e
              \u003cElOption label="低级"
                value="low"
              /\u003e
              \u003cElOption label="中级"
                value="medium"
              /\u003e
              \u003cElOption label="高级"
                value="high"
              /\u003e
            \u003c/ElSelect\u003e
          \u003c/ElFormItem\u003e
          \u003cElFormItem label="区域描述" prop="description"
          \u003e
            \u003cElInput
              v-model="zoneForm.description"
              type="textarea"
              placeholder="请输入危险区域描述"
              rows="3"
            /\u003e
          \u003c/ElFormItem\u003e
          \u003cElFormItem label="是否启用" prop="isActive"
          \u003e
            \u003cElSwitch
              v-model="zoneForm.isActive"
              style="--el-switch-on-color: #1890ff; --el-switch-off-color: #dcdfe6"
            /\u003e
          \u003c/ElFormItem\u003e
        \u003c/ElForm\u003e
      \u003c/div\u003e
      \u003etemplate #footer\u003e
        \u003cElButton @click="handleCloseZoneDialog"
          :disabled="savingZone"
        \u003e取消\u003c/ElButton\u003e
        \u003cElButton type="primary"
          @click="handleSaveZone"
          :loading="savingZone"
        \u003e{{ savingZone ? '保存中...' : '保存' }}\u003c/ElButton\u003e
      \u003etemplate\u003e
    \u003c/ElDialog\u003e

    \u003e!-- 删除危险区域确认对话框 --\u003e
    \u003cElDialog
      v-model="deleteZoneVisible"
      title="确认删除"
      width="400px"
    \u003e
      \u003cdiv
        style="padding: 20px 0; text-align: center"
      \u003e
        \u003cElIcon
          style="font-size: 48px; color: #f5222d; margin-bottom: 20px"
        \u003e
          \u003cDelete /\u003e
        \u003c/ElIcon\u003e
        \u003cp style="margin-bottom: 10px"\u003e您确定要删除危险区域 "{{ deleteTargetZone?.areaName }}" 吗？\u003c/p\u003e
        \u003cp style="color: #ff4d4f; font-size: 14px"\u003e删除后将无法恢复，并且相关的入侵记录将保留但关联信息会丢失。\u003c/p\u003e
      \u003c/div\u003e
      \u003etemplate #footer\u003e
        \u003cElButton @click="deleteZoneVisible = false"
          :disabled="deletingZone"
        \u003e取消\u003c/ElButton\u003e
        \u003cElButton type="danger"
          @click="confirmDeleteZone"
          :loading="deletingZone"
        \u003e确认删除\u003c/ElButton\u003e
      \u003etemplate\u003e
    \u003c/ElDialog\u003e
  \u003c/div\u003e
\u003c/template\u003e

\u003cscript setup lang="ts"\u003e
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { Search, VideoFilled, VideoPlay, CameraFilled, Timer, Picture, LineChart, Histogram, PieChart, Refresh, User, UserFilled, WarningFilled, Location, Plus, Delete } from '@element-plus/icons-vue'
import { getIntrusionList, getIntrusionDetail, updateRecordProcessStatus, getDangerZones, getDangerZoneDetail, addDangerZone, updateDangerZone, deleteDangerZone, toggleDangerZoneStatus, getDangerZoneStatistics } from '@/api/danger'

interface IntrusionRecord {
  id: number
  dangerZone: {
    id: number
    areaName: string
    workshopSection: string
    warningLevel: string
  }
  personName: string
  intrusionTime: string
  leaveTime?: string
  duration: number
  warningLevel: string
  alertMessage?: string
  status: 'pending' | 'processing' | 'processed'
  handler?: string
  processTime?: string
  processRemark?: string
  imageUrls?: string[]
  videoUrl?: string
}

interface DangerZone {
  id: number
  areaName: string
  workshopSection: string
  warningLevel: string
  description?: string
  isActive: boolean
  isAlerting: boolean
  todayIntrusionCount: number
  createdAt: string
  currentIntrusion?: IntrusionRecord
  isRefreshing?: boolean
}

interface WorkshopSection {
  value: string
  label: string
}

const searchForm = reactive({
  areaName: '',
  personName: '',
  warningLevel: '',
  workshopSection: ''
})

const dateRange = ref\u003cstring[]\u003e([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const intrusionList = ref\u003cIntrusionRecord[]\u003e([])
const dangerZones = ref\u003cDangerZone[]\u003e([])
const activeViewTab = ref('list')
const chartTimeRange = ref('7days')
const recordDetailVisible = ref(false)
const currentRecord = ref\u003cIntrusionRecord | null\u003e(null)
const videoPlayerVisible = ref(false)
const videoTitle = ref('')
const isVideoPlaying = ref(false)
const playbackSpeed = ref(1.0)
const markProcessedVisible = ref(false)
const markingProcessed = ref(false)
const processTargetRecord = ref\u003cIntrusionRecord | null\u003e(null)

const processForm = reactive({
  remark: ''
})

// 危险区域表单相关
const zoneDialogVisible = ref(false)
const editingZone = ref(false)
const savingZone = ref(false)
const zoneFormRef = ref\u003cInstanceType\u003ctypeof ElForm\u003e | null\u003e(null)
const zoneForm = reactive({
  areaName: '',
  workshopSection: '',
  warningLevel: 'medium',
  description: '',
  isActive: true
})

const zoneFormRules = reactive({
  areaName: [
    { required: true, message: '请输入区域名称', trigger: 'blur' },
    { min: 2, max: 50, message: '区域名称长度应在2-50个字符之间', trigger: 'blur' }
  ],
  workshopSection: [
    { required: true, message: '请选择所属工段', trigger: 'change' }
  ],
  warningLevel: [
    { required: true, message: '请选择警告级别', trigger: 'change' }
  ]
})

// 删除危险区域相关
const deleteZoneVisible = ref(false)
const deletingZone = ref(false)
const deleteTargetZone = ref\u003cDangerZone | null\u003e(null)

// 统计信息
const statistics = reactive({
  totalIntrusions: 0,
  activeDangerZones: 0,
  currentAlerts: 0,
  todayIntrusions: 0
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

// 加载入侵记录列表
async function loadIntrusionList() {
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
    
    const response = await getIntrusionList(params)
    intrusionList.value = response.data?.list || []
    pagination.total = response.data?.total || 0
    updateStatisticsFromList()
  } catch (error) {
    console.error('加载入侵记录失败:', error)
    // 使用模拟数据
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    intrusionList.value = [
      {
        id: 1,
        dangerZone: {
          id: 1,
          areaName: '高压设备区域',
          workshopSection: 'weaving',
          warningLevel: 'high'
        },
        personName: '张三',
        intrusionTime: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        leaveTime: undefined,
        duration: 900,
        warningLevel: 'high',
        alertMessage: '人员进入高压设备危险区域',
        status: 'pending'
      },
      {
        id: 2,
        dangerZone: {
          id: 2,
          areaName: '化学品存储区',
          workshopSection: 'dyeing',
          warningLevel: 'high'
        },
        personName: '李四',
        intrusionTime: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        leaveTime: undefined,
        duration: 600,
        warningLevel: 'high',
        alertMessage: '人员进入化学品存储危险区域',
        status: 'processing'
      },
      {
        id: 3,
        dangerZone: {
          id: 3,
          areaName: '机械运行区域',
          workshopSection: 'finishing',
          warningLevel: 'medium'
        },
        personName: '王五',
        intrusionTime: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        leaveTime: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        duration: 1200,
        warningLevel: 'medium',
        alertMessage: '人员进入机械运行危险区域',
        status: 'processed',
        handler: '安全管理员',
        processTime: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        processRemark: '已处理，人员已撤离'
      },
      {
        id: 4,
        dangerZone: {
          id: 4,
          areaName: '高空作业区域',
          workshopSection: 'inspection',
          warningLevel: 'high'
        },
        personName: '赵六',
        intrusionTime: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
        leaveTime: new Date(now.getTime() - 50 * 60 * 1000).toISOString(),
        duration: 600,
        warningLevel: 'high',
        alertMessage: '人员进入高空作业危险区域',
        status: 'processed',
        handler: '班组长',
        processTime: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        processRemark: '已核实，正常作业，已佩戴安全装备'
      },
      {
        id: 5,
        dangerZone: {
          id: 5,
          areaName: '有限空间区域',