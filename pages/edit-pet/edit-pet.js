const app = getApp()

Page({
  data: {
    petId: '',
    submitting: false,
    formData: {
      name: '',
      type: '',
      subtype: '',
      image: '',
      images: [],
      description: '',
      birthday: '',
      firstMeetDate: '',
      reminders: [],
      isPublic: true
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ petId: options.id })
      this.loadPetDetail()
    }
  },

  // 加载植宠详情
  async loadPetDetail() {
    try {
      const db = app.getDatabase()
      const res = await db.collection('pets').doc(this.data.petId).get()
      
      const pet = res.data
      this.setData({
        formData: {
          name: pet.name,
          type: pet.type,
          subtype: pet.subtype,
          image: pet.image,
          images: pet.images || [],
          description: pet.description || '',
          birthday: pet.birthday,
          firstMeetDate: pet.firstMeetDate,
          reminders: pet.reminders || [],
          isPublic: pet.isPublic
        }
      })
    } catch (error) {
      console.error('加载植宠详情失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
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

      const db = app.getDatabase()
      const formData = this.data.formData

      // 上传图片（仅新上传的图片）
      let image = formData.image
      let images = [...formData.images]

      // 检查是否是 cloud ID
      const isCloudId = (url) => url.startsWith('cloud://')
      
      if (formData.image && !isCloudId(formData.image)) {
        image = await app.utils.uploadImage(formData.image, 'pets')
      }

      // 上传新图片
      const newImages = images.filter(img => !isCloudId(img))
      if (newImages.length > 0) {
        const uploadedImages = await app.utils.uploadImages(newImages, 'pets')
        // 替换已上传的图片
        let imageIndex = 0
        images = images.map(img => {
          if (!isCloudId(img)) {
            return uploadedImages[imageIndex++]
          }
          return img
        })
      }

      // 更新数据
      const updateData = {
        ...formData,
        image,
        images,
        updatedAt: new Date()
      }

      delete updateData.reminders // 提醒单独处理

      await db.collection('pets').doc(this.data.petId).update({
        data: updateData
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

    return { valid: true }
  }
})
