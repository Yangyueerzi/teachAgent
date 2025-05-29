const cloud = require('wx-server-sdk')
const axios = require('axios')

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 云函数：提取图片中的单词
 * @param {Object} event - 云函数参数
 * @param {string} event.imageUrl - 图片URL、fileID或base64
 * @param {string} event.imageType - 图片类型：'url'、'fileID' 或 'base64'
 * @param {Object} context - 云函数上下文
 */
exports.main = async (event, context) => {
  try {
    const { imageUrl, imageType = 'url' } = event
    
    if (!imageUrl) {
      return {
        success: false,
        error: '缺少图片参数'
      }
    }

    // 阿里千问API配置
    const API_KEY = process.env.DASHSCOPE_API_KEY
    if (!API_KEY) {
      return {
        success: false,
        error: '未配置DASHSCOPE_API_KEY环境变量'
      }
    }

    // 处理不同类型的图片输入
    let processedImageUrl = imageUrl
    
    if (imageType === 'fileID' || imageUrl.startsWith('cloud://')) {
      // 如果是云存储fileID，获取临时下载链接
      console.log('处理云存储fileID:', imageUrl)
      try {
        const downloadResult = await cloud.getTempFileURL({
          fileList: [imageUrl]
        })
        
        if (downloadResult.fileList && downloadResult.fileList.length > 0) {
          const fileInfo = downloadResult.fileList[0]
          if (fileInfo.status === 0) {
            processedImageUrl = fileInfo.tempFileURL
            console.log('获取临时下载链接成功:', processedImageUrl)
          } else {
            throw new Error(`获取临时链接失败: ${fileInfo.errmsg}`)
          }
        } else {
          throw new Error('获取临时链接失败：返回结果为空')
        }
      } catch (error) {
        console.error('获取临时下载链接失败:', error)
        return {
          success: false,
          error: `图片处理失败: ${error.message}`
        }
      }
    } else if (imageType === 'base64' && !imageUrl.startsWith('data:')) {
      // 如果是base64但没有data前缀，添加前缀
      processedImageUrl = `data:image/jpeg;base64,${imageUrl}`
    }

    console.log('最终使用的图片URL类型:', imageType)
    console.log('处理后的图片URL长度:', processedImageUrl.length)

    // 构建请求数据
    const requestData = {
      model: "qwen-vl-ocr-latest",
      input: {
        messages: [
          {
            role: "user",
            content: [
              {
                image: processedImageUrl,
                min_pixels: 3136,
                max_pixels: 6422528,
                enable_rotate: true
              },
              {
                text: "请识别图片中的所有英文单词，要求：1. 只提取英文单词，忽略中文和数字；2. 每个单词单独一行；3. 保持单词的原始大小写；4. 不要添加任何额外的描述或格式；5. 如果某个字母模糊不清，用?代替该字母。请直接输出单词列表，每行一个单词。"
              }
            ]
          }
        ]
      }
    }

    console.log('开始调用阿里千问OCR API...')

    // 调用阿里千问OCR API
    const response = await axios({
      method: 'POST',
      url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: requestData,
      timeout: 30000 // 30秒超时
    })

    console.log('阿里千问API调用成功')

    if (response.data && response.data.output && response.data.output.choices) {
      const content = response.data.output.choices[0].message.content[0].text
      
      // 解析提取的文本，转换为单词数组
      const words = parseWordsFromText(content)
      
      console.log('识别到的单词数量:', words.length)
      
      return {
        success: true,
        data: {
          words: words,
          originalText: content,
          usage: response.data.usage
        }
      }
    } else {
      return {
        success: false,
        error: 'OCR识别失败，返回数据格式异常'
      }
    }

  } catch (error) {
    console.error('云函数执行错误:', error)
    
    // 处理不同类型的错误
    if (error.response) {
      // API请求错误
      const errorMessage = error.response.data?.message || error.response.data?.error?.message || error.message
      return {
        success: false,
        error: `API请求失败: ${error.response.status} - ${errorMessage}`
      }
    } else if (error.code === 'ECONNABORTED') {
      // 超时错误
      return {
        success: false,
        error: '请求超时，请稍后重试'
      }
    } else {
      // 其他错误
      return {
        success: false,
        error: `处理失败: ${error.message}`
      }
    }
  }
}

/**
 * 从OCR识别的文本中解析出单词列表
 * @param {string} text - OCR识别的原始文本
 * @returns {Array} 单词数组
 */
function parseWordsFromText(text) {
  if (!text) return []
  
  // 移除markdown代码块标记
  let cleanText = text.replace(/```[\s\S]*?```/g, '')
  cleanText = cleanText.replace(/```/g, '')
  
  // 按行分割
  const lines = cleanText.split('\n')
  const words = []
  
  for (let line of lines) {
    // 清理每行文本
    line = line.trim()
    
    // 跳过空行和非英文内容
    if (!line) continue
    
    // 使用正则表达式提取英文单词（包含?号用于模糊字母）
    const wordMatches = line.match(/[a-zA-Z?]+/g)
    
    if (wordMatches) {
      for (let word of wordMatches) {
        // 过滤掉太短的"单词"（可能是噪音）
        if (word.length >= 2) {
          words.push(word)
        }
      }
    }
  }
  
  // 去重并保持顺序
  const uniqueWords = [...new Set(words)]
  
  return uniqueWords
} 