Page({
  data: {
    
  },

  onLoad() {
    console.log('首页加载完成');
  },

  onShow() {
    // 页面显示时的逻辑
  },

  // 开始听写
  startDictation() {
    // 检查用户登录状态
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      // 未登录，跳转到登录页
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }

    // 已登录，跳转到拍照上传页面
    wx.navigateTo({
      url: '/pages/upload/upload'
    });
  },

  // 显示Toast消息
  showToast(message: string, theme: string = 'success') {
    const toast = this.selectComponent('#t-toast');
    if (toast) {
      toast.showToast({
        title: message,
        theme: theme,
        direction: 'column',
      });
    }
  }
}); 