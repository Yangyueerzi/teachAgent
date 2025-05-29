import Toast from 'tdesign-miniprogram/toast/index';

interface PracticeResult {
  word: string;
  userInput: string;
  isCorrect: boolean;
}

Page({
  data: {
    results: [] as PracticeResult[],
    accuracy: 0,
    totalWords: 0,
    correctCount: 0,
    wrongCount: 0,
    wrongWords: [] as PracticeResult[],
    encourageMessage: '',
    suggestions: [] as string[],
    showCelebration: false
  },

  onLoad() {
    // 获取练习结果
    const practiceResults = wx.getStorageSync('practiceResults') || [];
    if (practiceResults.length === 0) {
      this.showToast('没有找到练习结果', 'error');
      wx.navigateBack();
      return;
    }

    this.processResults(practiceResults);
    this.updateScoreCircle();
    
    // 检查是否需要显示庆祝动画
    if (this.data.accuracy >= 80) {
      setTimeout(() => {
        this.showCelebrationAnimation();
      }, 500);
    }
  },

  // 处理练习结果
  processResults(results: PracticeResult[]) {
    const correctCount = results.filter(r => r.isCorrect).length;
    const wrongWords = results.filter(r => !r.isCorrect);
    const accuracy = Math.round((correctCount / results.length) * 100);

    // 生成鼓励消息
    const encourageMessage = this.getEncourageMessage(accuracy);
    
    // 生成学习建议
    const suggestions = this.getSuggestions(accuracy, wrongWords);

    this.setData({
      results,
      accuracy,
      totalWords: results.length,
      correctCount,
      wrongCount: results.length - correctCount,
      wrongWords,
      encourageMessage,
      suggestions
    });
  },

  // 获取鼓励消息
  getEncourageMessage(accuracy: number): string {
    if (accuracy >= 90) {
      return '太棒了！你的表现非常出色！';
    } else if (accuracy >= 80) {
      return '很好！继续保持这个水平！';
    } else if (accuracy >= 60) {
      return '不错！继续努力，你会越来越棒的！';
    } else {
      return '加油！多练习几次就会进步的！';
    }
  },

  // 获取学习建议
  getSuggestions(accuracy: number, wrongWords: PracticeResult[]): string[] {
    const suggestions: string[] = [];

    if (accuracy < 60) {
      suggestions.push('建议先熟悉单词的发音和拼写');
      suggestions.push('可以先听几遍，熟悉发音后再拼写');
    }

    if (wrongWords.length > 0) {
      const longWords = wrongWords.filter(w => w.word.length > 6);
      if (longWords.length > 0) {
        suggestions.push('多练习长单词的拼写，注意每个字母');
      }
      
      suggestions.push('建议将错误单词加入复习清单');
    }

    if (accuracy >= 80) {
      suggestions.push('表现很好！可以尝试更多单词练习');
    }

    return suggestions;
  },

  // 更新圆形进度条
  updateScoreCircle() {
    const degrees = (this.data.accuracy / 100) * 360;
    const scoreCircle = wx.createSelectorQuery().select('.score-circle');
    scoreCircle.node().exec((res) => {
      if (res[0] && res[0].node) {
        res[0].node.style.setProperty('--progress-deg', `${degrees}deg`);
      }
    });
  },

  // 显示庆祝动画
  showCelebrationAnimation() {
    this.setData({
      showCelebration: true
    });

    setTimeout(() => {
      this.setData({
        showCelebration: false
      });
    }, 3000);
  },

  // 播放单词
  playWord(e: any) {
    const word = e.currentTarget.dataset.word;
    console.log('播放单词:', word);
    this.showToast(`播放单词: ${word}`, 'success');
  },

  // 重写单词
  retryWord(e: any) {
    const word = e.currentTarget.dataset.word;
    
    // 创建只包含这个单词的练习
    wx.setStorageSync('practiceWords', [word]);
    
    // 跳转到练习页面
    wx.navigateTo({
      url: '/pages/practice/practice'
    });
  },

  // 处理单词操作
  handleWordAction(e: any) {
    const word = e.currentTarget.dataset.word;
    console.log('点击单词:', word);
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  },

  // 重新练习
  practiceAgain() {
    // 获取原始单词列表
    const originalWords = this.data.results.map(r => r.word);
    wx.setStorageSync('practiceWords', originalWords);
    
    // 跳转到练习页面
    wx.redirectTo({
      url: '/pages/practice/practice'
    });
  },

  // 保存学习记录
  saveStudyRecord() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) return;

    const record = {
      date: new Date().toISOString(),
      totalWords: this.data.totalWords,
      correctCount: this.data.correctCount,
      accuracy: this.data.accuracy,
      wrongWords: this.data.wrongWords.map(w => w.word)
    };

    // 获取历史记录
    const studyRecords = wx.getStorageSync('studyRecords') || [];
    studyRecords.unshift(record);
    
    // 只保留最近20条记录
    if (studyRecords.length > 20) {
      studyRecords.splice(20);
    }

    wx.setStorageSync('studyRecords', studyRecords);
  },

  onShow() {
    // 保存学习记录
    this.saveStudyRecord();
  },

  // 显示Toast消息
  showToast(message: string, theme: string = 'success') {
    Toast({
      context: this,
      selector: '#t-toast',
      message: message,
      theme: theme,
      direction: 'column',
    });
  }
}); 