/**
 * 工具函数库
 */

/**
 * 格式化日期
 * @param {Date|String} date - 日期对象或日期字符串
 * @returns {String} 格式化后的日期字符串 YYYY-MM-DD
 */
export const formatDate = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化日期时间
 * @param {Date|String} date - 日期对象或日期字符串
 * @returns {String} 格式化后的日期时间字符串 YYYY-MM-DD HH:mm
 */
export const formatDateTime = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

/**
 * 格式化相对时间
 * @param {Date|String} date - 日期对象或日期字符串
 * @returns {String} 相对时间描述
 */
export const formatRelativeTime = (date) => {
  const now = new Date()
  const target = new Date(date)
  const diff = now - target

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 30) {
    return `${days}天前`
  } else if (months < 12) {
    return `${months}个月前`
  } else {
    return `${years}年前`
  }
}

/**
 * 计算陪伴时长
 * @param {Date|String} startDate - 开始日期
 * @returns {String} 陪伴时长描述
 */
export const calculateDuration = (startDate) => {
  const start = new Date(startDate)
  const end = new Date()
  const diff = end - start
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days < 0) {
    return '还未开始'
  } else if (days === 0) {
    return '今天'
  } else if (days < 30) {
    return `${days}天`
  } else if (days < 365) {
    const months = Math.floor(days / 30)
    const remainingDays = days % 30
    return `${months}个月${remainingDays > 0 ? remainingDays + '天' : ''}`
  } else {
    const years = Math.floor(days / 365)
    const months = Math.floor((days % 365) / 30)
    return `${years}年${months > 0 ? months + '个月' : ''}`
  }
}

/**
 * 计算年龄
 * @param {Date|String} birthday - 生日
 * @returns {String} 年龄描述
 */
export const calculateAge = (birthday) => {
  const birth = new Date(birthday)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  
  if (years < 0) {
    return '还未出生'
  } else if (years === 0) {
    const totalMonths = months + 1
    if (totalMonths <= 0) {
      const days = Math.floor((now - birth) / (1000 * 60 * 60 * 24))
      return `${days}天`
    }
    return `${totalMonths}个月`
  } else {
    return `${years}岁`
  }
}

/**
 * 显示加载提示
 * @param {String} title - 加载提示文字
 */
export const showLoading = (title = '加载中') => {
  wx.showLoading({
    title,
    mask: true
  })
}

/**
 * 隐藏加载提示
 */
export const hideLoading = () => {
  wx.hideLoading()
}

/**
 * 显示成功提示
 * @param {String} title - 提示文字
 */
export const showSuccess = (title) => {
  wx.showToast({
    title,
    icon: 'success',
    duration: 2000
  })
}

/**
 * 显示错误提示
 * @param {String} title - 提示文字
 */
export const showError = (title) => {
  wx.showToast({
    title,
    icon: 'none',
    duration: 2000
  })
}

/**
 * 显示确认对话框
 * @param {String} content - 确认内容
 * @returns {Promise} 用户选择结果
 */
export const showConfirm = (content) => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: '提示',
      content,
      success: (res) => {
        if (res.confirm) {
          resolve(true)
        } else {
          resolve(false)
        }
      },
      fail: reject
    })
  })
}

/**
 * 图片上传到云存储
 * @param {String} tempFilePath - 临时文件路径
 * @param {String} folder - 云存储文件夹
 * @returns {Promise} 上传结果
 */
export const uploadImage = (tempFilePath, folder = 'images') => {
  return new Promise((resolve, reject) => {
    const cloudPath = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
    wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath,
      success: (res) => {
        resolve(res.fileID)
      },
      fail: reject
    })
  })
}

/**
 * 多图上传
 * @param {Array} tempFilePaths - 临时文件路径数组
 * @param {String} folder - 云存储文件夹
 * @returns {Promise} 上传结果数组
 */
export const uploadImages = (tempFilePaths, folder = 'images') => {
  const promises = tempFilePaths.map(path => uploadImage(path, folder))
  return Promise.all(promises)
}

/**
 * 选择图片
 * @param {Number} count - 选择数量
 * @returns {Promise} 选择的图片临时路径数组
 */
export const chooseImage = (count = 9) => {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths)
      },
      fail: reject
    })
  })
}

/**
 * 图片懒加载处理
 * @param {String} src - 图片地址
 * @returns {Object} 图片加载状态
 */
export const lazyLoadImage = (src) => {
  return {
    src,
    loaded: false,
    loading: false,
    error: false
  }
}

/**
 * 缓存数据
 * @param {String} key - 缓存键
 * @param {Any} data - 缓存数据
 * @param {Number} expire - 过期时间（秒）
 */
export const setCache = (key, data, expire = 3600) => {
  const cacheData = {
    data,
    expire: Date.now() + expire * 1000
  }
  wx.setStorageSync(key, cacheData)
}

/**
 * 获取缓存数据
 * @param {String} key - 缓存键
 * @returns {Any} 缓存数据，过期返回 null
 */
export const getCache = (key) => {
  const cacheData = wx.getStorageSync(key)
  if (!cacheData) {
    return null
  }
  if (cacheData.expire && Date.now() > cacheData.expire) {
    wx.removeStorageSync(key)
    return null
  }
  return cacheData.data
}

/**
 * 清除缓存
 * @param {String} key - 缓存键
 */
export const removeCache = (key) => {
  wx.removeStorageSync(key)
}

/**
 * 获取植宠类型图标
 * @param {String} type - 植宠类型
 * @returns {String} 图标路径
 */
export const getPetTypeIcon = (type) => {
  const icons = {
    plant: '/images/icons/plant.png',
    flower: '/images/icons/flower.png',
    tree: '/images/icons/tree.png',
    fish: '/images/icons/fish.png',
    turtle: '/images/icons/turtle.png',
    bird: '/images/icons/bird.png',
    insect: '/images/icons/insect.png',
    other: '/images/icons/other.png'
  }
  return icons[type] || icons.other
}

/**
 * 获取任务类型图标
 * @param {String} type - 任务类型
 * @returns {String} 图标路径
 */
export const getTaskTypeIcon = (type) => {
  const icons = {
    water: '/images/icons/water.png',
    feed: '/images/icons/feed.png',
    sunbathe: '/images/icons/sun.png',
    prune: '/images/icons/scissors.png',
    clean: '/images/icons/clean.png',
    custom: '/images/icons/custom.png'
  }
  return icons[type] || icons.custom
}

/**
 * 获取优先级颜色
 * @param {String} priority - 优先级
 * @returns {String} 颜色值
 */
export const getPriorityColor = (priority) => {
  const colors = {
    low: '#999999',
    medium: '#FF9800',
    high: '#F44336'
  }
  return colors[priority] || colors.medium
}

/**
 * 验证表单
 * @param {Object} data - 表单数据
 * @param {Array} rules - 验证规则
 * @returns {Object} 验证结果
 */
export const validateForm = (data, rules) => {
  const errors = {}
  
  for (const rule of rules) {
    const { field, required, minLength, maxLength, pattern, message } = rule
    const value = data[field]
    
    if (required && (!value || value.trim() === '')) {
      errors[field] = message || `${field}不能为空`
      continue
    }
    
    if (value) {
      if (minLength && value.length < minLength) {
        errors[field] = `最少${minLength}个字符`
      }
      
      if (maxLength && value.length > maxLength) {
        errors[field] = `最多${maxLength}个字符`
      }
      
      if (pattern && !pattern.test(value)) {
        errors[field] = message || '格式不正确'
      }
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

export default {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  calculateDuration,
  calculateAge,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showConfirm,
  uploadImage,
  uploadImages,
  chooseImage,
  lazyLoadImage,
  setCache,
  getCache,
  removeCache,
  getPetTypeIcon,
  getTaskTypeIcon,
  getPriorityColor,
  validateForm
}
