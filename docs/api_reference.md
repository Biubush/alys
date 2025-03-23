# 阿里云盘同步系统API参考文档

## 概述

本文档详细说明阿里云盘同步系统提供的所有REST API接口，包括接口地址、请求方法、参数说明、响应格式和示例。这些API可用于与系统进行交互，实现自动化操作和第三方集成。

## API基础信息

### 基础URL

所有API请求都应使用以下基础URL：

```
https://{your-domain}/api/v1
```

其中`{your-domain}`是您的系统部署地址。

### 认证方式

除了公开接口外，所有API请求都需要认证。系统支持两种认证方式：

1. **Bearer Token认证**（推荐）
   
   在请求头中添加：
   ```
   Authorization: Bearer {access_token}
   ```

2. **API Key认证**
   
   在请求头中添加：
   ```
   X-API-Key: {your_api_key}
   ```

### 请求格式

- 除GET请求外，请求体应使用JSON格式。
- 请求头应包含`Content-Type: application/json`。
- 对于上传文件的请求，应使用`multipart/form-data`。

### 响应格式

所有API响应均为JSON格式，包含以下字段：

```json
{
  "success": true,          // 请求是否成功
  "message": "操作成功",     // 响应消息
  "code": 200,              // 响应代码
  "data": { ... }           // 响应数据
}
```

### 错误处理

当API请求失败时，响应格式如下：

```json
{
  "success": false,
  "message": "错误描述",
  "code": 40001,            // 错误代码
  "errors": [ ... ]         // 详细错误信息（可选）
}
```

常见错误代码：

| 代码 | 描述 |
|------|------|
| 40001 | 参数错误 |
| 40100 | 未授权 |
| 40101 | 会话过期 |
| 40300 | 权限不足 |
| 40400 | 资源不存在 |
| 50000 | 服务器内部错误 |

### 分页

列表类API支持分页，使用以下请求参数：

- `page`：页码，从1开始
- `size`：每页条数
- `sort`：排序字段
- `order`：排序方向，`asc`（升序）或`desc`（降序）

分页响应格式：

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "items": [ ... ],       // 当前页数据
    "total": 100,           // 总记录数
    "page": 1,              // 当前页码
    "size": 10,             // 每页条数
    "pages": 10             // 总页数
  }
}
```

### 速率限制

为保护系统资源，API请求有速率限制。限制信息会在响应头中返回：

- `X-RateLimit-Limit`：时间窗口内允许的最大请求数
- `X-RateLimit-Remaining`：当前时间窗口内剩余的请求数
- `X-RateLimit-Reset`：速率限制重置的时间（Unix时间戳）

## API参考

### 认证相关接口

#### 用户登录

- **URL**: `/auth/login`
- **方法**: `POST`
- **描述**: 使用用户名和密码登录，获取访问令牌
- **请求体**:
  ```json
  {
    "username": "user123",
    "password": "your_password",
    "remember": true           // 可选，是否延长令牌有效期
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "登录成功",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600,
      "token_type": "Bearer",
      "user": {
        "id": 1,
        "username": "user123",
        "email": "user@example.com",
        "nickname": "用户昵称",
        "role": "user",
        "is_active": true,
        "created_at": "2023-01-01T00:00:00Z"
      }
    }
  }
  ```

#### 刷新令牌

- **URL**: `/auth/refresh`
- **方法**: `POST`
- **描述**: 使用刷新令牌获取新的访问令牌
- **请求体**:
  ```json
  {
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "刷新成功",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600,
      "token_type": "Bearer"
    }
  }
  ```

#### 用户注册

- **URL**: `/auth/register`
- **方法**: `POST`
- **描述**: 注册新用户
- **请求体**:
  ```json
  {
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "your_password",
    "confirm_password": "your_password",
    "verification_code": "123456"     // 邮箱验证码
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "注册成功",
    "data": {
      "user_id": 2,
      "username": "newuser",
      "email": "newuser@example.com"
    }
  }
  ```

#### 发送验证码

- **URL**: `/auth/verification-code`
- **方法**: `POST`
- **描述**: 发送邮箱验证码（用于注册或重置密码）
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "purpose": "register"            // register 或 reset_password
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "验证码已发送",
    "data": {
      "expires_in": 300              // 验证码有效期（秒）
    }
  }
  ```

#### 重置密码

- **URL**: `/auth/reset-password`
- **方法**: `POST`
- **描述**: 通过验证码重置密码
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "verification_code": "123456",
    "new_password": "new_password",
    "confirm_password": "new_password"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "密码重置成功",
    "data": null
  }
  ```

#### 退出登录

- **URL**: `/auth/logout`
- **方法**: `POST`
- **描述**: 注销当前用户会话，使令牌失效
- **请求体**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "退出成功",
    "data": null
  }
  ```

### 用户相关接口

#### 获取当前用户信息

- **URL**: `/users/me`
- **方法**: `GET`
- **描述**: 获取当前登录用户的详细信息
- **请求参数**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "id": 1,
      "username": "user123",
      "email": "user@example.com",
      "nickname": "用户昵称",
      "role": "user",
      "is_active": true,
      "created_at": "2023-01-01T00:00:00Z",
      "last_login": "2023-05-10T12:30:45Z",
      "task_count": 5,
      "aliyun_status": {
        "is_connected": true,
        "nick_name": "阿里云盘用户",
        "user_id": "aliyun123456",
        "expire_time": "2023-06-10T00:00:00Z"
      }
    }
  }
  ```

#### 更新用户资料

- **URL**: `/users/me`
- **方法**: `PUT`
- **描述**: 更新当前登录用户的资料
- **请求体**:
  ```json
  {
    "nickname": "新昵称",
    "avatar": "avatar_url"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "更新成功",
    "data": {
      "id": 1,
      "username": "user123",
      "email": "user@example.com",
      "nickname": "新昵称",
      "avatar": "avatar_url"
    }
  }
  ```

#### 修改密码

- **URL**: `/users/me/password`
- **方法**: `PUT`
- **描述**: 修改当前登录用户的密码
- **请求体**:
  ```json
  {
    "current_password": "old_password",
    "new_password": "new_password",
    "confirm_password": "new_password"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "密码修改成功",
    "data": null
  }
  ```

#### 获取用户操作日志

- **URL**: `/users/me/logs`
- **方法**: `GET`
- **描述**: 获取当前用户的操作日志
- **请求参数**:
  - `page`: 页码（默认1）
  - `size`: 每页条数（默认10）
  - `start_date`: 开始日期（可选）
  - `end_date`: 结束日期（可选）
  - `type`: 日志类型（可选）
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "items": [
        {
          "id": 1,
          "user_id": 1,
          "action": "LOGIN",
          "description": "用户登录",
          "ip_address": "192.168.1.1",
          "user_agent": "Mozilla/5.0...",
          "created_at": "2023-05-10T12:30:45Z"
        },
        // ...更多日志条目
      ],
      "total": 50,
      "page": 1,
      "size": 10,
      "pages": 5
    }
  }
  ```

### 阿里云盘相关接口

#### 获取阿里云盘登录二维码

- **URL**: `/aliyun/qrcode`
- **方法**: `GET`
- **描述**: 获取阿里云盘登录的二维码信息
- **请求参数**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "qrcode_url": "https://example.com/qrcode.png",
      "qrcode_content": "https://auth.aliyundrive.com/...",
      "sid": "device_session_id",
      "expires_in": 120
    }
  }
  ```

#### 检查阿里云盘登录状态

- **URL**: `/aliyun/check-login`
- **方法**: `GET`
- **描述**: 检查阿里云盘登录状态
- **请求参数**:
  - `sid`: 二维码会话ID
- **响应**:
  ```json
  {
    "success": true,
    "message": "登录成功",
    "data": {
      "status": "CONFIRMED",       // PENDING, CONFIRMED, EXPIRED
      "user_info": {
        "nick_name": "阿里云盘用户",
        "user_id": "aliyun123456",
        "avatar": "avatar_url",
        "expire_time": "2023-06-10T00:00:00Z"
      }
    }
  }
  ```

#### 获取阿里云盘文件夹列表

- **URL**: `/aliyun/folders`
- **方法**: `GET`
- **描述**: 获取阿里云盘文件夹列表
- **请求参数**:
  - `parent_id`: 父文件夹ID（可选，默认为根目录）
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "items": [
        {
          "folder_id": "folder123",
          "name": "文档",
          "parent_id": "root",
          "path": "/文档",
          "created_at": "2023-01-15T10:20:30Z",
          "updated_at": "2023-03-20T14:25:36Z",
          "has_children": true
        },
        // ...更多文件夹
      ]
    }
  }
  ```

#### 刷新阿里云盘授权

- **URL**: `/aliyun/refresh-token`
- **方法**: `POST`
- **描述**: 刷新阿里云盘授权，延长有效期
- **请求体**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "刷新成功",
    "data": {
      "expire_time": "2023-07-10T00:00:00Z"
    }
  }
  ```

#### 断开阿里云盘连接

- **URL**: `/aliyun/disconnect`
- **方法**: `POST`
- **描述**: 断开与阿里云盘的连接
- **请求体**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "已断开连接",
    "data": null
  }
  ```

### 任务相关接口

#### 获取任务列表

- **URL**: `/tasks`
- **方法**: `GET`
- **描述**: 获取当前用户创建的任务列表
- **请求参数**:
  - `page`: 页码（默认1）
  - `size`: 每页条数（默认10）
  - `status`: 任务状态（可选，`active`或`disabled`）
  - `sort`: 排序字段（可选）
  - `order`: 排序方向（可选）
  - `keyword`: 搜索关键词（可选）
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "items": [
        {
          "id": 1,
          "name": "每日同步课程资料",
          "share_url": "https://www.aliyundrive.com/s/abcdef",
          "target_folder": "/学习资料/课程",
          "schedule_type": "cron",
          "schedule_value": "0 8 * * *",
          "next_execution_time": "2023-05-11T08:00:00Z",
          "last_execution_time": "2023-05-10T08:00:00Z",
          "last_execution_status": "success",
          "is_active": true,
          "created_at": "2023-01-01T00:00:00Z",
          "updated_at": "2023-05-10T08:00:05Z",
          "success_count": 130,
          "failure_count": 2,
          "success_rate": 98.5
        },
        // ...更多任务
      ],
      "total": 5,
      "page": 1,
      "size": 10,
      "pages": 1
    }
  }
  ```

#### 获取任务详情

- **URL**: `/tasks/{task_id}`
- **方法**: `GET`
- **描述**: 获取指定任务的详细信息
- **请求参数**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "id": 1,
      "name": "每日同步课程资料",
      "share_url": "https://www.aliyundrive.com/s/abcdef",
      "share_password": "1234",
      "target_folder": "/学习资料/课程",
      "file_filter": "*.pdf,*.doc",
      "schedule_type": "cron",
      "schedule_value": "0 8 * * *",
      "conflict_strategy": "overwrite",
      "retry_count": 3,
      "retry_interval": 300,
      "next_execution_time": "2023-05-11T08:00:00Z",
      "last_execution_time": "2023-05-10T08:00:00Z",
      "last_execution_status": "success",
      "is_active": true,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-05-10T08:00:05Z",
      "statistics": {
        "total_executions": 132,
        "success_count": 130,
        "failure_count": 2,
        "success_rate": 98.5,
        "total_files_synced": 2650,
        "total_size_synced": 1258291200
      }
    }
  }
  ```

#### 创建任务

- **URL**: `/tasks`
- **方法**: `POST`
- **描述**: 创建新的同步任务
- **请求体**:
  ```json
  {
    "name": "每日同步课程资料",
    "share_url": "https://www.aliyundrive.com/s/abcdef",
    "share_password": "1234",          // 可选
    "target_folder": "/学习资料/课程",
    "file_filter": "*.pdf,*.doc",      // 可选
    "schedule_type": "cron",           // cron 或 interval
    "schedule_value": "0 8 * * *",     // cron表达式或间隔秒数
    "conflict_strategy": "overwrite",  // overwrite 或 skip
    "retry_count": 3,                  // 可选
    "retry_interval": 300,             // 可选，单位秒
    "is_active": true                  // 可选，默认true
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "创建成功",
    "data": {
      "id": 1,
      "name": "每日同步课程资料",
      "share_url": "https://www.aliyundrive.com/s/abcdef",
      "target_folder": "/学习资料/课程",
      "schedule_type": "cron",
      "schedule_value": "0 8 * * *",
      "next_execution_time": "2023-05-11T08:00:00Z",
      "is_active": true,
      "created_at": "2023-05-10T15:30:45Z"
    }
  }
  ```

#### 更新任务

- **URL**: `/tasks/{task_id}`
- **方法**: `PUT`
- **描述**: 更新指定任务的信息
- **请求体**: 与创建任务相同，所有字段均为可选
- **响应**:
  ```json
  {
    "success": true,
    "message": "更新成功",
    "data": {
      "id": 1,
      "name": "更新后的任务名称",
      "share_url": "https://www.aliyundrive.com/s/abcdef",
      "target_folder": "/学习资料/课程",
      "schedule_type": "cron",
      "schedule_value": "0 9 * * *",   // 更新为早上9点
      "next_execution_time": "2023-05-11T09:00:00Z",
      "is_active": true,
      "updated_at": "2023-05-10T16:20:30Z"
    }
  }
  ```

#### 删除任务

- **URL**: `/tasks/{task_id}`
- **方法**: `DELETE`
- **描述**: 删除指定任务
- **请求参数**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "删除成功",
    "data": null
  }
  ```

#### 启用/禁用任务

- **URL**: `/tasks/{task_id}/toggle`
- **方法**: `POST`
- **描述**: 切换任务的启用/禁用状态
- **请求体**:
  ```json
  {
    "is_active": true    // 或false
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "任务已启用",    // 或"任务已禁用"
    "data": {
      "id": 1,
      "is_active": true,
      "next_execution_time": "2023-05-11T09:00:00Z"
    }
  }
  ```

#### 立即执行任务

- **URL**: `/tasks/{task_id}/execute`
- **方法**: `POST`
- **描述**: 立即执行指定任务
- **请求体**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "任务已加入执行队列",
    "data": {
      "execution_id": "exec123456",
      "task_id": 1,
      "status": "queued",
      "queue_time": "2023-05-10T16:25:30Z"
    }
  }
  ```

#### 获取任务执行记录

- **URL**: `/tasks/{task_id}/executions`
- **方法**: `GET`
- **描述**: 获取指定任务的执行记录
- **请求参数**:
  - `page`: 页码（默认1）
  - `size`: 每页条数（默认10）
  - `status`: 执行状态（可选）
  - `start_date`: 开始日期（可选）
  - `end_date`: 结束日期（可选）
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "items": [
        {
          "id": "exec123456",
          "task_id": 1,
          "start_time": "2023-05-10T08:00:00Z",
          "end_time": "2023-05-10T08:00:45Z",
          "status": "success",
          "duration": 45,
          "files_synced": 20,
          "files_failed": 0,
          "total_size": 102400000,
          "error_message": null
        },
        // ...更多执行记录
      ],
      "total": 132,
      "page": 1,
      "size": 10,
      "pages": 14
    }
  }
  ```

#### 获取执行记录详情

- **URL**: `/executions/{execution_id}`
- **方法**: `GET`
- **描述**: 获取指定执行记录的详细信息
- **请求参数**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "id": "exec123456",
      "task_id": 1,
      "task_name": "每日同步课程资料",
      "share_url": "https://www.aliyundrive.com/s/abcdef",
      "target_folder": "/学习资料/课程",
      "start_time": "2023-05-10T08:00:00Z",
      "end_time": "2023-05-10T08:00:45Z",
      "status": "success",
      "trigger_type": "scheduled",     // 或 manual
      "duration": 45,
      "files_synced": 20,
      "files_failed": 0,
      "total_size": 102400000,
      "error_message": null,
      "log": "任务开始执行...\n发现20个文件需要同步...\n...",
      "files": [
        {
          "name": "lecture1.pdf",
          "size": 5242880,
          "status": "success",
          "sync_time": "2023-05-10T08:00:15Z"
        },
        // ...更多文件记录
      ]
    }
  }
  ```

### 管理员接口

#### 获取系统概览

- **URL**: `/admin/dashboard`
- **方法**: `GET`
- **描述**: 获取系统概览信息（仅管理员）
- **请求参数**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "user_stats": {
        "total_users": 150,
        "active_users": 120,
        "new_users_today": 5,
        "active_rate": 80
      },
      "task_stats": {
        "total_tasks": 750,
        "active_tasks": 680,
        "executions_today": 1250,
        "success_rate": 98.5
      },
      "system_stats": {
        "cpu_usage": 35.2,
        "memory_usage": 60.5,
        "disk_usage": 42.8,
        "db_size": 256000000
      },
      "recent_events": [
        {
          "time": "2023-05-10T16:30:45Z",
          "type": "ERROR",
          "message": "数据库连接池接近上限"
        },
        // ...更多事件
      ],
      "service_status": {
        "web": "running",
        "db": "running",
        "redis": "running",
        "celery": "running"
      }
    }
  }
  ```

#### 获取用户列表

- **URL**: `/admin/users`
- **方法**: `GET`
- **描述**: 获取所有用户列表（仅管理员）
- **请求参数**:
  - 标准分页参数
  - `status`: 用户状态（可选）
  - `role`: 用户角色（可选）
  - `keyword`: 搜索关键词（可选）
- **响应**: 与其他列表接口类似，返回用户列表及分页信息

#### 获取用户详情

- **URL**: `/admin/users/{user_id}`
- **方法**: `GET`
- **描述**: 获取指定用户的详细信息（仅管理员）
- **请求参数**: 无
- **响应**: 返回用户详细信息，包括基本信息、统计数据、阿里云盘状态等

#### 启用/禁用用户

- **URL**: `/admin/users/{user_id}/toggle`
- **方法**: `POST`
- **描述**: 启用或禁用指定用户（仅管理员）
- **请求体**:
  ```json
  {
    "is_active": false,             // 或true
    "notify_user": true,            // 可选，是否通知用户
    "reason": "账号违规操作"         // 可选，禁用原因
  }
  ```
- **响应**: 返回用户状态更新结果

#### 重置用户密码

- **URL**: `/admin/users/{user_id}/reset-password`
- **方法**: `POST`
- **描述**: 重置指定用户的密码（仅管理员）
- **请求体**:
  ```json
  {
    "new_password": "新密码",       // 可选，不提供则生成随机密码
    "notify_user": true             // 可选，是否通知用户
  }
  ```
- **响应**: 返回密码重置结果

#### 获取所有任务

- **URL**: `/admin/tasks`
- **方法**: `GET`
- **描述**: 获取所有用户的任务列表（仅管理员）
- **请求参数**: 标准分页参数，可按用户、状态等筛选
- **响应**: 与普通任务列表类似，但包含所有用户的任务

#### 获取系统日志

- **URL**: `/admin/logs`
- **方法**: `GET`
- **描述**: 获取系统日志（仅管理员）
- **请求参数**:
  - 标准分页参数
  - `level`: 日志级别（可选）
  - `type`: 日志类型（可选）
  - `user_id`: 用户ID（可选）
  - `start_date`: 开始日期（可选）
  - `end_date`: 结束日期（可选）
- **响应**: 返回系统日志列表及分页信息

#### 获取所有执行记录

- **URL**: `/admin/executions`
- **方法**: `GET`
- **描述**: 获取所有任务的执行记录（仅管理员）
- **请求参数**: 标准分页参数，可按任务、用户、状态等筛选
- **响应**: 返回执行记录列表及分页信息

#### 获取系统设置

- **URL**: `/admin/settings`
- **方法**: `GET`
- **描述**: 获取系统设置（仅管理员）
- **请求参数**: 无
- **响应**: 返回系统设置信息

#### 更新系统设置

- **URL**: `/admin/settings`
- **方法**: `PUT`
- **描述**: 更新系统设置（仅管理员）
- **请求体**: 需要更新的设置项
- **响应**: 返回更新后的系统设置

#### 添加管理员

- **URL**: `/admin/admins`
- **方法**: `POST`
- **描述**: 添加新的管理员账户（仅超级管理员）
- **请求体**:
  ```json
  {
    "username": "admin2",
    "email": "admin2@example.com",
    "password": "admin_password",
    "permissions": ["user_manage", "log_view"]  // 可选
  }
  ```
- **响应**: 返回新创建的管理员信息

#### 修改管理员密码

- **URL**: `/admin/change-password`
- **方法**: `POST`
- **描述**: 修改管理员自身密码
- **请求体**:
  ```json
  {
    "current_password": "old_password",
    "new_password": "new_password",
    "confirm_password": "new_password"
  }
  ```
- **响应**: 返回密码修改结果

## 附录

### Cron表达式参考

Cron表达式由5个字段组成，分别表示：分钟、小时、日期、月份、星期几。

| 字段 | 允许值 | 允许的特殊字符 |
|------|-------|---------------|
| 分钟 | 0-59  | * , - / |
| 小时 | 0-23  | * , - / |
| 日期 | 1-31  | * , - / ? |
| 月份 | 1-12  | * , - / |
| 星期几 | 0-6 (0是周日) | * , - / ? |

常用Cron表达式示例：

- `0 0 * * *`: 每天凌晨00:00执行
- `0 */2 * * *`: 每2小时执行一次
- `0 8 * * 1-5`: 工作日（周一至周五）上午8:00执行
- `0 20 * * 0,6`: 周六和周日晚上8:00执行
- `0 9-18 * * 1-5`: 工作日上午9点到下午6点，每小时执行一次

### 错误代码详解

| 代码 | 描述 | 可能原因 |
|------|------|---------|
| 40001 | 参数错误 | 请求参数不符合要求，如缺少必填字段或格式错误 |
| 40002 | 验证码错误 | 验证码无效或已过期 |
| 40003 | 资源已存在 | 尝试创建已存在的资源，如用户名已被占用 |
| 40100 | 未授权 | 未提供认证信息或认证信息无效 |
| 40101 | 会话过期 | 令牌已过期，需要重新登录或刷新令牌 |
| 40300 | 权限不足 | 当前用户没有执行请求操作的权限 |
| 40301 | 禁止访问 | 用户账号已被禁用 |
| 40400 | 资源不存在 | 请求的资源不存在，如无效的任务ID |
| 42900 | 请求过多 | 超出API请求速率限制 |
| 50000 | 服务器内部错误 | 服务器处理请求时发生错误 |
| 50001 | 数据库错误 | 数据库操作失败 |
| 50002 | 外部服务错误 | 阿里云盘API调用失败 |

### API版本控制

为保证API向后兼容性，我们采用版本化API设计：

- v1版本为当前稳定版本
- 所有突破性变更将在新版本中发布
- 旧版本API将至少维护12个月

### API状态码

除了自定义的错误代码外，API还使用标准HTTP状态码：

- 200: 请求成功
- 201: 资源创建成功
- 400: 请求参数错误
- 401: 未授权
- 403: 禁止访问
- 404: 资源不存在
- 429: 请求过多
- 500: 服务器内部错误

### API安全建议

1. 使用HTTPS加密所有API通信
2. 定期轮换API密钥和刷新令牌
3. 实现最小权限原则，仅授予必要的API访问权限
4. 监控异常API调用行为
5. 记录所有API访问日志

---

最后更新：2023年10月 