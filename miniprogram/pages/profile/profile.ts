import Toast from 'tdesign-miniprogram/toast/index';
import Dialog from 'tdesign-miniprogram/dialog/index';

interface StudyRecord {
  date: string;
  totalWords: number;
  correctCount: number;
  accuracy: number;
  wrongWords: string[];
}

interface WrongWord {
  word: string;
  errorCount: number;
  status: 'mastered' | 'review';
}

Page({
  data: {
    userInfo: null as any,
    studyStats: {
      totalPractices: 0,
      averageAccuracy: 0,
      masteredWords: 0
    },
    studyRecords: [] as any[],
    wrongWordsList: [] as WrongWord[]
  },

  onLoad() {
    console.log('个人中心页面加载完成');
  },

  onShow() {
    this.loadUserInfo();
    this.loadStudyData();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({
      userInfo: userInfo
    });
  },

  // 加载学习数据
  loadStudyData() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) return;

    // 加载学习记录
    const studyRecords = wx.getStorageSync('studyRecords') || [];
    const formattedRecords = studyRecords.slice(0, 5).map((record: StudyRecord, index: number) => {
      const date = new Date(record.date);
      return {
        title: `第${index + 1}次练习`,
        description: `${date.getMonth() + 1}月${date.getDate()}日 ${record.totalWords}个单词`,
        accuracy: record.accuracy
      };
    });

    // 计算统计数据
    const stats = this.calculateStats(studyRecords);

    // 加载错误单词本
    const wrongWordsList = this.loadWrongWords(studyRecords);

    this.setData({
      studyRecords: formattedRecords,
      studyStats: stats,
      wrongWordsList: wrongWordsList
    });
  },

  // 计算统计数据
  calculateStats(records: StudyRecord[]) {
    if (records.length === 0) {
      return {
        totalPractices: 0,
        averageAccuracy: 0,
        masteredWords: 0
      };
    }

    const totalAccuracy = records.reduce((sum, record) => sum + record.accuracy, 0);
    const averageAccuracy = Math.round(totalAccuracy / records.length);
    
    // 计算掌握的单词数（假设正确率80%以上的单词为掌握）
    const masteredWords = records.reduce((sum, record) => {
      return sum + Math.round(record.totalWords * (record.accuracy / 100));
    }, 0);

    return {
      totalPractices: records.length,
      averageAccuracy: averageAccuracy,
      masteredWords: masteredWords
    };
  },

  // 加载错误单词本
  loadWrongWords(records: StudyRecord[]): WrongWord[] {
    const wordErrorMap = new Map<string, number>();
    
    // 统计每个单词的错误次数
    records.forEach(record => {
      record.wrongWords.forEach(word => {
        wordErrorMap.set(word, (wordErrorMap.get(word) || 0) + 1);
      });
    });

    // 转换为数组并排序
    const wrongWords: WrongWord[] = Array.from(wordErrorMap.entries()).map(([word, errorCount]) => ({
      word,
      errorCount,
      status: errorCount <= 2 ? 'mastered' : 'review'
    })).sort((a, b) => b.errorCount - a.errorCount);

    return wrongWords.slice(0, 10); // 只显示前10个
  },

  // 跳转到登录页
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 查看学习记录详情
  viewRecord(e: any) {
    const index = e.currentTarget.dataset.index;
    console.log('查看学习记录:', index);
    this.showToast('功能开发中', 'warning');
  },

  // 练习错误单词
  practiceWrongWord(e: any) {
    const word = e.currentTarget.dataset.word;
    
    // 创建只包含这个单词的练习
    wx.setStorageSync('practiceWords', [word]);
    
    // 跳转到练习页面
    wx.navigateTo({
      url: '/pages/practice/practice'
    });
  },

  // 查看学习统计
  viewStatistics() {
    this.showToast('学习统计功能开发中', 'warning');
  },

  // 打开设置
  openSettings() {
    this.showToast('设置功能开发中', 'warning');
  },

  // 打开帮助
  openHelp() {
    this.showToast('帮助功能开发中', 'warning');
  },

  // 退出登录
  logout() {
    Dialog({
      context: this,
      selector: '#t-dialog',
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmBtn: '确定',
      cancelBtn: '取消',
      success: (result) => {
        if (result.confirm) {
          // 清除用户信息
          wx.removeStorageSync('userInfo');
          
          // 重新加载页面数据
          this.loadUserInfo();
          this.loadStudyData();
          
          this.showToast('已退出登录', 'success');
        }
      }
    });
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