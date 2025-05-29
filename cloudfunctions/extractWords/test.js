/**
 * 云函数测试文件
 * 用于本地测试云函数功能
 */

const axios = require('axios')

// 测试函数
async function testOCR() {
  const API_KEY = 'your-api-key-here' // 替换为你的API密钥
  
  if (!API_KEY || API_KEY === 'your-api-key-here') {
    console.error('请先设置API密钥')
    return
  }

  // 测试图片URL（包含英文单词的图片）
  const testImageUrl = 'https://img.alicdn.com/imgextra/i2/O1CN01ktT8451iQutqReELT_!!6000000004408-0-tps-689-487.jpg'

  const requestData = {
    model: "qwen-vl-ocr-latest",
    input: {
      messages: [
        {
          role: "user",
          content: [
            {
              image: testImageUrl,
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

  try {
    console.log('开始测试OCR识别...')
    
    const response = await axios({
      method: 'POST',
      url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: requestData,
      timeout: 30000
    })

    if (response.data && response.data.output && response.data.output.choices) {
      const content = response.data.output.choices[0].message.content[0].text
      console.log('OCR识别结果:')
      console.log(content)
      
      // 解析单词
      const words = parseWordsFromText(content)
      console.log('\n解析出的单词:')
      console.log(words)
      
      console.log('\n测试成功！')
    } else {
      console.error('OCR识别失败，返回数据格式异常')
    }

  } catch (error) {
    console.error('测试失败:', error.message)
    if (error.response) {
      console.error('API错误:', error.response.status, error.response.data)
    }
  }
}

/**
 * 从OCR识别的文本中解析出单词列表
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
    line = line.trim()
    if (!line) continue
    
    // 使用正则表达式提取英文单词
    const wordMatches = line.match(/[a-zA-Z?]+/g)
    
    if (wordMatches) {
      for (let word of wordMatches) {
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

// 运行测试
if (require.main === module) {
  testOCR()
}

module.exports = { testOCR, parseWordsFromText } 