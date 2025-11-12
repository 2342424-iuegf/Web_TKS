import { defineStore } from 'pinia'
import { ref } from 'vue'

interface SystemConfig {
  language: string
  theme: string
  refreshInterval: number
}

export const useSystemStore = defineStore('system', () => {
  const config = ref<SystemConfig>({
    language: 'zh-CN',
    theme: 'light',
    refreshInterval: 30000
  })
  
  function updateConfig(newConfig: Partial<SystemConfig>) {
    config.value = { ...config.value, ...newConfig }
  }
  
  function toggleTheme() {
    config.value.theme = config.value.theme === 'light' ? 'dark' : 'light'
  }
  
  return {
    config,
    updateConfig,
    toggleTheme
  }
})