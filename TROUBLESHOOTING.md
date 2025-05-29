# 故障排除指南

## 问题1: "cloud Api is not enabled" 错误

### 症状
- 调用云函数时提示 "cloud Api is not enabled"
- 上传图片失败

### 解决步骤

#### 步骤1: 检查云开发服务状态
1. 打开微信开发者工具
2. 点击工具栏的"云开发"按钮
3. 如果显示"开通"按钮，说明还未开通云开发服务
4. 点击"开通"，选择免费套餐，完成开通

#### 步骤2: 获取正确的环境ID
1. 在云开发控制台中，查看左上角的环境信息
2. 复制环境ID（不是环境名称）
3. 环境ID格式类似：`cloud1-8g0qhqhm8b8b8b8b`

#### 步骤3: 配置环境ID
1. 打开 `miniprogram/app.ts`
2. 找到云开发初始化代码：
   ```typescript
   wx.cloud.init({
     env: 'cloud1-8g0qhqhm8b8b8b8b', // 替换为你的环境ID
     traceUser: true,
   })
   ```
3. 将环境ID替换为你的实际环境ID
4. 保存文件并重新编译

#### 步骤4: 验证配置
1. 在微信开发者工具控制台运行测试脚本
2. 复制 `test-cloud.js` 中的代码到控制台
3. 运行 `runAllTests()` 查看测试结果

## 问题2: 图片无法预览

### 症状
- 选择图片后预览区域不显示
- 图片显示空白或加载失败

### 解决步骤

#### 步骤1: 检查图片路径
1. 在控制台查看 `imageUrl` 的值
2. 确认路径格式正确（临时文件路径）

#### 步骤2: 检查组件版本
1. 确认已安装 TDesign 组件库
2. 运行 `npm install tdesign-miniprogram`
3. 重新构建项目

#### 步骤3: 使用原生组件
已将 `t-image` 替换为原生 `image` 组件，应该能解决预览问题。

#### 步骤4: 检查基础库版本
1. 在微信开发者工具中检查基础库版本
2. 建议使用 2.2.3 或以上版本
3. 在项目设置中调整基础库版本

## 问题3: 云函数部署失败

### 症状
- 右键云函数无法看到"上传并部署"选项
- 部署时提示错误

### 解决步骤

#### 步骤1: 检查目录结构
确认目录结构正确：
```
cloudfunctions/
└── extractWords/
    ├── index.js
    ├── package.json
    ├── config.json
    └── README.md
```

#### 步骤2: 安装依赖
```bash
cd cloudfunctions/extractWords
npm install
```

#### 步骤3: 检查云函数配置
1. 右键 `extractWords` 文件夹
2. 选择"配置"
3. 添加环境变量：`DASHSCOPE_API_KEY`

#### 步骤4: 重新部署
1. 右键 `extractWords` 文件夹
2. 选择"上传并部署：云端安装依赖"
3. 等待部署完成

## 问题4: OCR识别失败

### 症状
- 云函数调用成功但识别失败
- 提示API密钥相关错误

### 解决步骤

#### 步骤1: 检查API密钥
1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 确认API密钥有效且未过期
3. 检查账户余额和调用次数

#### 步骤2: 配置环境变量
1. 在云函数配置中添加：
   ```
   DASHSCOPE_API_KEY = sk-xxxxxxxxxxxxxxxxx
   ```
2. 确保密钥格式正确

#### 步骤3: 测试API连接
1. 使用 `cloudfunctions/extractWords/test.js` 进行本地测试
2. 替换其中的API密钥
3. 运行测试验证API连接

## 问题5: 网络连接问题

### 症状
- 请求超时
- 网络连接失败

### 解决步骤

#### 步骤1: 检查网络环境
1. 确认网络连接正常
2. 检查是否有防火墙限制

#### 步骤2: 调整超时设置
在云函数中已设置30秒超时，如需调整可修改：
```javascript
timeout: 30000 // 30秒
```

#### 步骤3: 重试机制
代码中已包含错误处理和重试提示。

## 调试技巧

### 1. 查看控制台日志
- 在微信开发者工具中查看 Console 输出
- 关注错误信息和警告

### 2. 查看云函数日志
1. 点击"云开发"按钮
2. 进入"云函数"页面
3. 查看函数调用日志

### 3. 使用测试脚本
运行 `test-cloud.js` 中的测试函数：
```javascript
runAllTests() // 运行所有测试
```

### 4. 分步调试
1. 先测试云开发初始化
2. 再测试云函数调用
3. 最后测试完整流程

## 常见错误代码

| 错误信息 | 原因 | 解决方法 |
|---------|------|----------|
| cloud Api is not enabled | 云开发未开通 | 开通云开发服务 |
| function not found | 云函数未部署 | 部署云函数 |
| timeout | 网络超时 | 检查网络连接 |
| 401 Unauthorized | API密钥无效 | 检查API密钥 |
| insufficient balance | 余额不足 | 充值或检查配额 |

## 联系支持

如果按照以上步骤仍无法解决问题：

1. 检查微信开发者工具版本（建议最新版）
2. 查看官方文档：[微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
3. 检查阿里千问API文档：[阿里云百炼平台](https://help.aliyun.com/zh/dashscope/)

## 成功验证清单

完成以下检查确保配置正确：

- [ ] 云开发服务已开通
- [ ] 环境ID已正确配置
- [ ] 云函数已成功部署
- [ ] API密钥已正确配置
- [ ] 测试脚本运行通过
- [ ] 图片预览功能正常
- [ ] OCR识别功能正常 