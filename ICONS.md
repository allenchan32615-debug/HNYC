# 图标资源清单

本文档列出项目所需的所有图标资源，方便后续替换 emoji 占位符。

## TabBar 图标 (81x81px)

### 公园广场
- `tabbar/home.png` - 首页图标（未选中）
- `tabbar/home-active.png` - 首页图标（选中）
- 建议图案：🏠 房子 或 🌳 树木

### 我的空间
- `tabbar/space.png` - 空间图标（未选中）
- `tabbar/space-active.png` - 空间图标（选中）
- 建议图案：🏡 房子 或 📱 手机

## 功能图标 (48x48px)

### 基础功能
- `icons/add-pet.png` - 添加植宠 ➕
- `icons/task.png` - 任务清单 ✅
- `icons/publish.png` - 发布动态 📤
- `icons/remind.png` - 提醒 ⏰
- `icons/search.png` - 搜索 🔍
- `icons/more.png` - 更多选项 ⋯
- `icons/arrow-right.png` - 右箭头 ›

### 任务类型图标
- `icons/water.png` - 浇水 💧
- `icons/feed.png` - 喂食 🍖
- `icons/sun.png` - 晒背 ☀️
- `icons/scissors.png` - 修剪 ✂️
- `icons/clean.png` - 清洁 🧹
- `icons/custom.png` - 自定义 📝

### 植宠类型图标
- `icons/plant.png` - 植物 🌱
- `icons/flower.png` - 花卉 🌸
- `icons/tree.png` - 树木 🌲
- `icons/fish.png` - 鱼类 🐟
- `icons/turtle.png` - 龟类 🐢
- `icons/bird.png` - 鸟类 🐦
- `icons/insect.png` - 昆虫 🦋
- `icons/other.png` - 其他 🐾

## 空状态图片 (240x240px)

- `empty-pets.png` - 无植宠空状态
  - 建议图案：空花盆或空笼子
  
- `empty-tasks.png` - 无任务空状态
  - 建议图案：空清单或日历
  
- `empty-posts.png` - 无动态空状态
  - 建议图案：空相册或相机

## 默认图片

- `default-avatar.png` - 默认头像 (200x200px)
  - 建议图案：用户剪影或花鸟鱼虫图案
  
- `default-pet.png` - 默认植宠封面 (400x400px)
  - 建议图案：植物剪影或宠物轮廓
  
- `placeholder.png` - 图片加载占位符 (200x200px)
  - 建议图案：灰色背景 + 加载图标

## 设计风格建议

### 颜色方案
- 主色：#4CAF50 (绿色)
- 辅色：#8BC34A (浅绿)
- 强调色：#2196F3 (蓝色)
- 背景色：#f5f7fa (浅灰)

### 图标风格
1. **扁平化风格**
   - 简洁明快
   - 无阴影或渐变
   - 纯色填充

2. **线性风格**
   - 细线条
   - 空心设计
   - 统一线宽 2px

3. **面性风格**
   - 实心填充
   - 圆角设计
   - 轻微阴影

### 推荐资源

#### 免费图标库
1. **iconfont** (阿里巴巴)
   - 网址：https://www.iconfont.cn/
   - 海量中文图标
   - 支持 SVG/PNG

2. **IconPark** (字节跳动)
   - 网址：https://iconpark.oceanengine.com/
   - 开源免费
   - 风格统一

3. **Remix Icon**
   - 网址：https://remixicon.com/
   - 开源免费
   - 设计精美

4. **Flaticon**
   - 网址：https://www.flaticon.com/
   - 彩色图标
   - 部分免费

#### 插画资源
1. **unDraw**
   - 网址：https://undraw.co/
   - 开源插画
   - 可自定义颜色

2. **ManyPixels**
   - 网址：https://www.manypixels.co/gallery/
   - 免费插画
   - 多种风格

## 替换步骤

### 方法一：使用设计工具
1. 使用 Figma/Sketch/Photoshop 设计图标
2. 导出为 PNG 格式
3. 放入对应目录

### 方法二：使用图标库
1. 从图标库下载图标
2. 统一尺寸和风格
3. 重命名后放入对应目录

### 方法三：使用 emoji 临时替代
1. 当前代码已使用 emoji
2. 可直接运行测试
3. 后续替换为实际图标

## 图标尺寸规范

### TabBar 图标
- 设计尺寸：162x162px (@2x)
- 导出尺寸：81x81px (@1x)
- 格式：PNG
- 背景：透明

### 功能图标
- 设计尺寸：96x96px (@2x)
- 导出尺寸：48x48px (@1x)
- 格式：PNG
- 背景：透明

### 空状态图片
- 设计尺寸：480x480px (@2x)
- 导出尺寸：240x240px (@1x)
- 格式：PNG
- 背景：透明或白色

## 注意事项

1. **版权**: 确保使用的图标有合法授权
2. **一致性**: 保持整套图标风格统一
3. **可访问性**: 图标要有足够的对比度
4. **性能**: 压缩图标文件大小
5. **适配**: 考虑不同屏幕的显示效果

## 临时方案

当前项目使用 emoji 作为临时图标：
- ✅ 优点：无需额外资源，直接可用
- ⚠️ 缺点：样式受系统影响，不够统一

建议在正式使用时替换为专业设计的图标。

---

*更新时间：2026 年 3 月 8 日*
