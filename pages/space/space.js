Page({
  data: {
    userInfo: null,
    pets: [],
    filteredPets: [],
    recentTasks: [],
    currentFilter: 'all',
    petCount: 0,
    taskCount: 0,
    dynamicCount: 0
  },

  onLoad() {
    this.loadUserInfo()
    this.loadPets()
    this.loadTasks()
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadPets()
    this.loadTasks()
  },

  // 加载用户信息
  async loadUserInfo() {
    const app = getApp()
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    
    if (userInfo) {
      this.setData({ userInfo })
    } else {
      // 引导登录
      this.showLoginGuide()
    }
  },

  // 显示登录引导
  showLoginGuide() {
    wx.showModal({
      title: '提示',
      content: '登录后可以记录你的植宠信息',
      confirmText: '立即登录',
      success: async (res) => {
        if (res.confirm) {
          await this.login()
        }
      }
    })
  },

  // 微信登录
  async login() {
    try {
      const { code } = await wx.login()
      // 调用云函数获取用户信息
      const result = await wx.cloud.callFunction({
        name: 'login',
        data: { code }
      })
      
      if (result.result && result.result.userInfo) {
        const userInfo = result.result.userInfo
        const app = getApp()
        app.globalData.userInfo = userInfo
        wx.setStorageSync('userInfo', userInfo)
        this.setData({ userInfo })
      }
    } catch (error) {
      console.error('登录失败:', error)
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
    }
  },

  // 加载植宠列表
  async loadPets() {
    try {
      wx.showLoading({ title: '加载中' })
      
      const db = getApp().getDatabase()
      const _ = db.command
      
      const res = await db.collection('pets')
        .where({
          _openid: getApp().globalData.userInfo?._openid || ''
        })
        .orderBy('createdAt', 'desc')
        .get()
      
      const pets = res.data || []
      this.setData({
        pets,
        filteredPets: this.filterPetsByType(pets, this.data.currentFilter),
        petCount: pets.length
      })
      
      wx.hideLoading()
    } catch (error) {
      console.error('加载植宠失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 加载任务列表
  async loadTasks() {
    try {
      const db = getApp().getDatabase()
      
      const res = await db.collection('tasks')
        .where({
          _openid: getApp().globalData.userInfo?._openid || '',
          isCompleted: false
        })
        .orderBy('nextExecuteTime', 'asc')
        .limit(5)
        .get()
      
      const tasks = res.data || []
      const pendingCount = tasks.length
      
      // 统计动态数量
      const postsRes = await db.collection('posts')
        .where({
          _openid: getApp().globalData.userInfo?._openid || '',
          isDeleted: false
        })
        .count()
      
      this.setData({
        recentTasks: tasks,
        taskCount: pendingCount,
        dynamicCount: postsRes.total
      })
    } catch (error) {
      console.error('加载任务失败:', error)
    }
  },

  // 筛选植宠
  filterPetsByType(pets, type) {
    if (type === 'all') {
      return pets
    } else if (type === 'plant') {
      return pets.filter(pet => pet.type === 'plant')
    } else if (type === 'animal') {
      return pets.filter(pet => pet.type !== 'plant')
    }
    return pets
  },

  // 筛选植宠类型
  filterPets(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      currentFilter: type,
      filteredPets: this.filterPetsByType(this.data.pets, type)
    })
  },

  // 添加植宠
  addPet() {
    wx.navigateTo({
      url: '/pages/add-pet/add-pet'
    })
  },

  // 跳转到任务列表
  goToTaskList() {
    wx.navigateTo({
      url: '/pages/task-list/task-list'
    })
  },

  // 跳转到植宠详情
  goToPetDetail(e) {
    const petId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/pet-detail/pet-detail?id=${petId}`
    })
  },

  // 发布动态
  publishDynamic() {
    wx.navigateTo({
      url: '/pages/publish/publish'
    })
  },

  // 查看提醒
  viewReminders() {
    wx.navigateTo({
      url: '/pages/task-list/task-list?type=reminders'
    })
  },

  // 完成任
  async completeTask(e) {
    const taskId = e.currentTarget.dataset.id
    
    try {
      wx.showLoading({ title: '完成中' })
      
      const db = getApp().getDatabase()
      await db.collection('tasks').doc(taskId).update({
        data: {
          isCompleted: true,
          completedAt: new Date()
        }
      })
      
      wx.hideLoading()
      wx.showToast({
        title: '任务已完成',
        icon: 'success'
      })
      
      // 刷新任务列表
      this.loadTasks()
    } catch (error) {
      console.error('完成任务失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 显示植宠操作菜单
  showPetActions(e) {
    const petId = e.currentTarget.dataset.id
    const pet = this.data.pets.find(p => p._id === petId)
    
    wx.showActionSheet({
      itemList: ['编辑信息', '查看主页', '删除植宠'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.editPet(petId)
        } else if (res.tapIndex === 1) {
          this.goToPetDetail({ currentTarget: { dataset: { id: petId } } })
        } else if (res.tapIndex === 2) {
          this.deletePet(petId)
        }
      }
    })
  },

  // 编辑植宠
  editPet(petId) {
    wx.navigateTo({
      url: `/pages/edit-pet/edit-pet?id=${petId}`
    })
  },

  // 删除植宠
  async deletePet(petId) {
    try {
      const confirmed = await wx.showModal({
        title: '确认删除',
        content: '确定要删除这个植宠吗？相关动态和任务也会被删除'
      })
      
      if (confirmed.confirm) {
        wx.showLoading({ title: '删除中' })
        
        const db = getApp().getDatabase()
        
        // 删除植宠
        await db.collection('pets').doc(petId).remove()
        
        // 删除相关任务
        const tasksRes = await db.collection('tasks')
          .where({ petId })
          .get()
        
        const deleteTasksPromises = tasksRes.data.map(task => 
          db.collection('tasks').doc(task._id).remove()
        )
        await Promise.all(deleteTasksPromises)
        
        wx.hideLoading()
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        
        // 刷新列表
        this.loadPets()
      }
    } catch (error) {
      console.error('删除植宠失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  },

  // 跳转到个人主页
  goToProfile() {
    if (this.data.userInfo) {
      wx.navigateTo({
        url: '/pages/profile/profile'
      })
    } else {
      this.showLoginGuide()
    }
  },

  // 获取植宠类型名称
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
      low: '低优先级',
      medium: '中优先级',
      high: '高优先级'
    }
    return texts[priority] || '中优先级'
  },

  // 获取优先级颜色
  getPriorityColor(priority) {
    const colors = {
      low: '#999999',
      medium: '#FF9800',
      high: '#F44336'
    }
    return colors[priority] || colors.medium
  }
})
