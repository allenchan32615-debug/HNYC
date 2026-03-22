Page({
  data: {
    submitting: false,
    formData: {
      name: '',
      type: '', // plant | animal
      subtype: '', // flower/tree/fish/turtle/bird/etc
      image: '',
      images: [],
      description: '',
      birthday: '',
      firstMeetDate: '',
      reminders: [],
      isPublic: true
    },
    subtypes: [
      { category: 'plant', value: 'flower', label: '花卉', icon: '🌸' },
      { category: 'plant', value: 'tree', label: '树木', icon: '🌲' },
      { category: 'plant', value: 'succulent', label: '多肉', icon: '🌵' },
      { category: 'plant', value: 'vine', label: '藤蔓', icon: '🍃' },
      { category: 'animal', value: 'fish', label: '鱼类', icon: '🐟' },
      { category: 'animal', value: 'turtle', label: '龟类', icon: '🐢' },
      { category: 'animal', value: 'bird', label: '鸟类', icon: '🐦' },
      { category: 'animal', value: 'insect', label: '昆虫', icon: '🦋' },
      { category: 'animal', value: 'other', label: '其他', icon: '🐾' }
    ],
    reminderTypes: [
      { type: 'water', label: '浇水' },
      { type: 'feed', label: '喂食' },
      { type: 'sunbathe', label: '晒背' },
      { type: 'prune', label: '修剪' },
      { type: 'clean', label: '清洁' },
      { type: 'custom', label: '自定义' }
    ]
  },

  onLoad() {
    // 初始化默认提醒
    this.setDefaultReminders()
  },

  // 设置默认提醒
  setDefaultReminders() {
    // 根据类型设置默认提醒
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

  // 选择类型
  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      'formData.type': type,
      'formData.subtype': ''
    })
  },

  // 选择子类型
  selectSubtype(e) {
    const subtype = e.currentTarget.dataset.type
    const category = e.currentTarget.dataset.category
    
    if (category === this.data.formData.type) {
      this.setData({
        'formData.subtype': subtype
      })
    }
  },

  // 日期选择
  onDateChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 选择封面图片
  async chooseCoverImage() {
    try {
      const { tempFilePaths } = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      
      if (tempFilePaths.length > 0) {
        this.setData({
          'formData.image': tempFilePaths[0]
        })
      }
    } catch (error) {
      console.error('选择封面失败:', error)
    }
  },

  // 清除封面
  clearCoverImage() {
    this.setData({
      'formData.image': ''
    })
  },

  // 选择相册图片
  async chooseImages() {
    try {
      const remaining = 9 - this.data.formData.images.length
      const { tempFilePaths } = await wx.chooseImage({
        count: remaining,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      
      this.setData({
        'formData.images': [...this.data.formData.images, ...tempFilePaths]
      })
    } catch (error) {
      console.error('选择图片失败:', error)
    }
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index
    wx.previewImage({
      urls: this.data.formData.images,
      current: index
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.formData.images.filter((_, i) => i !== index)
    this.setData({
      'formData.images': images
    })
  },

  // 添加提醒
  addReminder() {
    wx.showActionSheet({
      itemList: ['浇水', '喂食', '晒背', '修剪', '清洁', '自定义'],
      success: (res) => {
        const types = ['water', 'feed', 'sunbathe', 'prune', 'clean', 'custom']
        const type = types[res.tapIndex]
        
        const newReminder = {
          id: Date.now().toString(),
          type,
          interval: 1,
          enabled: true,
          lastTime: null
        }
        
        this.setData({
          'formData.reminders': [...this.data.formData.reminders, newReminder]
        })
      }
    })
  },

  // 切换提醒开关
  toggleReminder(e) {
    const index = e.currentTarget.dataset.index
    const enabled = e.detail.value
    this.setData({
      [`formData.reminders[${index}].enabled`]: enabled
    })
  },

  // 删除提醒
  deleteReminder(e) {
    const index = e.currentTarget.dataset.index
    const reminders = this.data.formData.reminders.filter((_, i) => i !== index)
    this.setData({
      'formData.reminders': reminders
    })
  },

  // 获取提醒类型名称
  getReminderTypeName(type) {
    const names = {
      water: '浇水',
      feed: '喂食',
      sunbathe: '晒背',
      prune: '修剪',
      clean: '清洁',
      custom: '自定义'
    }
    return names[type] || '自定义'
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

      const app = getApp()
      const formData = this.data.formData

      // 上传图片
      let image = ''
      let images = []

      if (formData.image) {
        image = await app.utils.uploadImage(formData.image, 'pets')
      }

      if (formData.images.length > 0) {
        images = await app.utils.uploadImages(formData.images, 'pets')
      }

      // 保存数据
      const db = app.getDatabase()
      const petData = {
        ...formData,
        image,
        images,
        _openid: app.globalData.userInfo?._openid || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        likeCount: 0
      }

      await db.collection('pets').add({
        data: petData
      })

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
      console.error('保存植宠失败:', error)
      wx.hideLoading()
      this.setData({ submitting: false })
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  // 验证表单
  validateForm() {
    const formData = this.data.formData

    if (!formData.name || formData.name.trim() === '') {
      return { valid: false, error: '请输入名称' }
    }

    if (!formData.type) {
      return { valid: false, error: '请选择类型' }
    }

    if (!formData.subtype) {
      return { valid: false, error: '请选择具体类型' }
    }

    return { valid: true }
  }
})
