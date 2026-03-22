/**
 * 图片缓存工具
 * 实现图片懒加载和离线缓存功能
 */

// 图片缓存管理器
const ImageCache = {
  // 缓存配置
  config: {
    maxSize: 50, // 最大缓存数量
    maxAge: 7 * 24 * 60 * 60 * 1000, // 缓存有效期 7 天
    cacheDir: 'image_cache' // 缓存目录
  },

  // 缓存映射表
  cacheMap: new Map(),

  /**
   * 初始化缓存
   */
  init() {
    // 从本地存储加载缓存信息
    try {
      const cacheInfo = wx.getStorageSync('imageCache')
      if (cacheInfo) {
        this.cacheMap = new Map(JSON.parse(cacheInfo))
      }
    } catch (error) {
      console.error('加载缓存失败:', error)
    }
    
    // 清理过期缓存
    this.cleanExpiredCache()
  },

  /**
   * 获取缓存的图片
   * @param {String} url - 图片 URL
   * @returns {String|null} 本地路径或 null
   */
  get(url) {
    const cache = this.cacheMap.get(url)
    if (!cache) {
      return null
    }

    // 检查是否过期
    if (Date.now() > cache.expire) {
      this.remove(url)
      return null
    }

    return cache.path
  },

  /**
   * 设置缓存
   * @param {String} url - 图片 URL
   * @param {String} localPath - 本地路径
   */
  async set(url, localPath) {
    // 检查缓存是否已满
    if (this.cacheMap.size >= this.config.maxSize) {
      this.cleanOldestCache()
    }

    const cache = {
      path: localPath,
      timestamp: Date.now(),
      expire: Date.now() + this.config.maxAge
    }

    this.cacheMap.set(url, cache)
    this.saveCache()
  },

  /**
   * 移除缓存
   * @param {String} url - 图片 URL
   */
  async remove(url) {
    const cache = this.cacheMap.get(url)
    if (cache) {
      try {
        // 删除本地文件
        await wx.removeSavedFile({
          filePath: cache.path
        })
      } catch (error) {
        console.error('删除缓存文件失败:', error)
      }
      this.cacheMap.delete(url)
      this.saveCache()
    }
  },

  /**
   * 下载并缓存图片
   * @param {String} url - 图片 URL
   * @returns {Promise<String>} 本地路径
   */
  async downloadAndCache(url) {
    // 检查是否已有缓存
    const cached = this.get(url)
    if (cached) {
      return cached
    }

    try {
      // 下载文件
      const downloadResult = await wx.downloadFile({
        url,
        success: (res) => {
          if (res.statusCode === 200) {
            return res.tempFilePath
          }
          throw new Error('下载失败')
        }
      })

      const tempFilePath = downloadResult.tempFilePath

      // 保存到本地
      const saveResult = await wx.saveFile({
        tempFilePath
      })

      const savedFilePath = saveResult.savedFilePath

      // 设置缓存
      await this.set(url, savedFilePath)

      return savedFilePath
    } catch (error) {
      console.error('缓存图片失败:', error)
      return url // 返回原 URL
    }
  },

  /**
   * 清理过期缓存
   */
  cleanExpiredCache() {
    const now = Date.now()
    for (const [url, cache] of this.cacheMap.entries()) {
      if (now > cache.expire) {
        this.remove(url)
      }
    }
  },

  /**
   * 清理最旧的缓存
   */
  cleanOldestCache() {
    // 按时间排序
    const sorted = Array.from(this.cacheMap.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    // 删除最旧的 10 个
    const toDelete = sorted.slice(0, 10)
    toDelete.forEach(([url]) => {
      this.remove(url)
    })
  },

  /**
   * 保存缓存信息到本地存储
   */
  saveCache() {
    try {
      wx.setStorageSync('imageCache', JSON.stringify(Array.from(this.cacheMap.entries())))
    } catch (error) {
      console.error('保存缓存失败:', error)
    }
  },

  /**
   * 清空所有缓存
   */
  clearAll() {
    this.cacheMap.clear()
    wx.removeStorageSync('imageCache')
  },

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      count: this.cacheMap.size,
      maxSize: this.config.maxSize,
      maxAge: this.config.maxAge
    }
  }
}

/**
 * 懒加载图片组件
 * @param {String} src - 图片源
 * @param {Object} options - 配置选项
 * @returns {Object} 图片加载状态
 */
function useLazyImage(src, options = {}) {
  const {
    placeholder = '/images/placeholder.png',
    useCache = true,
    onLoad,
    onError
  } = options

  const state = {
    src: placeholder,
    loaded: false,
    loading: false,
    error: false
  }

  /**
   * 加载图片
   */
  async function load() {
    if (state.loading || state.loaded) {
      return
    }

    state.loading = true
    state.error = false

    try {
      let imageSrc = src

      // 使用缓存
      if (useCache && src.startsWith('http')) {
        imageSrc = await ImageCache.downloadAndCache(src)
      }

      // 预加载图片
      await new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: imageSrc,
          success: resolve,
          fail: reject
        })
      })

      state.src = imageSrc
      state.loaded = true
      onLoad && onLoad()
    } catch (error) {
      console.error('加载图片失败:', error)
      state.error = true
      onError && onError(error)
    } finally {
      state.loading = false
    }
  }

  // 自动加载
  load()

  return {
    state,
    load,
    reload: load
  }
}

/**
 * 预加载多张图片
 * @param {Array} urls - 图片 URL 数组
 */
async function preloadImages(urls) {
  const promises = urls.map(url => {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: url,
        success: resolve,
        fail: reject
      })
    })
  })

  try {
    await Promise.all(promises)
    console.log('图片预加载完成')
  } catch (error) {
    console.error('图片预加载失败:', error)
  }
}

/**
 * 清除图片缓存
 */
function clearImageCache() {
  ImageCache.clearAll()
  wx.showToast({
    title: '缓存已清除',
    icon: 'success'
  })
}

module.exports = {
  ImageCache,
  useLazyImage,
  preloadImages,
  clearImageCache
}
