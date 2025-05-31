import Toast from 'tdesign-miniprogram/toast/index';

// 定义接口类型
interface UploadResult {
  success: boolean;
  fileID?: string;
  error?: string;
}

interface OCRResult {
  success: boolean;
  data?: {
    words: string[];
    originalText: string;
    usage?: any;
  };
  error?: string;
}

Page({
  data: {
    imageUrl: '',
    isProcessing: false,
    recognizedWords: [] as string[],
    uploadProgress: 0,
    processingStep: '', // 当前处理步骤
    isEditMode: false, // 是否处于编辑模式
    newWord: '' // 新添加的单词
  },

  onLoad() {
    console.log('拍照上传页面加载完成');
  },

  // 从相册选择
  chooseFromAlbum() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          imageUrl: tempFilePath
        });
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        this.showToast('选择图片失败', 'error');
      }
    });
  },

  // 拍照
  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          imageUrl: tempFilePath
        });
      },
      fail: (err) => {
        console.error('拍照失败:', err);
        this.showToast('拍照失败', 'error');
      }
    });
  },

  // 重新拍照
  retakePhoto() {
    this.setData({
      imageUrl: '',
      recognizedWords: [],
      uploadProgress: 0,
      processingStep: ''
    });
  },

  // 确认上传
  async confirmUpload() {
    if (!this.data.imageUrl) {
      this.showToast('请先选择图片', 'warning');
      return;
    }

    this.setData({
      isProcessing: true,
      uploadProgress: 0,
      processingStep: '准备上传图片...'
    });

    try {
      // 第一步：上传图片到云存储
      this.setData({
        uploadProgress: 20,
        processingStep: '正在上传图片...'
      });

      const cloudPath = `words/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const uploadResult = await this.uploadToCloud(this.data.imageUrl, cloudPath);
      
      if (!uploadResult.success || !uploadResult.fileID) {
        throw new Error(uploadResult.error || '图片上传失败');
      }

      // 第二步：调用云函数进行OCR识别
      this.setData({
        uploadProgress: 50,
        processingStep: '正在识别单词...'
      });

      const ocrResult = await this.callOCRFunction(uploadResult.fileID);
      
      if (!ocrResult.success) {
        throw new Error(ocrResult.error || 'OCR识别失败');
      }

      // 第三步：处理识别结果
      this.setData({
        uploadProgress: 80,
        processingStep: '正在处理结果...'
      });

      const words = ocrResult.data?.words || [];
      
      if (words.length === 0) {
        throw new Error('未识别到任何英文单词，请确保图片中包含清晰的英文单词');
      }

      // 完成
      this.setData({
        uploadProgress: 100,
        processingStep: '识别完成！',
        recognizedWords: words,
        isProcessing: false
      });

      this.showToast(`成功识别到 ${words.length} 个单词！`, 'success');

      // 清理云存储中的临时文件（可选）
      this.cleanupTempFile(uploadResult.fileID);

    } catch (error) {
      console.error('OCR处理失败:', error);
      this.setData({
        isProcessing: false,
        uploadProgress: 0,
        processingStep: ''
      });
      
      const errorMessage = error instanceof Error ? error.message : '处理失败，请重试';
      this.showToast(errorMessage, 'error');
      
      // 如果是网络错误，提供重试建议
      if (errorMessage.includes('网络') || errorMessage.includes('超时')) {
        setTimeout(() => {
          this.showToast('请检查网络连接后重试', 'warning');
        }, 2000);
      }
    }
  },

  // 上传图片到云存储
  uploadToCloud(filePath: string, cloudPath: string): Promise<UploadResult> {
    return new Promise((resolve) => {
      wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: filePath,
        success: (res) => {
          resolve({
            success: true,
            fileID: res.fileID
          });
        },
        fail: (err) => {
          console.error('云存储上传失败:', err);
          resolve({
            success: false,
            error: '图片上传失败，请检查网络连接'
          });
        }
      });
    });
  },

  // 调用OCR云函数
  callOCRFunction(imageUrl: string): Promise<OCRResult> {
    return new Promise((resolve) => {
      wx.cloud.callFunction({
        name: 'extractWords',
        data: {
          imageUrl: imageUrl,
          imageType: 'fileID'
        },
        success: (res) => {
          console.log('云函数调用成功:', res);
          // 确保返回正确的类型
          const result = res.result as OCRResult;
          resolve(result);
        },
        fail: (err) => {
          console.error('云函数调用失败:', err);
          let errorMessage = '识别服务暂时不可用';
          
          if (err.errMsg) {
            if (err.errMsg.includes('timeout')) {
              errorMessage = '识别超时，请稍后重试';
            } else if (err.errMsg.includes('network')) {
              errorMessage = '网络连接失败，请检查网络';
            } else if (err.errMsg.includes('cloud Api is not enabled')) {
              errorMessage = '云开发服务未开通，请先开通云开发';
            }
          }
          
          resolve({
            success: false,
            error: errorMessage
          });
        }
      });
    });
  },

  // 清理临时文件
  cleanupTempFile(fileID: string) {
    wx.cloud.deleteFile({
      fileList: [fileID],
      success: () => {
        console.log('临时文件清理成功');
      },
      fail: (err) => {
        console.warn('临时文件清理失败:', err);
      }
    });
  },

  // 开始练习
  startPractice() {
    if (this.data.recognizedWords.length === 0) {
      this.showToast('没有识别到单词', 'warning');
      return;
    }

    // 将单词列表存储到全局数据
    wx.setStorageSync('practiceWords', this.data.recognizedWords);
    
    // 跳转到练习页面
    wx.navigateTo({
      url: '/pages/practice/practice'
    });
  },

  // 选择上传方式
  chooseUploadMethod() {
    wx.showModal({
      title: '选择上传方式',
      content: '请选择获取图片的方式',
      confirmText: '拍照',
      cancelText: '相册',
      success: (result) => {
        if (result.confirm) {
          this.takePhoto();
        } else if (result.cancel) {
          this.chooseFromAlbum();
        }
      }
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
  },

  // 切换编辑模式
  toggleEditMode() {
    this.setData({
      isEditMode: !this.data.isEditMode
    });
  },

  // 更新单词
  updateWord(e: any) {
    const index = e.currentTarget.dataset.index;
    const newValue = e.detail.value.trim();
    
    if (!newValue) {
      this.showToast('单词不能为空', 'warning');
      return;
    }
    
    const words = [...this.data.recognizedWords];
    words[index] = newValue;
    
    this.setData({
      recognizedWords: words
    });
    
    this.showToast('单词已更新', 'success');
  },

  // 删除单词
  deleteWord(e: any) {
    const index = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除单词"${this.data.recognizedWords[index]}"吗？`,
      success: (result) => {
        if (result.confirm) {
          const words = [...this.data.recognizedWords];
          words.splice(index, 1);
          
          this.setData({
            recognizedWords: words
          });
          
          this.showToast('单词已删除', 'success');
        }
      }
    });
  },

  // 新单词输入
  onNewWordInput(e: any) {
    this.setData({
      newWord: e.detail.value
    });
  },

  // 添加新单词
  addNewWord() {
    const newWord = this.data.newWord.trim();
    
    if (!newWord) {
      this.showToast('请输入单词', 'warning');
      return;
    }
    
    // 检查是否已存在
    if (this.data.recognizedWords.includes(newWord)) {
      this.showToast('单词已存在', 'warning');
      return;
    }
    
    const words = [...this.data.recognizedWords, newWord];
    
    this.setData({
      recognizedWords: words,
      newWord: ''
    });
    
    this.showToast('单词已添加', 'success');
  },
}); 