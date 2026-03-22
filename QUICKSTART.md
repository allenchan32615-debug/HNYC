# 花鸟鱼虫小程序 - 快速启动指南

## 📋 项目已完成功能

### ✅ 核心功能模块

#### 1. 我的空间
- **我的植宠**: 完整的植宠管理系统（添加/编辑/删除）
- **定时任务**: 自定义任务管理（浇水/喂食/晒背/修剪等）
- **对象主页**: 双时间线展示（成长记录 + 任务清单）

#### 2. 公园广场
- **动态展示**: 朋友圈 + 小红书风格的图文展示
- **分类筛选**: 按植宠类型分类（植物/花卉/鱼类/龟类/鸟类等）
- **社交互动**: 关注/点赞/评论/访问他人主页

#### 3. 个人主页
- 用户信息展示
- 植宠列表
- 动态列表
- 关注/粉丝管理

### ✅ 技术特性

- 🎨 **自然清新 UI**: 绿色系主题，符合目标用户审美
- 📱 **响应式设计**: 适配不同尺寸移动设备
- ⚡ **性能优化**: 图片懒加载、离线缓存
- 🔒 **数据安全**: 云开发存储，用户数据隔离
- 📡 **离线支持**: 弱网/无网络环境基本操作

## 🚀 快速启动步骤

### 步骤 1: 环境准备

```bash
# 1. 下载并安装微信开发者工具
https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

# 2. 注册微信小程序账号
https://mp.weixin.qq.com/
```

### 步骤 2: 导入项目

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择项目目录：`/Users/youyou/Documents/Trae/HNYC`
4. 填入你的 AppID（如无 AppID 可选择测试号）

### 步骤 3: 配置项目

#### 3.1 修改 project.config.json
```json
{
  "appid": "你的小程序 AppID",
  "projectname": "hny-miniprogram"
}
```

#### 3.2 修改 app.js
```javascript
// 在 app.js 中修改云开发环境 ID
wx.cloud.init({
  env: '你的云环境 ID',  // 替换这里
  traceUser: true
})
```

### 步骤 4: 开通云开发

1. 在微信开发者工具中点击"云开发"按钮
2. 开通云开发服务（免费版即可）
3. 记录下环境 ID（填入 app.js）

### 步骤 5: 创建数据库

在云开发控制台创建以下集合：

```
users      - 用户信息
pets       - 植宠信息
tasks      - 任务信息
posts      - 动态信息
comments   - 评论信息
```

#### 数据库索引设置

为以下字段创建索引：

**pets 集合:**
- _openid (升序)
- type (升序)
- isPublic (升序)
- createdAt (降序)

**tasks 集合:**
- _openid (升序)
- petId (升序)
- isCompleted (升序)
- nextExecuteTime (升序)

**posts 集合:**
- _openid (升序)
- userId (升序)
- petId (升序)
- createdAt (降序)

### 步骤 6: 部署云函数

1. 右键点击 `cloudfunctions/login` 目录
2. 选择"上传并部署：云端安装依赖"
3. 等待部署完成

### 步骤 7: 配置数据库权限

在云开发控制台设置数据库权限：

```javascript
// users 集合权限
{
  "read": true,
  "write": "auth.openid == doc._openid"
}

// pets 集合权限
{
  "read": "doc.isPublic == true || auth.openid == doc._openid",
  "write": "auth.openid == doc._openid"
}

// tasks 集合权限
{
  "read": "auth.openid == doc._openid",
  "write": "auth.openid == doc._openid"
}

// posts 集合权限
{
  "read": true,
  "write": "auth.openid == doc._openid"
}
```

### 步骤 8: 准备图标资源（可选）

项目当前使用 emoji 作为图标占位符。如需使用实际图标：

1. 创建 `images/tabbar/` 目录
2. 创建 `images/icons/` 目录
3. 添加所需的 PNG 图标（详见 `images/README.md`）

### 步骤 9: 编译运行

1. 点击微信开发者工具的"编译"按钮
2. 查看预览效果
3. 使用"真机预览"在手机上测试

## 📁 项目文件结构

```
HNYC/
├── app.js                    # 全局逻辑
├── app.json                  # 全局配置
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置
├── sitemap.json             # 站点地图
├── README.md                # 项目说明文档
├── README-DATABASE.md       # 数据库设计文档
├── cloudfunctions/          # 云函数
│   └── login/              # 登录云函数
├── pages/                   # 页面目录
│   ├── index/              # 公园广场（首页）
│   ├── space/              # 我的空间
│   ├── pet-detail/         # 植宠详情
│   ├── task-list/          # 任务列表
│   ├── task-form/          # 任务表单
│   ├── add-pet/            # 添加植宠
│   ├── edit-pet/           # 编辑植宠
│   ├── profile/            # 个人主页
│   └── publish/            # 发布动态
├── utils/                   # 工具函数
│   ├── util.js             # 通用工具
│   ├── image-cache.js      # 图片缓存
│   └── cache-manager.js    # 离线缓存
└── images/                  # 图片资源
    └── README.md           # 图片说明
```

## 🎯 功能测试建议

### 测试流程

1. **登录测试**
   - 首次进入会自动登录
   - 查看个人头像和昵称

2. **植宠管理测试**
   - 添加一个植宠（植物或动物）
   - 编辑植宠信息
   - 查看植宠详情页

3. **任务管理测试**
   - 为植宠创建任务
   - 设置任务周期（每天/每周）
   - 完成任务并查看动态

4. **动态发布测试**
   - 发布一条动态
   - 上传图片和文字
   - 查看公园广场展示

5. **社交功能测试**
   - 访问他人主页
   - 关注其他用户
   - 点赞和评论

### 测试数据

建议创建以下测试数据：
- 2-3 个植宠（不同类型）
- 5-10 个任务（不同周期）
- 5-10 条动态（带图片）

## ⚠️ 常见问题

### 1. 云函数调用失败
- 检查云开发是否已开通
- 检查环境 ID 是否正确
- 重新上传云函数

### 2. 数据库操作失败
- 检查数据库集合是否创建
- 检查数据库权限设置
- 检查索引是否建立

### 3. 图片上传失败
- 检查云存储空间是否充足
- 检查图片大小是否超限
- 检查网络状态

### 4. 样式显示异常
- 清除缓存重新编译
- 检查基础库版本
- 确保使用最新开发者工具

## 📊 性能优化建议

1. **图片优化**
   - 使用压缩图片
   - 控制图片大小（建议<200KB）
   - 使用 WebP 格式

2. **数据优化**
   - 分页加载数据
   - 合理使用缓存
   - 减少数据库查询

3. **体验优化**
   - 添加加载动画
   - 实现骨架屏
   - 优化错误提示

## 🎨 自定义配置

### 修改主题色

在 `app.wxss` 中修改 CSS 变量：

```css
page {
  --primary-green: #4CAF50;    /* 主绿色 */
  --light-green: #8BC34A;      /* 浅绿色 */
  --dark-green: #388E3C;       /* 深绿色 */
  --primary-blue: #2196F3;     /* 主蓝色 */
}
```

### 修改导航栏颜色

在 `app.json` 中修改：

```json
{
  "window": {
    "navigationBarBackgroundColor": "#4CAF50",
    "navigationBarTitleText": "花鸟鱼虫"
  }
}
```

## 📞 技术支持

如遇到问题：
1. 查看微信官方文档
2. 检查控制台错误信息
3. 清除缓存重新编译

## 📝 后续优化方向

- [ ] 添加搜索功能
- [ ] 实现消息通知
- [ ] 增加数据统计
- [ ] 优化动画效果
- [ ] 添加订阅消息
- [ ] 实现分享功能

---

**祝您使用愉快！🌸🐟🐦**
