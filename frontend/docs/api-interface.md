# 阿里云盘同步系统前端API接口文档

## 概述

本文档详细说明前端与后端API的交互，包括接口地址、请求方法、参数和响应格式等。前端通过Axios库发起HTTP请求与后端进行通信，所有接口均遵循RESTful API设计规范。

## 基础配置

- **基础URL**: `/api/v1`
- **请求头**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}` (认证请求)
- **响应格式**: 所有接口返回JSON格式数据

## 错误处理

所有API错误响应遵循统一格式：

```json
{
  "success": false,
  "message": "错误描述信息",
  "code": 40001,  // 错误代码
  "data": null    // 可选的额外错误信息
}
```

常见错误代码：
- `40001`: 参数错误
- `40100`: 未授权
- `40101`: 会话过期
- `40300`: 权限不足
- `40400`: 资源不存在
- `50000`: 服务器内部错误

## 认证相关接口

### 1. 用户登录

- **URL**: `/auth/login`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码",
    "remember": true  // 可选，是否记住登录状态
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "登录成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600,  // token有效期（秒）
      "user": {
        "id": 1,
        "username": "用户名",
        "email": "user@example.com",
        "nickname": "昵称",
        "role": "user",  // 角色：user或admin
        "is_active": true,
        "created_at": "2023-01-01T00:00:00Z"
      }
    }
  }
  ```

### 2. 刷新令牌

- **URL**: `/auth/refresh`
- **方法**: `POST`
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
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600
    }
  }
  ```

### 3. 用户注册

- **URL**: `/auth/register`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "新用户名",
    "email": "user@example.com",
    "password": "密码",
    "verification_code": "123456"  // 邮箱验证码
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "注册成功",
    "data": {
      "user_id": 1,
      "username": "新用户名",
      "email": "user@example.com"
    }
  }
  ```

### 4. 发送验证码

- **URL**: `/auth/send-code`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "purpose": "register"  // 用途：register或reset_password
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "验证码已发送",
    "data": {
      "email": "user@example.com",
      "expires_in": 300  // 验证码有效期（秒）
    }
  }
  ```

### 5. 验证重置密码验证码

- **URL**: `/auth/verify-reset-code`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "verification_code": "123456"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "验证码有效",
    "data": {
      "valid": true,
      "reset_token": "abcdef123456"  // 可用于重置密码的临时令牌
    }
  }
  ```

### 6. 重置密码

- **URL**: `/auth/reset-password`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "verification_code": "123456",
    "new_password": "新密码"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "密码已重置",
    "data": null
  }
  ```

### 7. 退出登录

- **URL**: `/auth/logout`
- **方法**: `POST`
- **请求体**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "已退出登录",
    "data": null
  }
  ```

## 用户相关接口

### 1. 获取用户资料

- **URL**: `/users/profile`
- **方法**: `GET`
- **请求参数**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "id": 1,
      "username": "用户名",
      "email": "user@example.com",
      "nickname": "昵称",
      "role": "user",
      "is_active": true,
      "created_at": "2023-01-01T00:00:00Z",
      "aliyun_login_status": true,  // 阿里云盘登录状态
      "last_login": "2023-01-10T00:00:00Z"
    }
  }
  ```

### 2. 更新用户资料

- **URL**: `/users/profile`
- **方法**: `PUT`
- **请求体**:
  ```json
  {
    "nickname": "新昵称",
    "email": "newemail@example.com"  // 可选
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "更新成功",
    "data": {
      "id": 1,
      "username": "用户名",
      "email": "newemail@example.com",
      "nickname": "新昵称",
      "updated_at": "2023-01-15T00:00:00Z"
    }
  }
  ```

### 3. 修改密码

- **URL**: `/users/change-password`
- **方法**: `POST`
- **请求体**:
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
    "message": "密码已修改",
    "data": null
  }
  ```

### 4. 登录阿里云盘

- **URL**: `/users/aliyun/login`
- **方法**: `GET`
- **请求参数**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "qrcode_url": "https://example.com/qrcode.png",
      "qrcode_content": "二维码内容",
      "expires_in": 120  // 二维码有效期（秒）
    }
  }
  ```

### 5. 检查阿里云盘登录状态

- **URL**: `/users/aliyun/login/status`
- **方法**: `GET`
- **请求参数**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "status": "pending",  // pending, success, failed
      "user_info": null  // 登录成功时返回用户信息
    }
  }
  ```

### 6. 获取阿里云盘文件夹

- **URL**: `/users/aliyun/folders`
- **方法**: `GET`
- **请求参数**:
  - `parent_id`: 父文件夹ID（默认为"root"）
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "folders": [
        {
          "folder_id": "folder_1",
          "name": "文件夹1",
          "parent_id": "root",
          "created_at": "2023-01-01T00:00:00Z",
          "updated_at": "2023-01-01T00:00:00Z",
          "has_children": true
        },
        // ...更多文件夹
      ]
    }
  }
  ```

### 7. 获取用户日志

- **URL**: `/users/logs`
- **方法**: `GET`
- **请求参数**:
  - `page`: 页码（默认1）
  - `per_page`: 每页记录数（默认20）
  - `level`: 日志级别（可选）
  - `category`: 日志类别（可选）
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "logs": [
        {
          "id": 1,
          "level": "info",
          "category": "user",
          "message": "用户登录",
          "details": {},
          "created_at": "2023-01-01T00:00:00Z"
        },
        // ...更多日志
      ],
      "total": 100,
      "page": 1,
      "per_page": 20
    }
  }
  ```

### 8. 获取任务执行记录

- **URL**: `/users/executions`
- **方法**: `GET`
- **请求参数**:
  - `page`: 页码（默认1）
  - `per_page`: 每页记录数（默认20）
  - `status`: 状态筛选（可选）
  - `task_id`: 任务ID筛选（可选）
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "executions": [
        {
          "id": 1,
          "task_id": 1,
          "task_name": "任务名称",
          "status": "success",
          "start_time": "2023-01-01T00:00:00Z",
          "end_time": "2023-01-01T00:01:00Z",
          "files_scanned": 100,
          "files_synced": 50,
          "error_message": null
        },
        // ...更多执行记录
      ],
      "total": 50,
      "page": 1,
      "per_page": 20
    }
  }
  ```

## 任务相关接口

### 1. 获取任务列表

- **URL**: `/tasks`
- **方法**: `GET`
- **请求参数**:
  - `search`: 搜索关键词（可选）
  - `enabled_only`: 仅显示已启用任务（可选布尔值）
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "tasks": [
        {
          "id": 1,
          "name": "任务名称",
          "type": 1,  // 1:定时任务，2:间隔任务
          "share_id": "阿里云盘分享ID",
          "source_folder_id": "源文件夹ID",
          "target_folder_id": "目标文件夹ID",
          "is_enabled": true,
          "last_execution_status": "success",
          "last_execution_time": "2023-01-01T00:00:00Z",
          "next_execution_time": "2023-01-02T00:00:00Z",
          "created_at": "2022-12-01T00:00:00Z",
          "updated_at": "2022-12-01T00:00:00Z"
        },
        // ...更多任务
      ]
    }
  }
  ```

### 2. 获取任务详情

- **URL**: `/tasks/{task_id}`
- **方法**: `GET`
- **请求参数**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "id": 1,
      "name": "任务名称",
      "type": 1,
      "share_id": "阿里云盘分享ID",
      "source_folder_id": "源文件夹ID",
      "target_folder_id": "目标文件夹ID",
      "folder_name": "文件夹名称",
      "share_password": "分享密码",
      "schedule": {
        "expression": "0 0 * * *",
        "next_run": "2023-01-02T00:00:00Z"
      },
      "interval": null,
      "is_enabled": true,
      "created_at": "2022-12-01T00:00:00Z",
      "updated_at": "2022-12-01T00:00:00Z",
      "last_execution": {
        "id": 10,
        "status": "success",
        "start_time": "2023-01-01T00:00:00Z",
        "end_time": "2023-01-01T00:01:00Z",
        "files_scanned": 100,
        "files_synced": 50
      },
      "executions": [
        // 最近的5条执行记录
      ]
    }
  }
  ```

### 3. 创建任务

- **URL**: `/tasks`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "name": "任务名称",
    "share_id": "阿里云盘分享ID",
    "source_folder_id": "源文件夹ID",
    "target_folder_id": "目标文件夹ID",
    "folder_name": "文件夹名称",  // 可选
    "share_password": "分享密码",  // 可选
    "type": 1,  // 1:定时任务，2:间隔任务
    "schedule": {  // type=1时必填
      "expression": "0 0 * * *"  // cron表达式
    },
    "interval": 3600,  // type=2时必填，间隔秒数
    "is_enabled": true  // 是否启用
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "创建成功",
    "data": {
      "id": 2,
      "name": "任务名称",
      // ...其他任务信息
    }
  }
  ```

### 4. 更新任务

- **URL**: `/tasks/{task_id}`
- **方法**: `PUT`
- **请求体**: 与创建任务相同，所有字段都是可选的
- **响应**:
  ```json
  {
    "success": true,
    "message": "更新成功",
    "data": {
      "id": 2,
      "name": "新任务名称",
      // ...更新后的任务信息
    }
  }
  ```

### 5. 删除任务

- **URL**: `/tasks/{task_id}`
- **方法**: `DELETE`
- **请求参数**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "删除成功",
    "data": null
  }
  ```

### 6. 启用/禁用任务

- **URL**: `/tasks/{task_id}/toggle`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "enable": true  // true启用，false禁用
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "任务已启用",  // 或"任务已禁用"
    "data": {
      "id": 1,
      "is_enabled": true,
      "next_execution_time": "2023-01-02T00:00:00Z"  // 如果启用了任务
    }
  }
  ```

### 7. 立即执行任务

- **URL**: `/tasks/{task_id}/execute`
- **方法**: `POST`
- **请求体**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "任务执行已开始",
    "data": {
      "execution_id": 20,
      "task_id": 1,
      "status": "running"
    }
  }
  ```

### 8. 任务执行记录

- **URL**: `/tasks/{task_id}/executions`
- **方法**: `GET`
- **请求参数**:
  - `page`: 页码（默认1）
  - `per_page`: 每页记录数（默认20）
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "executions": [
        {
          "id": 20,
          "status": "success",
          "start_time": "2023-01-05T00:00:00Z",
          "end_time": "2023-01-05T00:01:00Z",
          "files_scanned": 150,
          "files_synced": 75,
          "error_message": null
        },
        // ...更多执行记录
      ],
      "total": 30,
      "page": 1,
      "per_page": 20
    }
  }
  ```

### 9. 验证分享链接

- **URL**: `/tasks/validate-share`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "share_url": "https://www.aliyundrive.com/s/abcdef",
    "share_password": "密码"  // 可选
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "链接有效",
    "data": {
      "share_id": "abcdef",
      "creator_name": "分享者名称",
      "share_name": "分享名称",
      "folder_id": "root"
    }
  }
  ```

## 管理员相关接口

### 1. 获取系统概览

- **URL**: `/admin/dashboard`
- **方法**: `GET`
- **请求参数**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "total_users": 100,
      "active_users": 80,
      "total_tasks": 500,
      "active_tasks": 300,
      "today_executions": 150,
      "success_rate": 0.95,
      "recent_logs": [
        // 最近10条系统日志
      ]
    }
  }
  ```

### 2. 获取用户列表

- **URL**: `/admin/users`
- **方法**: `GET`
- **请求参数**:
  - `page`: 页码（默认1）
  - `per_page`: 每页记录数（默认20）
  - `search`: 搜索关键词（可选）
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "users": [
        {
          "id": 1,
          "username": "用户名",
          "email": "email@example.com",
          "nickname": "昵称",
          "role": "user",
          "is_active": true,
          "created_at": "2023-01-01T00:00:00Z",
          "last_login": "2023-01-10T00:00:00Z",
          "tasks_count": 5
        },
        // ...更多用户
      ],
      "total": 100,
      "page": 1,
      "per_page": 20
    }
  }
  ```

### 3. 获取用户详情

- **URL**: `/admin/users/{user_id}`
- **方法**: `GET`
- **请求参数**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "id": 1,
      "username": "用户名",
      "email": "email@example.com",
      "nickname": "昵称",
      "role": "user",
      "is_active": true,
      "created_at": "2023-01-01T00:00:00Z",
      "last_login": "2023-01-10T00:00:00Z",
      "aliyun_login_status": true,
      "tasks": [
        // 用户的任务列表
      ],
      "recent_logs": [
        // 用户的最近日志
      ]
    }
  }
  ```

### 4. 禁用/启用用户

- **URL**: `/admin/users/{user_id}/ban`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "ban": true,  // true禁用，false启用
    "reason": "违反规定",  // 可选，禁用原因
    "send_notification": true  // 可选，是否发送通知
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "用户已禁用",  // 或"用户已启用"
    "data": {
      "user_id": 1,
      "is_active": false,
      "ban_reason": "违反规定",
      "notification_sent": true
    }
  }
  ```

### 5. 重置用户密码

- **URL**: `/admin/users/{user_id}/reset-password`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "new_password": "新密码"  // 可选，不提供则生成随机密码
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "密码已重置",
    "data": {
      "user_id": 1,
      "new_password": "随机生成的密码"  // 仅当未提供新密码时返回
    }
  }
  ```

### 6. 获取所有任务

- **URL**: `/admin/tasks`
- **方法**: `GET`
- **请求参数**:
  - `page`: 页码（默认1）
  - `per_page`: 每页记录数（默认20）
  - `search`: 搜索关键词（可选）
  - `user_id`: 用户ID筛选（可选）
  - `enabled`: 启用状态筛选（可选布尔值）
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "tasks": [
        {
          "id": 1,
          "name": "任务名称",
          "user_id": 1,
          "username": "用户名",
          "type": 1,
          "is_enabled": true,
          "last_execution_status": "success",
          "last_execution_time": "2023-01-01T00:00:00Z",
          "created_at": "2022-12-01T00:00:00Z"
        },
        // ...更多任务
      ],
      "total": 500,
      "page": 1,
      "per_page": 20
    }
  }
  ```

### 7. 获取任务详情（管理员视角）

- **URL**: `/admin/tasks/{task_id}`
- **方法**: `GET`
- **请求参数**: 无
- **响应**: 与普通任务详情类似，但包含更多管理信息

### 8. 启用/禁用任务（管理员操作）

- **URL**: `/admin/tasks/{task_id}/toggle`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "enable": true  // true启用，false禁用
  }
  ```
- **响应**: 与普通任务切换状态类似

### 9. 获取系统日志

- **URL**: `/admin/logs`
- **方法**: `GET`
- **请求参数**:
  - `page`: 页码（默认1）
  - `per_page`: 每页记录数（默认20）
  - `level`: 日志级别（可选）
  - `category`: 日志类别（可选）
  - `user_id`: 用户ID（可选）
  - `admin_id`: 管理员ID（可选）
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "logs": [
        {
          "id": 1,
          "level": "info",
          "category": "system",
          "message": "系统启动",
          "details": {},
          "user_id": null,
          "admin_id": 1,
          "created_at": "2023-01-01T00:00:00Z"
        },
        // ...更多日志
      ],
      "total": 1000,
      "page": 1,
      "per_page": 20
    }
  }
  ```

### 10. 获取所有执行记录

- **URL**: `/admin/executions`
- **方法**: `GET`
- **请求参数**:
  - `page`: 页码（默认1）
  - `per_page`: 每页记录数（默认20）
  - `status`: 状态筛选（可选）
  - `task_id`: 任务ID筛选（可选）
  - `user_id`: 用户ID筛选（可选）
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "executions": [
        {
          "id": 1,
          "task_id": 1,
          "task_name": "任务名称",
          "user_id": 1,
          "username": "用户名",
          "status": "success",
          "start_time": "2023-01-01T00:00:00Z",
          "end_time": "2023-01-01T00:01:00Z",
          "files_scanned": 100,
          "files_synced": 50,
          "error_message": null
        },
        // ...更多执行记录
      ],
      "total": 5000,
      "page": 1,
      "per_page": 20
    }
  }
  ```

### 11. 获取系统设置

- **URL**: `/admin/settings`
- **方法**: `GET`
- **请求参数**: 无
- **响应**:
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "system": {
        "max_tasks_per_user": 10,
        "max_concurrent_tasks": 5,
        "default_task_timeout": 3600,
        "retry_count": 3,
        "retry_interval": 300
      },
      "email": {
        "smtp_server": "smtp.example.com",
        "smtp_port": 587,
        "smtp_username": "user@example.com",
        "smtp_password": "********",  // 密码会被隐藏
        "email_from": "noreply@example.com"
      }
    }
  }
  ```

### 12. 更新系统设置

- **URL**: `/admin/settings`
- **方法**: `PUT`
- **请求体**: 与获取系统设置的响应体data字段结构相同
- **响应**:
  ```json
  {
    "success": true,
    "message": "设置已更新",
    "data": {
      // 更新后的设置
    }
  }
  ```

### 13. 添加管理员

- **URL**: `/admin/add-admin`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "管理员名",
    "email": "admin@example.com",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "管理员添加成功",
    "data": {
      "id": 10,
      "username": "管理员名",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
  ```

### 14. 修改管理员密码

- **URL**: `/admin/change-password`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "current_password": "当前密码",
    "new_password": "新密码"
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

## 接口状态码

所有接口的HTTP状态码规范：

- `200 OK`: 请求成功
- `201 Created`: 资源创建成功
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未授权或Token无效
- `403 Forbidden`: 权限不足
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

## 请求示例

### 使用Axios发送请求示例

```javascript
// 登录请求
const login = async (username, password, remember = false) => {
  try {
    const response = await axios.post('/api/v1/auth/login', {
      username,
      password,
      remember
    });
    
    // 保存Token到localStorage或状态管理库
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('refreshToken', response.data.data.refresh_token);
    
    return response.data;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
};

// 获取用户资料
const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.get('/api/v1/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('获取用户资料失败:', error);
    throw error;
  }
};