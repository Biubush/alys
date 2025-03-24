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

# 创建健康检查服务脚本
RUN echo 'from http.server import HTTPServer, BaseHTTPRequestHandler\n\
import json\n\
\n\
class HealthHandler(BaseHTTPRequestHandler):\n\
    def do_GET(self):\n\
        if self.path == "/health":\n\
            self.send_response(200)\n\
            self.send_header("Content-type", "application/json")\n\
            self.end_headers()\n\
            self.wfile.write(json.dumps({"status": "ok"}).encode())\n\
        else:\n\
            self.send_response(404)\n\
            self.end_headers()\n\
\n\
print("启动健康检查服务在端口8000...")\n\
server = HTTPServer(("0.0.0.0", 8000), HealthHandler)\n\
server.serve_forever()\n\
' > /app/health_server.py

# 健康检查
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 启动命令
CMD ["python", "/app/health_server.py"] 