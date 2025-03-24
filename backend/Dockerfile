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
# 创建一个简单的健康检查服务器以并行运行\n\
python -c "\n\
from http.server import HTTPServer, BaseHTTPRequestHandler\n\
import json, threading\n\
\n\
class HealthHandler(BaseHTTPRequestHandler):\n\
    def do_GET(self):\n\
        if self.path == \"/health\":\n\
            self.send_response(200)\n\
            self.send_header(\"Content-type\", \"application/json\")\n\
            self.end_headers()\n\
            self.wfile.write(json.dumps({\"status\": \"ok\"}).encode())\n\
        else:\n\
            self.send_response(404)\n\
            self.end_headers()\n\
\n\
def run_health_server():\n\
    print(\"启动健康检查服务在端口8001...\")\n\
    server = HTTPServer((\"0.0.0.0\", 8001), HealthHandler)\n\
    server.serve_forever()\n\
\n\
thread = threading.Thread(target=run_health_server, daemon=True)\n\
thread.start()\n\
" &\n\
\n\
echo "正在初始化数据库..."\n\
python -m app.database_init || echo "数据库初始化失败，继续启动应用"\n\
\n\
echo "启动应用服务..."\n\
uvicorn app.main:app --host 0.0.0.0 --port 8000\n\
' > /app/start.sh && chmod +x /app/start.sh

# 健康检查
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# 启动命令
CMD ["/app/start.sh"] 