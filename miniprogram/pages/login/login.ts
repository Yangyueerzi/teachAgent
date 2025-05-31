import Toast from 'tdesign-miniprogram/toast/index';
import { API } from '../../utils/api';

Page({
  data: {
    showPhoneInput: false,
    phoneNumber: '',
    verifyCode: '',
    codeCountdown: 0,
    canSendCode: false,
    canLogin: false,
    isLogging: false
  },

  onLoad() {
    console.log('登录页面加载完成');
  },

  // 微信登录
  async wechatLogin() {
    if (this.data.isLogging) {
      return;
    }

    this.setData({
      isLogging: true
    });

    try {
      // 先获取用户信息授权
      const userInfoResult = await API.getUserProfile();
      if (!userInfoResult.success) {
        this.showToast('需要授权用户信息才能登录', 'warning');
        this.setData({ isLogging: false });
        return;
      }

      const userProfile = userInfoResult.data;

      // 进行微信登录
      const loginResult = await API.wechatLogin();
      
      if (loginResult.success) {
        // 合并用户信息
        const userInfo = {
          ...loginResult.data.userInfo,
          nickName: userProfile.nickName,
          avatarUrl: userProfile.avatarUrl,
          gender: userProfile.gender,
          grade: loginResult.data.userInfo.grade || '小学三年级',
          openid: loginResult.data.openid,
          sessionInfo: loginResult.data.sessionInfo,
          loginTime: new Date().toISOString()
        };

        // 保存用户信息到本地存储
        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('sessionInfo', loginResult.data.sessionInfo);

        // 更新云端用户信息
        await API.updateUserInfo(loginResult.data.openid, {
          nickName: userProfile.nickName,
          avatarUrl: userProfile.avatarUrl,
          gender: userProfile.gender
        });

        this.showToast('登录成功！', 'success');

        // 延迟跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/home/home'
          });
        }, 1500);

      } else {
        this.showToast(loginResult.message || '登录失败，请重试', 'error');
      }

    } catch (error: any) {
      console.error('微信登录出错:', error);
      this.showToast('登录失败，请检查网络连接', 'error');
    }

    this.setData({
      isLogging: false
    });
  },

  // 显示手机号登录
  showPhoneLogin() {
    this.setData({
      showPhoneInput: true
    });
  },

  // 手机号输入变化
  onPhoneChange(e: any) {
    const phoneNumber = e.detail.value;
    this.setData({
      phoneNumber: phoneNumber,
      canSendCode: this.isValidPhone(phoneNumber)
    });
    this.updateCanLogin();
  },

  // 验证码输入变化
  onCodeChange(e: any) {
    const verifyCode = e.detail.value;
    this.setData({
      verifyCode: verifyCode
    });
    this.updateCanLogin();
  },

  // 发送验证码
  sendCode() {
    if (!this.data.canSendCode) {
      this.showToast('请输入正确的手机号', 'warning');
      return;
    }

    // 模拟发送验证码
    this.showToast('验证码已发送', 'success');
    
    // 开始倒计时
    this.startCountdown();
  },

  // 开始倒计时
  startCountdown() {
    let countdown = 60;
    this.setData({
      codeCountdown: countdown
    });

    const timer = setInterval(() => {
      countdown--;
      this.setData({
        codeCountdown: countdown
      });

      if (countdown <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  },

  // 手机号登录
  phoneLogin() {
    if (!this.data.canLogin) {
      this.showToast('请完善登录信息', 'warning');
      return;
    }

    // 模拟验证码验证
    if (this.data.verifyCode !== '123456') {
      this.showToast('验证码错误', 'error');
      return;
    }

    // 模拟登录成功
    const userInfo = {
      nickName: `用户${this.data.phoneNumber.slice(-4)}`,
      phone: this.data.phoneNumber,
      avatarUrl: '',
      grade: '小学生',
      loginTime: new Date().toISOString()
    };

    // 保存用户信息
    wx.setStorageSync('userInfo', userInfo);

    this.showToast('登录成功！', 'success');

    // 延迟跳转
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/home/home'
      });
    }, 1500);
  },

  // 验证手机号格式
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  // 更新登录按钮状态
  updateCanLogin() {
    const canLogin = this.isValidPhone(this.data.phoneNumber) && 
                     this.data.verifyCode.length === 6;
    this.setData({
      canLogin: canLogin
    });
  },

  // 查看用户协议
  viewUserAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '这里是用户协议的内容...',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  // 查看隐私政策
  viewPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '这里是隐私政策的内容...',
      showCancel: false,
      confirmText: '我知道了'
    });
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