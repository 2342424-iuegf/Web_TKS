import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

// 配置dayjs插件
dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('zh-cn')

// 格式化日期
export function formatDate(date: string | number | Date, format: string = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

// 格式化日期时间
export function formatDateTime(date: string | number | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs(date).format(format)
}

// 格式化时间
export function formatTime(date: string | number | Date, format: string = 'HH:mm:ss'): string {
  return dayjs(date).format(format)
}

// 获取相对时间
export function fromNow(date: string | number | Date): string {
  return dayjs(date).fromNow()
}

// 获取时间差
export function getDuration(start: string | number | Date, end: string | number | Date): string {
  const diff = dayjs(end).diff(dayjs(start))
  return dayjs.duration(diff).format('HH:mm:ss')
}

// 获取今天的开始时间
export function getTodayStart(): Date {
  return dayjs().startOf('day').toDate()
}

// 获取今天的结束时间
export function getTodayEnd(): Date {
  return dayjs().endOf('day').toDate()
}

// 获取本周的开始时间
export function getWeekStart(): Date {
  return dayjs().startOf('week').toDate()
}

// 获取本周的结束时间
export function getWeekEnd(): Date {
  return dayjs().endOf('week').toDate()
}

// 获取本月的开始时间
export function getMonthStart(): Date {
  return dayjs().startOf('month').toDate()
}

// 获取本月的结束时间
export function getMonthEnd(): Date {
  return dayjs().endOf('month').toDate()
}