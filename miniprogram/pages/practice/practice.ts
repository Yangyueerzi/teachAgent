import Toast from 'tdesign-miniprogram/toast/index';

interface PracticeResult {
  word: string;
  userInput: string;
  isCorrect: boolean;
}

Page({
  data: {
    words: [] as string[],
    currentIndex: 0,
    currentInput: '',
    isPlaying: false,
    pressedKey: '',
    showFeedback: false,
    feedbackType: 'correct',
    feedbackMessage: '',
    results: [] as PracticeResult[],
    keyboardLayout: [
      'Q', 'W', 'E', 'R', 'T', 'Y',
      'U', 'I', 'O', 'P', 'A', 'S',
      'D', 'F', 'G', 'H', 'J', 'K',
      'L', 'Z', 'X', 'C', 'V', 'B',
      'N', 'M'
    ],
    // 音频播放相关
    audioContext: null as any,
    speechSupported: false
  },

  // 计算属性
  get progressPercentage() {
    const { currentIndex, words } = this.data;
    return Math.round(((currentIndex + 1) / words.length) * 100);
  },

  get accuracy() {
    const { results } = this.data;
    if (results.length === 0) return 0;
    const correctCount = results.filter((r: PracticeResult) => r.isCorrect).length;
    return Math.round((correctCount / results.length) * 100);
  },

  onLoad() {
    // 获取练习单词列表
    const practiceWords = wx.getStorageSync('practiceWords') || [];
    if (practiceWords.length === 0) {
      this.showToast('没有找到练习单词', 'error');
      wx.navigateBack();
      return;
    }

    // 随机打乱单词顺序
    const shuffledWords = this.shuffleArray([...practiceWords]);
    
    this.setData({
      words: shuffledWords
    });

    // 初始化音频功能
    this.initAudio();

    console.log('听写练习页面加载完成，单词列表:', shuffledWords);
  },

  onShow() {
    this.updateProgress();
  },

  onUnload() {
    // 清理音频资源
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
    }
  },

  // 初始化音频功能
  initAudio() {
    try {
      // 创建音频上下文
      const audioContext = wx.createInnerAudioContext();
      this.setData({
        audioContext: audioContext,
        speechSupported: true
      });
      
      // 设置音频事件监听
      audioContext.onEnded(() => {
        this.setData({
          isPlaying: false
        });
      });

      audioContext.onError((err) => {
        console.error('音频播放错误:', err);
        this.setData({
          isPlaying: false
        });
        this.showToast('语音播放失败', 'error');
      });

      console.log('音频功能初始化成功');
    } catch (error) {
      console.error('音频功能初始化失败:', error);
      this.setData({
        speechSupported: false
      });
    }
  },

  // 播放单词
  async playWord() {
    if (this.data.isPlaying) return;
    
    const currentWord = this.data.words[this.data.currentIndex];
    if (!currentWord) return;

    this.setData({
      isPlaying: true
    });

    console.log('开始播放单词:', currentWord);

    try {
      // 方法1: 尝试使用在线TTS服务
      await this.playWithOnlineTTS(currentWord);
    } catch (error) {
      console.error('在线TTS播放失败:', error);
      
      try {
        // 方法2: 尝试使用Web Speech API (如果支持)
        await this.playWithWebSpeech(currentWord);
      } catch (speechError) {
        console.error('Web Speech API播放失败:', speechError);
        
        // 方法3: 使用文本显示作为备选方案
        this.playWithTextDisplay(currentWord);
      }
    }
  },

  // 方法1: 使用在线TTS服务播放
  playWithOnlineTTS(word: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.data.audioContext) {
        reject('音频上下文未初始化');
        return;
      }

      // TTS服务列表（按优先级排序）
      const ttsServices = [
        // 1. 有道翻译TTS（国内访问稳定）
        `http://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=1`,
        // 2. Google Translate TTS（音质好但可能被限制）
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(word)}`,
        // 3. 百度翻译TTS（备选）
        `https://fanyi.baidu.com/gettts?lan=en&text=${encodeURIComponent(word)}&spd=3&source=web`
      ];

      let currentServiceIndex = 0;

      const tryNextService = () => {
        if (currentServiceIndex >= ttsServices.length) {
          reject('所有TTS服务都不可用');
          return;
        }

        const ttsUrl = ttsServices[currentServiceIndex];
        console.log(`尝试TTS服务 ${currentServiceIndex + 1}:`, ttsUrl);

        this.data.audioContext.src = ttsUrl;
        
        this.data.audioContext.onCanplay(() => {
          console.log('音频准备完成，开始播放');
          this.data.audioContext.play();
        });

        this.data.audioContext.onPlay(() => {
          console.log('语音播放开始');
        });

        this.data.audioContext.onEnded(() => {
          console.log('语音播放完成');
          this.setData({
            isPlaying: false
          });
          resolve();
        });

        this.data.audioContext.onError((err: any) => {
          console.warn(`TTS服务 ${currentServiceIndex + 1} 失败:`, err);
          currentServiceIndex++;
          
          // 尝试下一个服务
          setTimeout(tryNextService, 500);
        });

        // 设置单个服务的超时时间
        const serviceTimeout = setTimeout(() => {
          console.warn(`TTS服务 ${currentServiceIndex + 1} 超时`);
          currentServiceIndex++;
          tryNextService();
        }, 3000);

        // 成功播放时清除超时
        this.data.audioContext.onPlay(() => {
          clearTimeout(serviceTimeout);
        });
      };

      // 开始尝试第一个服务
      tryNextService();

      // 设置总超时时间
      setTimeout(() => {
        if (this.data.isPlaying) {
          this.setData({
            isPlaying: false
          });
          reject('TTS服务总体超时');
        }
      }, 10000);
    });
  },

  // 方法2: 使用Web Speech API播放 (部分浏览器支持)
  playWithWebSpeech(word: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 在小程序环境中，Web Speech API 支持有限，使用备选方案
      reject('小程序环境暂不支持Web Speech API');
    });
  },

  // 方法3: 使用文本显示作为备选方案
  playWithTextDisplay(word: string) {
    console.log('使用文本显示模式播放单词:', word);
    
    // 显示单词给用户看（作为语音的备选方案）
    this.showToast(`单词: ${word}`, 'loading');
    
    // 模拟播放时长
    setTimeout(() => {
      this.setData({
        isPlaying: false
      });
    }, 2000);
  },

  // 按键按下
  onKeyPress(e: any) {
    const letter = e.currentTarget.dataset.letter;
    this.setData({
      pressedKey: letter,
      currentInput: this.data.currentInput + letter.toLowerCase()
    });
  },

  // 按键释放
  onKeyRelease() {
    this.setData({
      pressedKey: ''
    });
  },

  // 清除输入
  clearInput() {
    this.setData({
      currentInput: ''
    });
  },

  // 提交单词
  submitWord() {
    const { currentInput, words, currentIndex } = this.data;
    
    if (!currentInput.trim()) {
      this.showToast('请输入单词', 'warning');
      return;
    }

    const currentWord = words[currentIndex];
    const isCorrect = currentInput.toLowerCase() === currentWord.toLowerCase();
    
    // 记录结果
    const result: PracticeResult = {
      word: currentWord,
      userInput: currentInput,
      isCorrect: isCorrect
    };

    const newResults = [...this.data.results, result];
    this.setData({
      results: newResults
    });

    // 显示反馈
    this.showFeedback(isCorrect, currentWord);

    // 延迟进入下一个单词
    setTimeout(() => {
      this.nextWord();
    }, 2000);
  },

  // 显示反馈
  showFeedback(isCorrect: boolean, correctWord: string) {
    const message = isCorrect ? '正确！' : `错误！正确答案是：${correctWord}`;
    
    this.setData({
      showFeedback: true,
      feedbackType: isCorrect ? 'correct' : 'incorrect',
      feedbackMessage: message
    });

    setTimeout(() => {
      this.setData({
        showFeedback: false
      });
    }, 2000);
  },

  // 下一个单词
  nextWord() {
    const { currentIndex, words } = this.data;
    
    if (currentIndex >= words.length - 1) {
      // 完成所有单词，跳转到结果页
      this.finishPractice();
      return;
    }

    this.setData({
      currentIndex: currentIndex + 1,
      currentInput: ''
    });

    this.updateProgress();
  },

  // 完成练习
  finishPractice() {
    // 保存练习结果
    wx.setStorageSync('practiceResults', this.data.results);
    
    // 跳转到结果页
    wx.redirectTo({
      url: '/pages/result/result'
    });
  },

  // 更新进度
  updateProgress() {
    // 触发页面更新以重新计算计算属性
    this.setData({
      progressPercentage: this.progressPercentage,
      accuracy: this.accuracy
    });
  },

  // 随机打乱数组
  shuffleArray(array: string[]): string[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },

  // 显示Toast消息
  showToast(message: string, theme: 'success' | 'warning' | 'error' | 'loading' = 'success') {
    Toast({
      context: this,
      selector: '#t-toast',
      message: message,
      theme: theme,
      direction: 'column',
    });
  }
}); 