FROM python:3.9-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# 安装Python依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 创建数据目录
RUN mkdir -p /app/data

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8000

# 创建启动脚本
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# 启动适配器应用来提供健康检查\n\
echo "启动健康检查服务..."\n\
uvicorn app.adapter:app --host 0.0.0.0 --port 8001 & \n\
ADAPTER_PID=$!\n\
\n\
# 等待健康检查服务启动\n\
sleep 2\n\
curl -s http://localhost:8001/health > /dev/null || { echo "健康检查服务启动失败"; exit 1; }\n\
echo "健康检查服务启动成功，PID: $ADAPTER_PID"\n\
\n\
# 初始化应用\n\
echo "正在初始化数据库..."\n\
python -m app.database_init || echo "数据库初始化失败，继续启动应用"\n\
\n\
# 确保在应用退出时关闭健康检查服务\n\
trap "kill $ADAPTER_PID 2>/dev/null || true" EXIT\n\
\n\
# 启动主应用\n\
echo "启动主应用服务..."\n\
uvicorn app.main:app --host 0.0.0.0 --port 8000\n\
' > /app/start.sh && chmod +x /app/start.sh

# 健康检查
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# 启动命令
CMD ["/app/start.sh"] 