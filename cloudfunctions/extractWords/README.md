# 单词提取云函数 (extractWords)

基于阿里千问OCR能力的英文单词提取云函数，用于从图片中识别并提取英文单词。

## 功能特性

- 🔍 **智能识别**：基于阿里千问最新OCR模型
- 📝 **单词提取**：专门提取英文单词，过滤中文和数字
- 🔄 **自动旋转**：支持图片自动旋转识别
- ❓ **模糊处理**：模糊字母用?代替
- 🚫 **去重处理**：自动去除重复单词

## 配置要求

### 1. 环境变量配置

在微信开发者工具中，需要为云函数配置环境变量：

```json
{
  "DASHSCOPE_API_KEY": "你的阿里千问API密钥"
}
```

### 2. API密钥获取

1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 注册并实名认证
3. 创建应用并获取API Key
4. 在云函数配置中设置 `DASHSCOPE_API_KEY`

## 使用方法

### 在小程序中调用

```javascript
// 调用云函数提取单词
wx.cloud.callFunction({
  name: 'extractWords',
  data: {
    imageUrl: 'https://example.com/image.jpg', // 图片URL
    imageType: 'url' // 图片类型：'url' 或 'base64'
  },
  success: res => {
    if (res.result.success) {
      const words = res.result.data.words
      console.log('提取的单词:', words)
      // words 是一个字符串数组，如：['apple', 'banana', 'orange']
    } else {
      console.error('提取失败:', res.result.error)
    }
  },
  fail: err => {
    console.error('云函数调用失败:', err)
  }
})
```

### 使用本地图片

```javascript
// 1. 先选择图片
wx.chooseImage({
  count: 1,
  success: res => {
    const tempFilePath = res.tempFilePaths[0]
    
    // 2. 上传到云存储
    wx.cloud.uploadFile({
      cloudPath: `words/${Date.now()}.jpg`,
      filePath: tempFilePath,
      success: uploadRes => {
        // 3. 调用云函数识别
        wx.cloud.callFunction({
          name: 'extractWords',
          data: {
            imageUrl: uploadRes.fileID,
            imageType: 'url'
          },
          success: res => {
            if (res.result.success) {
              const words = res.result.data.words
              console.log('提取的单词:', words)
            }
          }
        })
      }
    })
  }
})
```

## 参数说明

### 输入参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| imageUrl | string | 是 | 图片URL或云存储fileID |
| imageType | string | 否 | 图片类型，默认'url' |

### 返回结果

成功时：
```json
{
  "success": true,
  "data": {
    "words": ["apple", "banana", "orange"],
    "originalText": "原始OCR识别文本",
    "usage": {
      "total_tokens": 765,
      "output_tokens": 159,
      "input_tokens": 606
    }
  }
}
```

失败时：
```json
{
  "success": false,
  "error": "错误信息"
}
```

## 部署步骤

1. **上传云函数**
   ```bash
   # 在云函数目录下安装依赖
   npm install
   ```

2. **配置环境变量**
   - 在微信开发者工具中右键云函数
   - 选择"配置"
   - 添加环境变量 `DASHSCOPE_API_KEY`

3. **部署云函数**
   - 右键云函数选择"上传并部署"

## 注意事项

1. **API配额**：阿里千问OCR有调用次数限制，请合理使用
2. **图片要求**：
   - 支持常见图片格式（JPG、PNG等）
   - 建议图片清晰度适中
   - 文字内容清晰可见
3. **网络要求**：云函数需要访问外网调用阿里云API
4. **超时设置**：默认30秒超时，大图片可能需要更长时间

## 错误处理

常见错误及解决方案：

- `未配置DASHSCOPE_API_KEY环境变量`：检查环境变量配置
- `API请求失败: 401`：API密钥无效或过期
- `请求超时`：图片过大或网络问题，建议压缩图片
- `OCR识别失败`：图片质量问题或格式不支持

## 版本历史

- v1.0.0：初始版本，支持基础单词提取功能 