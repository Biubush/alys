# ALYS-Pro 部署指南

[返回文档首页](./README.md)

本文档提供了ALYS-Pro（阿里云盘同步系统）的详细部署指南，包括环境要求、安装步骤和配置说明。

## 环境要求

### 硬件要求
- CPU: 2核心以上
- 内存: 至少2GB
- 存储空间: 根据同步文件需求，推荐20GB以上

### 软件要求
- Docker 20.10.0或更高版本（推荐使用Docker部署）
- Docker Compose 2.0.0或更高版本
- 或者满足以下条件的传统部署环境：
  - Python 3.9+
  - Node.js 16+
  - Nginx (生产环境前端部署)

## 部署方式

### 方式一：Docker快速部署（推荐）

1. **克隆代码仓库**
   ```bash
   git clone https://github.com/yourusername/alys-pro.git
   cd alys-pro
   ```

2. **配置环境变量**
   ```bash
   cp .env.example .env
   ```
   编辑`.env`文件，根据需要修改配置参数。

3. **使用Docker Compose启动服务**
   ```bash
   docker-compose up -d
   ```
   这将启动后端API服务和前端Web界面。

4. **访问系统**
   默认情况下，系统将在以下地址可用：
   - 前端界面: `http://localhost:80`
   - 后端API: `http://localhost:8000`
   - API文档: `http://localhost:8000/api/v1/docs`

### 方式二：生产环境部署

1. **克隆代码仓库**
   ```bash
   git clone https://github.com/yourusername/alys-pro.git
   cd alys-pro
   ```

2. **配置生产环境变量**
   ```bash
   cp .env.example .env.prod
   ```
   编辑`.env.prod`文件，配置生产环境参数。

3. **使用生产配置启动服务**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **配置反向代理(可选)**
   对于生产环境，推荐使用Nginx或其他反向代理服务器，并配置SSL证书。
   示例Nginx配置在`./proxy/nginx.conf`。

### 方式三：开发环境手动部署

#### 后端服务

1. **安装Python依赖**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **配置开发环境**
   ```bash
   cp ../.env.example .env
   ```
   编辑`.env`文件，配置开发环境参数。

3. **启动后端服务**
   ```bash
   python -m app.main
   ```

#### 前端服务

1. **安装Node.js依赖**
   ```bash
   cd frontend
   npm install
   ```

2. **配置开发环境**
   ```bash
   cp .env.example .env
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 配置说明

### 关键配置参数

在`.env`文件中，您可以配置以下关键参数：

| 参数名 | 说明 | 默认值 |
|---------|---------|---------|
| `DEBUG` | 调试模式开关 | `false` |
| `SERVER_HOST` | 后端服务主机 | `0.0.0.0` |
| `SERVER_PORT` | 后端服务端口 | `8000` |
| `SERVER_WORKERS` | 服务工作进程数 | `4` |
| `SECRET_KEY` | 系统安全密钥 | （需要生成） |
| `ALIYUNDRIVE_CLIENT_ID` | 阿里云盘API客户端ID | - |
| `ALIYUNDRIVE_CLIENT_SECRET` | 阿里云盘API客户端密钥 | - |
| `DATABASE_URL` | 数据库连接URL | `sqlite:///./data/alys.db` |

### 阿里云盘API配置

要使用阿里云盘API功能，您需要：

1. 申请阿里云盘开发者账号
2. 创建应用并获取`CLIENT_ID`和`CLIENT_SECRET`
3. 在`.env`文件中配置这些参数

## 系统维护

### 数据备份
```bash
docker-compose exec backend python -m app.utils.backup
```

### 日志查看
```bash
docker-compose logs -f backend  # 查看后端日志
docker-compose logs -f frontend # 查看前端日志
```

### 系统更新
```bash
git pull
docker-compose down
docker-compose up -d --build
```

## 常见问题

- **问题1: 系统无法启动**
  请检查端口占用和环境变量配置。

- **问题2: 无法连接到阿里云盘**
  请验证API密钥配置是否正确，网络连接是否畅通。

- **问题3: 同步任务失败**
  检查日志文件定位具体错误原因，确认授权是否有效。

如需进一步支持，请参考[后端技术文档](./backend-technical.md)和[前端技术文档](./frontend-technical.md)。 