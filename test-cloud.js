/**
 * 云开发配置测试脚本
 * 在微信开发者工具的控制台中运行此代码来测试云开发配置
 */

// 测试云开发初始化
function testCloudInit() {
  console.log('=== 测试云开发初始化 ===');
  
  if (!wx.cloud) {
    console.error('❌ wx.cloud 不存在，请检查基础库版本');
    return false;
  }
  
  try {
    // 测试云开发是否已初始化
    wx.cloud.callFunction({
      name: 'test', // 这个函数不存在，但可以测试云开发是否初始化
      success: () => {
        console.log('✅ 云开发已正确初始化');
      },
      fail: (err) => {
        if (err.errMsg.includes('cloud Api is not enabled')) {
          console.error('❌ 云开发服务未开通或环境ID配置错误');
          console.log('请检查：');
          console.log('1. 是否已在微信开发者工具中开通云开发');
          console.log('2. app.ts 中的环境ID是否正确');
        } else if (err.errMsg.includes('function not found')) {
          console.log('✅ 云开发已正确初始化（函数不存在是正常的）');
        } else {
          console.error('❌ 云开发初始化失败:', err);
        }
      }
    });
  } catch (error) {
    console.error('❌ 云开发测试失败:', error);
    return false;
  }
  
  return true;
}

// 测试云函数
function testCloudFunction() {
  console.log('=== 测试云函数 ===');
  
  wx.cloud.callFunction({
    name: 'extractWords',
    data: {
      imageUrl: 'test',
      imageType: 'url'
    },
    success: (res) => {
      console.log('✅ 云函数调用成功:', res);
      if (res.result && res.result.error && res.result.error.includes('DASHSCOPE_API_KEY')) {
        console.log('⚠️ 需要配置阿里千问API密钥');
      }
    },
    fail: (err) => {
      console.error('❌ 云函数调用失败:', err);
      if (err.errMsg.includes('function not found')) {
        console.log('请检查：');
        console.log('1. 云函数是否已正确部署');
        console.log('2. 函数名称是否为 extractWords');
      }
    }
  });
}

// 测试云存储
function testCloudStorage() {
  console.log('=== 测试云存储 ===');
  
  // 创建一个测试文件
  const testData = 'test data';
  const testPath = `test/${Date.now()}.txt`;
  
  wx.cloud.uploadFile({
    cloudPath: testPath,
    filePath: 'data:text/plain;base64,' + btoa(testData),
    success: (res) => {
      console.log('✅ 云存储上传成功:', res.fileID);
      
      // 删除测试文件
      wx.cloud.deleteFile({
        fileList: [res.fileID],
        success: () => {
          console.log('✅ 测试文件已清理');
        }
      });
    },
    fail: (err) => {
      console.error('❌ 云存储测试失败:', err);
    }
  });
}

// 运行所有测试
function runAllTests() {
  console.log('开始测试云开发配置...\n');
  
  setTimeout(() => testCloudInit(), 100);
  setTimeout(() => testCloudFunction(), 1000);
  setTimeout(() => testCloudStorage(), 2000);
  
  console.log('\n测试完成，请查看上方结果');
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testCloudInit,
    testCloudFunction,
    testCloudStorage,
    runAllTests
  };
}

// 在控制台中运行：runAllTests()
console.log('请在控制台中运行：runAllTests()'); 