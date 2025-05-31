# 微信登录功能设置指南

## 概述
本项目已经集成了真实的微信登录功能，使用微信小程序云开发来处理用户认证。

## 功能特性
- ✅ 真实的微信用户登录
- ✅ 用户信息获取和存储
- ✅ 登录状态管理
- ✅ 云数据库用户记录
- ✅ 安全的session管理

## 部署步骤

### 1. 确保云开发环境已配置
确保在 `miniprogram/app.ts` 中的云环境ID是正确的：
```typescript
wx.cloud.init({
  env: 'your-cloud-env-id', // 替换为你的云环境ID
  traceUser: true,
})
```

### 2. 部署云函数
运行部署脚本：
```bash
# Windows
deploy-wechat-login.bat

# 或者手动部署
cd cloudfunctions/wechatLogin
npm install
cd ../..
# 在微信开发者工具中右键云函数目录选择"上传并部署"
```

### 3. 配置云数据库
在微信云开发控制台中创建 `users` 集合，用于存储用户信息。

### 4. 配置小程序权限
确保小程序已配置以下权限：
- `scope.userInfo` - 获取用户信息
- 云开发权限

## 代码结构

### API工具类 (`miniprogram/utils/api.ts`)
- `API.wechatLogin()` - 微信登录
- `API.getUserInfo()` - 获取用户信息
- `API.callCloudFunction()` - 调用云函数

### 云函数 (`cloudfunctions/wechatLogin/`)
- 处理微信登录逻辑
- 用户信息存储和更新
- 安全的session管理

### 登录页面 (`miniprogram/pages/login/login.ts`)
- 微信登录按钮处理
- 用户信息授权
- 登录状态管理

## 使用方法

### 前端调用
```typescript
// 微信登录
const result = await API.wechatLogin();
if (result.success) {
  // 登录成功
  const userInfo = result.data.userInfo;
  const sessionInfo = result.data.sessionInfo;
}
```

### 用户数据结构
```typescript
interface UserInfo {
  _id: string;
  openid: string;
  unionid?: string;
  nickName: string;
  avatarUrl: string;
  gender: number;
  grade: string;
  createTime: Date;
  lastLoginTime: Date;
  loginCount: number;
  status: string;
}
```

## 安全注意事项

1. **不要在前端存储敏感信息**：sessionKey等敏感信息只在云函数中处理
2. **Session过期管理**：登录态有效期为7天，需要定期刷新
3. **用户权限验证**：后续API调用需要验证用户登录状态

## 故障排除

### 常见问题
1. **云函数调用失败**：检查云环境ID是否正确
2. **用户信息获取失败**：确保用户已授权用户信息权限
3. **数据库写入失败**：检查云数据库权限配置

### 调试方法
- 查看云函数日志
- 检查网络请求
- 验证用户授权状态

## 更新日志
- 2024-01-XX: 初始版本，支持基础微信登录
- 集成云数据库用户管理
- 添加安全的session管理 