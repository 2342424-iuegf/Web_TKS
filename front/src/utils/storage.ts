class Storage {
  get(key: string): any {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('获取存储数据失败:', error)
      return null
    }
  }
  
  set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('设置存储数据失败:', error)
    }
  }
  
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('删除存储数据失败:', error)
    }
  }
  
  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('清空存储数据失败:', error)
    }
  }
  
  getSession(key: string): any {
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('获取会话存储数据失败:', error)
      return null
    }
  }
  
  setSession(key: string, value: any): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('设置会话存储数据失败:', error)
    }
  }
  
  removeSession(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error('删除会话存储数据失败:', error)
    }
  }
}

export const storage = new Storage()