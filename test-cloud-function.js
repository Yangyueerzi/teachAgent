// 测试云函数部署状态的脚本
// 在微信开发者工具的控制台中运行此代码

// 测试云函数是否可用
wx.cloud.callFunction({
  name: 'teachAgentApi',
  data: {
    action: 'test'
  },
  success: (res) => {
    console.log('✅ 云函数调用成功:', res);
    if (res.result.success === false && res.result.code === 'UNKNOWN_ACTION') {
      console.log('✅ 云函数部署成功！(收到预期的UNKNOWN_ACTION错误)');
    }
  },
  fail: (err) => {
    console.error('❌ 云函数调用失败:', err);
    if (err.errCode === -501000) {
      console.error('❌ 云函数未找到，请检查是否已部署 teachAgentApi 云函数');
    }
  }
});

// 测试微信登录功能
async function testWechatLogin() {
  try {
    const loginRes = await new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      });
    });
    
    console.log('获取到登录code:', loginRes.code);
    
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
    
    console.log('✅ 微信登录测试成功:', result);
  } catch (error) {
    console.error('❌ 微信登录测试失败:', error);
  }
}

console.log('请在部署云函数后运行以下命令测试：');
console.log('testWechatLogin()'); 