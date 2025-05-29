# 开发指南

## 快速开始

### 1. 环境准备
- 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 确保已安装 Node.js 16+ 版本

### 2. 项目导入
1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `miniprogram` 目录
4. 填写项目信息：
   - 项目名称：家长辅导助手
   - AppID：使用测试号或申请正式AppID
   - 开发模式：小程序

### 3. 安装依赖
在微信开发者工具的终端中执行：
```bash
npm install
```

然后在工具菜单中选择：工具 → 构建npm

### 4. 开发调试
- 在模拟器中预览各个页面
- 使用真机预览测试完整功能
- 查看控制台日志进行调试

## 页面说明

### 首页 (pages/home)
- **功能**: 应用入口，展示单词听写功能卡片
- **路由**: `/pages/home/home`
- **特点**: TabBar页面，检查登录状态

### 拍照上传 (pages/upload)
- **功能**: 拍照或选择图片，OCR识别单词
- **路由**: `/pages/upload/upload`
- **特点**: 支持相册选择和拍照，模拟OCR识别

### 听写练习 (pages/practice)
- **功能**: 语音播放单词，虚拟键盘输入
- **路由**: `/pages/practice/practice`
- **特点**: 虚拟键盘，实时反馈，进度显示

### 结果展示 (pages/result)
- **功能**: 显示练习结果，错误单词列表
- **路由**: `/pages/result/result`
- **特点**: 圆形进度条，庆祝动画，学习建议

### 个人中心 (pages/profile)
- **功能**: 用户信息，学习记录，错误单词本
- **路由**: `/pages/profile/profile`
- **特点**: TabBar页面，登录状态管理

### 登录页面 (pages/login)
- **功能**: 微信登录，手机号验证码登录
- **路由**: `/pages/login/login`
- **特点**: 多种登录方式，表单验证

## 数据流转

### 存储结构
```javascript
// 用户信息
userInfo: {
  nickName: string,
  avatarUrl: string,
  phone?: string,
  grade: string,
  loginTime: string
}

// 练习单词
practiceWords: string[]

// 练习结果
practiceResults: Array<{
  word: string,
  userInput: string,
  isCorrect: boolean
}>

// 学习记录
studyRecords: Array<{
  date: string,
  totalWords: number,
  correctCount: number,
  accuracy: number,
  wrongWords: string[]
}>
```

### 页面跳转流程
```
首页 → 登录页 → 拍照上传 → 听写练习 → 结果展示
  ↓                                        ↓
个人中心 ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

## 组件使用

### TDesign组件
项目使用TDesign小程序组件库，主要组件包括：
- `t-button`: 按钮组件
- `t-cell`: 单元格组件
- `t-input`: 输入框组件
- `t-icon`: 图标组件
- `t-toast`: 轻提示组件
- `t-dialog`: 对话框组件
- `t-progress`: 进度条组件
- `t-avatar`: 头像组件
- `t-tag`: 标签组件
- `t-grid`: 宫格组件

### 自定义样式
- 主题色：#0052d9 (TDesign蓝)
- 圆角：24rpx (卡片)、16rpx (按钮)
- 阴影：0 4rpx 16rpx rgba(0, 0, 0, 0.06)

## 调试技巧

### 1. 模拟数据
- OCR识别：返回固定单词列表
- 语音播放：控制台输出，模拟播放状态
- 验证码：固定为 "123456"

### 2. 状态管理
- 使用 `wx.getStorageSync` 和 `wx.setStorageSync` 管理数据
- 页面间通过 Storage 传递数据
- 使用 `onShow` 生命周期刷新数据

### 3. 错误处理
- 所有异步操作都有错误处理
- 使用 Toast 组件显示错误信息
- 关键操作有确认对话框

## 发布准备

### 1. 代码检查
- 确保所有页面正常加载
- 检查控制台无错误信息
- 测试各种边界情况

### 2. 资源优化
- 压缩图片资源
- 清理无用代码
- 检查包大小限制

### 3. 审核准备
- 完善隐私政策
- 准备应用截图
- 填写应用描述

## 常见问题

### Q: TDesign组件样式不生效？
A: 确保已正确构建npm，并在app.json中配置了组件路径。

### Q: 真机预览功能异常？
A: 检查是否使用了模拟器专用的API，确保代码兼容性。

### Q: 页面跳转失败？
A: 检查路由路径是否正确，确保页面已在app.json中注册。

### Q: 数据丢失？
A: 检查Storage操作是否正确，注意异步操作的时序。

---

如有其他问题，请查看微信小程序官方文档或联系开发团队。 