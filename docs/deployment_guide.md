# 阿里云盘同步系统部署指南

本文档详细说明如何部署和配置阿里云盘同步系统，包括环境准备、安装步骤、配置说明和常见问题解决方案。

## 系统要求

### 硬件要求

- **CPU**: 2核或更高
- **内存**: 最小4GB，推荐8GB或更高
- **磁盘空间**: 最小20GB，视同步文件规模可能需要更多

### 软件要求

- **操作系统**: 
  - Linux（推荐Ubuntu 20.04/22.04或CentOS 7/8）
  - Windows Server 2016/2019/2022（需要额外配置）
  - macOS（仅用于开发环境）

- **软件环境**:
  - Python 3.9+
  - Node.js 16+
  - PostgreSQL 13+
  - Redis 6+
  - Nginx (用于反向代理)
  - Docker (可选，用于容器化部署)

## 部署方式

阿里云盘同步系统支持三种部署方式:

1. **传统部署**: 在实体服务器或虚拟机上直接部署
2. **Docker部署**: 使用Docker和Docker Compose部署
3. **Kubernetes部署**: 在Kubernetes集群中部署（高级选项）

## 传统部署

### 1. 环境准备

#### 1.1 安装Python环境

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y python3 python3-pip python3-dev python3-venv

# CentOS/RHEL
sudo yum install -y python39 python39-devel python39-pip
```

#### 1.2 安装数据库

```bash
# PostgreSQL
# Ubuntu/Debian
sudo apt install -y postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install -y postgresql postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql
```

```sql
CREATE DATABASE aliyundrive_sync;
CREATE USER aliyundrive WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE aliyundrive_sync TO aliyundrive;
\q
```

#### 1.3 安装Redis

```bash
# Ubuntu/Debian
sudo apt install -y redis-server
sudo systemctl start redis
sudo systemctl enable redis

# CentOS/RHEL
sudo yum install -y redis
sudo systemctl start redis
sudo systemctl enable redis
```

#### 1.4 安装Node.js环境

```bash
# 使用NVM安装Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install 16
nvm use 16
```

#### 1.5 安装Nginx

```bash
# Ubuntu/Debian
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# CentOS/RHEL
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. 后端部署

#### 2.1 获取源代码

```bash
git clone https://github.com/yourusername/aliyundrive-sync.git
cd aliyundrive-sync/backend
```

#### 2.2 创建虚拟环境

```bash
python3 -m venv venv
source venv/bin/activate
```

#### 2.3 安装依赖

```bash
pip install -U pip
pip install -r requirements.txt
```

#### 2.4 配置环境变量

创建`.env`文件:

```
# 数据库配置
DATABASE_URL=postgresql://aliyundrive:your_secure_password@localhost/aliyundrive_sync

# Redis配置
REDIS_URL=redis://localhost:6379/0

# 安全配置
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# 邮件设置
MAIL_SERVER=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_email_password
MAIL_FROM=noreply@example.com
MAIL_TLS=True
MAIL_SSL=False

# 系统设置
MAX_TASKS_PER_USER=10
MAX_CONCURRENT_TASKS=5
DEFAULT_TASK_TIMEOUT=3600
RETRY_COUNT=3
RETRY_INTERVAL=300
```

#### 2.5 初始化数据库

```bash
alembic upgrade head
```

#### 2.6 创建管理员账户

```bash
python -m app.initial_setup
```

#### 2.7 配置Systemd服务（API服务）

创建文件 `/etc/systemd/system/aliyundrive-api.service`:

```
[Unit]
Description=Aliyun Drive Sync API Service
After=network.target postgresql.service redis.service

[Service]
User=your_user
Group=your_user
WorkingDirectory=/path/to/aliyundrive-sync/backend
Environment="PATH=/path/to/aliyundrive-sync/backend/venv/bin"
ExecStart=/path/to/aliyundrive-sync/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

#### 2.8 配置Systemd服务（Celery Worker）

创建文件 `/etc/systemd/system/aliyundrive-worker.service`:

```
[Unit]
Description=Aliyun Drive Sync Celery Worker
After=network.target postgresql.service redis.service

[Service]
User=your_user
Group=your_user
WorkingDirectory=/path/to/aliyundrive-sync/backend
Environment="PATH=/path/to/aliyundrive-sync/backend/venv/bin"
ExecStart=/path/to/aliyundrive-sync/backend/venv/bin/celery -A app.tasks.worker worker --loglevel=info
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

#### 2.9 配置Systemd服务（Celery Beat）

创建文件 `/etc/systemd/system/aliyundrive-beat.service`:

```
[Unit]
Description=Aliyun Drive Sync Celery Beat
After=network.target postgresql.service redis.service

[Service]
User=your_user
Group=your_user
WorkingDirectory=/path/to/aliyundrive-sync/backend
Environment="PATH=/path/to/aliyundrive-sync/backend/venv/bin"
ExecStart=/path/to/aliyundrive-sync/backend/venv/bin/celery -A app.tasks.worker beat --loglevel=info
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

#### 2.10 启动服务

```bash
sudo systemctl daemon-reload
sudo systemctl start aliyundrive-api
sudo systemctl start aliyundrive-worker
sudo systemctl start aliyundrive-beat
sudo systemctl enable aliyundrive-api
sudo systemctl enable aliyundrive-worker
sudo systemctl enable aliyundrive-beat
```

### 3. 前端部署

#### 3.1 构建前端

```bash
cd /path/to/aliyundrive-sync/frontend
npm install
npm run build
```

#### 3.2 配置Nginx

创建文件 `/etc/nginx/sites-available/aliyundrive-sync`:

```nginx
server {
    listen 80;
    server_name your_domain.com;  # 替换为你的域名或IP

    # 重定向HTTP到HTTPS（生产环境推荐）
    # return 301 https://$host$request_uri;

    # 如果不使用HTTPS，取消以下注释
    location / {
        root /path/to/aliyundrive-sync/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTPS配置（生产环境推荐）
# server {
#     listen 443 ssl;
#     server_name your_domain.com;
# 
#     ssl_certificate /path/to/cert.pem;
#     ssl_certificate_key /path/to/key.pem;
# 
#     location / {
#         root /path/to/aliyundrive-sync/frontend/dist;
#         index index.html;
#         try_files $uri $uri/ /index.html;
#     }
# 
#     location /api {
#         proxy_pass http://localhost:8000;
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#     }
# }
```

启用配置并重启Nginx:

```bash
# Ubuntu/Debian
sudo ln -s /etc/nginx/sites-available/aliyundrive-sync /etc/nginx/sites-enabled/
sudo nginx -t  # 检查配置
sudo systemctl restart nginx

# CentOS/RHEL
sudo cp /etc/nginx/sites-available/aliyundrive-sync /etc/nginx/conf.d/
sudo nginx -t
sudo systemctl restart nginx
```

## Docker部署

### 1. 准备环境

确保已安装Docker和Docker Compose:

```bash
# 安装Docker
curl -fsSL https://get.docker.com | sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.15.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 准备Docker Compose文件

创建`docker-compose.yml`文件:

```yaml
version: '3'

services:
  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_USER=aliyundrive
      - POSTGRES_PASSWORD=your_secure_password
      - POSTGRES_DB=aliyundrive_sync
    restart: always

  redis:
    image: redis:6
    volumes:
      - redis_data:/data
    restart: always

  backend:
    build: ./backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://aliyundrive:your_secure_password@db/aliyundrive_sync
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=your_secret_key_here
      - JWT_SECRET_KEY=your_jwt_secret_key
      - JWT_ALGORITHM=HS256
      - JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
      - JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
      - MAIL_SERVER=smtp.example.com
      - MAIL_PORT=587
      - MAIL_USERNAME=your_email@example.com
      - MAIL_PASSWORD=your_email_password
      - MAIL_FROM=noreply@example.com
      - MAIL_TLS=True
      - MAIL_SSL=False
      - MAX_TASKS_PER_USER=10
      - MAX_CONCURRENT_TASKS=5
      - DEFAULT_TASK_TIMEOUT=3600
      - RETRY_COUNT=3
      - RETRY_INTERVAL=300
    depends_on:
      - db
      - redis
    restart: always

  celery-worker:
    build: ./backend
    command: celery -A app.tasks.worker worker --loglevel=info
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://aliyundrive:your_secure_password@db/aliyundrive_sync
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
      - backend
    restart: always

  celery-beat:
    build: ./backend
    command: celery -A app.tasks.worker beat --loglevel=info
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://aliyundrive:your_secure_password@db/aliyundrive_sync
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
      - backend
    restart: always

  frontend:
    build: ./frontend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    restart: always

  nginx:
    image: nginx:1.21
    ports:
      - 80:80
      - 443:443
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./frontend/dist:/usr/share/nginx/html
      - ./nginx/certs:/etc/nginx/certs
    depends_on:
      - backend
      - frontend
    restart: always

volumes:
  postgres_data:
  redis_data:
```

### 3. 创建Nginx配置

在项目目录中创建`nginx/conf.d/app.conf`:

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. 准备Dockerfile

#### 4.1 后端Dockerfile

创建`backend/Dockerfile`:

```dockerfile
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 初始化数据库
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
```

创建`backend/docker-entrypoint.sh`:

```bash
#!/bin/bash
set -e

# 等待数据库准备好
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# 等待Redis准备好
echo "Waiting for Redis..."
while ! nc -z redis 6379; do
  sleep 0.1
done
echo "Redis started"

# 应用数据库迁移
alembic upgrade head

# 如果首次启动，创建管理员账户
if [ ! -f "/app/.initialized" ]; then
    python -m app.initial_setup
    touch /app/.initialized
fi

# 执行传入的命令
exec "$@"
```

#### 4.2 前端Dockerfile

创建`frontend/Dockerfile`:

```dockerfile
FROM node:16 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:1.21

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/conf.d/app.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 5. 启动服务

```bash
docker-compose up -d
```

初始化管理员账户（仅首次运行）:

```bash
docker-compose exec backend python -m app.initial_setup
```

## Kubernetes部署

对于大规模部署和高可用性需求，可以使用Kubernetes部署。本指南提供基本步骤，详细配置需根据具体的Kubernetes环境调整。

### 1. 准备Kubernetes配置文件

#### 1.1 创建命名空间

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: aliyundrive-sync
```

#### 1.2 创建配置映射和密钥

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: aliyundrive-config
  namespace: aliyundrive-sync
data:
  MAX_TASKS_PER_USER: "10"
  MAX_CONCURRENT_TASKS: "5"
  DEFAULT_TASK_TIMEOUT: "3600"
  RETRY_COUNT: "3"
  RETRY_INTERVAL: "300"
  MAIL_SERVER: "smtp.example.com"
  MAIL_PORT: "587"
  MAIL_FROM: "noreply@example.com"
  MAIL_TLS: "True"
  MAIL_SSL: "False"
```

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: aliyundrive-secret
  namespace: aliyundrive-sync
type: Opaque
data:
  DATABASE_URL: <base64-encoded-db-url>
  REDIS_URL: <base64-encoded-redis-url>
  SECRET_KEY: <base64-encoded-secret-key>
  JWT_SECRET_KEY: <base64-encoded-jwt-secret>
  MAIL_USERNAME: <base64-encoded-username>
  MAIL_PASSWORD: <base64-encoded-password>
```

#### 1.3 部署数据库和Redis

使用Helm或Kubernetes Operators部署PostgreSQL和Redis。

#### 1.4 部署后端服务

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aliyundrive-backend
  namespace: aliyundrive-sync
spec:
  replicas: 2
  selector:
    matchLabels:
      app: aliyundrive-backend
  template:
    metadata:
      labels:
        app: aliyundrive-backend
    spec:
      containers:
      - name: backend
        image: your-registry/aliyundrive-backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: aliyundrive-config
        - secretRef:
            name: aliyundrive-secret
        resources:
          limits:
            cpu: "1"
            memory: "1Gi"
          requests:
            cpu: "500m"
            memory: "512Mi"
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
```

```yaml
# backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: aliyundrive-backend
  namespace: aliyundrive-sync
spec:
  selector:
    app: aliyundrive-backend
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
```

#### 1.5 部署Celery Worker和Beat

```yaml
# celery-worker-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aliyundrive-worker
  namespace: aliyundrive-sync
spec:
  replicas: 2
  selector:
    matchLabels:
      app: aliyundrive-worker
  template:
    metadata:
      labels:
        app: aliyundrive-worker
    spec:
      containers:
      - name: worker
        image: your-registry/aliyundrive-backend:latest
        command: ["celery", "-A", "app.tasks.worker", "worker", "--loglevel=info"]
        envFrom:
        - configMapRef:
            name: aliyundrive-config
        - secretRef:
            name: aliyundrive-secret
        resources:
          limits:
            cpu: "1"
            memory: "1Gi"
          requests:
            cpu: "500m"
            memory: "512Mi"
```

```yaml
# celery-beat-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aliyundrive-beat
  namespace: aliyundrive-sync
spec:
  replicas: 1
  selector:
    matchLabels:
      app: aliyundrive-beat
  template:
    metadata:
      labels:
        app: aliyundrive-beat
    spec:
      containers:
      - name: beat
        image: your-registry/aliyundrive-backend:latest
        command: ["celery", "-A", "app.tasks.worker", "beat", "--loglevel=info"]
        envFrom:
        - configMapRef:
            name: aliyundrive-config
        - secretRef:
            name: aliyundrive-secret
        resources:
          limits:
            cpu: "0.5"
            memory: "512Mi"
          requests:
            cpu: "200m"
            memory: "256Mi"
```

#### 1.6 部署前端

```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aliyundrive-frontend
  namespace: aliyundrive-sync
spec:
  replicas: 2
  selector:
    matchLabels:
      app: aliyundrive-frontend
  template:
    metadata:
      labels:
        app: aliyundrive-frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/aliyundrive-frontend:latest
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "0.5"
            memory: "512Mi"
          requests:
            cpu: "200m"
            memory: "256Mi"
```

```yaml
# frontend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: aliyundrive-frontend
  namespace: aliyundrive-sync
spec:
  selector:
    app: aliyundrive-frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

#### 1.7 配置Ingress

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: aliyundrive-ingress
  namespace: aliyundrive-sync
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: aliyundrive-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: aliyundrive-backend
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: aliyundrive-frontend
            port:
              number: 80
```

### 2. 应用配置

```bash
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f celery-worker-deployment.yaml
kubectl apply -f celery-beat-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
kubectl apply -f ingress.yaml
```

### 3. 初始化数据库和管理员账户

```bash
# 获取后端Pod名称
BACKEND_POD=$(kubectl get pods -n aliyundrive-sync -l app=aliyundrive-backend -o jsonpath="{.items[0].metadata.name}")

# 应用数据库迁移
kubectl exec -it $BACKEND_POD -n aliyundrive-sync -- alembic upgrade head

# 创建管理员账户
kubectl exec -it $BACKEND_POD -n aliyundrive-sync -- python -m app.initial_setup
```

## 配置说明

### 环境变量配置

| 变量名                           | 说明                      | 示例值                                   |
|---------------------------------|--------------------------|----------------------------------------|
| DATABASE_URL                    | 数据库连接URL              | postgresql://user:pass@host/dbname     |
| REDIS_URL                       | Redis连接URL              | redis://host:6379/0                    |
| SECRET_KEY                      | 应用密钥                   | 随机字符串                               |
| JWT_SECRET_KEY                  | JWT加密密钥                | 随机字符串                               |
| JWT_ALGORITHM                   | JWT加密算法                | HS256                                  |
| JWT_ACCESS_TOKEN_EXPIRE_MINUTES | 访问令牌有效期（分钟）       | 30                                     |
| JWT_REFRESH_TOKEN_EXPIRE_DAYS   | 刷新令牌有效期（天）         | 7                                      |
| MAIL_SERVER                     | 邮件服务器                 | smtp.example.com                       |
| MAIL_PORT                       | 邮件服务器端口             | 587                                    |
| MAIL_USERNAME                   | 邮件账号                   | user@example.com                       |
| MAIL_PASSWORD                   | 邮件密码                   | 密码                                    |
| MAIL_FROM                       | 发件人邮箱                 | noreply@example.com                    |
| MAIL_TLS                        | 是否使用TLS                | True                                   |
| MAIL_SSL                        | 是否使用SSL                | False                                  |
| MAX_TASKS_PER_USER              | 每用户最大任务数            | 10                                     |
| MAX_CONCURRENT_TASKS            | 最大并发任务数             | 5                                      |
| DEFAULT_TASK_TIMEOUT            | 默认任务超时时间（秒）       | 3600                                   |
| RETRY_COUNT                     | 任务失败重试次数            | 3                                      |
| RETRY_INTERVAL                  | 重试间隔时间（秒）          | 300                                    |

### 系统设置

系统启动后，管理员可以通过Web界面的"系统设置"页面调整以下配置：

1. **任务配置**
   - 用户任务限制
   - 并发任务数
   - 任务超时时间
   - 重试策略

2. **邮件配置**
   - SMTP服务器设置
   - 邮件模板

3. **系统维护**
   - 日志清理策略
   - 数据备份选项

## 系统维护

### 数据库备份

定期备份PostgreSQL数据库:

```bash
# 传统部署
pg_dump -U aliyundrive aliyundrive_sync > backup_$(date +%Y%m%d).sql

# Docker部署
docker exec -t aliyundrive-sync_db_1 pg_dump -U aliyundrive aliyundrive_sync > backup_$(date +%Y%m%d).sql
```

### 日志管理

默认情况下，系统日志存储在数据库中，可以通过Web界面的管理员日志页面查看。后端服务和Celery的运行日志默认输出到标准输出。

对于传统部署，可以使用logrotate管理日志文件:

```
/var/log/aliyundrive-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 aliyundrive aliyundrive
    sharedscripts
    postrotate
        systemctl reload aliyundrive-api
        systemctl reload aliyundrive-worker
        systemctl reload aliyundrive-beat
    endscript
}
```

### 系统更新

#### 传统部署更新

```bash
# 备份数据库
pg_dump -U aliyundrive aliyundrive_sync > backup_before_update.sql

# 更新代码
cd /path/to/aliyundrive-sync
git pull

# 更新后端
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head

# 重启服务
sudo systemctl restart aliyundrive-api
sudo systemctl restart aliyundrive-worker
sudo systemctl restart aliyundrive-beat

# 更新前端
cd ../frontend
npm install
npm run build

# 重启Nginx
sudo systemctl restart nginx
```

#### Docker部署更新

```bash
# 备份数据库
docker exec -t aliyundrive-sync_db_1 pg_dump -U aliyundrive aliyundrive_sync > backup_before_update.sql

# 拉取最新代码
git pull

# 重新构建和启动容器
docker-compose build
docker-compose up -d

# 应用数据库迁移
docker-compose exec backend alembic upgrade head
```

## 常见问题解决

### 1. 数据库连接问题

**症状**: 服务无法连接到数据库

**解决方案**:
- 检查数据库连接URL是否正确
- 确认PostgreSQL服务是否运行
- 确认用户权限是否正确
- 检查防火墙设置

```bash
# 检查PostgreSQL状态
sudo systemctl status postgresql

# 检查用户和数据库
sudo -u postgres psql
\l  # 列出数据库
\du  # 列出用户
```

### 2. Redis连接问题

**症状**: Celery无法启动或任务无法执行

**解决方案**:
- 确认Redis服务是否运行
- 检查Redis连接URL
- 检查防火墙设置

```bash
# 检查Redis状态
sudo systemctl status redis

# 测试Redis连接
redis-cli ping  # 应返回PONG
```

### 3. 任务执行失败

**症状**: 同步任务失败，在执行记录中显示错误

**解决方案**:
- 检查阿里云盘账号是否正常登录
- 检查分享链接和密码是否有效
- 检查目标文件夹权限
- 查看Celery Worker日志

```bash
# 查看Celery Worker日志
sudo journalctl -u aliyundrive-worker
```

### 4. 邮件发送失败

**症状**: 无法发送验证码或通知邮件

**解决方案**:
- 检查SMTP服务器配置
- 确认邮箱凭据是否正确
- 检查网络连接
- 尝试使用其他SMTP服务

### 5. 前端无法访问

**症状**: 无法访问Web界面或显示错误

**解决方案**:
- 检查Nginx配置
- 确认前端构建是否成功
- 检查浏览器控制台错误
- 检查Nginx错误日志

```bash
# 检查Nginx配置
sudo nginx -t

# 检查Nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

### 6. API响应缓慢

**症状**: Web界面加载缓慢，API请求超时

**解决方案**:
- 增加后端服务的worker数量
- 优化数据库查询
- 检查服务器资源使用情况
- 考虑添加缓存层

```bash
# 检查系统资源
top
free -h
df -h
```

### 7. 权限问题

**症状**: 无法访问某些功能或执行某些操作

**解决方案**:
- 确认用户角色是否正确
- 检查JWT令牌是否有效
- 清除浏览器缓存和Cookie
- 重新登录

## 安全建议

1. **使用HTTPS**
   - 配置SSL证书
   - 强制HTTP转HTTPS

2. **配置防火墙**
   - 只开放必要端口
   - 限制IP访问范围

3. **定期更新**
   - 保持系统组件更新
   - 关注安全公告

4. **数据备份**
   - 定期备份数据库
   - 测试恢复流程

5. **监控系统**
   - 配置异常登录警告
   - 监控资源使用情况

## 性能优化

1. **数据库优化**
   - 添加适当的索引
   - 定期维护和清理
   - 考虑读写分离

2. **缓存策略**
   - 使用Redis缓存热点数据
   - 添加文件夹列表缓存

3. **并发调优**
   - 根据服务器资源调整worker数量
   - 优化Celery任务队列

4. **静态资源优化**
   - 配置Nginx缓存
   - 使用CDN加速前端资源

## 高可用部署

对于需要高可用性的生产环境，建议：

1. **数据库高可用**
   - PostgreSQL主从复制
   - 考虑使用数据库集群

2. **Redis集群**
   - Redis哨兵或集群模式
   - 持久化配置

3. **负载均衡**
   - 使用Nginx或云服务商提供的负载均衡
   - 配置会话保持

4. **服务冗余**
   - 多实例部署后端服务
   - 多实例部署Celery Worker

5. **监控与自动恢复**
   - 配置健康检查
   - 设置自动扩缩容策略 