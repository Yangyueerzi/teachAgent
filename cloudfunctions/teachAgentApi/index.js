const cloud = require('wx-server-sdk');
const axios = require('axios');

// 初始化云环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 获取数据库引用
const db = cloud.database();

/**
 * 统一云函数入口
 * 根据 action 字段路由到不同的业务处理函数
 */
exports.main = async (event, context) => {
  const { action, ...params } = event;
  
  try {
    // 根据业务名路由到对应的处理函数
    switch (action) {
      case 'wechatLogin':
        return await handleWechatLogin(params, context);
      
      case 'extractWords':
        return await handleExtractWords(params, context);
      
      case 'getUserInfo':
        return await handleGetUserInfo(params, context);
      
      case 'updateUserInfo':
        return await handleUpdateUserInfo(params, context);
      
      case 'saveStudyRecord':
        return await handleSaveStudyRecord(params, context);
      
      default:
        return {
          success: false,
          message: `未知的业务操作: ${action}`,
          code: 'UNKNOWN_ACTION'
        };
    }
  } catch (error) {
    console.error(`业务操作失败 [${action}]:`, error);
    return {
      success: false,
      message: error.message || '服务器内部错误',
      code: 'INTERNAL_ERROR',
      error: {
        name: error.name,
        message: error.message
      }
    };
  }
};

/**
 * 微信登录处理
 */
async function handleWechatLogin(params, context) {
  const { code } = params;
  
  if (!code) {
    throw new Error('缺少登录凭证code');
  }

  try {
    // 获取微信调用上下文（云开发会自动处理登录凭证）
    const wxContext = cloud.getWXContext();
    console.log('微信上下文:', wxContext);
    
    // 使用云开发的方式获取openid
    let openid = wxContext.OPENID;
    let unionid = wxContext.UNIONID;
    
    // 如果通过上下文没有获取到openid，尝试使用code换取
    if (!openid) {
      try {
        // 备用方案：调用微信官方API
        const loginResult = await cloud.openapi.auth.code2Session({
          appid: wxContext.APPID,
          secret: process.env.APP_SECRET || wxContext.ENV, // 使用环境变量中的AppSecret
          jsCode: code,
          grantType: 'authorization_code'
        });

        if (loginResult.errCode === 0) {
          openid = loginResult.openid;
          unionid = loginResult.unionid;
          console.log('通过官方API获取openid成功:', openid);
        } else {
          throw new Error(`微信API调用失败: ${loginResult.errMsg}`);
        }
      } catch (apiError) {
        console.error('微信官方API调用失败:', apiError);
        // 如果官方API也失败，使用模拟的openid（仅用于开发测试）
        openid = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('使用模拟openid进行测试:', openid);
      }
    }
    
    if (!openid) {
      throw new Error('无法获取用户标识');
    }
    
    // 确保数据库集合存在
    const userCollection = db.collection('users');
    
    let userRecord;
    try {
      // 尝试查询用户
      userRecord = await userCollection.where({
        openid: openid
      }).get();
    } catch (collectionError) {
      if (collectionError.errCode === -502005) {
        // 集合不存在，先创建一个文档来初始化集合
        console.log('users集合不存在，正在初始化...');
        
        const newUser = {
          openid: openid,
          unionid: unionid,
          createTime: new Date(),
          lastLoginTime: new Date(),
          loginCount: 1,
          grade: '小学三年级',
          status: 'active'
        };
        
        const addResult = await userCollection.add({
          data: newUser
        });
        
        console.log('创建新用户并初始化集合成功:', addResult._id);
        
        const userData = {
          _id: addResult._id,
          ...newUser
        };
        
        // 生成安全的返回数据
        const safeUserData = {
          _id: userData._id,
          openid: userData.openid,
          unionid: userData.unionid,
          createTime: userData.createTime,
          lastLoginTime: userData.lastLoginTime,
          loginCount: userData.loginCount,
          grade: userData.grade,
          status: userData.status
        };
        
        return {
          success: true,
          data: {
            userInfo: safeUserData,
            sessionInfo: {
              openid: openid,
              createTime: Date.now(),
              expireTime: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天过期
            },
            openid: openid
          },
          message: '登录成功（首次创建）'
        };
      } else {
        throw collectionError;
      }
    }
    
    let userData;
    
    // 如果用户不存在，创建新用户
    if (userRecord.data.length === 0) {
      const newUser = {
        openid: openid,
        unionid: unionid,
        createTime: new Date(),
        lastLoginTime: new Date(),
        loginCount: 1,
        grade: '小学三年级',
        status: 'active'
      };
      
      const addResult = await userCollection.add({
        data: newUser
      });
      
      userData = {
        _id: addResult._id,
        ...newUser
      };
      console.log('创建新用户成功:', userData._id);
    } else {
      // 用户已存在，更新登录信息
      userData = userRecord.data[0];
      await userCollection.doc(userData._id).update({
        data: {
          lastLoginTime: new Date(),
          loginCount: db.command.inc(1)
        }
      });
      
      userData.lastLoginTime = new Date();
      userData.loginCount = (userData.loginCount || 0) + 1;
      console.log('更新用户登录信息:', userData._id);
    }
    
    // 生成安全的返回数据
    const safeUserData = {
      _id: userData._id,
      openid: userData.openid,
      unionid: userData.unionid,
      createTime: userData.createTime,
      lastLoginTime: userData.lastLoginTime,
      loginCount: userData.loginCount,
      grade: userData.grade,
      status: userData.status
    };
    
    return {
      success: true,
      data: {
        userInfo: safeUserData,
        sessionInfo: {
          openid: openid,
          createTime: Date.now(),
          expireTime: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天过期
        },
        openid: openid
      },
      message: '登录成功'
    };
    
  } catch (error) {
    console.error('微信登录失败:', error);
    throw new Error(`登录失败: ${error.message || '未知错误'}`);
  }
}

/**
 * 提取图片中的单词
 */
async function handleExtractWords(params, context) {
  const { imageUrl, imageType = 'url' } = params;
  
  if (!imageUrl) {
    throw new Error('缺少图片参数');
  }

  // 阿里千问API配置
  const API_KEY = process.env.DASHSCOPE_API_KEY;
  if (!API_KEY) {
    throw new Error('未配置DASHSCOPE_API_KEY环境变量');
  }

  // 处理不同类型的图片输入
  let processedImageUrl = imageUrl;
  
  if (imageType === 'fileID' || imageUrl.startsWith('cloud://')) {
    // 如果是云存储fileID，获取临时下载链接
    console.log('处理云存储fileID:', imageUrl);
    try {
      const downloadResult = await cloud.getTempFileURL({
        fileList: [imageUrl]
      });
      
      if (downloadResult.fileList && downloadResult.fileList.length > 0) {
        const fileInfo = downloadResult.fileList[0];
        if (fileInfo.status === 0) {
          processedImageUrl = fileInfo.tempFileURL;
          console.log('获取临时链接成功:', processedImageUrl);
        } else {
          throw new Error(`获取临时链接失败: ${fileInfo.errMsg}`);
        }
      } else {
        throw new Error('获取临时链接失败：无返回数据');
      }
    } catch (error) {
      console.error('处理云存储文件失败:', error);
      throw new Error(`处理云存储文件失败: ${error.message}`);
    }
  }

  try {
    // 调用阿里千问API进行图片文字识别
    const response = await axios({
      method: 'POST',
      url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: 'qwen-vl-plus',
        input: {
          messages: [
            {
              role: 'user',
              content: [
                {
                  image: processedImageUrl
                },
                {
                  text: `请识别这张图片中的英文单词表内容，按照以下规则处理：
1. 忽略章节标题（如Module、Unit、Lesson等）
2. 保持完整短句不拆分（如"How are you?"应作为一个整体）
3. 只提取真正的学习词汇
4. 忽略页码、序号等非词汇内容
以JSON格式返回，格式为{"words": ["word1", "complete phrase", ...]}。只返回JSON，不要其他文字。`
                }
              ]
            }
          ]
        },
        parameters: {
          result_format: 'message'
        }
      },
      timeout: 30000
    });

    console.log('API响应:', response.data);

    if (response.data && response.data.output && response.data.output.choices) {
      const result = response.data.output.choices[0].message.content;
      console.log('提取结果:', result);

      // 尝试解析JSON结果
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResult = JSON.parse(jsonMatch[0]);
          if (parsedResult.words && Array.isArray(parsedResult.words)) {
            // 进一步过滤和优化单词列表
            const filteredWords = filterAndOptimizeWords(parsedResult.words);
            return {
              success: true,
              data: {
                words: filteredWords,
                totalCount: filteredWords.length,
                originalCount: parsedResult.words.length
              },
              message: '提取成功'
            };
          }
        }
        
        // 如果JSON解析失败，尝试其他方式提取单词
        const words = extractWordsFromText(result);
        const filteredWords = filterAndOptimizeWords(words);
        return {
          success: true,
          data: {
            words: filteredWords,
            totalCount: filteredWords.length
          },
          message: '提取成功'
        };
        
      } catch (parseError) {
        console.error('解析结果失败:', parseError);
        const words = extractWordsFromText(result);
        const filteredWords = filterAndOptimizeWords(words);
        return {
          success: true,
          data: {
            words: filteredWords,
            totalCount: filteredWords.length
          },
          message: '提取成功（备用解析）'
        };
      }
    } else {
      throw new Error('API返回数据格式异常');
    }

  } catch (error) {
    console.error('API调用失败:', error);
    if (error.response) {
      console.error('API错误响应:', error.response.data);
      throw new Error(`API调用失败: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      throw new Error(`API调用失败: ${error.message}`);
    }
  }
}

/**
 * 获取用户信息
 */
async function handleGetUserInfo(params, context) {
  const { openid } = params;
  
  if (!openid) {
    throw new Error('缺少用户标识');
  }

  const userCollection = db.collection('users');
  const userRecord = await userCollection.where({
    openid: openid
  }).get();

  if (userRecord.data.length === 0) {
    throw new Error('用户不存在');
  }

  const userData = userRecord.data[0];
  
  // 返回安全的用户数据
  const safeUserData = {
    _id: userData._id,
    openid: userData.openid,
    unionid: userData.unionid,
    nickName: userData.nickName,
    avatarUrl: userData.avatarUrl,
    gender: userData.gender,
    grade: userData.grade,
    createTime: userData.createTime,
    lastLoginTime: userData.lastLoginTime,
    loginCount: userData.loginCount,
    status: userData.status
  };

  return {
    success: true,
    data: safeUserData,
    message: '获取用户信息成功'
  };
}

/**
 * 更新用户信息
 */
async function handleUpdateUserInfo(params, context) {
  const { openid, ...updateData } = params;
  
  if (!openid) {
    throw new Error('缺少用户标识');
  }

  // 过滤敏感字段
  const allowedFields = ['nickName', 'avatarUrl', 'gender', 'grade'];
  const filteredData = {};
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });

  if (Object.keys(filteredData).length === 0) {
    throw new Error('没有需要更新的字段');
  }

  const userCollection = db.collection('users');
  const updateResult = await userCollection.where({
    openid: openid
  }).update({
    data: {
      ...filteredData,
      updateTime: new Date()
    }
  });

  if (updateResult.stats.updated === 0) {
    throw new Error('用户不存在或更新失败');
  }

  return {
    success: true,
    data: filteredData,
    message: '更新用户信息成功'
  };
}

/**
 * 保存学习记录
 */
async function handleSaveStudyRecord(params, context) {
  const { openid, words, studyTime, correctCount, totalCount } = params;
  
  if (!openid) {
    throw new Error('缺少用户标识');
  }

  const studyRecord = {
    openid: openid,
    words: words || [],
    studyTime: studyTime || new Date(),
    correctCount: correctCount || 0,
    totalCount: totalCount || 0,
    accuracy: totalCount > 0 ? (correctCount / totalCount * 100).toFixed(2) : 0,
    createTime: new Date()
  };

  const recordCollection = db.collection('studyRecords');
  const addResult = await recordCollection.add({
    data: studyRecord
  });

  return {
    success: true,
    data: {
      recordId: addResult._id,
      ...studyRecord
    },
    message: '保存学习记录成功'
  };
}

/**
 * 从文本中提取英文单词的备用方法
 */
function extractWordsFromText(text) {
  // 使用正则表达式提取英文单词
  const wordPattern = /\b[A-Za-z]+\b/g;
  const matches = text.match(wordPattern);
  
  if (!matches) {
    return [];
  }
  
  // 去重并过滤长度
  const uniqueWords = [...new Set(matches)]
    .filter(word => word.length > 1) // 过滤单个字母
    .map(word => word.toLowerCase()); // 转为小写
  
  return uniqueWords;
}

/**
 * 进一步过滤和优化单词列表
 */
function filterAndOptimizeWords(words) {
  if (!Array.isArray(words)) {
    return [];
  }

  // 章节标题关键词列表
  const sectionTitles = [
    'module', 'unit', 'lesson', 'chapter', 'part', 'section',
    'vocabulary', 'words', 'phrases', 'grammar', 'exercise',
    'review', 'test', 'quiz', 'homework', 'practice'
  ];

  // 过滤和优化单词
  const filteredWords = words
    .map(word => {
      if (typeof word !== 'string') return '';
      return word.trim();
    })
    .filter(word => {
      if (!word || word.length === 0) return false;
      
      // 过滤纯数字
      if (/^\d+$/.test(word)) return false;
      
      // 过滤单个字母
      if (/^[a-zA-Z]$/.test(word)) return false;
      
      // 过滤章节标题
      const lowerWord = word.toLowerCase();
      if (sectionTitles.some(title => lowerWord.includes(title))) return false;
      
      // 过滤常见的非词汇内容
      if (/^(page|p\.|no\.|number)[\s\d]*$/i.test(word)) return false;
      
      // 过滤序号格式 (如 "1.", "2)", "a)", "(1)")
      if (/^[\(\d\)\.a-z]+[\)\.]?$/i.test(word) && word.length <= 5) return false;
      
      // 保留有效的英文内容
      if (/[a-zA-Z]/.test(word)) return true;
      
      return false;
    })
    .map(word => {
      // 清理单词格式
      // 移除首尾的标点符号（但保留内部的）
      word = word.replace(/^[^\w\s]+|[^\w\s\?!\.]+$/g, '');
      
      // 处理特殊情况：保持问句和感叹句的完整性
      if (word.includes('?') || word.includes('!')) {
        return word;
      }
      
      // 标准化大小写：首字母大写，其余小写（除非是专有名词）
      if (word.length > 1) {
        // 检查是否可能是专有名词（全大写或特殊格式）
        if (!/^[A-Z]{2,}$/.test(word)) {
          word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
      }
      
      return word;
    })
    .filter(word => word.length > 0);

  // 去重，保持原始顺序
  const uniqueWords = [];
  const seen = new Set();
  
  for (const word of filteredWords) {
    const normalizedWord = word.toLowerCase();
    if (!seen.has(normalizedWord)) {
      seen.add(normalizedWord);
      uniqueWords.push(word);
    }
  }

  return uniqueWords;
} 