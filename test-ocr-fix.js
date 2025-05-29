/**
 * OCR修复验证测试脚本
 * 在微信开发者工具控制台中运行此代码来测试OCR修复
 */

// 测试云函数修复
function testOCRFix() {
  console.log('=== 测试OCR修复 ===');
  
  // 模拟上传一个测试图片到云存储
  const testImagePath = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const testCloudPath = `test/ocr-test-${Date.now()}.png`;
  
  console.log('1. 上传测试图片到云存储...');
  
  wx.cloud.uploadFile({
    cloudPath: testCloudPath,
    filePath: testImagePath,
    success: (uploadRes) => {
      console.log('✅ 图片上传成功:', uploadRes.fileID);
      
      console.log('2. 调用修复后的OCR云函数...');
      
      // 测试修复后的云函数
      wx.cloud.callFunction({
        name: 'extractWords',
        data: {
          imageUrl: uploadRes.fileID,
          imageType: 'fileID' // 使用修复后的参数
        },
        success: (ocrRes) => {
          console.log('✅ OCR云函数调用成功:', ocrRes);
          
          if (ocrRes.result.success) {
            console.log('✅ OCR识别成功!');
            console.log('识别结果:', ocrRes.result.data);
          } else {
            console.log('⚠️ OCR识别失败:', ocrRes.result.error);
            
            // 分析错误原因
            if (ocrRes.result.error.includes('URL does not appear to be valid')) {
              console.log('❌ 仍然存在URL格式问题，需要进一步检查');
            } else if (ocrRes.result.error.includes('DASHSCOPE_API_KEY')) {
              console.log('⚠️ 需要配置阿里千问API密钥');
            } else {
              console.log('🔍 其他错误，需要进一步分析');
            }
          }
          
          // 清理测试文件
          wx.cloud.deleteFile({
            fileList: [uploadRes.fileID],
            success: () => console.log('✅ 测试文件已清理'),
            fail: (err) => console.warn('⚠️ 测试文件清理失败:', err)
          });
        },
        fail: (ocrErr) => {
          console.error('❌ OCR云函数调用失败:', ocrErr);
          
          // 清理测试文件
          wx.cloud.deleteFile({
            fileList: [uploadRes.fileID]
          });
        }
      });
    },
    fail: (uploadErr) => {
      console.error('❌ 图片上传失败:', uploadErr);
    }
  });
}

// 测试临时下载链接
function testTempFileURL() {
  console.log('=== 测试临时下载链接功能 ===');
  
  // 先上传一个测试文件
  const testImagePath = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const testCloudPath = `test/temp-url-test-${Date.now()}.png`;
  
  wx.cloud.uploadFile({
    cloudPath: testCloudPath,
    filePath: testImagePath,
    success: (uploadRes) => {
      console.log('✅ 测试文件上传成功:', uploadRes.fileID);
      
      // 测试获取临时下载链接
      wx.cloud.getTempFileURL({
        fileList: [uploadRes.fileID],
        success: (tempRes) => {
          console.log('✅ 获取临时下载链接成功:', tempRes);
          
          if (tempRes.fileList && tempRes.fileList.length > 0) {
            const fileInfo = tempRes.fileList[0];
            if (fileInfo.status === 0) {
              console.log('✅ 临时链接有效:', fileInfo.tempFileURL);
              console.log('链接格式正确，可以用于阿里千问API');
            } else {
              console.error('❌ 临时链接获取失败:', fileInfo.errmsg);
            }
          }
          
          // 清理测试文件
          wx.cloud.deleteFile({
            fileList: [uploadRes.fileID],
            success: () => console.log('✅ 测试文件已清理'),
            fail: (err) => console.warn('⚠️ 测试文件清理失败:', err)
          });
        },
        fail: (tempErr) => {
          console.error('❌ 获取临时下载链接失败:', tempErr);
          
          // 清理测试文件
          wx.cloud.deleteFile({
            fileList: [uploadRes.fileID]
          });
        }
      });
    },
    fail: (uploadErr) => {
      console.error('❌ 测试文件上传失败:', uploadErr);
    }
  });
}

// 检查云函数部署状态
function checkCloudFunctionStatus() {
  console.log('=== 检查云函数部署状态 ===');
  
  wx.cloud.callFunction({
    name: 'extractWords',
    data: {
      imageUrl: 'test',
      imageType: 'test'
    },
    success: (res) => {
      console.log('✅ 云函数可访问:', res);
      
      if (res.result && res.result.error) {
        if (res.result.error.includes('缺少图片参数')) {
          console.log('✅ 云函数逻辑正常（参数验证工作）');
        } else if (res.result.error.includes('DASHSCOPE_API_KEY')) {
          console.log('⚠️ 需要配置API密钥');
        } else {
          console.log('🔍 云函数返回其他错误:', res.result.error);
        }
      }
    },
    fail: (err) => {
      console.error('❌ 云函数不可访问:', err);
      
      if (err.errMsg.includes('function not found')) {
        console.log('❌ 云函数未部署或名称错误');
        console.log('请检查：');
        console.log('1. 云函数是否已正确部署');
        console.log('2. 函数名称是否为 extractWords');
      }
    }
  });
}

// 运行完整测试
function runOCRTests() {
  console.log('开始OCR修复验证测试...\n');
  
  setTimeout(() => checkCloudFunctionStatus(), 100);
  setTimeout(() => testTempFileURL(), 1500);
  setTimeout(() => testOCRFix(), 3000);
  
  console.log('测试启动完成，请查看详细结果...\n');
}

// 部署指南
function deploymentGuide() {
  console.log('=== 云函数部署指南 ===');
  console.log('');
  console.log('1. 在微信开发者工具中：');
  console.log('   - 右键点击 cloudfunctions/extractWords 文件夹');
  console.log('   - 选择"上传并部署：云端安装依赖"');
  console.log('   - 等待部署完成');
  console.log('');
  console.log('2. 配置环境变量：');
  console.log('   - 右键点击 cloudfunctions/extractWords 文件夹');
  console.log('   - 选择"配置"');
  console.log('   - 添加环境变量：DASHSCOPE_API_KEY');
  console.log('');
  console.log('3. 测试部署：');
  console.log('   - 运行 runOCRTests() 验证修复');
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testOCRFix,
    testTempFileURL,
    checkCloudFunctionStatus,
    runOCRTests,
    deploymentGuide
  };
}

// 使用说明
console.log('OCR修复测试脚本已加载');
console.log('运行命令：');
console.log('- runOCRTests()        // 运行完整测试');
console.log('- deploymentGuide()    // 查看部署指南');
console.log('- checkCloudFunctionStatus() // 检查云函数状态'); 