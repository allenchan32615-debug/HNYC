# 🌸 花鸟鱼虫 - 微信小程序

> 一款面向花鸟鱼虫爱好者的社交与管理小程序

[![微信小程序](https://img.shields.io/badge/平台 - 微信小程序 -07c160?style=flat-square)](https://developers.weixin.qq.com/miniprogram/dev/framework/)
[![云开发](https://img.shields.io/badge/技术 - 云开发 -07c160?style=flat-square)](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
[![版本](https://img.shields.io/badge/版本 -1.0.0-blue?style=flat-square)]()
[![完成度](https://img.shields.io/badge/完成度 -100%25-success?style=flat-square)]()

## 📱 项目简介

花鸟鱼虫是一款专为花鸟鱼虫爱好者设计的微信小程序，提供植宠管理、任务提醒、动态分享、社交互动等功能。帮助用户科学管理植宠，记录成长点滴，结识志同道合的朋友。

### 核心特色

- 🏡 **全面管理**: 完整的植宠档案库，支持植物和动物
- ⏰ **智能提醒**: 自定义任务系统，再也不怕忘记照顾
- 📊 **双时间线**: 独特设计，记录成长与任务历程
- 🌳 **社交广场**: 分享动态，关注互动，建立爱好者社区
- 🎨 **清新设计**: 自然风格，绿色主题，视觉舒适

## ✨ 功能特性

### 我的空间
- 📝 添加/编辑/删除植宠
- 🏷️ 支持多种类型（花卉/树木/鱼类/龟类/鸟类等）
- 📸 封面图和相册管理
- ⏰ 自定义提醒设置
- 📊 陪伴时长和年龄计算

### 定时任务
- 💧 浇水/🍖喂食/☀️晒背/✂️修剪等任务类型
- 📅 灵活的周期设置（每天/每周/自定义）
- 🔴 优先级管理
- ✅ 任务完成自动发布动态

### 对象主页
- 📖 专属档案页面
- 🌱 成长时间线（动态记录）
- ✅ 任务时间线（任务清单）
- 📊 基础信息展示

### 公园广场
- 📱 朋友圈式动态展示
- 🏷️ 分类筛选（植物/花卉/鱼类/龟类/鸟类）
- 📈 最新/热门排序
- ❤️ 点赞/💬评论/👥关注

### 个人主页
- 👤 用户信息展示
- 📊 统计数据（植宠/关注/粉丝/动态）
- 🌿 植宠列表
- 📝 动态列表

## 🛠 技术架构

```
┌─────────────────────────────────────┐
│         微信小程序前端               │
│  WXML + WXSS + JavaScript           │
├─────────────────────────────────────┤
│         云开发 Cloud Base           │
│  云函数 + 云数据库 + 云存储          │
└─────────────────────────────────────┘
```

### 技术栈
- **前端框架**: 微信小程序原生
- **后端服务**: 微信云开发
- **数据库**: 云数据库
- **存储**: 云存储
- **样式**: WXSS + CSS 变量

### 核心特性
- 🚀 Serverless 架构
- 🔒 数据安全保障
- ⚡ 离线缓存支持
- 📦 图片懒加载
- 🔄 智能数据同步

## 📂 项目结构

```
HNYC/
├── 📱 Pages (9 个页面)
│   ├── index/          - 公园广场
│   ├── space/          - 我的空间
│   ├── pet-detail/     - 植宠详情
│   ├── task-list/      - 任务列表
│   ├── task-form/      - 任务表单
│   ├── add-pet/        - 添加植宠
│   ├── edit-pet/       - 编辑植宠
│   ├── profile/        - 个人主页
│   └── publish/        - 发布动态
├── ☁️ Cloud Functions
│   └── login/          - 登录云函数
├── 🧰 Utils
│   ├── util.js         - 通用工具
│   ├── image-cache.js  - 图片缓存
│   └── cache-manager.js- 离线缓存
├── 📚 Documentation
│   ├── README.md       - 项目说明
│   ├── QUICKSTART.md   - 快速启动
│   ├── USER_GUIDE.md   - 使用指南
│   ├── PROJECT_SUMMARY.md - 项目总结
│   ├── DELIVERY.md     - 交付清单
│   └── ICONS.md        - 图标说明
└── 🎨 Configuration
    ├── app.js/json/wxss
    └── project.config.json
```

## 🚀 快速开始

### 环境要求
- 微信开发者工具 (最新版)
- 小程序 AppID
- 云开发环境

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd HNYC
```

2. **导入项目**
- 打开微信开发者工具
- 选择"导入项目"
- 选择 HNYC 目录
- 填入 AppID

3. **配置环境**
```javascript
// app.js
wx.cloud.init({
  env: 'your-env-id',  // 替换为你的云环境 ID
  traceUser: true
})
```

4. **部署云函数**
- 右键 `cloudfunctions/login`
- 选择"上传并部署：云端安装依赖"

5. **创建数据库**
在云开发控制台创建以下集合：
- users
- pets
- tasks
- posts
- comments

6. **运行项目**
- 点击"编译"按钮
- 查看预览效果

详细步骤请查看 [QUICKSTART.md](QUICKSTART.md)

## 📊 数据库设计

### 集合说明

| 集合名 | 说明 | 主要字段 |
|--------|------|----------|
| users | 用户信息 | nickName, avatarUrl, following, followers |
| pets | 植宠信息 | name, type, subtype, image, reminders |
| tasks | 任务信息 | title, type, petId, schedule, isCompleted |
| posts | 动态信息 | content, images, userId, petId, likes |
| comments | 评论信息 | postId, userId, content, likes |

详细设计请查看 [README-DATABASE.md](README-DATABASE.md)

## 🎨 设计系统

### 颜色
```css
--primary-green: #4CAF50    /* 主绿色 */
--light-green: #8BC34A      /* 浅绿色 */
--dark-green: #388E3C       /* 深绿色 */
--primary-blue: #2196F3     /* 主蓝色 */
--bg-color: #f5f7fa         /* 背景色 */
```

### 图标
- 当前使用 emoji 临时替代
- 建议替换为专业图标（见 [ICONS.md](ICONS.md)）

## 📖 文档索引

| 文档 | 说明 |
|------|------|
| [README.md](README.md) | 项目完整说明 |
| [QUICKSTART.md](QUICKSTART.md) | 快速启动指南 |
| [USER_GUIDE.md](USER_GUIDE.md) | 用户使用指南 |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | 项目总结 |
| [DELIVERY.md](DELIVERY.md) | 交付清单 |
| [ICONS.md](ICONS.md) | 图标资源说明 |
| [README-DATABASE.md](README-DATABASE.md) | 数据库设计 |

## 🎯 功能演示

### 使用流程

```
1. 登录 → 自动创建账号
   ↓
2. 添加植宠 → 填写信息 → 设置提醒
   ↓
3. 创建任务 → 设置周期 → 定时提醒
   ↓
4. 完成任务 → 发布动态 → 分享广场
   ↓
5. 浏览广场 → 互动社交 → 关注好友
```

### 核心功能

✅ **植宠管理**: 添加/编辑/删除，完整档案
✅ **任务系统**: 灵活周期，智能提醒
✅ **动态发布**: 图文结合，关联植宠
✅ **社交互动**: 关注/点赞/评论
✅ **双时间线**: 成长记录 + 任务清单

## 🔧 开发说明

### 代码规范
- 使用 ES6+ 语法
- 遵循微信小程序开发规范
- 统一命名规范
- 完整注释

### 性能优化
- 图片懒加载
- 数据分页
- 离线缓存
- 防抖节流

### 错误处理
- Try-catch 捕获异常
- 友好错误提示
- 日志记录

## 📈 项目数据

- 📄 **代码行数**: 5000+
- 📱 **页面数量**: 9
- ☁️ **云函数**: 1
- 🗄️ **数据库集合**: 5
- 🎨 **页面文件**: 36

## ⚠️ 注意事项

1. **云开发配置**: 必须开通云开发并配置环境 ID
2. **图标资源**: 当前使用 emoji，建议替换为实际图标
3. **数据库权限**: 需要正确配置集合权限
4. **测试数据**: 建议先添加测试数据验证功能

## 🚧 后续优化

### 功能扩展
- [ ] 搜索功能
- [ ] 消息通知
- [ ] 数据统计
- [ ] 话题社区
- [ ] 商城功能

### 体验优化
- [ ] 骨架屏
- [ ] 深色模式
- [ ] 动画优化
- [ ] 无障碍支持

## 🤝 贡献指南

欢迎贡献代码和建议！

## 📄 许可证

本项目仅供学习交流使用

## 📞 联系方式

如有问题，请查看文档或参考微信官方文档。

---

**Made with ❤️ for 花鸟鱼虫爱好者**

🌸🐟🐦 祝您使用愉快！
