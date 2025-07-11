# 家长辅导助手 - 原型展示

## 项目概述

这是一个基于PRD文档开发的家长辅导孩子作业微信小程序原型，主要功能是帮助家长高效辅导孩子完成单词听写练习。

## 功能特点

### 🎯 核心功能
- **单词听写**: 拍照识别单词表，智能语音听写练习
- **用户管理**: 支持微信授权和手机号验证码登录
- **学习记录**: 完整的练习历史和错误单词管理

### 📱 界面设计
- **iPhone 15 Pro适配**: 393 x 852 像素，圆角设计
- **TDesign风格**: 采用腾讯TDesign设计规范
- **响应式布局**: 使用Tailwind CSS构建现代化界面
- **交互动效**: 丰富的动画和反馈效果

## 页面结构

```
prototype/
├── index.html          # 主入口页面（原型展示）
├── home.html           # 首页/辅导页面
├── upload.html         # 拍照上传页面
├── practice.html       # 听写练习页面
├── result.html         # 听写结果页面
├── profile.html        # 我的页面
├── login.html          # 登录页面
└── README.md          # 说明文档
```

## 页面功能详解

### 1. 主入口页面 (index.html)
- 以网格形式展示所有页面原型
- 每个页面都在iPhone 15 Pro外观的框架中展示
- 支持同时查看所有界面设计

### 2. 首页/辅导页面 (home.html)
- 单词听写功能入口
- 即将推出的功能预览（数学口算、阅读理解）
- 底部TabBar导航

### 3. 拍照上传页面 (upload.html)
- 支持相册选择和拍照功能
- 实时预览和确认
- OCR识别进度显示
- 识别结果展示

### 4. 听写练习页面 (practice.html)
- 单词语音播放
- 虚拟键盘输入
- 实时进度显示
- 正误反馈

### 5. 听写结果页面 (result.html)
- 圆形进度条显示正确率
- 详细统计数据
- 错误单词列表
- 学习建议

### 6. 我的页面 (profile.html)
- 用户信息展示
- 学习记录历史
- 错误单词本
- 功能设置菜单

### 7. 登录页面 (login.html)
- 微信一键登录
- 手机号验证码登录
- 用户协议确认

## 技术特点

### 🎨 设计规范
- **颜色主题**: 蓝色系主色调 (#0052d9)
- **圆角设计**: 统一的12px圆角
- **阴影效果**: 层次分明的卡片阴影
- **字体系统**: 苹果系统字体栈

### 💻 技术栈
- **HTML5**: 语义化标签
- **CSS3**: 现代CSS特性
- **Tailwind CSS**: 原子化CSS框架
- **JavaScript**: 原生JS交互逻辑

### 📱 移动端优化
- **触摸友好**: 44px最小点击区域
- **手势支持**: 长按输入模拟
- **性能优化**: 流畅的动画效果
- **适配安全区**: 支持刘海屏

## 使用方法

1. **本地预览**
   ```bash
   # 直接在浏览器中打开
   open prototype/index.html
   ```

2. **Web服务器**
   ```bash
   # 使用Python简单服务器
   cd prototype
   python -m http.server 8000
   # 访问 http://localhost:8000
   ```

3. **Live Server**
   - 使用VS Code的Live Server插件
   - 右键index.html选择"Open with Live Server"

## 交互说明

### 拍照上传流程
1. 点击"从相册选择"或"拍照"按钮
2. 预览照片并确认上传
3. 等待OCR识别处理
4. 查看识别结果并开始练习

### 听写练习流程
1. 点击播放按钮听取单词发音
2. 使用虚拟键盘拼写单词
3. 点击提交查看结果
4. 继续下一个单词或查看最终结果

### 登录流程
- **微信登录**: 点击即可模拟登录成功
- **手机号登录**: 输入任意11位手机号，验证码输入"123456"

## 数据模拟

原型中使用了模拟数据来展示功能：

- **示例单词**: apple, banana, orange, grape, watermelon, strawberry
- **用户信息**: 小明同学，三年级二班
- **学习记录**: 15次练习，78%平均正确率
- **错误单词**: watermelon, strawberry等

## 浏览器兼容性

- ✅ Chrome 80+
- ✅ Safari 13+
- ✅ Firefox 75+
- ✅ Edge 80+

## 注意事项

1. **原型限制**: 这是静态原型，不包含真实的后端功能
2. **数据模拟**: 所有数据都是模拟的，不会真实保存
3. **功能演示**: 重点展示界面设计和交互流程
4. **移动优先**: 建议在移动设备或开发者工具的移动模式下查看

## 后续开发建议

1. **技术选型**: 建议使用微信小程序原生框架或uni-app
2. **后端服务**: 需要OCR识别、语音合成、用户管理等服务
3. **数据存储**: 用户信息、学习记录、单词库等数据管理
4. **性能优化**: 图片压缩、音频缓存、离线功能等

## 联系方式

如有问题或建议，请联系开发团队。 