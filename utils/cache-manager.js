/**
 * 离线缓存管理器
 * 支持基本操作在弱网或无网络环境下进行
 */

const CacheManager = {
  // 缓存配置
  config: {
    version: '1.0.0',
    maxSize: 100 * 1024 * 1024, // 100MB
    expireTime: 24 * 60 * 60 * 1000 // 24 小时
  },

  // 缓存数据
  cache: {
    pets: [],
    tasks: [],
    posts: [],
    userInfo: null,
    lastUpdate: 0
  },

  /**
   * 初始化缓存
   */
  init() {
    this.loadCache()
    
    // 检查缓存是否过期
    if (this.isCacheExpired()) {
      this.refreshCache()
    }
  },

  /**
   * 加载缓存
   */
  loadCache() {
    try {
      const cacheData = wx.getStorageSync('offlineCache')
      if (cacheData) {
        this.cache = { ...this.cache, ...cacheData }
      }
    } catch (error) {
      console.error('加载缓存失败:', error)
    }
  },

  /**
   * 保存缓存
   */
  saveCache() {
    try {
      wx.setStorageSync('offlineCache', this.cache)
    } catch (error) {
      console.error('保存缓存失败:', error)
    }
  },

  /**
   * 检查缓存是否过期
   */
  isCacheExpired() {
    const now = Date.now()
    return now - this.cache.lastUpdate > this.config.expireTime
  },

  /**
   * 刷新缓存
   */
  async refreshCache() {
    try {
      const app = getApp()
      const db = app.getDatabase()
      const openid = app.globalData.userInfo?._openid || ''

      // 并行加载数据
      const [petsRes, tasksRes, postsRes] = await Promise.all([
        db.collection('pets').where({ _openid: openid }).get(),
        db.collection('tasks').where({ _openid: openid }).get(),
        db.collection('posts').where({ userId: app.globalData.userInfo?._id || '' }).limit(20).get()
      ])

      this.cache = {
        pets: petsRes.data,
        tasks: tasksRes.data,
        posts: postsRes.data,
        userInfo: app.globalData.userInfo,
        lastUpdate: Date.now()
      }

      this.saveCache()
    } catch (error) {
      console.error('刷新缓存失败:', error)
    }
  },

  /**
   * 获取缓存的植宠列表
   */
  getPets() {
    return this.cache.pets
  },

  /**
   * 获取缓存的任务列表
   */
  getTasks() {
    return this.cache.tasks
  },

  /**
   * 获取缓存的动态列表
   */
  getPosts() {
    return this.cache.posts
  },

  /**
   * 更新缓存中的单个项目
   */
  updateItem(type, item) {
    const index = this.cache[type].findIndex(i => i._id === item._id)
    if (index >= 0) {
      this.cache[type][index] = item
    } else {
      this.cache[type].unshift(item)
    }
    this.saveCache()
  },

  /**
   * 从缓存中删除项目
   */
  removeItem(type, id) {
    this.cache[type] = this.cache[type].filter(item => item._id !== id)
    this.saveCache()
  },

  /**
   * 检查网络状态
   */
  async checkNetwork() {
    try {
      const networkType = await wx.getNetworkType()
      return networkType.networkType !== 'none'
    } catch (error) {
      return false
    }
  },

  /**
   * 智能加载数据
   * 优先使用网络，网络失败时使用缓存
   */
  async loadData(type, query = {}, options = {}) {
    const {
      useCache = true,
      forceRefresh = false
    } = options

    const isOnline = await this.checkNetwork()

    if (!isOnline && useCache) {
      // 离线模式，使用缓存
      wx.showToast({
        title: '离线模式',
        icon: 'none'
      })
      return this.cache[type] || []
    }

    try {
      // 在线模式，从网络加载
      const app = getApp()
      const db = app.getDatabase()
      
      let collectionQuery = db.collection(type).where(query)
      
      if (options.orderBy) {
        collectionQuery = collectionQuery.orderBy(options.orderBy.field, options.orderBy.direction)
      }
      
      if (options.limit) {
        collectionQuery = collectionQuery.limit(options.limit)
      }
      
      const res = await collectionQuery.get()
      
      // 更新缓存
      if (useCache) {
        this.cache[type] = res.data
        this.cache.lastUpdate = Date.now()
        this.saveCache()
      }
      
      return res.data
    } catch (error) {
      console.error('加载数据失败:', error)
      
      // 网络失败，使用缓存
      if (useCache) {
        wx.showToast({
          title: '网络不佳，使用缓存数据',
          icon: 'none'
        })
        return this.cache[type] || []
      }
      
      throw error
    }
  },

  /**
   * 清空缓存
   */
  clearCache() {
    this.cache = {
      pets: [],
      tasks: [],
      posts: [],
      userInfo: null,
      lastUpdate: 0
    }
    wx.removeStorageSync('offlineCache')
  },

  /**
   * 获取缓存状态
   */
  getCacheStatus() {
    const info = wx.getStorageInfoSync()
    return {
      size: info.currentSize,
      limit: info.limitSize,
      keys: info.keys.length,
      lastUpdate: this.cache.lastUpdate
    }
  }
}

/**
 * 数据同步管理器
 */
const SyncManager = {
  // 待同步的操作队列
  syncQueue: [],

  // 是否正在同步
  isSyncing: false,

  /**
   * 添加待同步操作
   */
  addSyncOperation(operation) {
    this.syncQueue.push({
      ...operation,
      timestamp: Date.now(),
      retry: 0
    })
    this.saveSyncQueue()
    
    // 尝试同步
    this.sync()
  },

  /**
   * 保存同步队列
   */
  saveSyncQueue() {
    try {
      wx.setStorageSync('syncQueue', this.syncQueue)
    } catch (error) {
      console.error('保存同步队列失败:', error)
    }
  },

  /**
   * 加载同步队列
   */
  loadSyncQueue() {
    try {
      this.syncQueue = wx.getStorageSync('syncQueue') || []
    } catch (error) {
      console.error('加载同步队列失败:', error)
    }
  },

  /**
   * 执行同步
   */
  async sync() {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return
    }

    const isOnline = await CacheManager.checkNetwork()
    if (!isOnline) {
      return
    }

    this.isSyncing = true

    try {
      const app = getApp()
      const db = app.getDatabase()

      // 处理队列中的操作
      const failed = []
      for (const operation of this.syncQueue) {
        try {
          await this.executeOperation(db, operation)
        } catch (error) {
          console.error('同步操作失败:', error)
          operation.retry++
          if (operation.retry < 3) {
            failed.push(operation)
          }
        }
      }

      // 保留失败的操作
      this.syncQueue = failed
      this.saveSyncQueue()
    } catch (error) {
      console.error('同步失败:', error)
    } finally {
      this.isSyncing = false
    }
  },

  /**
   * 执行单个操作
   */
  async executeOperation(db, operation) {
    const { type, action, data, id } = operation

    switch (action) {
      case 'add':
        await db.collection(type).add({ data })
        break
      case 'update':
        await db.collection(type).doc(id).update({ data })
        break
      case 'remove':
        await db.collection(type).doc(id).remove()
        break
    }
  },

  /**
   * 手动触发同步
   */
  async manualSync() {
    wx.showLoading({ title: '同步中...' })
    await this.sync()
    wx.hideLoading()
    wx.showToast({
      title: '同步完成',
      icon: 'success'
    })
  }
}

// 初始化
CacheManager.init()
SyncManager.loadSyncQueue()

// 监听网络状态变化
wx.onNetworkStatusChange((res) => {
  if (res.isConnected) {
    SyncManager.sync()
  }
})

module.exports = {
  CacheManager,
  SyncManager
}
