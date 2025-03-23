# 阿里云盘同步系统

阿里云盘同步系统是一个基于Web的工具，旨在帮助用户自动化管理和同步阿里云盘中的共享文件。系统允许用户设置自动同步任务，将他人分享的文件或文件夹自动保存到自己的阿里云盘中，实现文件的定时更新和管理。

## 功能特点

- 用户管理：注册、登录、个人资料管理
- 阿里云盘集成：扫码登录、浏览文件夹
- 同步任务管理：创建、配置、执行任务
- 定时规则：支持Cron表达式和间隔时间
- 管理功能：用户管理、系统配置、日志查看

## 配置说明

系统使用根目录下的`config.ini`文件进行配置。首次运行时，可以复制`config.ini.template`为`config.ini`并根据需要修改。

主要配置项包括：

1. **数据库配置**：PostgreSQL连接信息
2. **Redis配置**：Redis连接信息
3. **安全配置**：密钥和Token设置
4. **邮件配置**：SMTP服务器设置
5. **任务配置**：任务限制和超时设置
6. **服务器配置**：API服务器设置
7. **管理员配置**：初始管理员账户信息

## 快速开始

### 使用Docker Compose

1. 克隆项目:
   ```bash
   git clone https://github.com/yourusername/aliyundrive-sync.git
   cd aliyundrive-sync
   ```

2. 复制配置文件模板:
   ```bash
   cp config.ini.template config.ini
   ```

3. 修改配置文件，主要需要修改数据库密码、密钥和管理员密码等敏感信息。

4. 启动服务:
   ```bash
   docker-compose up -d
   ```

5. 访问Web界面:
   浏览器打开 `http://localhost`

### 传统部署

详细的传统部署方式请参考 [部署文档](docs/deployment_guide.md)。

## 项目结构

- `backend/`: 后端API服务，基于FastAPI
- `frontend/`: 前端应用，基于React
- `docs/`: 项目文档
- `nginx/`: Nginx配置
- `config.ini.template`: 配置文件模板
- `docker-compose.yml`: Docker Compose配置文件
- `Dockerfile`: Docker构建文件

## 文档

- [项目介绍](docs/project_introduction.md)
- [技术文档](docs/technical_documentation.md)
- [部署指南](docs/deployment_guide.md)

## 贡献

欢迎提交Issue和Pull Request来帮助改进这个项目。

## 许可证

[MIT](LICENSE) 