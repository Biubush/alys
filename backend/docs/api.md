# 阿里云盘同步系统 API 文档

本文档详细说明了阿里云盘同步系统的后端API接口，包括认证、用户、任务和管理员相关接口。

## 目录

- [通用规范](#通用规范)
- [认证相关](#认证相关)
- [用户相关](#用户相关)
- [任务相关](#任务相关)
- [管理员相关](#管理员相关)

## 通用规范

### 基础URL

所有API请求的基础URL为：`/api/v1`

### 认证方式

除了登录、注册等公开接口外，所有API都需要进行JWT认证。在请求头中添加以下字段：

```
Authorization: Bearer <access_token>
```

### 响应格式

所有API响应均采用JSON格式，基本结构如下：

```json
{
  "success": true/false,        // 请求是否成功
  "message": "返回的消息提示",    // 成功或错误提示信息
  "data": { ... }              // 返回的数据，失败时可能不包含此字段
}
```

### 错误处理

当请求失败时，会返回对应的HTTP状态码和错误信息：

```json
{
  "success": false,
  "message": "错误原因"
}
```

常见的HTTP状态码：

- `200` - 请求成功
- `400` - 请求参数错误
- `401` - 未认证或认证失败
- `403` - 无权限访问
- `404` - 资源不存在
- `500` - 服务器内部错误

## 认证相关

### 注册

注册新用户账号。

- **URL**: `/auth/register`
- **方法**: `POST`
- **认证**: 无需认证
- **请求参数**:

```json
{
  "username": "用户名",
  "password": "密码",
  "email": "邮箱地址",
  "nickname": "昵称",
  "code": "邮箱验证码"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "username": "用户名",
    "email": "邮箱地址",
    "nickname": "昵称"
  }
}
```

### 发送验证码

发送邮箱验证码。

- **URL**: `/auth/send-code`
- **方法**: `POST`
- **认证**: 无需认证
- **请求参数**:

```json
{
  "email": "邮箱地址",
  "purpose": "register/reset_password/login" // 验证码用途
}
```

- **响应**:

```json
{
  "success": true,
  "message": "验证码已发送到邮箱"
}
```

### 登录

用户登录，获取访问令牌。

- **URL**: `/auth/login`
- **方法**: `POST`
- **认证**: 无需认证
- **请求参数**:

```json
{
  "username": "用户名",
  "password": "密码"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "access_token": "访问令牌",
    "refresh_token": "刷新令牌",
    "user": {
      "id": 1,
      "username": "用户名",
      "nickname": "昵称",
      "email": "邮箱地址",
      "is_banned": false,
      "last_login": "2023-03-01T12:34:56"
    }
  }
}
```

### 刷新令牌

刷新访问令牌。

- **URL**: `/auth/refresh`
- **方法**: `POST`
- **认证**: 需要刷新令牌
- **响应**:

```json
{
  "success": true,
  "message": "令牌已刷新",
  "data": {
    "access_token": "新的访问令牌"
  }
}
```

### 找回密码

发起找回密码流程。

- **URL**: `/auth/recover-password`
- **方法**: `POST`
- **认证**: 无需认证
- **请求参数**:

```json
{
  "email": "邮箱地址",
  "code": "验证码",
  "new_password": "新密码"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "密码已重置"
}
```

### 注销

用户注销。

- **URL**: `/auth/logout`
- **方法**: `POST`
- **认证**: 需要认证
- **响应**:

```json
{
  "success": true,
  "message": "注销成功"
}
```

## 用户相关

### 获取个人资料

获取当前用户的个人资料。

- **URL**: `/users/profile`
- **方法**: `GET`
- **认证**: 需要认证
- **响应**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "用户名",
    "nickname": "昵称",
    "email": "邮箱地址",
    "is_banned": false,
    "last_login": "2023-03-01T12:34:56",
    "created_at": "2023-01-01T12:00:00",
    "task_count": 5,
    "active_task_count": 2,
    "is_aliyun_logged_in": true
  }
}
```

### 更新个人资料

更新当前用户的个人资料。

- **URL**: `/users/profile`
- **方法**: `PUT`
- **认证**: 需要认证
- **请求参数**:

```json
{
  "nickname": "新昵称",
  "email": "新邮箱地址"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "个人资料已更新",
  "data": {
    "nickname": "新昵称",
    "email": "新邮箱地址"
  }
}
```

### 修改密码

修改当前用户的密码。

- **URL**: `/users/change-password`
- **方法**: `POST`
- **认证**: 需要认证
- **请求参数**:

```json
{
  "old_password": "旧密码",
  "new_password": "新密码"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "密码已修改"
}
```

### 登录阿里云盘

登录阿里云盘获取授权。

- **URL**: `/users/aliyun/login`
- **方法**: `GET`
- **认证**: 需要认证
- **响应**:

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "qrcode_url": "/static/img/qrcode/username.png"
  }
}
```

### 获取阿里云盘文件夹

获取阿里云盘文件夹列表。

- **URL**: `/users/aliyun/folders`
- **方法**: `GET`
- **认证**: 需要认证
- **请求参数(查询字符串)**:
  - `parent_id`: 父文件夹ID，默认为"root"

- **响应**:

```json
{
  "success": true,
  "data": {
    "folders": [
      {
        "file_id": "文件夹ID",
        "name": "文件夹名称",
        "created_at": "2023-01-01T12:00:00",
        "updated_at": "2023-01-01T12:00:00"
      }
    ]
  }
}
```

### 获取日志列表

获取当前用户的日志记录。

- **URL**: `/users/logs`
- **方法**: `GET`
- **认证**: 需要认证
- **请求参数(查询字符串)**:
  - `page`: 页码，默认为1
  - `per_page`: 每页条数，默认为20
  - `level`: 日志级别，可选
  - `category`: 日志类别，可选

- **响应**:

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "level": "info",
        "category": "auth",
        "message": "用户登录成功",
        "ip_address": "127.0.0.1",
        "created_at": "2023-03-01T12:34:56"
      }
    ],
    "pagination": {
      "total": 100,
      "pages": 5,
      "page": 1,
      "per_page": 20
    }
  }
}
```

### 获取任务执行记录

获取当前用户的任务执行记录。

- **URL**: `/users/executions`
- **方法**: `GET`
- **认证**: 需要认证
- **请求参数(查询字符串)**:
  - `page`: 页码，默认为1
  - `per_page`: 每页条数，默认为20
  - `status`: 状态筛选，可选
  - `task_id`: 任务ID筛选，可选

- **响应**:

```json
{
  "success": true,
  "data": {
    "executions": [
      {
        "id": 1,
        "task_id": 1,
        "task_name": "任务名称",
        "status": "success",
        "start_time": "2023-03-01T12:30:00",
        "end_time": "2023-03-01T12:35:00",
        "duration": 300,
        "files_scanned": 100,
        "files_saved": 50,
        "files_skipped": 50,
        "error_message": null
      }
    ],
    "pagination": {
      "total": 50,
      "pages": 3,
      "page": 1,
      "per_page": 20
    }
  }
}
```

## 任务相关

### 获取任务列表

获取当前用户的所有任务。

- **URL**: `/tasks`
- **方法**: `GET`
- **认证**: 需要认证
- **请求参数(查询字符串)**:
  - `search`: 搜索关键词，可选
  - `enabled_only`: 是否只返回已启用的任务，可选

- **响应**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "任务名称",
      "type": 0,
      "share_id": "分享ID",
      "source_folder_id": "源文件夹ID",
      "target_folder_id": "目标文件夹ID",
      "folder_name": "文件夹名称",
      "share_password": "分享密码",
      "schedule": {},
      "interval": 3600,
      "next_run": "2023-03-01T18:00:00",
      "is_enabled": true,
      "is_running": false,
      "created_at": "2023-03-01T12:00:00"
    }
  ]
}
```

### 获取任务详情

获取单个任务的详细信息。

- **URL**: `/tasks/{task_id}`
- **方法**: `GET`
- **认证**: 需要认证
- **响应**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "任务名称",
    "type": 0,
    "share_id": "分享ID",
    "source_folder_id": "源文件夹ID",
    "target_folder_id": "目标文件夹ID",
    "target_folder_name": "目标文件夹名称",
    "folder_name": "文件夹名称",
    "share_password": "分享密码",
    "schedule": {},
    "interval": 3600,
    "next_run": "2023-03-01T18:00:00",
    "is_enabled": true,
    "is_running": false,
    "created_at": "2023-03-01T12:00:00",
    "executions": [
      {
        "id": 1,
        "status": "success",
        "start_time": "2023-03-01T12:30:00",
        "end_time": "2023-03-01T12:35:00",
        "files_scanned": 100,
        "files_saved": 50,
        "files_skipped": 50,
        "error_message": null
      }
    ]
  }
}
```

### 创建任务

创建新的同步任务。

- **URL**: `/tasks`
- **方法**: `POST`
- **认证**: 需要认证
- **请求参数**:

```json
{
  "name": "任务名称",
  "share_id": "分享ID",
  "source_folder_id": "源文件夹ID",
  "target_folder_id": "目标文件夹ID",
  "folder_name": "文件夹名称",
  "share_password": "分享密码",
  "type": 0,
  "schedule": {},
  "interval": 3600,
  "is_enabled": true
}
```

- **响应**:

```json
{
  "success": true,
  "message": "任务创建成功",
  "data": {
    "id": 1,
    "name": "任务名称",
    "next_run": "2023-03-01T18:00:00"
  }
}
```

### 更新任务

更新现有任务的信息。

- **URL**: `/tasks/{task_id}`
- **方法**: `PUT`
- **认证**: 需要认证
- **请求参数**:

```json
{
  "name": "新任务名称",
  "share_id": "新分享ID",
  "source_folder_id": "新源文件夹ID",
  "target_folder_id": "新目标文件夹ID",
  "folder_name": "新文件夹名称",
  "share_password": "新分享密码",
  "type": 1,
  "schedule": {},
  "interval": 7200,
  "is_enabled": false
}
```

- **响应**:

```json
{
  "success": true,
  "message": "任务更新成功",
  "data": {
    "id": 1,
    "name": "新任务名称",
    "next_run": "2023-03-02T18:00:00"
  }
}
```

### 删除任务

删除指定的任务。

- **URL**: `/tasks/{task_id}`
- **方法**: `DELETE`
- **认证**: 需要认证
- **响应**:

```json
{
  "success": true,
  "message": "任务已删除"
}
```

### 启用任务

启用指定的任务。

- **URL**: `/tasks/{task_id}/enable`
- **方法**: `POST`
- **认证**: 需要认证
- **响应**:

```json
{
  "success": true,
  "message": "任务已启用",
  "data": {
    "is_enabled": true
  }
}
```

### 禁用任务

禁用指定的任务。

- **URL**: `/tasks/{task_id}/disable`
- **方法**: `POST`
- **认证**: 需要认证
- **响应**:

```json
{
  "success": true,
  "message": "任务已禁用",
  "data": {
    "is_enabled": false
  }
}
```

### 立即执行任务

立即执行指定的任务。

- **URL**: `/tasks/{task_id}/run`
- **方法**: `POST`
- **认证**: 需要认证
- **响应**:

```json
{
  "success": true,
  "message": "任务已开始执行"
}
```

### 获取任务执行记录

获取指定任务的执行记录。

- **URL**: `/tasks/{task_id}/executions`
- **方法**: `GET`
- **认证**: 需要认证
- **响应**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": "success",
      "start_time": "2023-03-01T12:30:00",
      "end_time": "2023-03-01T12:35:00",
      "duration": 300,
      "files_scanned": 100,
      "files_saved": 50,
      "files_skipped": 50,
      "error_message": null
    }
  ]
}
```

### 验证分享链接

验证阿里云盘分享链接是否有效。

- **URL**: `/tasks/validate-share`
- **方法**: `POST`
- **认证**: 需要认证
- **请求参数**:

```json
{
  "share_id": "分享ID",
  "share_password": "分享密码"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "分享链接有效",
  "data": {
    "share_id": "分享ID",
    "share_name": "分享名称",
    "create_time": "2023-03-01T12:00:00"
  }
}
```

## 管理员相关

### 获取系统概览

获取系统整体数据概览。

- **URL**: `/admin/dashboard`
- **方法**: `GET`
- **认证**: 需要管理员权限
- **响应**:

```json
{
  "success": true,
  "data": {
    "user_count": 100,
    "active_user_count": 80,
    "task_count": 500,
    "active_task_count": 300,
    "execution_count": 10000,
    "today_execution_count": 200,
    "recent_logs": [
      {
        "id": 1,
        "level": "info",
        "category": "system",
        "message": "系统启动",
        "created_at": "2023-03-01T12:00:00"
      }
    ],
    "system_info": {
      "cpu_usage": 0.35,
      "memory_usage": 0.45,
      "disk_usage": 0.25,
      "uptime": "10天2小时30分钟"
    }
  }
}
```

### 获取用户列表

获取系统中的所有用户。

- **URL**: `/admin/users`
- **方法**: `GET`
- **认证**: 需要管理员权限
- **请求参数(查询字符串)**:
  - `page`: 页码，默认为1
  - `per_page`: 每页条数，默认为20
  - `search`: 搜索关键词，可选

- **响应**:

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "用户名",
        "nickname": "昵称",
        "email": "邮箱地址",
        "is_banned": false,
        "task_count": 5,
        "created_at": "2023-01-01T12:00:00",
        "last_login": "2023-03-01T12:34:56"
      }
    ],
    "pagination": {
      "total": 100,
      "pages": 5,
      "page": 1,
      "per_page": 20
    }
  }
}
```

### 获取用户详情

获取特定用户的详细信息。

- **URL**: `/admin/users/{user_id}`
- **方法**: `GET`
- **认证**: 需要管理员权限
- **响应**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "用户名",
    "nickname": "昵称",
    "email": "邮箱地址",
    "is_banned": false,
    "created_at": "2023-01-01T12:00:00",
    "last_login": "2023-03-01T12:34:56",
    "tasks": [
      {
        "id": 1,
        "name": "任务名称",
        "share_id": "分享ID",
        "type": 0,
        "is_enabled": true,
        "next_run": "2023-03-01T18:00:00",
        "created_at": "2023-03-01T12:00:00"
      }
    ],
    "logs": [
      {
        "id": 1,
        "level": "info",
        "category": "auth",
        "message": "用户登录成功",
        "ip_address": "127.0.0.1",
        "created_at": "2023-03-01T12:34:56"
      }
    ]
  }
}
```

### 禁用/启用用户

禁用或启用特定用户。

- **URL**: `/admin/users/{user_id}/ban`
- **方法**: `POST`
- **认证**: 需要管理员权限
- **请求参数**:

```json
{
  "ban": true,             // true表示禁用，false表示启用
  "reason": "禁用原因",
  "send_notification": true  // 是否发送邮件通知用户
}
```

- **响应**:

```json
{
  "success": true,
  "message": "用户已禁用",
  "data": {
    "is_banned": true
  }
}
```

### 重置用户密码

重置特定用户的密码。

- **URL**: `/admin/users/{user_id}/reset-password`
- **方法**: `POST`
- **认证**: 需要管理员权限
- **响应**:

```json
{
  "success": true,
  "message": "密码已重置并发送到用户邮箱"
}
```

### 获取所有任务列表

获取系统中的所有任务。

- **URL**: `/admin/tasks`
- **方法**: `GET`
- **认证**: 需要管理员权限
- **请求参数(查询字符串)**:
  - `page`: 页码，默认为1
  - `per_page`: 每页条数，默认为20
  - `search`: 搜索关键词，可选
  - `user_id`: 用户ID筛选，可选
  - `enabled`: 是否启用筛选，可选

- **响应**:

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 1,
        "name": "任务名称",
        "user_id": 1,
        "username": "用户名",
        "share_id": "分享ID",
        "type": 0,
        "is_enabled": true,
        "next_run": "2023-03-01T18:00:00",
        "created_at": "2023-03-01T12:00:00"
      }
    ],
    "pagination": {
      "total": 500,
      "pages": 25,
      "page": 1,
      "per_page": 20
    }
  }
}
```

### 获取任务详情

获取特定任务的详细信息（管理员视角）。

- **URL**: `/admin/tasks/{task_id}`
- **方法**: `GET`
- **认证**: 需要管理员权限
- **响应**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "任务名称",
    "user_id": 1,
    "username": "用户名",
    "share_id": "分享ID",
    "source_folder_id": "源文件夹ID",
    "target_folder_id": "目标文件夹ID",
    "folder_name": "文件夹名称",
    "share_password": "分享密码",
    "type": 0,
    "schedule": {},
    "interval": 3600,
    "next_run": "2023-03-01T18:00:00",
    "is_enabled": true,
    "created_at": "2023-03-01T12:00:00",
    "executions": [
      {
        "id": 1,
        "status": "success",
        "start_time": "2023-03-01T12:30:00",
        "end_time": "2023-03-01T12:35:00",
        "files_scanned": 100,
        "files_saved": 50,
        "files_skipped": 50,
        "error_message": null
      }
    ]
  }
}
```

### 启用/禁用任务

管理员启用或禁用特定任务。

- **URL**: `/admin/tasks/{task_id}/toggle`
- **方法**: `POST`
- **认证**: 需要管理员权限
- **请求参数**:

```json
{
  "enable": true  // true表示启用，false表示禁用
}
```

- **响应**:

```json
{
  "success": true,
  "message": "任务已启用",
  "data": {
    "is_enabled": true
  }
}
```

### 获取系统日志

获取系统全局日志。

- **URL**: `/admin/logs`
- **方法**: `GET`
- **认证**: 需要管理员权限
- **请求参数(查询字符串)**:
  - `page`: 页码，默认为1
  - `per_page`: 每页条数，默认为20
  - `level`: 日志级别筛选，可选
  - `category`: 日志类别筛选，可选
  - `user_id`: 用户ID筛选，可选
  - `admin_id`: 管理员ID筛选，可选

- **响应**:

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "user_id": 1,
        "username": "用户名",
        "admin_id": null,
        "level": "info",
        "category": "auth",
        "message": "用户登录成功",
        "ip_address": "127.0.0.1",
        "created_at": "2023-03-01T12:34:56"
      }
    ],
    "pagination": {
      "total": 10000,
      "pages": 500,
      "page": 1,
      "per_page": 20
    }
  }
}
```

### 获取任务执行记录

获取系统全局任务执行记录。

- **URL**: `/admin/executions`
- **方法**: `GET`
- **认证**: 需要管理员权限
- **请求参数(查询字符串)**:
  - `page`: 页码，默认为1
  - `per_page`: 每页条数，默认为20
  - `status`: 状态筛选，可选
  - `task_id`: 任务ID筛选，可选
  - `user_id`: 用户ID筛选，可选

- **响应**:

```json
{
  "success": true,
  "data": {
    "executions": [
      {
        "id": 1,
        "task_id": 1,
        "task_name": "任务名称",
        "user_id": 1,
        "username": "用户名",
        "status": "success",
        "start_time": "2023-03-01T12:30:00",
        "end_time": "2023-03-01T12:35:00",
        "duration": 300,
        "files_scanned": 100,
        "files_saved": 50,
        "files_skipped": 50,
        "error_message": null
      }
    ],
    "pagination": {
      "total": 10000,
      "pages": 500,
      "page": 1,
      "per_page": 20
    }
  }
}
```

### 获取系统设置

获取系统配置设置。

- **URL**: `/admin/settings`
- **方法**: `GET`
- **认证**: 需要管理员权限
- **响应**:

```json
{
  "success": true,
  "data": {
    "website": "网站名称",
    "port": 8587,
    "mail_settings": {
      "mail_user": "邮箱用户名",
      "mail_sender": "发送邮箱地址",
      "mail_receiver": "接收邮箱地址"
    },
    "schedule_settings": {
      "max_instances": 3,
      "misfire_grace_time": 60
    }
  }
}
```

### 更新系统设置

更新系统配置设置。

- **URL**: `/admin/settings`
- **方法**: `PUT`
- **认证**: 需要管理员权限
- **请求参数**:

```json
{
  "website": "新网站名称",
  "port": 8588,
  "mail_settings": {
    "mail_user": "新邮箱用户名",
    "mail_password": "新邮箱密码",
    "mail_sender": "新发送邮箱地址",
    "mail_receiver": "新接收邮箱地址"
  }
}
```

- **响应**:

```json
{
  "success": true,
  "message": "系统设置已更新"
}
```

### 添加管理员

添加新的管理员账号。

- **URL**: `/admin/admins`
- **方法**: `POST`
- **认证**: 需要管理员权限
- **请求参数**:

```json
{
  "username": "管理员用户名",
  "password": "密码",
  "email": "邮箱地址"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "管理员账号已创建",
  "data": {
    "id": 2,
    "username": "管理员用户名"
  }
}
```

### 修改管理员密码

修改当前管理员的密码。

- **URL**: `/admin/change-password`
- **方法**: `POST`
- **认证**: 需要管理员权限
- **请求参数**:

```json
{
  "old_password": "旧密码",
  "new_password": "新密码"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "密码已修改"
}
``` 