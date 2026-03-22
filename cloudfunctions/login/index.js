// 云函数：用户登录
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { code } = event
  
  try {
    // 通过 code 获取用户 openid
    const result = await cloud.openapi.auth.code2Session({
      appid: wxContext.APPID,
      js_code: code,
      grant_type: 'authorization_code',
      secret: process.env.SECRET
    })
    
    const { openid, session_key } = result
    
    // 查询用户是否存在
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .get()
    
    let user = null
    if (userRes.data.length === 0) {
      // 创建新用户
      const createTime = new Date()
      const createUserRes = await db.collection('users').add({
        data: {
          _openid: openid,
          nickName: '花鸟鱼虫用户',
          avatarUrl: '/images/default-avatar.png',
          gender: 0,
          bio: '记录与花鸟鱼虫的美好时光',
          following: [],
          followers: [],
          createdAt: createTime,
          updatedAt: createTime
        }
      })
      
      user = {
        _id: createUserRes._id,
        _openid: openid,
        nickName: '花鸟鱼虫用户',
        avatarUrl: '/images/default-avatar.png',
        following: [],
        followers: []
      }
    } else {
      user = userRes.data[0]
    }
    
    return {
      success: true,
      userInfo: user,
      openid
    }
  } catch (error) {
    console.error('登录失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
