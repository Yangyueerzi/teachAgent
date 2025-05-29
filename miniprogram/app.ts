// app.ts
App<IAppOption>({
  globalData: {
    userInfo: null,
    systemInfo: null
  },

  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'cloud1-0g9l5ytxf45e113f', // 用户确认的正确云环境ID
        traceUser: true,
      })
      console.log('云开发初始化成功')
    } else {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    }

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 获取系统信息
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res;
        console.log('系统信息:', res);
      }
    });

    // 检查登录状态
    this.checkLoginStatus();

    // 登录
    wx.login({
      success: res => {
        console.log('登录成功:', res.code);
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      console.log('用户已登录:', userInfo);
    } else {
      console.log('用户未登录');
    }
  },

  // 设置用户信息
  setUserInfo(userInfo: any) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  },

  // 清除用户信息
  clearUserInfo() {
    this.globalData.userInfo = null;
    wx.removeStorageSync('userInfo');
  }
})