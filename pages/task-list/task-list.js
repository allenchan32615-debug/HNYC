Page({
  data: {
    tasks: [],
    filteredTasks: [],
    currentFilter: 'all',
    stats: {
      total: 0,
      pending: 0,
      completed: 0,
      today: 0
    },
    currentDate: '',
    sortBy: 'time'
  },

  onLoad(options) {
    const today = new Date()
    this.setData({
      currentDate: this.formatDate(today)
    })
    
    this.loadTasks()
  },

  onShow() {
    this.loadTasks()
  },

  // 加载任务列表
  async loadTasks() {
    try {
      wx.showLoading({ title: '加载中' })
      
      const db = getApp().getDatabase()
      const app = getApp()
      
      const res = await db.collection('tasks')
        .where({
          _openid: app.globalData.userInfo?._openid || ''
        })
        .orderBy('createdAt', 'desc')
        .get()
      
      const tasks = res.data || []
      this.setData({
        tasks,
        filteredTasks: this.filterTasks(tasks, this.data.currentFilter)
      })
      
      this.calculateStats(tasks)
      wx.hideLoading()
    } catch (error) {
      console.error('加载任务失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 筛选任务
  filterTasks(tasks, filter) {
    let filtered = [...tasks]
    
    if (filter === 'pending') {
      filtered = tasks.filter(t => !t.isCompleted)
    } else if (filter === 'completed') {
      filtered = tasks.filter(t => t.isCompleted)
    }
    
    // 排序
    return this.sortTasks(filtered)
  },

  // 排序任务
  sortTasks(tasks) {
    const sorted = [...tasks]
    
    if (this.data.sortBy === 'time') {
      sorted.sort((a, b) => {
        const timeA = a.schedule?.time || '00:00'
        const timeB = b.schedule?.time || '00:00'
        return timeA.localeCompare(timeB)
      })
    } else if (this.data.sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      sorted.sort((a, b) => {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
    }
    
    return sorted
  },

  // 计算统计数据
  calculateStats(tasks) {
    const total = tasks.length
    const pending = tasks.filter(t => !t.isCompleted).length
    const completed = tasks.filter(t => t.isCompleted).length
    
    // 今日任务
    const today = new Date()
    const todayStr = this.formatDate(today)
    const todayTasks = tasks.filter(t => {
      if (t.isCompleted) return false
      const schedule = t.schedule
      if (!schedule) return false
      
      // 检查是否是今日应执行的任务
      if (schedule.type === 'daily') {
        return true
      } else if (schedule.type === 'weekly' && schedule.weekdays) {
        return schedule.weekdays.includes(today.getDay())
      }
      
      return false
    }).length
    
    this.setData({
      'stats.total': total,
      'stats.pending': pending,
      'stats.completed': completed,
      'stats.today': todayTasks
    })
  },

  // 设置筛选
  setFilter(e) {
    const filter = e.currentTarget.dataset.type
    this.setData({
      currentFilter: filter,
      filteredTasks: this.filterTasks(this.data.tasks, filter)
    })
  },

  // 显示排序菜单
  showSortMenu() {
    wx.showActionSheet({
      itemList: ['按时间排序', '按优先级排序'],
      success: (res) => {
        this.setData({
          sortBy: res.tapIndex === 0 ? 'time' : 'priority'
        })
        this.setFilter({ currentTarget: { dataset: { type: this.data.currentFilter } } })
      }
    })
  },

  // 切换任务状态
  async toggleTask(e) {
    const taskId = e.currentTarget.dataset.id
    const task = this.data.tasks.find(t => t._id === taskId)
    
    try {
      const db = getApp().getDatabase()
      const isCompleted = !task.isCompleted
      
      await db.collection('tasks').doc(taskId).update({
        data: {
          isCompleted,
          completedAt: isCompleted ? new Date() : null
        }
      })
      
      wx.showToast({
        title: isCompleted ? '任务已完成' : '任务已取消',
        icon: 'success'
      })
      
      // 刷新列表
      this.loadTasks()
    } catch (error) {
      console.error('切换任务状态失败:', error)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 添加任务
  addTask() {
    wx.navigateTo({
      url: '/pages/task-form/task-form'
    })
  },

  // 编辑任务
  editTask(e) {
    const taskId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/task-form/task-form?id=${taskId}`
    })
  },

  // 删除任务
  async deleteTask(e) {
    const taskId = e.currentTarget.dataset.id
    
    try {
      const confirmed = await wx.showModal({
        title: '确认删除',
        content: '确定要删除这个任务吗？'
      })
      
      if (confirmed.confirm) {
        const db = getApp().getDatabase()
        await db.collection('tasks').doc(taskId).remove()
        
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        
        this.loadTasks()
      }
    } catch (error) {
      console.error('删除任务失败:', error)
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  },

  // 获取任务类型文本
  getTaskTypeText(type) {
    const texts = {
      water: '浇水',
      feed: '喂食',
      sunbathe: '晒背',
      prune: '修剪',
      clean: '清洁',
      custom: '自定义'
    }
    return texts[type] || '自定义'
  },

  // 获取任务类型图标
  getTaskTypeIcon(type) {
    const icons = {
      water: '/images/icons/water.png',
      feed: '/images/icons/feed.png',
      sunbathe: '/images/icons/sun.png',
      prune: '/images/icons/scissors.png',
      clean: '/images/icons/clean.png',
      custom: '/images/icons/custom.png'
    }
    return icons[type] || icons.custom
  },

  // 获取优先级文本
  getPriorityText(priority) {
    const texts = {
      low: '低',
      medium: '中',
      high: '高'
    }
    return texts[priority] || '中'
  },

  // 获取优先级颜色
  getPriorityColor(priority) {
    const colors = {
      low: '#999999',
      medium: '#FF9800',
      high: '#F44336'
    }
    return colors[priority] || colors.medium
  },

  // 获取周期文本
  getScheduleText(schedule) {
    if (!schedule) return ''
    
    const types = {
      once: '仅一次',
      daily: '每天',
      weekly: '每周',
      custom: '自定义'
    }
    
    const typeText = types[schedule.type] || '自定义'
    
    if (schedule.type === 'weekly' && schedule.weekdays) {
      const weekdayMap = ['日', '一', '二', '三', '四', '五', '六']
      const weekdays = schedule.weekdays.map(d => `周${weekdayMap[d]}`).join('、')
      return `${typeText}(${weekdays})`
    }
    
    return typeText
  },

  // 格式化日期
  formatDate(date) {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
})
