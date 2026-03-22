App({
  onLaunch() {
    // 初始化云开发环境
    if (wx.cloud) {
      wx.cloud.init({
        env: 'hny-env-xxx', // 替换为实际云环境 ID
        traceUser: true
      })
    }

    // 初始化全局数据
    this.globalData = {
      userInfo: null,
      pets: [],
      tasks: [],
      followedUsers: []
    }

    // 检查登录状态
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
  },

  // 获取云数据库引用
  getDatabase() {
    return wx.cloud.database()
  },

  // 全局工具方法
  utils: {
    // 格式化时间
    formatDate(date) {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    // 格式化日期时间
    formatDateTime(date) {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hour = String(d.getHours()).padStart(2, '0')
      const minute = String(d.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hour}:${minute}`
    },

    // 计算陪伴时长
    calculateDuration(startDate) {
      const start = new Date(startDate)
      const end = new Date()
      const diff = end - start
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      if (days < 30) {
        return `${days}天`
      } else if (days < 365) {
        const months = Math.floor(days / 30)
        return `${months}个月`
      } else {
        const years = Math.floor(days / 365)
        const months = Math.floor((days % 365) / 30)
        return `${years}年${months}个月`
      }
    },

    // 显示加载提示
    showLoading(title = '加载中') {
      wx.showLoading({
        title,
        mask: true
      })
    },

    // 隐藏加载提示
    hideLoading() {
      wx.hideLoading()
    },

    // 显示成功提示
    showSuccess(title) {
      wx.showToast({
        title,
        icon: 'success',
        duration: 2000
      })
    },

    // 显示错误提示
    showError(title) {
      wx.showToast({
        title,
        icon: 'none',
        duration: 2000
      })
    },

    // 图片上传
    uploadImage(tempFilePath) {
      return new Promise((resolve, reject) => {
        const cloudPath = `images/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
        wx.cloud.uploadFile({
          cloudPath,
          filePath: tempFilePath,
          success: res => resolve(res.fileID),
          fail: reject
        })
      })
    }
  }
})
