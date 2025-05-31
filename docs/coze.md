# Coze工作流API调用指南 - 微信小程序版

本文档详细说明如何在微信小程序中调用Coze工作流API。

## 基本配置

### API端点
**✅ 已验证可用的端点**:
```
https://api.coze.cn/v1/workflow/run (主要推荐)
```

**备用端点**:
```
https://api.coze.com/v1/workflow/run (国际版，可作备用)
```

**❌ 已废弃的端点**:
```
https://api.coze.cn/open_api/v2/workflows/run (已不可用)
```

### 认证配置
```javascript
const headers = {
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json'
  // 注意：微信小程序不支持设置User-Agent头部
};
```

## 基本调用结构

### ✅ 测试验证的标准格式
```javascript
// 推荐格式 - 经过实际测试验证
const requestData = {
  workflow_id: "7510465323067818018", // 示例工作流ID
  parameters: {
    input: "用户输入内容"
  }
};
```

### 备用请求格式
```javascript
// 格式1: Bot聊天格式
const requestData = {
  bot_id: "YOUR_WORKFLOW_ID",
  query: "用户输入内容",
  user: "miniprogram_user",
  chat_history: [],
  stream: false
};

// 格式2: 简化格式
const requestData = {
  workflow_id: "YOUR_WORKFLOW_ID",
  input: "用户输入内容"
};
```

## 完整示例：语音学习工作流

```javascript
/**
 * 调用Coze工作流API - 基于实际测试成功的配置
 */
async function callCozeWorkflow(userInput) {
  const API_TOKEN = 'pat_cxg2AIxkRfxkgwXkdRIfpH6G6e88h2VkuQRmUXwwLKYDJ96R6EteJDB1J1nuyQ5A';
  const WORKFLOW_ID = '7510465323067818018';
  
  // 经过测试验证的端点列表
  const API_ENDPOINTS = [
    'https://api.coze.cn/v1/workflow/run', // ✅ 主要端点
    'https://api.coze.com/v1/workflow/run'  // 备用端点
  ];
  
  const headers = {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  // 经过测试验证的请求格式
  const requestFormats = [
    // ✅ 标准格式（推荐）
    {
      workflow_id: WORKFLOW_ID,
      parameters: {
        input: userInput
      }
    },
    // 备用格式
    {
      bot_id: WORKFLOW_ID,
      query: userInput,
      user: "miniprogram_user",
      stream: false
    },
    {
      workflow_id: WORKFLOW_ID,
      input: userInput
    }
  ];
  
  // 智能重试机制
  for (let endpointIndex = 0; endpointIndex < API_ENDPOINTS.length; endpointIndex++) {
    const endpoint = API_ENDPOINTS[endpointIndex];
    
    for (let formatIndex = 0; formatIndex < requestFormats.length; formatIndex++) {
      const requestData = requestFormats[formatIndex];
      
      try {
        const response = await new Promise((resolve, reject) => {
          wx.request({
            url: endpoint,
            method: 'POST',
            header: headers,
            data: requestData,
            timeout: 30000,
            success: resolve,
            fail: reject
          });
        });
        
        if (response.statusCode >= 200 && response.statusCode < 300 && response.data.code === 0) {
          return {
            success: true,
            data: response.data.data,
            endpoint: endpoint,
            format: formatIndex + 1
          };
        }
      } catch (error) {
        console.log(`端点${endpointIndex + 1}格式${formatIndex + 1}失败:`, error.message);
        continue;
      }
    }
  }
  
  throw new Error('所有端点和格式都失败');
}

// 使用示例
try {
  const result = await callCozeWorkflow('你好，请介绍一下自己');
  console.log('工作流结果:', result.data);
  console.log('成功端点:', result.endpoint);
} catch (error) {
  console.error('调用失败:', error);
}
```

## 响应格式解析

### ✅ 实际测试的成功响应格式
```javascript
{
  "code": 0,
  "msg": "success", 
  "data": "AI生成的回复内容（字符串格式）",
  "debug_url": "https://coze.cn/workspace/debug/xxx",
  "token": 234,
  "cost": "0.002"
}
```

### 响应处理最佳实践
```javascript
function parseCozeResponse(response) {
  if (response.statusCode >= 200 && response.statusCode < 300) {
    if (response.data.code === 0) {
      // ✅ 成功响应
      return {
        success: true,
        content: response.data.data, // 直接使用data字段作为AI回复
        debugUrl: response.data.debug_url,
        cost: response.data.cost
      };
    } else {
      // ❌ API错误
      return {
        success: false,
        error: response.data.msg || '工作流执行失败',
        code: response.data.code
      };
    }
  } else {
    // ❌ HTTP错误
    return {
      success: false,
      error: `HTTP错误: ${response.statusCode}`,
      statusCode: response.statusCode
    };
  }
}
```

## 实际使用场景

### 聊天对话实现
```javascript
async function chatWithCoze(userMessage) {
  try {
    const result = await callCozeWorkflow(userMessage);
    
    if (result.success) {
      // 直接显示AI回复，无需复杂解析
      return {
        type: 'ai',
        content: result.data, // 这里就是AI的回复内容
        timestamp: new Date().toLocaleTimeString()
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    return {
      type: 'error',
      content: `对话失败: ${error.message}`,
      timestamp: new Date().toLocaleTimeString()
    };
  }
}
```

### 小程序页面集成
```javascript
Page({
  data: {
    messages: [],
    inputText: '',
    isLoading: false
  },
  
  async sendMessage() {
    if (!this.data.inputText.trim()) return;
    
    const userMessage = {
      type: 'user',
      content: this.data.inputText,
      timestamp: new Date().toLocaleTimeString()
    };
    
    this.setData({
      messages: [...this.data.messages, userMessage],
      inputText: '',
      isLoading: true
    });
    
    try {
      const aiMessage = await chatWithCoze(userMessage.content);
      this.setData({
        messages: [...this.data.messages, aiMessage],
        isLoading: false
      });
    } catch (error) {
      console.error('聊天失败:', error);
      this.setData({ isLoading: false });
    }
  }
});
```

## 错误处理

### 常见错误码及解决方案
- `✅ 200 + code: 0`: 成功响应，直接使用data字段
- `❌ 401`: API Token无效，检查认证信息
- `❌ 403`: 权限不足，检查工作流权限设置  
- `❌ 404`: 端点错误，确保使用v1版本端点
- `❌ 4000`: 参数错误，检查请求数据格式
- `❌ 429`: 频率限制，实现请求间隔控制
- `❌ 500`: 服务器错误，稍后重试

### 错误处理最佳实践
```javascript
function handleCozeError(error, response) {
  let userFriendlyMessage = '';
  
  if (response?.statusCode === 404) {
    userFriendlyMessage = 'API服务暂不可用，请稍后重试';
  } else if (response?.data?.code === 4000) {
    userFriendlyMessage = '请求格式有误，请检查输入内容';
  } else if (response?.statusCode === 401) {
    userFriendlyMessage = '认证失败，请检查配置';
  } else if (response?.statusCode === 429) {
    userFriendlyMessage = '请求过于频繁，请稍后重试';
  } else {
    userFriendlyMessage = '服务暂时不可用，请稍后重试';
  }
  
  wx.showToast({
    title: userFriendlyMessage,
    icon: 'none',
    duration: 3000
  });
  
  // 详细错误日志（仅开发环境）
  console.error('Coze API详细错误:', {
    statusCode: response?.statusCode,
    responseData: response?.data,
    error: error
  });
}
```

## 性能优化

### 请求频率控制
```javascript
class CozeAPILimiter {
  constructor(minInterval = 1000) { // 最小间隔1秒
    this.minInterval = minInterval;
    this.lastRequestTime = 0;
  }
  
  async call(requestData) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
    return await callCozeWorkflow(requestData);
  }
}

// 使用限流器
const apiLimiter = new CozeAPILimiter();
const result = await apiLimiter.call('用户输入');
```

## 测试验证步骤

### 1. 开发环境配置
1. 微信开发者工具 → 详情 → 本地设置 → 勾选"不校验合法域名"
2. 确保网络连接正常

### 2. API参数验证
- ✅ **工作流ID**: `7510465323067818018` (已测试可用)
- ✅ **API Token**: `pat_cxg2AIxkRfxkgwXkdRIfpH6G6e88h2VkuQRmUXwwLKYDJ96R6EteJDB1J1nuyQ5A` (已验证)
- ✅ **端点**: `https://api.coze.cn/v1/workflow/run` (已确认可用)

### 3. 测试用例
```javascript
// 基础测试
await callCozeWorkflow('你好');

// 复杂对话测试  
await callCozeWorkflow('请帮我分析一下今天的学习情况');

// 多语言测试
await callCozeWorkflow('Hello, how are you?');
```

## 故障排查指南

### 常见问题解决
1. **404错误** → 确认使用 `https://api.coze.cn/v1/workflow/run`
2. **认证失败** → 检查Bearer Token格式和有效性
3. **参数错误** → 使用标准的`{workflow_id, parameters: {input}}`格式
4. **无响应** → 检查微信小程序网络配置
5. **响应解析失败** → 直接使用`response.data.data`作为AI回复

## 更新日志

- **2025-01-30**: ✅ 基于实际测试成功案例更新文档
- **2025-01-30**: ✅ 验证API端点和请求格式
- **2025-01-30**: ✅ 修正响应处理方式
- **2025-01-29**: 添加多端点支持和错误处理优化
- **2025-01-28**: 初始版本，包含基本API调用说明

---

*本文档基于实际测试验证，确保代码可直接使用*
