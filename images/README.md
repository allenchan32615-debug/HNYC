# 图片资源说明

由于小程序需要实际图片资源，以下是需要的图标和占位符说明。您可以使用 emoji 临时替代，或准备相应的图片资源。

## 需要的图标资源

### TabBar 图标 (images/tabbar/)
- home.png - 首页图标（公园广场）
- home-active.png - 首页选中状态
- space.png - 空间图标（我的空间）
- space-active.png - 空间选中状态

### 功能图标 (images/icons/)
- add-pet.png - 添加植宠图标
- task.png - 任务图标
- publish.png - 发布图标
- remind.png - 提醒图标
- more.png - 更多选项图标
- arrow-right.png - 右箭头图标
- search.png - 搜索图标
- water.png - 浇水图标
- feed.png - 喂食图标
- sun.png - 晒背图标
- scissors.png - 修剪图标
- clean.png - 清洁图标
- custom.png - 自定义图标

### 植宠类型图标 (images/icons/)
- plant.png - 植物图标
- flower.png - 花卉图标
- tree.png - 树木图标
- fish.png - 鱼类图标
- turtle.png - 龟类图标
- bird.png - 鸟类图标
- insect.png - 昆虫图标
- other.png - 其他图标

### 空状态图片 (images/)
- empty-pets.png - 无植宠空状态
- empty-tasks.png - 无任务空状态
- empty-posts.png - 无动态空状态

### 默认图片
- default-avatar.png - 默认头像
- default-pet.png - 默认植宠封面
- placeholder.png - 图片加载占位符

## 临时解决方案

当前代码中使用 emoji 作为临时替代，您可以在开发过程中：

1. 使用 emoji 表情（已实现）
2. 使用 iconfont 等图标库
3. 准备实际的 PNG/SVG 图片资源

## 推荐图标资源

### 免费图标库
1. [iconfont](https://www.iconfont.cn/) - 阿里巴巴矢量图标库
2. [IconPark](https://iconpark.oceanengine.com/) - 字节跳动图标库
3. [Remix Icon](https://remixicon.com/) - 开源图标库

### 设计风格建议
- 使用扁平化或线性图标
- 颜色以绿色系为主（#4CAF50）
- 保持图标风格一致性
- 尺寸建议：TabBar 图标 81x81px，功能图标 48x48px

## 图片资源准备

### 空状态插画
可以使用以下主题：
- 空花盆（表示无植宠）
- 空清单（表示无任务）
- 空相册（表示无动态）

### 默认封面图
- 植物剪影
- 花鸟鱼虫相关图案
- 自然风景

## 更新说明

当您准备好图片资源后：
1. 将图片放入对应的目录
2. 确保图片尺寸和格式正确
3. 更新代码中的图片路径引用
