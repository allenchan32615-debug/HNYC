const app = getApp()

Page({
  data: {
    submitting: false,
    petId: '',
    selectedPet: null,
    pets: [],
    content: '',
    images: [],
    postType: 'daily',
    location: '',
    isPublic: true,
    showLocation: false
  },

  onLoad(options) {
    this.loadPets()
    
    // 如果指定了植宠 ID
    if (options.petId) {
      this.selectPetById(options.petId)
    }
  },

  // 加载植宠列表
  async loadPets() {
    try {
      const db = app.getDatabase()
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

  // 通过 ID 选择植宠
  selectPetById(petId) {
    const pet = this.data.pets.find(p => p._id === petId)
    if (pet) {
      this.setData({
        petId: pet._id,
        selectedPet: pet
      })
    }
  },

  // 选择植宠
  async selectPet() {
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
          petId: pet._id,
          selectedPet: pet
        })
      }
    })
  },

  // 内容变化
  onContentChange(e) {
    this.setData({
      content: e.detail.value
    })
  },

  // 选择图片
  async chooseImages() {
    try {
      const remaining = 9 - this.data.images.length
      
      const { tempFilePaths } = await wx.chooseImage({
        count: remaining,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      
      this.setData({
        images: [...this.data.images, ...tempFilePaths]
      })
    } catch (error) {
      console.error('选择图片失败:', error)
    }
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index
    wx.previewImage({
      urls: this.data.images,
      current: index
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images.filter((_, i) => i !== index)
    this.setData({ images })
  },

  // 选择类型
  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ postType: type })
  },

  // 选择位置
  async chooseLocation() {
    try {
      const { name, address } = await wx.chooseLocation({})
      this.setData({
        location: name || address,
        showLocation: true
      })
    } catch (error) {
      if (error.errMsg !== 'chooseLocation:fail cancel') {
        wx.showToast({
          title: '选择失败',
          icon: 'none'
        })
      }
    }
  },

  // 开关变化
  onSwitchChange(e) {
    this.setData({
      isPublic: e.detail.value
    })
  },

  // 提交动态
  async submitPost() {
    // 验证
    if (!this.data.content.trim() && this.data.images.length === 0) {
      wx.showToast({
        title: '请输入内容或上传图片',
        icon: 'none'
      })
      return
    }

    try {
      this.setData({ submitting: true })
      wx.showLoading({ title: '发布中' })

      const db = app.getDatabase()
      const userInfo = app.globalData.userInfo

      // 上传图片
      let imageUrls = []
      if (this.data.images.length > 0) {
        imageUrls = await Promise.all(
          this.data.images.map(path => app.utils.uploadImage(path, 'posts'))
        )
      }

      // 构建动态数据
      const postData = {
        _openid: userInfo?._openid || '',
        userId: userInfo?._id || '',
        userNickName: userInfo?.nickName || '未知用户',
        userAvatar: userInfo?.avatarUrl || '',
        petId: this.data.petId || '',
        petName: this.data.selectedPet?.name || '',
        petType: this.data.selectedPet?.type || '',
        petImage: this.data.selectedPet?.image || '',
        content: this.data.content,
        images: imageUrls,
        type: this.data.postType,
        location: this.data.location,
        likes: [],
        comments: [],
        viewCount: 0,
        isPublic: this.data.isPublic,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // 保存到数据库
      await db.collection('posts').add({
        data: postData
      })

      wx.hideLoading()
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      })

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('发布动态失败:', error)
      wx.hideLoading()
      this.setData({ submitting: false })
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      })
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
  }
})
