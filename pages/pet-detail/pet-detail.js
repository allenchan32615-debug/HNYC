Page({
  data: {
    petId: '',
    petInfo: null,
    posts: [],
    tasks: [],
    currentTab: 'growth',
    petTypeName: '',
    subTypeName: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ petId: options.id })
      this.loadPetDetail()
      this.loadPosts()
      this.loadTasks()
    }
  },

  onShow() {
    // 刷新数据
    if (this.data.petId) {
      this.loadPetDetail()
      this.loadPosts()
      this.loadTasks()
    }
  },

  // 加载植宠详情
  async loadPetDetail() {
    try {
      const db = getApp().getDatabase()
      const res = await db.collection('pets').doc(this.data.petId).get()
      
      const petInfo = res.data
      this.setData({
        petInfo,
        petTypeName: this.getPetTypeName(petInfo.type),
        subTypeName: this.getSubTypeName(petInfo.subtype)
      })
      
      // 设置页面标题
      wx.setNavigationBarTitle({
        title: petInfo.name
      })
    } catch (error) {
      console.error('加载植宠详情失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 加载动态列表
  async loadPosts() {
    try {
      const db = getApp().getDatabase()
      const res = await db.collection('posts')
        .where({
          petId: this.data.petId,
          isDeleted: false
        })
        .orderBy('createdAt', 'desc')
        .get()
      
      const posts = res.data || []
      this.setData({ posts })
    } catch (error) {
      console.error('加载动态失败:', error)
    }
  },

  // 加载任务列表
  async loadTasks() {
    try {
      const db = getApp().getDatabase()
      const res = await db.collection('tasks')
        .where({
          petId: this.data.petId
        })
        .orderBy('isCompleted', 'asc')
        .orderBy('nextExecuteTime', 'asc')
        .get()
      
      const tasks = res.data || []
      this.setData({ tasks })
    } catch (error) {
      console.error('加载任务失败:', error)
    }
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
  },

  // 编辑植宠
  editPet() {
    wx.navigateTo({
      url: `/pages/edit-pet/edit-pet?id=${this.data.petId}`
    })
  },

  // 分享植宠
  sharePet() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    
    wx.showModal({
      title: '分享',
      content: `快来看我的${this.data.petInfo.name}！`,
      showCancel: false
    })
  },

  // 发布动态
  publishDynamic() {
    wx.navigateTo({
      url: `/pages/publish/publish?petId=${this.data.petId}`
    })
  },

  // 添加任务
  addTask() {
    wx.navigateTo({
      url: `/pages/task-form/task-form?petId=${this.data.petId}`
    })
  },

  // 完成任务
  async completeTask(e) {
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
      
      // 如果完成且公开，询问是否发布动态
      if (isCompleted && task.isPublic) {
        setTimeout(() => {
          wx.showModal({
            title: '发布动态',
            content: '是否将这个任务完成情况发布到公园广场？',
            success: (res) => {
              if (res.confirm) {
                this.publishTaskCompletion(task)
              }
            }
          })
        }, 1000)
      }
      
      // 刷新任务列表
      this.loadTasks()
    } catch (error) {
      console.error('完成任务失败:', error)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 发布任务完成动态
  async publishTaskCompletion(task) {
    try {
      const db = getApp().getDatabase()
      const app = getApp()
      
      await db.collection('posts').add({
        data: {
          _openid: app.globalData.userInfo?._openid || '',
          userId: app.globalData.userInfo?._id || '',
          userNickName: app.globalData.userInfo?.nickName || '未知用户',
          userAvatar: app.globalData.userInfo?.avatarUrl || '',
          petId: this.data.petId,
          petName: this.data.petInfo.name,
          petType: this.data.petInfo.type,
          content: `完成了${task.title}任务`,
          images: [],
          type: 'task',
          taskId: task._id,
          likes: [],
          comments: [],
          viewCount: 0,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('发布动态失败:', error)
    }
  },

  // 点赞动态
  async likePost(e) {
    const postId = e.currentTarget.dataset.id
    const post = this.data.posts.find(p => p._id === postId)
    
    try {
      const db = getApp().getDatabase()
      const app = getApp()
      const userId = app.globalData.userInfo?._openid || ''
      
      let likes = post.likes || []
      const isLiked = likes.includes(userId)
      
      if (isLiked) {
        // 取消点赞
        likes = likes.filter(id => id !== userId)
      } else {
        // 点赞
        likes.push(userId)
      }
      
      await db.collection('posts').doc(postId).update({
        data: {
          likes
        }
      })
      
      // 刷新动态列表
      this.loadPosts()
    } catch (error) {
      console.error('点赞失败:', error)
    }
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index
    const source = e.currentTarget.dataset.source
    
    let urls = []
    if (source === 'post') {
      urls = this.data.posts.find(p => p.images && p.images[index])?.images || []
    } else {
      urls = this.data.petInfo.images
    }
    
    wx.previewImage({
      urls,
      current: index
    })
  },

  // 获取类型名称
  getPetTypeName(type) {
    const names = {
      plant: '植物',
      flower: '花卉',
      tree: '树木',
      fish: '鱼类',
      turtle: '龟类',
      bird: '鸟类',
      insect: '昆虫',
      other: '其他'
    }
    return names[type] || '其他'
  },

  getSubTypeName(subtype) {
    const names = {
      flower: '花卉',
      tree: '树木',
      succulent: '多肉',
      vine: '藤蔓',
      fish: '鱼类',
      turtle: '龟类',
      bird: '鸟类',
      insect: '昆虫',
      other: '其他'
    }
    return names[subtype] || '其他'
  },

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

  getPostTypeText(type) {
    const texts = {
      daily: '日常',
      task: '任务',
      achievement: '成就'
    }
    return texts[type] || '日常'
  },

  getPriorityText(priority) {
    const texts = {
      low: '低',
      medium: '中',
      high: '高'
    }
    return texts[priority] || '中'
  },

  getPriorityColor(priority) {
    const colors = {
      low: '#999999',
      medium: '#FF9800',
      high: '#F44336'
    }
    return colors[priority] || colors.medium
  },

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
      return `${typeText}(${weekdays}) ${schedule.time}`
    }
    
    return `${typeText} ${schedule.time || ''}`
  },

  calculateDuration(startDate) {
    if (!startDate) return '未知'
    const start = new Date(startDate)
    const end = new Date()
    const diff = end - start
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) return '还未开始'
    if (days === 0) return '今天'
    if (days < 30) return `${days}天`
    if (days < 365) {
      const months = Math.floor(days / 30)
      return `${months}个月`
    }
    const years = Math.floor(days / 365)
    return `${years}年`
  },

  calculateAge(birthday) {
    if (!birthday) return '未知'
    const birth = new Date(birthday)
    const now = new Date()
    const years = now.getFullYear() - birth.getFullYear()
    
    if (years < 0) return '还未出生'
    if (years === 0) {
      const months = now.getMonth() - birth.getMonth()
      if (months <= 0) {
        const days = Math.floor((now - birth) / (1000 * 60 * 60 * 24))
        return `${days}天`
      }
      return `${months}个月`
    }
    return `${years}岁`
  },

  formatRelativeTime(date) {
    if (!date) return ''
    const now = new Date()
    const target = new Date(date)
    const diff = now - target
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    
    if (seconds < 60) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 30) return `${days}天前`
    if (months < 12) return `${months}个月前`
    return `${Math.floor(months / 12)}年前`
  }
})
