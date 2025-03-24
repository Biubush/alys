# ALYS-Pro 后端技术文档

[返回文档首页](./README.md)

本文档详细描述了ALYS-Pro系统后端的技术架构、设计模式和实现细节，为开发者提供技术参考。

## 技术栈

ALYS-Pro后端采用以下技术栈：

- **主框架**：FastAPI (Python 3.9+)
- **数据库**：SQLite (本地部署) / PostgreSQL (生产部署)
- **任务队列**：Celery + Redis
- **认证**：JWT (JSON Web Token)
- **API文档**：Swagger UI (OpenAPI)
- **部署**：Docker + Docker Compose

## 系统架构

系统整体采用分层架构设计：

```
┌─────────────────────────────────────┐
│ API层 (app/api/)                    │
│ - 路由定义和请求处理                  │
│ - 参数校验和错误处理                  │
│ - 权限控制                          │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│ 服务层 (app/services/)              │
│ - 业务逻辑实现                       │
│ - 事务管理                          │
│ - 外部API集成                       │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│ 数据层 (app/models/)                │
│ - 数据模型定义                       │
│ - 数据访问和持久化                    │
│ - 数据校验                          │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│ 核心层 (app/core/)                  │
│ - 配置管理                          │
│ - 安全认证                          │
│ - 异常处理                          │
└─────────────────────────────────────┘
```

## 目录结构

```
backend/
├── app/
│   ├── __init__.py            # 应用初始化
│   ├── main.py                # 应用入口
│   ├── initial_setup.py       # 初始化脚本
│   ├── api/                   # API路由和控制器
│   │   ├── __init__.py
│   │   ├── auth.py            # 认证相关接口
│   │   ├── user.py            # 用户管理接口
│   │   ├── task.py            # 任务管理接口
│   │   └── admin.py           # 管理接口
│   ├── core/                  # 核心模块
│   │   ├── __init__.py
│   │   ├── config.py          # 配置管理
│   │   ├── security.py        # 安全相关工具
│   │   ├── dependencies.py    # 依赖注入
│   │   └── exceptions.py      # 异常定义
│   ├── models/                # 数据模型
│   │   ├── __init__.py
│   │   ├── user.py            # 用户模型
│   │   ├── task.py            # 任务模型
│   │   └── file.py            # 文件模型
│   ├── services/              # 业务服务
│   │   ├── __init__.py
│   │   ├── auth_service.py    # 认证服务
│   │   ├── user_service.py    # 用户服务
│   │   ├── task_service.py    # 任务服务
│   │   └── aliyundrive_service.py # 阿里云盘集成
│   ├── tasks/                 # 后台任务
│   │   ├── __init__.py
│   │   ├── celery_app.py      # Celery配置
│   │   ├── sync_tasks.py      # 同步任务
│   │   └── scheduled_tasks.py # 计划任务
│   └── utils/                 # 工具函数
│       ├── __init__.py
│       ├── file_utils.py      # 文件操作工具
│       ├── cron_utils.py      # Cron表达式工具
│       └── logging_utils.py   # 日志工具
├── tests/                     # 测试代码
│   ├── __init__.py
│   ├── conftest.py            # 测试配置
│   ├── test_api/              # API测试
│   └── test_services/         # 服务测试
├── data/                      # 数据存储目录
│   ├── db.sqlite              # SQLite数据库
│   └── logs/                  # 日志文件
├── requirements.txt           # 依赖管理
└── Dockerfile                 # Docker配置
```

## 核心组件

### 数据模型

系统主要数据模型包括：

#### 用户模型 (User)

```python
class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    drive_tokens = relationship("DriveToken", back_populates="user", cascade="all, delete-orphan")
    sync_tasks = relationship("SyncTask", back_populates="user", cascade="all, delete-orphan")
```

#### 阿里云盘令牌 (DriveToken)

```python
class DriveToken(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    access_token = Column(String(512), nullable=False)
    refresh_token = Column(String(512), nullable=False)
    drive_id = Column(String(128), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="drive_tokens")
```

#### 同步任务 (SyncTask)

```python
class SyncTask(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(128), nullable=False)
    local_path = Column(String(512), nullable=False)
    remote_path = Column(String(512), nullable=False)
    sync_type = Column(Enum("upload_only", "download_only", "bidirectional"), nullable=False)
    schedule = Column(String(64), nullable=True)  # Cron格式
    status = Column(Enum("active", "paused", "error"), default="active")
    filters = Column(JSON, default=lambda: {"include": [], "exclude": []})
    last_sync = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="sync_tasks")
    sync_logs = relationship("SyncLog", back_populates="task", cascade="all, delete-orphan")
```

### 服务实现

系统主要服务实现包括：

#### 认证服务 (AuthService)

负责用户认证、注册、令牌管理等功能，包括：

- JWT令牌生成与验证
- 密码加密与验证
- 用户注册与登录
- 阿里云盘OAuth认证流程

#### 任务服务 (TaskService)

负责同步任务的管理和执行，包括：

- 任务CRUD操作
- 任务调度与执行
- 同步状态管理
- 同步历史记录

#### 阿里云盘服务 (AliyundriveService)

负责与阿里云盘API交互，包括：

- 认证令牌管理
- 文件上传与下载
- 文件列表获取
- 文件操作(创建、删除、重命名等)

### 后台任务

系统使用Celery实现后台任务处理：

#### 文件同步任务

```python
@celery_app.task
def sync_task(task_id: int):
    """执行文件同步任务"""
    task_service = TaskService()
    task = task_service.get_task(task_id)
    
    if not task:
        logger.error(f"Task not found: {task_id}")
        return
    
    try:
        # 获取任务详情
        logger.info(f"Starting sync task: {task.name}")
        
        # 执行同步逻辑
        if task.sync_type == "upload_only":
            upload_files(task)
        elif task.sync_type == "download_only":
            download_files(task)
        else:  # bidirectional
            bidirectional_sync(task)
            
        # 更新任务状态
        task_service.update_task_status(task_id, last_sync=datetime.utcnow())
        logger.info(f"Sync task completed: {task.name}")
        
    except Exception as e:
        logger.error(f"Sync task failed: {str(e)}")
        task_service.update_task_status(task_id, status="error")
```

#### 计划任务调度

使用Celery Beat进行计划任务调度，支持Cron表达式：

```python
@celery_app.task
def schedule_sync_tasks():
    """调度需要执行的同步任务"""
    task_service = TaskService()
    scheduled_tasks = task_service.get_tasks_to_run()
    
    for task in scheduled_tasks:
        logger.info(f"Scheduling task: {task.name}")
        sync_task.delay(task.id)
```

### 安全机制

系统实现了多层次的安全机制：

1. **认证安全**
   - 密码哈希使用bcrypt算法
   - JWT令牌有效期限管理
   - 刷新令牌机制

2. **授权与权限**
   - 基于角色的访问控制(RBAC)
   - API权限装饰器
   - 资源所有权检查

3. **数据安全**
   - 输入验证和清理
   - SQL注入防护(使用ORM)
   - 敏感数据加密存储

4. **API安全**
   - CORS保护
   - 请求限流
   - 敏感操作日志审计

## 性能优化

系统针对文件同步场景进行了性能优化：

1. **文件同步优化**
   - 增量同步算法，只处理变更文件
   - 分块上传/下载大文件
   - 文件元数据缓存

2. **数据库优化**
   - 关键字段索引
   - 查询优化
   - 连接池管理

3. **API性能**
   - 响应缓存
   - 分页处理大结果集
   - 异步处理长时间操作

## 扩展与定制

系统设计为可扩展架构，支持：

1. **云存储扩展**
   - 支持添加其他云存储服务(OneDrive、Google Drive等)
   - 抽象存储接口设计

2. **配置定制**
   - 环境变量配置
   - 配置文件覆盖
   - 运行时配置调整

3. **插件系统**
   - 预处理/后处理钩子
   - 自定义过滤器
   - 事件监听器

## 测试策略

系统采用多层次测试策略：

1. **单元测试**
   - 服务和工具函数测试
   - 模型测试

2. **集成测试**
   - API端点测试
   - 数据库集成测试

3. **系统测试**
   - 端到端同步测试
   - 性能和负载测试

## 日志与监控

系统提供全面的日志和监控：

1. **日志系统**
   - 多级别日志(DEBUG, INFO, WARNING, ERROR)
   - 按模块区分日志
   - 循环日志文件

2. **监控指标**
   - 系统资源使用(CPU、内存、磁盘)
   - 任务执行状态和时间
   - API请求统计

## 进一步阅读

- [后端API接口文档](./backend-api.md) - 详细的API使用说明
- [前端技术文档](./frontend-technical.md) - 前端技术实现细节
- [部署指南](./deployment-guide.md) - 系统部署和配置说明 