@echo off
echo ================================
echo 家长辅导助手小程序部署脚本
echo ================================
echo.

echo [1/3] 安装小程序依赖...
cd miniprogram
call npm install
if %errorlevel% neq 0 (
    echo 小程序依赖安装失败！
    pause
    exit /b 1
)
echo 小程序依赖安装完成！
echo.

echo [2/3] 安装云函数依赖...
cd ..\cloudfunctions\extractWords
call npm install
if %errorlevel% neq 0 (
    echo 云函数依赖安装失败！
    pause
    exit /b 1
)
echo 云函数依赖安装完成！
echo.

echo [3/3] 部署完成！
echo.
echo ================================
echo 接下来请按照以下步骤操作：
echo ================================
echo 1. 在微信开发者工具中打开项目
echo 2. 点击"云开发"按钮开通云开发服务
echo 3. 获取阿里千问API密钥：
echo    https://bailian.console.aliyun.com/
echo 4. 右键点击extractWords云函数 → 配置
echo 5. 添加环境变量：DASHSCOPE_API_KEY
echo 6. 右键点击extractWords云函数 → 上传并部署
echo ================================
echo.
pause 