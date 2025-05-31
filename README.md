# TeachAgent - AI智能教学助手

> 基于微信小程序的AI教育辅助工具

## 项目简介

TeachAgent是一个智能教学助手小程序，旨在通过AI技术帮助学生和教师进行更高效的学习和教学。项目集成了语音识别、OCR文字识别、云函数等多种技术，提供智能化的教育解决方案。

## 功能特性

- 🎤 **语音识别**: 支持语音输入和处理
- 📷 **OCR文字识别**: 图片文字提取和识别
- ☁️ **云函数集成**: 后端服务和数据处理
- 🎨 **现代化UI**: 基于TDesign组件库的美观界面
- 📱 **微信小程序**: 原生小程序体验

## 技术栈

- **前端**: 微信小程序 + TypeScript
- **UI组件**: TDesign Miniprogram
- **后端**: 微信云开发 + Node.js
- **AI服务**: 语音识别、OCR等AI能力

## 项目结构

```
teachAgent/
├── miniprogram/          # 小程序前端代码
├── cloudfunctions/       # 云函数代码
├── prototype/           # 原型和设计文件
├── docs/               # 项目文档
├── typings/            # TypeScript类型定义
├── test-*.js           # 测试脚本
├── project.config.json # 小程序配置
└── package.json        # 项目依赖
```

## 快速开始

### 环境要求

- Node.js >= 14.0.0
- 微信开发者工具
- 微信开发者账号

### 安装依赖

```bash
npm install
```

### 配置说明

1. 复制 `project.config.json` 并根据实际情况修改appid
2. 在微信开发者工具中打开项目
3. 配置云开发环境（参考 `CLOUD_SETUP.md`）

### 运行项目

1. 使用微信开发者工具打开项目目录
2. 编译并预览小程序
3. 在模拟器或真机上测试功能

## 开发指南

### 云函数部署

```bash
# 运行部署脚本
deploy.bat
```

### 测试脚本

项目提供了多个测试脚本：

- `test-cloud.js` - 云开发环境测试
- `test-speech.js` - 语音功能测试  
- `test-ocr-fix.js` - OCR功能测试
- `test-cloud-storage.js` - 云存储测试

## 文档

- [云环境配置指南](CLOUD_SETUP.md)
- [云存储设置说明](CLOUD_STORAGE_SETUP.md)
- [故障排除指南](TROUBLESHOOTING.md)

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

[MIT License](LICENSE)

## 作者

[@Yangyueerzi](https://github.com/Yangyueerzi) 