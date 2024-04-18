#!/bin/bash 
 
set -e  # 设置遇到错误立即退出脚本 
 
# 克隆仓库 
echo "克隆仓库 ..." 
if ! git clone https://github.com/Biubush/alys.git; then 
    echo "无法克隆仓库，请检查网络连接或仓库地址是否正确。" 
    exit 1 
fi 
cd alys || exit 1 
 
# 安装依赖 
echo "安装依赖 ..." 
if ! python3 -m pip install -i https://mirrors.aliyun.com/pypi/simple/ -r requirements.txt; then 
 
    echo "安装依赖失败，请检查依赖是否正确配置或网络连接是否正常。" 
    exit 1 
fi 
 
# 运行 app.py 
echo "开始运行 alys程序 ..." 
if ! python3 app.py; then 
    echo "启动应用程序失败，请检查应用程序是否正确配置。" 
    exit 1 
fi