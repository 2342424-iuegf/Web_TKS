<template>
  <div class="sider">
    <el-menu
      :default-active="activePath"
      class="el-menu-vertical"
      router
      unique-opened
    >
      <el-sub-menu index="1">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </template>
        <el-menu-item index="/system/user">用户管理</el-menu-item>
        <el-menu-item index="/system/role">权限管理</el-menu-item>
        <el-menu-item index="/system/parameter">参数设置</el-menu-item>
        <el-menu-item index="/system/camera">摄像头管理</el-menu-item>
        <el-menu-item index="/system/event-push">事件推送设置</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="2">
        <template #title>
          <el-icon><Location /></el-icon>
          <span>检测区域设置</span>
        </template>
        <el-menu-item index="/detection/car-exchange">机台-换车区域设置</el-menu-item>
        <el-menu-item index="/detection/off-duty">机台-脱岗区域设置</el-menu-item>
        <el-menu-item index="/detection/danger">危险区域设置</el-menu-item>
      </el-sub-menu>

      <el-menu-item index="/model">
        <el-icon><DataAnalysis /></el-icon>
        <span>模型管理</span>
      </el-menu-item>

      <el-sub-menu index="3">
        <template #title>
          <el-icon><Van /></el-icon>
          <span>布车分布检测</span>
        </template>
        <el-menu-item index="/cloth-car/monitoring">布车分布监测</el-menu-item>
        <el-menu-item index="/cloth-car/search">布车搜索定位</el-menu-item>
      </el-sub-menu>

      <el-menu-item index="/channel">
        <el-icon><Operation /></el-icon>
        <span>通道出入检测</span>
      </el-menu-item>

      <el-menu-item index="/cloth-change">
        <el-icon><RefreshRight /></el-icon>
        <span>落布换车检测</span>
      </el-menu-item>

      <el-menu-item index="/off-duty/detection">
        <el-icon><UserFilled /></el-icon>
        <span>脱岗检测</span>
      </el-menu-item>

      <el-menu-item index="/danger/detection">
        <el-icon><WarningFilled /></el-icon>
        <span>危险检测</span>
      </el-menu-item>

      <el-menu-item index="/event">
        <el-icon><Calendar /></el-icon>
        <span>事件查询</span>
      </el-menu-item>

      <el-sub-menu index="4">
        <template #title>
          <el-icon><VideoPlay /></el-icon>
          <span>视频查询</span>
        </template>
        <el-menu-item index="/video/live">实时视频</el-menu-item>
        <el-menu-item index="/video/playback">视频回放</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMenu, ElSubMenu, ElMenuItem } from 'element-plus'
import {
  Setting,
  Location,
  DataAnalysis,
  Van,
  Operation,
  RefreshRight,
  UserFilled,
  WarningFilled,
  Calendar,
  VideoPlay
} from '@element-plus/icons-vue'

const route = useRoute()

const activePath = computed(() => route.path)
</script>

<style scoped>
.sider {
  width: 240px;
  height: 100%;
  background: #001529;
  overflow-y: auto;
}

.el-menu-vertical {
  height: 100%;
  background: #001529;
}

.el-menu {
  border-right: none;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.65);
  height: 50px;
  line-height: 50px;
  font-size: 14px;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  color: #1890ff;
}

:deep(.el-menu-item.is-active) {
  background-color: #1890ff;
  color: #fff;
}

:deep(.el-sub-menu__title .el-icon) {
  color: rgba(255, 255, 255, 0.65);
}

:deep(.el-sub-menu__title:hover .el-icon) {
  color: #1890ff;
}

:deep(.el-menu--vertical .el-menu .el-menu-item) {
  background-color: #000c17;
}

:deep(.el-menu--vertical .el-menu .el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  color: #1890ff;
}
</style>