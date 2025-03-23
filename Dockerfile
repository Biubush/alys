# 多阶段构建

# 后端构建阶段
FROM python:3.9-slim AS backend-builder

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# 前端构建阶段
FROM node:16-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# 最终镜像
FROM python:3.9-slim

WORKDIR /app

# 复制后端
COPY --from=backend-builder /app /app/backend
COPY --from=backend-builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages

# 复制前端构建结果
COPY --from=frontend-builder /app/dist /app/frontend/dist

# 复制Nginx配置
COPY nginx/conf.d/app.conf /etc/nginx/conf.d/default.conf

# 复制配置文件模板
COPY config.ini.template /app/config.ini.template

# 复制启动脚本
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# 安装Nginx
RUN apt-get update && \
    apt-get install -y nginx netcat && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 80 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"] 