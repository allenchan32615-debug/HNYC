# 手机号+验证码直接登录功能 - 实现计划

## 项目概述
为花鸟鱼虫H5应用添加手机号+验证码直接登录功能，支持用户通过手机号接收验证码进行快速登录。

## 任务分解与优先级

### [/] 任务 1: 添加登录弹窗UI
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 创建手机号+验证码登录弹窗
  - 包含手机号输入、验证码输入、获取验证码按钮
  - 设计符合现有UI风格的登录界面
- **Success Criteria**:
  - 登录弹窗在点击登录按钮时正确显示
  - 弹窗包含所有必要的输入字段和按钮
  - 界面风格与现有应用一致
- **Test Requirements**:
  - `programmatic` TR-1.1: 点击登录按钮后弹窗正确显示
  - `human-judgement` TR-1.2: 界面美观，操作流程清晰
- **Notes**: 复用现有的modal-overlay和modal样式

### [ ] 任务 2: 实现手机号验证和验证码发送
- **Priority**: P0
- **Depends On**: 任务1
- **Description**:
  - 实现手机号格式验证
  - 实现获取验证码功能（模拟）
  - 添加验证码发送倒计时
- **Success Criteria**:
  - 手机号格式错误时给出提示
  - 点击获取验证码后显示倒计时
  - 倒计时结束后可重新发送
- **Test Requirements**:
  - `programmatic` TR-2.1: 手机号格式验证正确
  - `programmatic` TR-2.2: 验证码发送后倒计时正常
  - `human-judgement` TR-2.3: 用户体验流畅
- **Notes**: 使用setInterval实现倒计时，模拟API调用

### [ ] 任务 3: 实现登录逻辑
- **Priority**: P0
- **Depends On**: 任务2
- **Description**:
  - 实现登录验证逻辑
  - 处理登录成功和失败的情况
  - 添加登录状态管理
- **Success Criteria**:
  - 验证码正确时登录成功
  - 验证码错误时给出提示
  - 登录状态正确更新
- **Test Requirements**:
  - `programmatic` TR-3.1: 正确的验证码能登录成功
  - `programmatic` TR-3.2: 错误的验证码提示错误
  - `human-judgement` TR-3.3: 登录流程流畅
- **Notes**: 使用localStorage存储登录状态，模拟后端验证

### [ ] 任务 4: 添加登录状态管理
- **Priority**: P1
- **Depends On**: 任务3
- **Description**:
  - 管理用户登录状态
  - 实现自动登录
  - 显示用户信息
- **Success Criteria**:
  - 登录后显示用户信息
  - 刷新页面后保持登录状态
  - 未登录时显示登录提示
- **Test Requirements**:
  - `programmatic` TR-4.1: 登录后用户信息正确显示
  - `programmatic` TR-4.2: 刷新页面后保持登录状态
  - `human-judgement` TR-4.3: 用户信息显示正常
- **Notes**: 使用localStorage存储用户信息

### [ ] 任务 5: 添加登录入口
- **Priority**: P1
- **Depends On**: 任务4
- **Description**:
  - 在我的空间页面添加登录入口
  - 未登录时显示登录提示
  - 登录后显示用户信息
- **Success Criteria**:
  - 未登录时显示登录按钮
  - 点击登录按钮打开登录弹窗
  - 登录后显示用户信息
- **Test Requirements**:
  - `programmatic` TR-5.1: 未登录时显示登录按钮
  - `programmatic` TR-5.2: 点击按钮打开登录弹窗
  - `human-judgement` TR-5.3: 登录入口位置合理
- **Notes**: 在用户卡片中添加登录状态判断

### [ ] 任务 6: 实现退出登录功能
- **Priority**: P2
- **Depends On**: 任务4
- **Description**:
  - 添加退出登录按钮
  - 清除登录状态
  - 重置用户信息
- **Success Criteria**:
  - 点击退出登录后清除登录状态
  - 页面显示未登录状态
  - 可以重新登录
- **Test Requirements**:
  - `programmatic` TR-6.1: 退出登录后登录状态被清除
  - `programmatic` TR-6.2: 退出后可以重新登录
  - `human-judgement` TR-6.3: 退出流程流畅
- **Notes**: 清除localStorage中的登录信息

## 技术实现要点

1. **前端技术**:
   - Vue 3 响应式数据
   - 原生JavaScript实现倒计时
   - localStorage存储登录状态
   - 模拟API调用

2. **UI设计**:
   - 复用现有modal样式
   - 保持与现有应用风格一致
   - 响应式设计

3. **用户体验**:
   - 清晰的错误提示
   - 流畅的倒计时效果
   - 自动登录功能
   - 友好的登录/未登录状态切换

## 测试计划

1. **功能测试**:
   - 手机号格式验证
   - 验证码发送
   - 登录验证
   - 登录状态管理
   - 退出登录

2. **用户体验测试**:
   - 界面美观度
   - 操作流程清晰度
   - 错误提示友好性
   - 响应速度

3. **兼容性测试**:
   - 主流浏览器兼容性
   - 移动端适配

## 预期完成时间
- 总预计时间: 2-3小时
- 任务1-3: 1小时
- 任务4-6: 1-2小时

## 风险评估
- **风险1**: 手机号验证规则可能需要调整
  - 缓解: 参考行业标准手机号验证规则

- **风险2**: 验证码发送逻辑可能需要后端支持
  - 缓解: 先实现前端模拟，预留后端API接口

- **风险3**: 登录状态管理可能存在安全隐患
  - 缓解: 使用localStorage存储，设置合理的过期时间

## 成功标准
- 完整实现手机号+验证码登录功能
- 界面美观，用户体验良好
- 功能稳定，无明显bug
- 代码结构清晰，易于维护
