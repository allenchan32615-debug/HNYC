Page({
  data: {
    taskId: '',
    submitting: false,
    pets: [],
    selectedPet: null,
    formData: {
      title: '',
      petId: '',
      petName: '',
      petImage: '',
      type: 'water',
      description: '',
      priority: 'medium',
      schedule: {
        type: 'daily',
        time: '09:00',
        interval: 1,
        weekdays: [1, 3, 5]
      },
      isPublic: true
    },
    taskTypes: [
      { value: 'water', label: '浇水', icon: '/images/icons/water.png' },
      { value: 'feed', label: '喂食', icon: '/images/icons/feed.png' },
      { value: 'sunbathe', label: '晒背', icon: '/images/icons/sun.png' },
      { value: 'prune', label: '修剪', icon: '/images/icons/scissors.png' },
      { value: 'clean', label: '清洁', icon: '/images/icons/clean.png' },
      { value: 'custom', label: '自定义', icon: '/images/icons/custom.png' }
    ],
    weekdays: [
      { value: 1, label: '一', selected: true },
      { value: 2, label: '二', selected: false },
      { value: 3, label: '三', selected: true },
      { value: 4, label: '四', selected: false },
      { value: 5, label: '五', selected: true },
      { value: 6, label: '六', selected: false },
      { value: 0, label: '日', selected: false }
    ]
  },

  onLoad(options) {
    this.loadPets()
    
    // 如果是编辑模式
    if (options.id) {
      this.setData({ taskId: options.id })
      this.loadTaskDetail(options.id)
    }
    
    // 如果指定了植宠 ID
    if (options.petId) {
      this.selectPetById(options.petId)
    }
  },

  // 加载植宠列表
  async loadPets() {
    try {
      const db = getApp().getDatabase()
      const app = getApp()
      
      const res = await db.collection('pets')
        .where({
          _openid: app.globalData.userInfo?._openid || ''
        })
        .get()
      
      this.setData({ pets: res.data || [] })
    } catch (error) {
      console.error('加载植宠失败:', error)
    }
  },

  // 加载任务详情
  async loadTaskDetail(taskId) {
    try {
      const db = getApp().getDatabase()
      const res = await db.collection('tasks').doc(taskId).get()
      
      const task = res.data
      const formData = {
        title: task.title,
        petId: task.petId,
        petName: task.petName,
        petImage: task.petImage,
        type: task.type,
        description: task.description,
        priority: task.priority,
        schedule: task.schedule,
        isPublic: task.isPublic || false
      }
      
      // 设置选中的植宠
      const selectedPet = this.data.pets.find(p => p._id === task.petId)
      
      // 设置星期选择
      const weekdays = this.data.weekdays.map(day => ({
        ...day,
        selected: task.schedule.weekdays?.includes(day.value) || false
      }))
      
      this.setData({
        formData,
        selectedPet,
        weekdays
      })
      
      wx.setNavigationBarTitle({
        title: '编辑任务'
      })
    } catch (error) {
      console.error('加载任务详情失败:', error)
    }
  },

  // 通过 ID 选择植宠
  selectPetById(petId) {
    const pet = this.data.pets.find(p => p._id === petId)
    if (pet) {
      this.setData({
        selectedPet: pet,
        'formData.petId': pet._id,
        'formData.petName': pet.name,
        'formData.petImage': pet.image
      })
    }
  },

  // 输入框变化
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 开关变化
  onSwitchChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 选择植宠
  selectPet() {
    if (this.data.pets.length === 0) {
      wx.showToast({
        title: '请先添加植宠',
        icon: 'none'
      })
      return
    }

    const petNames = this.data.pets.map(p => p.name)
    
    wx.showActionSheet({
      itemList: petNames,
      success: (res) => {
        const pet = this.data.pets[res.tapIndex]
        this.setData({
          selectedPet: pet,
          'formData.petId': pet._id,
          'formData.petName': pet.name,
          'formData.petImage': pet.image
        })
      }
    })
  },

  // 选择任务类型
  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      'formData.type': type
    })
  },

  // 选择优先级
  selectPriority(e) {
    const priority = e.currentTarget.dataset.priority
    this.setData({
      'formData.priority': priority
    })
  },

  // 时间选择
  onTimeChange(e) {
    const time = e.detail.value
    this.setData({
      'formData.schedule.time': time
    })
  },

  // 选择周期类型
  selectSchedule(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      'formData.schedule.type': type
    })
  },

  // 切换星期
  toggleWeekday(e) {
    const index = e.currentTarget.dataset.index
    const selected = !this.data.weekdays[index].selected
    
    this.setData({
      [`weekdays[${index}].selected`]: selected
    })
    
    // 更新选中的星期数组
    const selectedWeekdays = this.data.weekdays
      .filter(day => day.selected)
      .map(day => day.value)
    
    this.setData({
      'formData.schedule.weekdays': selectedWeekdays
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  },

  // 提交表单
  async submitForm() {
    // 验证表单
    const validation = this.validateForm()
    if (!validation.valid) {
      wx.showToast({
        title: validation.error,
        icon: 'none'
      })
      return
    }

    try {
      this.setData({ submitting: true })
      wx.showLoading({ title: '保存中' })

      const db = getApp().getDatabase()
      const app = getApp()
      const formData = this.data.formData

      // 计算下次执行时间
      const nextExecuteTime = this.calculateNextExecuteTime(formData.schedule)

      const taskData = {
        ...formData,
        petImage: formData.petImage || '/images/default-pet.png',
        isCompleted: false,
        nextExecuteTime,
        _openid: app.globalData.userInfo?._openid || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (this.data.taskId) {
        // 更新任务
        delete taskData.createdAt
        await db.collection('tasks').doc(this.data.taskId).update({
          data: taskData
        })
      } else {
        // 创建任务
        await db.collection('tasks').add({
          data: taskData
        })
      }

      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('保存任务失败:', error)
      wx.hideLoading()
      this.setData({ submitting: false })
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  // 计算下次执行时间
  calculateNextExecuteTime(schedule) {
    const now = new Date()
    const [hours, minutes] = schedule.time.split(':').map(Number)
    
    const nextTime = new Date(now)
    nextTime.setHours(hours, minutes, 0, 0)
    
    // 如果今天的时间已经过了，设置为明天
    if (nextTime <= now) {
      nextTime.setDate(nextTime.getDate() + 1)
    }
    
    // 如果是每周，检查是否是选中的星期
    if (schedule.type === 'weekly' && schedule.weekdays) {
      const currentWeekday = nextTime.getDay()
      if (!schedule.weekdays.includes(currentWeekday)) {
        // 找到下一个选中的星期
        for (let i = 1; i <= 7; i++) {
          const nextDate = new Date(nextTime)
          nextDate.setDate(nextDate.getDate() + i)
          const weekday = nextDate.getDay()
          if (schedule.weekdays.includes(weekday)) {
            return nextDate
          }
        }
      }
    }
    
    return nextTime
  },

  // 验证表单
  validateForm() {
    const formData = this.data.formData

    if (!formData.title || formData.title.trim() === '') {
      return { valid: false, error: '请输入任务标题' }
    }

    if (!formData.petId) {
      return { valid: false, error: '请选择关联植宠' }
    }

    if (!formData.schedule.time) {
      return { valid: false, error: '请选择提醒时间' }
    }

    if (formData.schedule.type === 'weekly' && formData.schedule.weekdays.length === 0) {
      return { valid: false, error: '请选择重复的星期' }
    }

    return { valid: true }
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
  }
})
