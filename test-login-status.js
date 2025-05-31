// 测试登录状态和用户信息的脚本
// 在微信开发者工具控制台中运行

// 检查本地存储的用户信息
function checkLocalUserInfo() {
  console.log('=== 检查本地用户信息 ===');
  
  const userInfo = wx.getStorageSync('userInfo');
  const sessionInfo = wx.getStorageSync('sessionInfo');
  
  if (userInfo) {
    console.log('✅ 用户信息已保存:');
    console.log('- 昵称:', userInfo.nickName);
    console.log('- 头像:', userInfo.avatarUrl);
    console.log('- 年级:', userInfo.grade);
    console.log('- OpenID:', userInfo.openid);
    console.log('- 登录时间:', userInfo.loginTime);
    console.log('- 完整信息:', userInfo);
  } else {
    console.log('❌ 未找到用户信息');
  }
  
  if (sessionInfo) {
    console.log('✅ 会话信息已保存:');
    console.log('- OpenID:', sessionInfo.openid);
    console.log('- 过期时间:', new Date(sessionInfo.expireTime));
    console.log('- 完整信息:', sessionInfo);
  } else {
    console.log('❌ 未找到会话信息');
  }
  
  console.log('========================');
}

// 测试云端用户信息获取
async function testGetUserInfo() {
  try {
    console.log('=== 测试云端用户信息获取 ===');
    
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.openid) {
      console.log('❌ 请先登录');
      return;
    }
    
    const result = await new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'teachAgentApi',
        data: {
          action: 'getUserInfo',
          openid: userInfo.openid
        },
        success: resolve,
        fail: reject
      });
    });
    
    if (result.result.success) {
      console.log('✅ 云端用户信息获取成功:');
      console.log(result.result.data);
    } else {
      console.log('❌ 获取失败:', result.result.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 测试更新用户信息
async function testUpdateUserInfo() {
  try {
    console.log('=== 测试更新用户信息 ===');
    
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.openid) {
      console.log('❌ 请先登录');
      return;
    }
    
    const result = await new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'teachAgentApi',
        data: {
          action: 'updateUserInfo',
          openid: userInfo.openid,
          grade: '四年级', // 更新年级
          nickName: userInfo.nickName + '_测试'
        },
        success: resolve,
        fail: reject
      });
    });
    
    if (result.result.success) {
      console.log('✅ 用户信息更新成功:');
      console.log(result.result.data);
    } else {
      console.log('❌ 更新失败:', result.result.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 综合测试
async function runAllTests() {
  console.log('🔍 开始综合测试...');
  checkLocalUserInfo();
  await testGetUserInfo();
  await testUpdateUserInfo();
  console.log('🎉 测试完成！');
}

console.log('=== 登录状态测试工具 ===');
console.log('可用命令:');
console.log('- checkLocalUserInfo() : 检查本地用户信息');
console.log('- testGetUserInfo()    : 测试获取云端用户信息');
console.log('- testUpdateUserInfo() : 测试更新用户信息');
console.log('- runAllTests()        : 运行所有测试');
console.log('========================'); 