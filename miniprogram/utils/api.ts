// API工具类 - 统一云函数版本
export class API {
  // 云函数名称
  private static readonly CLOUD_FUNCTION_NAME = 'teachAgentApi';

  // 基础请求方法
  static request(options: {
    url: string;
    method?: string;
    data?: any;
    header?: any;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      wx.request({
        url: options.url,
        method: options.method as any || 'GET',
        data: options.data,
        header: {
          'content-type': 'application/json',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  // 统一云函数调用方法
  private static callCloudFunction(action: string, data: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: this.CLOUD_FUNCTION_NAME,
        data: {
          action: action,
          ...data
        },
        success: (res) => {
          if (res.result.success) {
            resolve(res.result);
          } else {
            reject(new Error(res.result.message || '云函数调用失败'));
          }
        },
        fail: (err) => {
          console.error(`云函数调用失败 [${action}]:`, err);
          reject(err);
        }
      });
    });
  }

  // 微信登录
  static async wechatLogin(): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      // 1. 获取微信登录凭证
      const loginResult = await this.wxLogin();
      const code = loginResult.code;

      // 2. 调用统一云函数进行登录
      const cloudResult = await this.callCloudFunction('wechatLogin', {
        code: code
      });

      return cloudResult;
    } catch (error: any) {
      console.error('微信登录失败:', error);
      return {
        success: false,
        message: error.message || '登录失败'
      };
    }
  }

  // 获取微信用户信息
  static async getUserProfile(): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    return new Promise((resolve) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve({
            success: true,
            data: res.userInfo
          });
        },
        fail: (err) => {
          console.error('获取用户信息失败:', err);
          resolve({
            success: false,
            message: '获取用户信息失败'
          });
        }
      });
    });
  }

  // 获取用户信息（从云数据库）
  static async getUserInfo(openid: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      const result = await this.callCloudFunction('getUserInfo', {
        openid: openid
      });
      return result;
    } catch (error: any) {
      console.error('获取用户信息失败:', error);
      return {
        success: false,
        message: error.message || '获取用户信息失败'
      };
    }
  }

  // 更新用户信息
  static async updateUserInfo(openid: string, userInfo: {
    nickName?: string;
    avatarUrl?: string;
    gender?: number;
    grade?: string;
  }): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      const result = await this.callCloudFunction('updateUserInfo', {
        openid: openid,
        ...userInfo
      });
      return result;
    } catch (error: any) {
      console.error('更新用户信息失败:', error);
      return {
        success: false,
        message: error.message || '更新用户信息失败'
      };
    }
  }

  // 提取图片中的单词
  static async extractWords(imageUrl: string, imageType: 'url' | 'fileID' | 'base64' = 'url'): Promise<{
    success: boolean;
    data?: {
      words: string[];
      totalCount: number;
    };
    message?: string;
  }> {
    try {
      const result = await this.callCloudFunction('extractWords', {
        imageUrl: imageUrl,
        imageType: imageType
      });
      return result;
    } catch (error: any) {
      console.error('提取单词失败:', error);
      return {
        success: false,
        message: error.message || '提取单词失败'
      };
    }
  }

  // 保存学习记录
  static async saveStudyRecord(data: {
    openid: string;
    words: string[];
    studyTime?: Date;
    correctCount: number;
    totalCount: number;
  }): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      const result = await this.callCloudFunction('saveStudyRecord', data);
      return result;
    } catch (error: any) {
      console.error('保存学习记录失败:', error);
      return {
        success: false,
        message: error.message || '保存学习记录失败'
      };
    }
  }

  // 获取学习记录
  static async getStudyRecords(openid: string, limit: number = 10): Promise<{
    success: boolean;
    data?: any[];
    message?: string;
  }> {
    try {
      // 这里可以添加获取学习记录的云函数调用
      // 暂时返回空数组
      return {
        success: true,
        data: [],
        message: '获取学习记录成功'
      };
    } catch (error: any) {
      console.error('获取学习记录失败:', error);
      return {
        success: false,
        message: error.message || '获取学习记录失败'
      };
    }
  }

  // 微信登录Promise封装
  private static wxLogin(): Promise<any> {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      });
    });
  }

  // 上传文件到云存储
  static async uploadFile(filePath: string, cloudPath?: string): Promise<{
    success: boolean;
    fileID?: string;
    message?: string;
  }> {
    return new Promise((resolve) => {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substr(2);
      const defaultCloudPath = cloudPath || `images/${timestamp}_${randomStr}.jpg`;

      wx.cloud.uploadFile({
        cloudPath: defaultCloudPath,
        filePath: filePath,
        success: (res) => {
          resolve({
            success: true,
            fileID: res.fileID,
            message: '上传成功'
          });
        },
        fail: (err) => {
          console.error('文件上传失败:', err);
          resolve({
            success: false,
            message: '文件上传失败'
          });
        }
      });
    });
  }

  // 获取临时下载链接
  static async getTempFileURL(fileIDs: string[]): Promise<{
    success: boolean;
    fileList?: any[];
    message?: string;
  }> {
    return new Promise((resolve) => {
      wx.cloud.getTempFileURL({
        fileList: fileIDs,
        success: (res) => {
          resolve({
            success: true,
            fileList: res.fileList,
            message: '获取下载链接成功'
          });
        },
        fail: (err) => {
          console.error('获取下载链接失败:', err);
          resolve({
            success: false,
            message: '获取下载链接失败'
          });
        }
      });
    });
  }
} 