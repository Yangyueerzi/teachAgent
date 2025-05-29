/**
 * 云环境诊断脚本
 * 帮助分析环境ID冲突和云存储配置问题
 */

// 诊断云环境配置
function diagnoseCloudEnv() {
  console.log('=== 云环境诊断开始 ===');
  console.log('用户确认的环境ID: cloud1-0g9l5ytxf45e113f');
  console.log('错误信息中的环境ID: ec0f7a5d-941f-4c7e-90c3-a2a76f4567f7');
  console.log('');

  // 检查当前云开发初始化状态
  if (!wx.cloud) {
    console.error('❌ wx.cloud 不可用，请检查基础库版本');
    return;
  }

  console.log('✅ wx.cloud 可用');
  
  // 测试当前配置的环境
  console.log('正在测试当前环境配置...');
  
  wx.cloud.callFunction({
    name: 'test-env-check',
    success: () => {
      console.log('✅ 当前环境配置正常');
    },
    fail: (err) => {
      console.log('当前环境测试结果:', err);
      
      if (err.errMsg.includes('env check invalid')) {
        console.log('❌ 环境ID配置有问题');
        console.log('可能的原因：');
        console.log('1. 环境ID不存在或已被删除');
        console.log('2. 环境ID输入错误');
        console.log('3. 小程序AppID与环境不匹配');
        console.log('4. 环境权限问题');
      } else if (err.errMsg.includes('function not found')) {
        console.log('✅ 环境ID配置正确（函数不存在是正常的）');
      }
    }
  });
}

// 测试云存储权限
function testStoragePermissions() {
  console.log('=== 测试云存储权限 ===');
  
  const testPath = `test/permission-test-${Date.now()}.txt`;
  const testContent = 'Permission test content';
  
  wx.cloud.uploadFile({
    cloudPath: testPath,
    filePath: 'data:text/plain;charset=utf-8,' + encodeURIComponent(testContent),
    success: (res) => {
      console.log('✅ 云存储上传成功');
      console.log('文件ID:', res.fileID);
      
      // 清理测试文件
      wx.cloud.deleteFile({
        fileList: [res.fileID],
        success: () => console.log('✅ 测试文件已清理'),
        fail: (err) => console.warn('⚠️ 测试文件清理失败:', err)
      });
    },
    fail: (err) => {
      console.error('❌ 云存储上传失败:', err);
      analyzeStorageError(err);
    }
  });
}

// 分析存储错误
function analyzeStorageError(err) {
  console.log('=== 存储错误分析 ===');
  
  if (err.errMsg.includes('env check invalid')) {
    console.log('🔍 问题：环境ID验证失败');
    console.log('📋 检查清单：');
    console.log('1. 确认云开发控制台中的环境ID');
    console.log('2. 检查 app.ts 中配置的环境ID');
    console.log('3. 确认小程序AppID正确');
    console.log('4. 检查是否有多个云环境');
  } else if (err.errMsg.includes('storage not enabled')) {
    console.log('🔍 问题：云存储服务未开通');
    console.log('📋 解决方案：');
    console.log('1. 在云开发控制台开通存储服务');
    console.log('2. 选择合适的存储套餐');
  } else if (err.errMsg.includes('permission denied')) {
    console.log('🔍 问题：存储权限不足');
    console.log('📋 解决方案：');
    console.log('1. 在存储设置中配置读写权限');
    console.log('2. 检查安全规则配置');
  } else {
    console.log('🔍 其他错误:', err.errMsg);
  }
}

// 检查云开发控制台配置
function checkConsoleConfig() {
  console.log('=== 云开发控制台检查指南 ===');
  console.log('请在云开发控制台中检查以下项目：');
  console.log('');
  console.log('1. 环境列表：');
  console.log('   - 查看有多少个环境');
  console.log('   - 确认每个环境的ID');
  console.log('   - 检查环境状态（正常/异常）');
  console.log('');
  console.log('2. 存储服务：');
  console.log('   - 确认存储服务已开通');
  console.log('   - 检查存储权限配置');
  console.log('   - 查看存储使用情况');
  console.log('');
  console.log('3. 云函数：');
  console.log('   - 确认 extractWords 函数已部署');
  console.log('   - 检查函数配置和环境变量');
  console.log('   - 查看函数调用日志');
}

// 环境ID冲突解决方案
function resolveEnvConflict() {
  console.log('=== 环境ID冲突解决方案 ===');
  console.log('');
  console.log('方案1: 使用默认环境');
  console.log('在 app.ts 中修改为：');
  console.log('wx.cloud.init({');
  console.log('  // 不指定 env，使用默认环境');
  console.log('  traceUser: true,');
  console.log('})');
  console.log('');
  console.log('方案2: 重新确认环境ID');
  console.log('1. 在云开发控制台左上角查看环境ID');
  console.log('2. 复制完整的环境ID');
  console.log('3. 确保没有多余的空格或字符');
  console.log('');
  console.log('方案3: 创建新环境');
  console.log('1. 在云开发控制台创建新环境');
  console.log('2. 使用新环境的ID');
  console.log('3. 重新部署云函数到新环境');
}

// 运行完整诊断
function runFullDiagnosis() {
  console.log('开始云环境完整诊断...\n');
  
  setTimeout(() => diagnoseCloudEnv(), 100);
  setTimeout(() => testStoragePermissions(), 1000);
  setTimeout(() => checkConsoleConfig(), 2000);
  setTimeout(() => resolveEnvConflict(), 3000);
  
  console.log('诊断启动完成，请查看详细结果...\n');
}

// 快速修复建议
function quickFix() {
  console.log('=== 快速修复建议 ===');
  console.log('');
  console.log('立即尝试的解决方案：');
  console.log('');
  console.log('1. 使用默认环境（推荐）：');
  console.log('   在 app.ts 中注释掉 env 参数');
  console.log('   // env: "cloud1-0g9l5ytxf45e113f",');
  console.log('');
  console.log('2. 检查云开发控制台：');
  console.log('   - 确认环境状态正常');
  console.log('   - 确认存储服务已开通');
  console.log('   - 确认云函数已部署');
  console.log('');
  console.log('3. 重新编译小程序：');
  console.log('   - 保存所有文件');
  console.log('   - 重新编译项目');
  console.log('   - 测试上传功能');
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    diagnoseCloudEnv,
    testStoragePermissions,
    analyzeStorageError,
    checkConsoleConfig,
    resolveEnvConflict,
    runFullDiagnosis,
    quickFix
  };
}

// 使用说明
console.log('云环境诊断脚本已加载');
console.log('运行命令：');
console.log('- runFullDiagnosis()  // 运行完整诊断');
console.log('- quickFix()          // 查看快速修复建议');
console.log('- checkConsoleConfig() // 查看控制台检查指南'); 