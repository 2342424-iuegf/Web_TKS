<template>
  <div class="annotation-canvas-container">
    <div class="canvas-wrapper" ref="canvasWrapperRef">
      <canvas
        ref="canvasRef"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @click="handleClick"
        @contextmenu.prevent="handleRightClick"
      ></canvas>
      <div class="canvas-overlay">
        <div class="timestamp" v-if="timestamp">{{ timestamp }}</div>
        <div class="camera-id" v-if="cameraId">{{ cameraId }}</div>
        <div class="mouse-coords" v-if="mouseCoords">
          X: {{ mouseCoords.x }}, Y: {{ mouseCoords.y }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

export interface Annotation {
  area_no?: number
  machine_id?: string
  color?: string
  points?: number[][]
  [key: string]: any
}

interface Props {
  imageUrl?: string
  annotations?: Annotation[]
  isDrawing?: boolean
  drawColor?: string
  currentAreaNo?: number
  cameraId?: string
  timestamp?: string
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: '',
  annotations: () => [],
  isDrawing: false,
  drawColor: '#ff0000',
  currentAreaNo: 1,
  cameraId: '',
  timestamp: ''
})

const emit = defineEmits<{
  'annotation-update': [annotations: Annotation[]]
  'point-add': [point: number[]]
  'drawing-complete': []
}>()

const canvasRef = ref<HTMLCanvasElement>()
const canvasWrapperRef = ref<HTMLDivElement>()
const mouseCoords = ref<{ x: number; y: number } | null>(null)

let image: HTMLImageElement | null = null
let currentPoints: number[][] = []
let isDrawingMode = false
let scale = 1
let offsetX = 0
let offsetY = 0

// 加载图像
async function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      image = img
      nextTick(() => {
        resizeCanvas()
        draw()
        resolve(img)
      })
    }
    img.onerror = reject
    img.src = url
  })
}

// 调整Canvas尺寸
function resizeCanvas() {
  if (!canvasRef.value || !canvasWrapperRef.value || !image) return

  const wrapper = canvasWrapperRef.value
  const canvas = canvasRef.value
  const wrapperWidth = wrapper.clientWidth
  const wrapperHeight = wrapper.clientHeight

  // 计算缩放比例，保持图像宽高比
  const imageAspect = image.width / image.height
  const wrapperAspect = wrapperWidth / wrapperHeight

  let canvasWidth: number
  let canvasHeight: number

  if (imageAspect > wrapperAspect) {
    canvasWidth = wrapperWidth
    canvasHeight = wrapperWidth / imageAspect
  } else {
    canvasHeight = wrapperHeight
    canvasWidth = wrapperHeight * imageAspect
  }

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  scale = canvasWidth / image.width
  offsetX = (wrapperWidth - canvasWidth) / 2
  offsetY = (wrapperHeight - canvasHeight) / 2

  canvas.style.left = `${offsetX}px`
  canvas.style.top = `${offsetY}px`

  draw()
}

// 获取鼠标在Canvas中的坐标
function getCanvasCoordinates(event: MouseEvent): number[] | null {
  if (!canvasRef.value) return null

  const rect = canvasRef.value.getBoundingClientRect()
  const x = Math.round((event.clientX - rect.left) / scale)
  const y = Math.round((event.clientY - rect.top) / scale)

  return [x, y]
}

// 绘制
function draw() {
  if (!canvasRef.value || !image) return

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  // 清空画布
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  // 绘制图像
  ctx.drawImage(image, 0, 0, canvasRef.value.width, canvasRef.value.height)

  // 绘制已保存的标注
  props.annotations.forEach((annotation) => {
    if (annotation.points && annotation.points.length > 0) {
      drawPolygon(ctx, annotation.points, annotation.color || '#ff0000', false)
    }
  })

  // 绘制当前正在绘制的多边形
  if (isDrawingMode && currentPoints.length > 0) {
    drawPolygon(ctx, currentPoints, props.drawColor, true)
  }
}

// 绘制多边形
function drawPolygon(
  ctx: CanvasRenderingContext2D,
  points: number[][],
  color: string,
  isDrawing: boolean
) {
  if (points.length === 0) return

  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = isDrawing ? `${color}33` : `${color}22` // 半透明填充
  ctx.lineWidth = 2

  ctx.beginPath()
  ctx.moveTo(points[0][0] * scale, points[0][1] * scale)

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0] * scale, points[i][1] * scale)
  }

  if (isDrawing && points.length > 2) {
    // 绘制闭合线（从最后一个点到第一个点）
    ctx.lineTo(points[0][0] * scale, points[0][1] * scale)
  }

  ctx.fill()
  ctx.stroke()

  // 绘制顶点
  points.forEach((point, index) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(point[0] * scale, point[1] * scale, 4, 0, Math.PI * 2)
    ctx.fill()

    // 如果是正在绘制，显示顶点编号
    if (isDrawing) {
      ctx.fillStyle = '#fff'
      ctx.font = '12px Arial'
      ctx.fillText(
        String(index + 1),
        point[0] * scale + 6,
        point[1] * scale - 6
      )
    }
  })

  ctx.restore()
}

// 鼠标按下
function handleMouseDown(event: MouseEvent) {
  // 鼠标按下主要用于拖拽，点击事件在 handleClick 中处理
}

// 鼠标移动
function handleMouseMove(event: MouseEvent) {
  const coords = getCanvasCoordinates(event)
  if (coords) {
    mouseCoords.value = { x: coords[0], y: coords[1] }
  }

  if (isDrawingMode && currentPoints.length > 0) {
    draw()
  }
}

// 鼠标抬起
function handleMouseUp(event: MouseEvent) {
  // 可以在这里添加拖拽逻辑
}

// 鼠标点击
function handleClick(event: MouseEvent) {
  if (!props.isDrawing || !isDrawingMode) return

  const coords = getCanvasCoordinates(event)
  if (coords) {
    // 检查是否点击了第一个点（闭合多边形）
    if (
      currentPoints.length > 2 &&
      Math.abs(currentPoints[0][0] - coords[0]) < 10 &&
      Math.abs(currentPoints[0][1] - coords[1]) < 10
    ) {
      // 完成绘制
      completeDrawing()
    } else {
      // 添加新点
      currentPoints.push(coords)
      emit('point-add', coords)
      draw()
    }
  }
}

// 右键点击
function handleRightClick(event: MouseEvent) {
  if (props.isDrawing && isDrawingMode && currentPoints.length > 0) {
    // 取消最后一个点
    currentPoints.pop()
    draw()
  }
}

// 完成绘制
function completeDrawing() {
  if (currentPoints.length >= 3) {
    const newAnnotation: Annotation = {
      area_no: props.currentAreaNo,
      machine_id: `AUTO${props.currentAreaNo}`,
      color: props.drawColor,
      points: [...currentPoints]
    }

    const updatedAnnotations = [...props.annotations, newAnnotation]
    emit('annotation-update', updatedAnnotations)
    emit('drawing-complete')

    currentPoints = []
    isDrawingMode = false
  }
}

// 清除当前绘制
function clearCurrentDrawing() {
  currentPoints = []
  isDrawingMode = false
  draw()
}

// 删除标注
function deleteAnnotation(areaNo: number) {
  const updatedAnnotations = props.annotations.filter(
    (ann) => ann.area_no !== areaNo
  )
  emit('annotation-update', updatedAnnotations)
}

// 监听图像URL变化
watch(() => props.imageUrl, (newUrl) => {
  if (newUrl) {
    loadImage(newUrl)
  }
})

// 监听标注变化
watch(() => props.annotations, () => {
  draw()
}, { deep: true })

// 监听绘制模式变化
watch(() => props.isDrawing, (newVal) => {
  if (!newVal) {
    clearCurrentDrawing()
  }
})

// 窗口大小变化
function handleResize() {
  resizeCanvas()
}

onMounted(() => {
  if (props.imageUrl) {
    loadImage(props.imageUrl)
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 暴露方法给父组件
defineExpose({
  clearCurrentDrawing,
  deleteAnnotation,
  completeDrawing
})
</script>

<style scoped>
.annotation-canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
  overflow: hidden;
}

.canvas-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

canvas {
  position: absolute;
  cursor: crosshair;
  max-width: 100%;
  max-height: 100%;
}

.canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.timestamp {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.camera-id {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.mouse-coords {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>

