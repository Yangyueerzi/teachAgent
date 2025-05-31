import Toast from 'tdesign-miniprogram/toast/index';

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
    wrongWordsList: [] as WrongWord[],
    showEditModal: false,
    editUserInfo: {
      nickName: '',
      avatarUrl: '',
      grade: ''
    },
    gradeOptions: [
      { label: '小学一年级', value: '小学一年级' },
      { label: '小学二年级', value: '小学二年级' },
      { label: '小学三年级', value: '小学三年级' },
      { label: '小学四年级', value: '小学四年级' },
      { label: '小学五年级', value: '小学五年级' },
      { label: '小学六年级', value: '小学六年级' },
      { label: '初中一年级', value: '初中一年级' },
      { label: '初中二年级', value: '初中二年级' },
      { label: '初中三年级', value: '初中三年级' },
      { label: '高中一年级', value: '高中一年级' },
      { label: '高中二年级', value: '高中二年级' },
      { label: '高中三年级', value: '高中三年级' }
    ]
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
      status: (errorCount <= 2 ? 'mastered' : 'review') as 'mastered' | 'review'
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
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmText: '确定',
      cancelText: '取消',
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
  showToast(message: string, theme: 'success' | 'warning' | 'error' = 'success') {
    Toast({
      context: this,
      selector: '#t-toast',
      message: message,
      theme: theme,
      direction: 'column',
    });
  },

  // 打开编辑个人信息
  editProfile() {
    const userInfo = this.data.userInfo;
    if (!userInfo) {
      this.showToast('请先登录', 'warning');
      return;
    }
    
    this.setData({
      editUserInfo: {
        nickName: userInfo.nickName || '',
        avatarUrl: userInfo.avatarUrl || '',
        grade: userInfo.grade || '小学三年级'
      },
      showEditModal: true
    });
  },

  // 关闭编辑弹窗
  closeEditModal() {
    this.setData({
      showEditModal: false
    });
  },

  // 编辑弹窗显示状态变化
  onEditModalChange(e: any) {
    this.setData({
      showEditModal: e.detail.visible
    });
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        // 上传头像到云存储
        this.uploadAvatar(tempFilePath);
      },
      fail: (err) => {
        console.error('选择头像失败:', err);
        this.showToast('选择头像失败', 'error');
      }
    });
  },

  // 上传头像
  async uploadAvatar(filePath: string) {
    wx.showLoading({
      title: '上传中...'
    });

    try {
      const cloudPath = `avatars/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const uploadResult = await wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: filePath
      });

      if (uploadResult.fileID) {
        // 获取临时链接用于显示
        const tempUrlResult = await wx.cloud.getTempFileURL({
          fileList: [uploadResult.fileID]
        });

        if (tempUrlResult.fileList && tempUrlResult.fileList.length > 0) {
          const tempUrl = tempUrlResult.fileList[0].tempFileURL;
          
          this.setData({
            'editUserInfo.avatarUrl': tempUrl
          });

          this.showToast('头像上传成功', 'success');
        }
      }
    } catch (error) {
      console.error('头像上传失败:', error);
      this.showToast('头像上传失败', 'error');
    }

    wx.hideLoading();
  },

  // 昵称输入变化
  onNickNameChange(e: any) {
    this.setData({
      'editUserInfo.nickName': e.detail.value
    });
  },

  // 学年选择变化
  onGradeChange(e: any) {
    this.setData({
      'editUserInfo.grade': e.detail.value
    });
  },

  // 保存用户信息
  async saveUserInfo() {
    const editInfo = this.data.editUserInfo;
    
    if (!editInfo.nickName.trim()) {
      this.showToast('请输入昵称', 'warning');
      return;
    }

    wx.showLoading({
      title: '保存中...'
    });

    try {
      // 更新本地用户信息
      const userInfo = { ...this.data.userInfo };
      userInfo.nickName = editInfo.nickName.trim();
      userInfo.avatarUrl = editInfo.avatarUrl;
      userInfo.grade = editInfo.grade;

      // 保存到本地存储
      wx.setStorageSync('userInfo', userInfo);

      // 更新页面数据
      this.setData({
        userInfo: userInfo,
        showEditModal: false
      });

      this.showToast('保存成功', 'success');

      // TODO: 如果有云端API，这里可以同步到云端
      // await API.updateUserInfo(userInfo.openid, {
      //   nickName: editInfo.nickName,
      //   avatarUrl: editInfo.avatarUrl,
      //   grade: editInfo.grade
      // });

    } catch (error) {
      console.error('保存用户信息失败:', error);
      this.showToast('保存失败', 'error');
    }

    wx.hideLoading();
  },
}); 