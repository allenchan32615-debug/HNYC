const app = getApp()

Page({
  data: {
    posts: [],
    currentCategory: 'all',
    currentSort: 'latest',
    loading: false,
    refreshing: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    currentUserId: ''
  },

  onLoad() {
    this.data.currentUserId = app.globalData.userInfo?._id || ''
    this.loadPosts()
  },

  onShow() {
    // 刷新数据
    if (this.data.posts.length > 0) {
      this.loadPosts(true)
    }
  },

  onPullDownRefresh() {
    this.refresh()
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadMore()
    }
  },

  // 加载动态列表
  async loadPosts(isRefresh = false) {
    if (this.data.loading) return

    try {
      this.setData({ loading: true })

      const db = app.getDatabase()
      const { page, pageSize, currentCategory, currentSort } = this.data

      // 构建查询条件
      let query = {
        isDeleted: false
      }

      // 分类筛选
      if (currentCategory !== 'all') {
        query.petType = currentCategory
      }

      // 排序
      let sortField = 'createdAt'
      let sortOrder = 'desc'
      
      if (currentSort === 'hot') {
        sortField = 'likeCount'
      }

      // 查询
      const res = await db.collection('posts')
        .where(query)
        .orderBy(sortField, sortOrder)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get()

      const newPosts = res.data || []

      if (isRefresh) {
        this.setData({
          posts: newPosts,
          page: 1,
          hasMore: newPosts.length >= pageSize
        })
      } else {
        this.setData({
          posts: [...this.data.posts, ...newPosts],
          page: page + 1,
          hasMore: newPosts.length >= pageSize
        })
      }

      // 获取用户关注状态
      await this.loadFollowStatus()

      this.setData({ loading: false, refreshing: false })
      
      if (isRefresh) {
        wx.stopPullDownRefresh()
      }
    } catch (error) {
      console.error('加载动态失败:', error)
      this.setData({ loading: false, refreshing: false })
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 加载更多
  async loadMore() {
    await this.loadPosts(false)
  },

  // 刷新
  async refresh() {
    this.setData({ refreshing: true })
    await this.loadPosts(true)
  },

  // 加载关注状态
  async loadFollowStatus() {
    try {
      const db = app.getDatabase()
      const following = app.globalData.userInfo?.following || []
      
      const posts = this.data.posts.map(post => ({
        ...post,
        isFollowed: following.includes(post.userId)
      }))
      
      this.setData({ posts })
    } catch (error) {
      console.error('加载关注状态失败:', error)
    }
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category,
      posts: [],
      page: 1,
      hasMore: true
    })
    this.loadPosts(true)
  },

  // 切换排序
  switchSort(e) {
    const sort = e.currentTarget.dataset.sort
    this.setData({
      currentSort: sort,
      posts: [],
      page: 1,
      hasMore: true
    })
    this.loadPosts(true)
  },

  // 发布动态
  publishDynamic() {
    wx.navigateTo({
      url: '/pages/publish/publish'
    })
  },

  // 显示搜索
  showSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },

  // 点赞
  async likePost(e) {
    const postId = e.currentTarget.dataset.id
    const post = this.data.posts.find(p => p._id === postId)
    
    try {
      const db = app.getDatabase()
      const userId = app.globalData.userInfo?._openid || ''
      
      let likes = post.likes || []
      const isLiked = likes.includes(userId)
      
      if (isLiked) {
        likes = likes.filter(id => id !== userId)
      } else {
        likes.push(userId)
      }
      
      await db.collection('posts').doc(postId).update({
        data: { likes }
      })
      
      // 更新本地数据
      const posts = this.data.posts.map(p => {
        if (p._id === postId) {
          return {
            ...p,
            likes,
            likeCount: likes.length,
            isLiked: likes.includes(userId)
          }
        }
        return p
      })
      
      this.setData({ posts })
    } catch (error) {
      console.error('点赞失败:', error)
    }
  },

  // 关注用户
  async followUser(e) {
    const userId = e.currentTarget.dataset.userId
    
    try {
      const confirmed = await wx.showModal({
        title: '关注',
        content: '确定要关注这位用户吗？'
      })
      
      if (confirmed.confirm) {
        const db = app.getDatabase()
        const currentUserId = app.globalData.userInfo?._id
        
        // 更新当前用户的关注列表
        const userInfo = app.globalData.userInfo
        let following = userInfo.following || []
        
        if (!following.includes(userId)) {
          following.push(userId)
          
          await db.collection('users').doc(currentUserId).update({
            data: { following }
          })
          
          // 更新对方的粉丝列表
          await db.collection('users').where({
            _id: userId
          }).update({
            data: {
              followers: db.command.push(currentUserId)
            }
          })
          
          // 更新本地数据
          app.globalData.userInfo.following = following
          wx.setStorageSync('userInfo', userInfo)
          
          const posts = this.data.posts.map(p => {
            if (p.userId === userId) {
              return { ...p, isFollowed: true }
            }
            return p
          })
          
          this.setData({ posts })
          
          wx.showToast({
            title: '关注成功',
            icon: 'success'
          })
        }
      }
    } catch (error) {
      console.error('关注失败:', error)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 查看用户主页
  goToUserProfile(e) {
    const userId = e.currentTarget.dataset.userId
    if (userId === this.data.currentUserId) {
      wx.navigateTo({
        url: '/pages/profile/profile'
      })
    } else {
      wx.navigateTo({
        url: `/pages/profile/profile?id=${userId}`
      })
    }
  },

  // 查看植宠详情
  goToPetDetail(e) {
    const petId = e.currentTarget.dataset.petId
    wx.navigateTo({
      url: `/pages/pet-detail/pet-detail?id=${petId}`
    })
  },

  // 预览图片
  previewImages(e) {
    const postIndex = e.currentTarget.dataset.postIndex
    const imageIndex = e.currentTarget.dataset.index
    const post = this.data.posts[postIndex]
    
    wx.previewImage({
      urls: post.images,
      current: imageIndex
    })
  },

  // 显示评论
  showComments(e) {
    const postId = e.currentTarget.dataset.id
    const posts = this.data.posts.map(p => {
      if (p._id === postId) {
        return { ...p, showComments: !p.showComments }
      }
      return p
    })
    this.setData({ posts })
  },

  // 查看全部评论
  viewAllComments(e) {
    const postId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/comments/comments?postId=${postId}`
    })
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

  // 获取动态类型文本
  getPostTypeText(type) {
    const texts = {
      daily: '日常',
      task: '任务',
      achievement: '成就'
    }
    return texts[type] || '日常'
  },

  // 格式化相对时间
  formatRelativeTime(date) {
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
  },

  // 下拉刷新
  onRefresh() {
    this.refresh()
  }
})
