// 简化的微信登录测试
// 在微信开发者工具控制台中运行

async function testSimpleLogin() {
  try {
    console.log('开始测试微信登录...');
    
    // 1. 获取登录code
    const loginRes = await new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      });
    });
    
    console.log('✅ 获取登录code成功:', loginRes.code);
    
    // 2. 调用云函数登录
    const result = await new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'teachAgentApi',
        data: {
          action: 'wechatLogin',
          code: loginRes.code
        },
        success: resolve,
        fail: reject
      });
    });
    
    console.log('✅ 云函数调用成功:', result);
    
    if (result.result.success) {
      console.log('🎉 微信登录测试成功!');
      console.log('用户信息:', result.result.data.userInfo);
      console.log('openid:', result.result.data.openid);
    } else {
      console.error('❌ 登录失败:', result.result.message);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
    
    // 详细错误信息
    if (error.errCode) {
      console.error('错误码:', error.errCode);
      console.error('错误信息:', error.errMsg);
    }
  }
}

// 测试云函数是否部署成功
async function testCloudFunction() {
  try {
    const result = await new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'teachAgentApi',
        data: {
          action: 'test'
        },
        success: resolve,
        fail: reject
      });
    });
    
    console.log('✅ 云函数可以访问');
    if (result.result.code === 'UNKNOWN_ACTION') {
      console.log('✅ 云函数路由工作正常');
    }
  } catch (error) {
    console.error('❌ 云函数访问失败:', error);
  }
}

console.log('=== 微信登录测试脚本 ===');
console.log('1. 先运行: testCloudFunction()');
console.log('2. 再运行: testSimpleLogin()');
console.log('======================='); 