/**
 * 语音播放功能测试脚本
 * 在微信开发者工具控制台中运行此代码来测试语音播放功能
 */

// 测试在线TTS服务
function testOnlineTTS() {
  console.log('=== 测试在线TTS服务 ===');
  
  const testWord = 'hello';
  console.log('测试单词:', testWord);
  
  // 创建音频上下文
  const audioContext = wx.createInnerAudioContext();
  
  // 使用Google Translate TTS服务
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(testWord)}`;
  console.log('TTS URL:', ttsUrl);
  
  audioContext.src = ttsUrl;
  
  audioContext.onCanplay(() => {
    console.log('✅ 音频可以播放');
    audioContext.play();
  });
  
  audioContext.onPlay(() => {
    console.log('✅ 开始播放语音');
  });
  
  audioContext.onEnded(() => {
    console.log('✅ 语音播放完成');
    audioContext.destroy();
  });
  
  audioContext.onError((err) => {
    console.error('❌ 语音播放失败:', err);
    console.log('可能的原因：');
    console.log('1. 网络连接问题');
    console.log('2. Google TTS服务被限制');
    console.log('3. 音频格式不支持');
    audioContext.destroy();
  });
  
  // 设置超时
  setTimeout(() => {
    console.log('⚠️ 播放超时，停止音频');
    audioContext.destroy();
  }, 10000);
}

// 测试备用TTS服务
function testAlternateTTS() {
  console.log('=== 测试备用TTS服务 ===');
  
  const testWord = 'world';
  console.log('测试单词:', testWord);
  
  // 创建音频上下文
  const audioContext = wx.createInnerAudioContext();
  
  // 使用其他TTS服务（例如：有道翻译）
  const ttsUrl = `http://dict.youdao.com/dictvoice?audio=${encodeURIComponent(testWord)}&type=1`;
  console.log('备用TTS URL:', ttsUrl);
  
  audioContext.src = ttsUrl;
  
  audioContext.onCanplay(() => {
    console.log('✅ 备用音频可以播放');
    audioContext.play();
  });
  
  audioContext.onPlay(() => {
    console.log('✅ 开始播放备用语音');
  });
  
  audioContext.onEnded(() => {
    console.log('✅ 备用语音播放完成');
    audioContext.destroy();
  });
  
  audioContext.onError((err) => {
    console.error('❌ 备用语音播放失败:', err);
    audioContext.destroy();
  });
  
  // 设置超时
  setTimeout(() => {
    console.log('⚠️ 备用播放超时，停止音频');
    audioContext.destroy();
  }, 10000);
}

// 测试音频权限
function testAudioPermissions() {
  console.log('=== 测试音频权限 ===');
  
  wx.getSetting({
    success: (res) => {
      console.log('当前权限设置:', res.authSetting);
      
      if (res.authSetting['scope.record']) {
        console.log('✅ 已获得录音权限');
      } else {
        console.log('⚠️ 未获得录音权限，但播放音频不需要此权限');
      }
    },
    fail: (err) => {
      console.error('❌ 获取权限信息失败:', err);
    }
  });
}

// 测试网络连接
function testNetworkConnection() {
  console.log('=== 测试网络连接 ===');
  
  wx.getNetworkType({
    success: (res) => {
      console.log('网络类型:', res.networkType);
      
      if (res.networkType === 'none') {
        console.log('❌ 无网络连接');
      } else {
        console.log('✅ 网络连接正常');
        
        // 测试网络请求
        wx.request({
          url: 'https://www.google.com',
          method: 'HEAD',
          success: () => {
            console.log('✅ 外网连接正常');
          },
          fail: (err) => {
            console.log('⚠️ 外网连接可能受限:', err);
            console.log('这可能影响在线TTS服务的使用');
          }
        });
      }
    },
    fail: (err) => {
      console.error('❌ 获取网络状态失败:', err);
    }
  });
}

// 创建本地音频文件测试
function testLocalAudio() {
  console.log('=== 测试本地音频播放 ===');
  
  // 创建一个简单的音频数据（用于测试音频播放功能）
  const audioContext = wx.createInnerAudioContext();
  
  // 使用一个已知的在线音频文件进行测试
  const testAudioUrl = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
  
  audioContext.src = testAudioUrl;
  
  audioContext.onCanplay(() => {
    console.log('✅ 测试音频可以播放');
    audioContext.play();
  });
  
  audioContext.onPlay(() => {
    console.log('✅ 开始播放测试音频');
  });
  
  audioContext.onEnded(() => {
    console.log('✅ 测试音频播放完成');
    audioContext.destroy();
  });
  
  audioContext.onError((err) => {
    console.error('❌ 测试音频播放失败:', err);
    console.log('音频播放功能可能存在问题');
    audioContext.destroy();
  });
}

// 运行所有测试
function runSpeechTests() {
  console.log('开始语音播放功能测试...\n');
  
  setTimeout(() => testAudioPermissions(), 100);
  setTimeout(() => testNetworkConnection(), 1000);
  setTimeout(() => testLocalAudio(), 2000);
  setTimeout(() => testOnlineTTS(), 4000);
  setTimeout(() => testAlternateTTS(), 8000);
  
  console.log('测试启动完成，请查看详细结果...\n');
}

// 语音播放问题排查指南
function speechTroubleshooting() {
  console.log('=== 语音播放问题排查指南 ===');
  console.log('');
  console.log('常见问题及解决方案：');
  console.log('');
  console.log('1. 没有声音：');
  console.log('   - 检查设备音量设置');
  console.log('   - 检查小程序音频权限');
  console.log('   - 尝试播放其他音频确认设备正常');
  console.log('');
  console.log('2. 网络错误：');
  console.log('   - 检查网络连接');
  console.log('   - 尝试切换网络环境（WiFi/4G）');
  console.log('   - 检查防火墙设置');
  console.log('');
  console.log('3. TTS服务不可用：');
  console.log('   - Google TTS可能被限制，尝试其他服务');
  console.log('   - 考虑使用本地音频文件');
  console.log('   - 实现离线语音合成');
  console.log('');
  console.log('4. 音频格式问题：');
  console.log('   - 确保音频格式被小程序支持');
  console.log('   - 尝试不同的音频源');
}

// 推荐的TTS服务列表
function listTTSServices() {
  console.log('=== 推荐的TTS服务 ===');
  console.log('');
  console.log('1. Google Translate TTS:');
  console.log('   URL: https://translate.google.com/translate_tts');
  console.log('   优点: 音质好，支持多语言');
  console.log('   缺点: 可能被限制访问');
  console.log('');
  console.log('2. 有道翻译TTS:');
  console.log('   URL: http://dict.youdao.com/dictvoice');
  console.log('   优点: 国内访问稳定');
  console.log('   缺点: 音质一般');
  console.log('');
  console.log('3. 百度TTS:');
  console.log('   需要API密钥，音质好');
  console.log('');
  console.log('4. 阿里云TTS:');
  console.log('   需要API密钥，功能强大');
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testOnlineTTS,
    testAlternateTTS,
    testAudioPermissions,
    testNetworkConnection,
    testLocalAudio,
    runSpeechTests,
    speechTroubleshooting,
    listTTSServices
  };
}

// 使用说明
console.log('语音播放测试脚本已加载');
console.log('运行命令：');
console.log('- runSpeechTests()         // 运行完整测试');
console.log('- testOnlineTTS()          // 测试在线TTS');
console.log('- speechTroubleshooting()  // 查看问题排查指南');
console.log('- listTTSServices()        // 查看TTS服务列表'); 