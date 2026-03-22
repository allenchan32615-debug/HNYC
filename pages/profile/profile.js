const app = getApp()

Page({
  data: {
    userId: '',
    isMyProfile: true,
    userInfo: null,
    pets: [],
    posts: [],
    stats: {
      petCount: 0,
      followingCount: 0,
      followersCount: 0,
      postsCount: 0
    },
    isFollowed: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        userId: options.id,
        isMyProfile: false
      })
    }
    this.loadProfile()
  },

  onShow() {
    if (this.data.isMyProfile) {
      this.loadProfile()
    }
  },

  // 加载个人主页数据
  async loadProfile() {
    try {
      const db = app.getDatabase()
      const currentUserId = app.globalData.userInfo?._id
      const targetUserId = this.data.userId || currentUserId

      // 加载用户信息
      const userRes = await db.collection('users')
        .where({ _id: targetUserId })
        .get()
      
      if (userRes.data.length > 0) {
        const userInfo = userRes.data[0]
        this.setData({
          userInfo,
          'stats.followingCount': (userInfo.following || []).length,
          'stats.followersCount': (userInfo.followers || []).length
        })

        // 检查是否关注
        if (!this.data.isMyProfile) {
          const isFollowed = (app.globalData.userInfo?.following || []).includes(targetUserId)
          this.setData({ isFollowed })
        }
      }

      // 加载植宠列表
      const petsRes = await db.collection('pets')
        .where({
          _openid: targetUserId
        })
        .orderBy('createdAt', 'desc')
        .get()
      
      const pets = petsRes.data || []
      this.setData({
        pets,
        'stats.petCount': pets.length
      })

      // 加载动态列表
      const postsRes = await db.collection('posts')
        .where({
          userId: targetUserId,
          isDeleted: false
        })
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get()
      
      const posts = postsRes.data || []
      this.setData({
        posts,
        'stats.postsCount': posts.length
      })
    } catch (error) {
      console.error('加载个人主页失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 切换关注状态
  async toggleFollow() {
    try {
      const db = app.getDatabase()
      const currentUserId = app.globalData.userInfo?._id
      const targetUserId = this.data.userId

      if (this.data.isFollowed) {
        // 取消关注
        const confirmed = await wx.showModal({
          title: '确认',
          content: '确定要取消关注吗？'
        })

        if (confirmed.confirm) {
          let following = app.globalData.userInfo.following || []
          following = following.filter(id => id !== targetUserId)

          await db.collection('users').doc(currentUserId).update({
            data: { following }
          })

          app.globalData.userInfo.following = following
          wx.setStorageSync('userInfo', app.globalData.userInfo)

          this.setData({
            isFollowed: false,
            'stats.followersCount': this.data.stats.followersCount - 1
          })

          wx.showToast({
            title: '已取消关注',
            icon: 'success'
          })
        }
      } else {
        // 关注
        let following = app.globalData.userInfo.following || []
        following.push(targetUserId)

        await db.collection('users').doc(currentUserId).update({
          data: { following }
        })

        // 更新对方的粉丝列表
        await db.collection('users').where({
          _id: targetUserId
        }).update({
          data: {
            followers: db.command.push(currentUserId)
          }
        })

        app.globalData.userInfo.following = following
        wx.setStorageSync('userInfo', app.globalData.userInfo)

        this.setData({
          isFollowed: true,
          'stats.followersCount': this.data.stats.followersCount + 1
        })

        wx.showToast({
          title: '关注成功',
          icon: 'success'
        })
      }
    } catch (error) {
      console.error('关注操作失败:', error)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 编辑资料
  editProfile() {
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    })
  },

  // 跳转植宠详情
  goToPetDetail(e) {
    const petId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/pet-detail/pet-detail?id=${petId}`
    })
  },

  // 跳转动态详情
  goToPostDetail(e) {
    // TODO: 实现动态详情页
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
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
  }
})
