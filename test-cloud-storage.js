/**
 * 云存储配置测试脚本
 * 在微信开发者工具控制台中运行此代码来测试云存储配置
 */

// 测试云存储上传功能
function testCloudStorage() {
  console.log('=== 开始测试云存储 ===');
  
  // 创建一个测试文件
  const testContent = 'Hello Cloud Storage Test - ' + new Date().toISOString();
  const testFileName = `test/storage-test-${Date.now()}.txt`;
  
  // 将文本转换为临时文件路径（模拟）
  const canvas = wx.createCanvasContext('test-canvas');
  
  // 使用简单的方法测试上传
  console.log('正在测试云存储上传...');
  
  wx.cloud.uploadFile({
    cloudPath: testFileName,
    filePath: 'data:text/plain;charset=utf-8,' + encodeURIComponent(testContent),
    success: (res) => {
      console.log('✅ 云存储上传成功!');
      console.log('文件ID:', res.fileID);
      console.log('状态码:', res.statusCode);
      
      // 测试删除文件
      wx.cloud.deleteFile({
        fileList: [res.fileID],
        success: (deleteRes) => {
          console.log('✅ 测试文件清理成功');
          console.log('删除结果:', deleteRes);
        },
        fail: (deleteErr) => {
          console.warn('⚠️ 测试文件清理失败:', deleteErr);
        }
      });
    },
    fail: (err) => {
      console.error('❌ 云存储上传失败:', err);
      
      // 分析错误原因
      if (err.errMsg) {
        if (err.errMsg.includes('env check invalid')) {
          console.log('🔧 解决方案：');
          console.log('1. 检查 app.ts 中的环境ID是否正确');
          console.log('2. 当前应该使用：ec0f7a5d-941f-4c7e-90c3-a2a76f4567f7');
        } else if (err.errMsg.includes('storage not enabled')) {
          console.log('🔧 解决方案：');
          console.log('1. 在云开发控制台开通存储服务');
          console.log('2. 点击左侧菜单"存储" -> "开通存储"');
        } else if (err.errMsg.includes('permission denied')) {
          console.log('🔧 解决方案：');
          console.log('1. 检查存储权限配置');
          console.log('2. 在存储设置中配置读写权限');
        }
      }
    }
  });
}

// 测试云开发环境
function testCloudEnv() {
  console.log('=== 测试云开发环境 ===');
  
  // 测试云函数调用（用于验证环境）
  wx.cloud.callFunction({
    name: 'test-non-existent-function',
    success: () => {
      console.log('✅ 云开发环境正常');
    },
    fail: (err) => {
      if (err.errMsg.includes('function not found')) {
        console.log('✅ 云开发环境配置正确（函数不存在是正常的）');
      } else if (err.errMsg.includes('env check invalid')) {
        console.error('❌ 环境ID配置错误');
        console.log('当前错误的环境ID，请修改 app.ts 中的环境ID');
      } else {
        console.warn('⚠️ 云开发环境可能有问题:', err);
      }
    }
  });
}

// 检查云开发初始化状态
function checkCloudInit() {
  console.log('=== 检查云开发初始化 ===');
  
  if (typeof wx === 'undefined') {
    console.error('❌ wx 对象不存在，请在小程序环境中运行');
    return false;
  }
  
  if (!wx.cloud) {
    console.error('❌ wx.cloud 不存在，请检查基础库版本');
    return false;
  }
  
  console.log('✅ 云开发API可用');
  return true;
}

// 运行完整测试
function runStorageTests() {
  console.log('开始云存储配置测试...\n');
  
  if (!checkCloudInit()) {
    return;
  }
  
  // 延时执行各项测试
  setTimeout(() => testCloudEnv(), 500);
  setTimeout(() => testCloudStorage(), 1500);
  
  console.log('\n测试启动完成，请查看上方结果');
  console.log('如果测试失败，请按照提示进行配置');
}

// 快速修复环境ID的函数
function quickFixEnvId() {
  console.log('=== 环境ID快速修复指南 ===');
  console.log('1. 打开 miniprogram/app.ts 文件');
  console.log('2. 找到第16行的 env 配置');
  console.log('3. 修改为：env: "ec0f7a5d-941f-4c7e-90c3-a2a76f4567f7"');
  console.log('4. 保存文件并重新编译');
  console.log('5. 重新运行测试：runStorageTests()');
}

// 云存储开通指南
function storageSetupGuide() {
  console.log('=== 云存储开通指南 ===');
  console.log('1. 在微信开发者工具中点击"云开发"按钮');
  console.log('2. 在左侧菜单中点击"存储"');
  console.log('3. 如果显示"开通存储"，点击开通');
  console.log('4. 选择免费套餐');
  console.log('5. 在"设置"标签中配置读写权限');
  console.log('6. 重新运行测试：runStorageTests()');
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testCloudStorage,
    testCloudEnv,
    checkCloudInit,
    runStorageTests,
    quickFixEnvId,
    storageSetupGuide
  };
}

// 使用说明
console.log('云存储测试脚本已加载');
console.log('运行命令：');
console.log('- runStorageTests()     // 运行完整测试');
console.log('- quickFixEnvId()       // 查看环境ID修复指南');
console.log('- storageSetupGuide()   // 查看存储开通指南'); 