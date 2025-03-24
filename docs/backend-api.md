# ALYS-Pro 后端API接口文档

[返回文档首页](./README.md)

本文档详细说明了ALYS-Pro系统后端提供的所有API接口，包括请求方法、参数说明和返回值格式。

## API概述

ALYS-Pro后端API基于RESTful架构设计，使用JSON作为数据交换格式。所有API端点统一以`/api/v1`作为前缀。

基础URL：`http://your-server-address:8000/api/v1`

## 认证方式

除了少数公共接口外，大多数API需要认证才能访问。系统使用JWT (JSON Web Token) 进行身份认证：

- 通过用户名和密码登录后获取令牌
- 在后续请求中，在HTTP请求头中设置`Authorization: Bearer {token}`

## API端点

### 认证相关

#### 登录

```
POST /auth/login
```

**请求体**：
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "username": "your_username",
      "email": "your_email@example.com",
      "is_admin": false
    }
  }
}
```

#### 注册

```
POST /auth/register
```

**请求体**：
```json
{
  "username": "new_username",
  "password": "new_password",
  "email": "new_email@example.com"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "new_username",
    "email": "new_email@example.com",
    "is_admin": false
  }
}
```

#### 阿里云盘授权

```
POST /auth/aliyundrive/authorize
```

**请求体**：
```json
{
  "code": "authorization_code_from_oauth"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "drive_id": "drive_123456",
    "user_name": "阿里云盘用户名",
    "avatar": "https://example.com/avatar.jpg",
    "expires_in": 7200
  }
}
```

### 用户管理

#### 获取当前用户信息

```
GET /user/me
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "your_username",
    "email": "your_email@example.com",
    "is_admin": false,
    "created_at": "2023-01-01T12:00:00Z",
    "aliyundrive_info": {
      "is_authorized": true,
      "username": "阿里云盘用户名",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

#### 更新用户信息

```
PUT /user/me
```

**请求体**：
```json
{
  "email": "updated_email@example.com",
  "password": "new_password"  // 可选
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "your_username",
    "email": "updated_email@example.com",
    "is_admin": false
  }
}
```

### 任务管理

#### 获取所有同步任务

```
GET /task/sync
```

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "文档备份",
      "local_path": "/data/documents",
      "remote_path": "/backup/documents",
      "sync_type": "bidirectional",
      "schedule": "0 0 * * *",  // cron格式
      "status": "active",
      "last_sync": "2023-03-15T10:30:00Z",
      "created_at": "2023-01-01T12:00:00Z"
    },
    // ...更多任务
  ]
}
```

#### 创建同步任务

```
POST /task/sync
```

**请求体**：
```json
{
  "name": "照片备份",
  "local_path": "/data/photos",
  "remote_path": "/backup/photos",
  "sync_type": "upload_only",
  "schedule": "0 0 * * *",  // cron格式或null表示手动
  "filters": {
    "include": ["*.jpg", "*.png"],
    "exclude": ["temp/*"]
  }
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "照片备份",
    "local_path": "/data/photos",
    "remote_path": "/backup/photos",
    "sync_type": "upload_only",
    "schedule": "0 0 * * *",
    "status": "active",
    "filters": {
      "include": ["*.jpg", "*.png"],
      "exclude": ["temp/*"]
    },
    "created_at": "2023-03-20T14:30:00Z"
  }
}
```

#### 获取特定任务

```
GET /task/sync/{task_id}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "文档备份",
    "local_path": "/data/documents",
    "remote_path": "/backup/documents",
    "sync_type": "bidirectional",
    "schedule": "0 0 * * *",
    "status": "active",
    "last_sync": "2023-03-15T10:30:00Z",
    "created_at": "2023-01-01T12:00:00Z",
    "filters": {
      "include": [],
      "exclude": [".git/*", "node_modules/*"]
    },
    "statistics": {
      "files_total": 120,
      "files_synced": 120,
      "bytes_total": 1500000,
      "bytes_synced": 1500000
    }
  }
}
```

#### 更新任务

```
PUT /task/sync/{task_id}
```

**请求体**：
```json
{
  "name": "文档备份更新",
  "schedule": "0 0 1 * *",  // 修改为每月1日
  "status": "paused"  // 暂停任务
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "文档备份更新",
    "local_path": "/data/documents",
    "remote_path": "/backup/documents",
    "sync_type": "bidirectional",
    "schedule": "0 0 1 * *",
    "status": "paused",
    "last_sync": "2023-03-15T10:30:00Z"
  }
}
```

#### 删除任务

```
DELETE /task/sync/{task_id}
```

**响应**：
```json
{
  "success": true,
  "message": "任务已成功删除"
}
```

#### 手动触发同步

```
POST /task/sync/{task_id}/run
```

**响应**：
```json
{
  "success": true,
  "data": {
    "job_id": "job_123456",
    "task_id": 1,
    "status": "running",
    "started_at": "2023-03-20T15:30:00Z"
  }
}
```

### 文件操作

#### 列出云盘文件

```
GET /files/list
```

**查询参数**：
- `path` (string): 云盘路径，默认为根目录
- `limit` (number): 返回结果数量限制
- `order_by` (string): 排序字段，可选值 name, size, updated_at
- `order_direction` (string): 排序方向，可选值 asc, desc

**响应**：
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "drive_id": "drive_123456",
        "file_id": "file_abcdef",
        "name": "文档",
        "type": "folder",
        "size": 0,
        "created_at": "2023-01-15T08:30:00Z",
        "updated_at": "2023-03-10T14:20:00Z"
      },
      {
        "drive_id": "drive_123456",
        "file_id": "file_ghijkl",
        "name": "报告.pdf",
        "type": "file",
        "size": 1024000,
        "created_at": "2023-03-18T09:15:00Z",
        "updated_at": "2023-03-18T09:15:00Z"
      }
      // ...更多文件
    ],
    "next_marker": "marker_123" // 用于分页
  }
}
```

### 系统管理

#### 系统状态

```
GET /admin/status
```

**响应**：
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "uptime": 1209600,  // 秒
    "system_stats": {
      "cpu_usage": 25.5,
      "memory_usage": 512,  // MB
      "disk_usage": 5120  // MB
    },
    "tasks_stats": {
      "total": 5,
      "active": 3,
      "paused": 2,
      "running": 1
    }
  }
}
```

## 错误处理

当API请求失败时，响应将包含错误信息：

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "认证令牌无效或已过期"
  }
}
```

常见错误代码：

| 错误代码 | HTTP状态码 | 说明 |
|---------|----------|------|
| `BAD_REQUEST` | 400 | 请求参数无效 |
| `UNAUTHORIZED` | 401 | 未认证或认证失败 |
| `FORBIDDEN` | 403 | 权限不足 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `CONFLICT` | 409 | 资源冲突 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

## API限流

为保护系统资源，API实施了限流策略：

- 匿名用户: 60次请求/分钟
- 认证用户: 300次请求/分钟
- 管理员用户: 600次请求/分钟

超出限制后，API将返回状态码`429 Too Many Requests`。

## 进一步阅读

- [后端技术文档](./backend-technical.md) - 了解更多后端技术实现细节
- [部署指南](./deployment-guide.md) - 系统部署和配置说明 