import { request } from './axios';

// 获取系统概览
export const getDashboard = () => {
  return request({
    url: '/admin/dashboard',
    method: 'GET',
  });
};

// 获取用户列表
export const getUsers = (params?: {
  page?: number;
  per_page?: number;
  search?: string;
}) => {
  return request({
    url: '/admin/users',
    method: 'GET',
    params,
  });
};

// 获取用户详情
export const getUserById = (userId: number) => {
  return request({
    url: `/admin/users/${userId}`,
    method: 'GET',
  });
};

// 禁用/启用用户
export const banUser = (userId: number, data: {
  ban: boolean;
  reason?: string;
  send_notification?: boolean;
}) => {
  return request({
    url: `/admin/users/${userId}/ban`,
    method: 'POST',
    data,
  });
};

// 重置用户密码
export const resetUserPassword = (userId: number, data: {
  new_password: string;
}) => {
  return request({
    url: `/admin/users/${userId}/reset-password`,
    method: 'POST',
    data,
  });
};

// 获取所有任务列表
export const getAllTasks = (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  user_id?: number;
  enabled?: boolean;
}) => {
  return request({
    url: '/admin/tasks',
    method: 'GET',
    params,
  });
};

// 获取任务详情（管理员视角）
export const getAdminTaskById = (taskId: number) => {
  return request({
    url: `/admin/tasks/${taskId}`,
    method: 'GET',
  });
};

// 启用/禁用任务（管理员操作）
export const toggleTask = (taskId: number, enable: boolean) => {
  return request({
    url: `/admin/tasks/${taskId}/toggle`,
    method: 'POST',
    data: { enable },
  });
};

// 获取系统日志
export const getSystemLogs = (params?: {
  page?: number;
  per_page?: number;
  level?: string;
  category?: string;
  user_id?: number;
  admin_id?: number;
}) => {
  return request({
    url: '/admin/logs',
    method: 'GET',
    params,
  });
};

// 获取全局任务执行记录
export const getAllExecutions = (params?: {
  page?: number;
  per_page?: number;
  status?: string;
  task_id?: number;
  user_id?: number;
}) => {
  return request({
    url: '/admin/executions',
    method: 'GET',
    params,
  });
};

// 获取系统设置
export const getSystemSettings = () => {
  return request({
    url: '/admin/settings',
    method: 'GET',
  });
};

// 更新系统设置
export const updateSystemSettings = (data: Record<string, any>) => {
  return request({
    url: '/admin/settings',
    method: 'PUT',
    data,
  });
};

// 添加管理员
export const addAdmin = (data: {
  username: string;
  password: string;
  email: string;
}) => {
  return request({
    url: '/admin/admins',
    method: 'POST',
    data,
  });
};

// 修改管理员密码
export const changeAdminPassword = (data: {
  old_password: string;
  new_password: string;
}) => {
  return request({
    url: '/admin/change-password',
    method: 'POST',
    data,
  });
}; 