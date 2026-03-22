/**
 * 数据库设计文档
 * 
 * 云开发数据库集合设计
 */

// ==================== 用户集合 (users) ====================
/**
 * {
 *   _id: String, // 自动生成
 *   _openid: String, // 微信 openid
 *   nickName: String, // 昵称
 *   avatarUrl: String, // 头像
 *   gender: Number, // 性别 0:未知 1:男 2:女
 *   bio: String, // 个人简介
 *   following: [String], // 关注的用户 ID 列表
 *   followers: [String], // 粉丝用户 ID 列表
 *   createdAt: Date, // 创建时间
 *   updatedAt: Date // 更新时间
 * }
 */

// ==================== 植宠集合 (pets) ====================
/**
 * {
 *   _id: String,
 *   _openid: String,
 *   name: String, // 名称
 *   type: String, // 类型：plant/fish/bird/insect/other
 *   subtype: String, // 子类型：flower/tree/fish/turtle/bird/etc
 *   image: String, // 封面图片 fileID
 *   images: [String], // 图片列表 fileID
 *   birthday: Date, // 生日/购买日期
 *   firstMeetDate: Date, // 初见日期
 *   description: String, // 描述
 *   tags: [String], // 标签
 *   reminders: [ // 提醒设置
 *     {
 *       type: String, // 提醒类型：water/feed/sunbathe/prune/etc
 *       interval: Number, // 间隔天数
 *       lastTime: Date, // 上次执行时间
 *       enabled: Boolean // 是否启用
 *     }
 *   ],
 *   isPublic: Boolean, // 是否公开
 *   viewCount: Number, // 浏览次数
 *   likeCount: Number, // 点赞数
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */

// ==================== 任务集合 (tasks) ====================
/**
 * {
 *   _id: String,
 *   _openid: String,
 *   title: String, // 任务标题
 *   type: String, // 任务类型：water/feed/sunbathe/prune/clean/custom
 *   petId: String, // 关联的植宠 ID
 *   petName: String, // 关联的植宠名称（冗余）
 *   petImage: String, // 关联的植宠图片（冗余）
 *   description: String, // 任务描述
 *   priority: String, // 优先级：low/medium/high
 *   schedule: { // 重复周期设置
 *     type: String, // once/daily/weekly/custom
 *     interval: Number, // 间隔（天/周）
 *     weekdays: [Number], // 每周几执行 [1,3,5]
 *     time: String // 执行时间 "09:00"
 *   },
 *   remindTime: String, // 提醒时间 "08:30"
 *   isCompleted: Boolean, // 是否完成
 *   completedAt: Date, // 完成时间
 *   nextExecuteTime: Date, // 下次执行时间
 *   isPublic: Boolean, // 完成后是否发布到广场
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */

// ==================== 动态集合 (posts) ====================
/**
 * {
 *   _id: String,
 *   _openid: String,
 *   userId: String, // 用户 ID
 *   userNickName: String, // 用户昵称
 *   userAvatar: String, // 用户头像
 *   petId: String, // 关联植宠 ID（可选）
 *   petName: String, // 关联植宠名称
 *   petType: String, // 关联植宠类型
 *   content: String, // 文字内容
 *   images: [String], // 图片列表 fileID
 *   videos: [String], // 视频列表 fileID（可选）
 *   type: String, // 动态类型：daily/task/achievement
 *   taskId: String, // 关联任务 ID（可选）
 *   location: String, // 位置（可选）
 *   likes: [String], // 点赞用户 ID 列表
 *   comments: [ // 评论列表
 *     {
 *       userId: String,
 *       userNickName: String,
 *       userAvatar: String,
 *       content: String,
 *       createdAt: Date
 *     }
 *   ],
 *   viewCount: Number, // 浏览次数
 *   isDeleted: Boolean, // 是否删除
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */

// ==================== 评论集合 (comments) ====================
/**
 * {
 *   _id: String,
 *   _openid: String,
 *   postId: String, // 动态 ID
 *   userId: String,
 *   userNickName: String,
 *   userAvatar: String,
 *   content: String,
 *   parentId: String, // 父评论 ID（回复功能）
 *   replyTo: String, // 回复的用户昵称
 *   likes: [String], // 点赞用户
 *   createdAt: Date
 * }
 */

// ==================== 索引设计 ====================
/**
 * users:
 *   - _openid (unique)
 * 
 * pets:
 *   - _openid (index)
 *   - type (index)
 *   - isPublic (index)
 *   - createdAt (index)
 * 
 * tasks:
 *   - _openid (index)
 *   - petId (index)
 *   - isCompleted (index)
 *   - nextExecuteTime (index)
 * 
 * posts:
 *   - _openid (index)
 *   - userId (index)
 *   - petId (index)
 *   - createdAt (index)
 *   - isDeleted (index)
 * 
 * comments:
 *   - postId (index)
 *   - userId (index)
 */
