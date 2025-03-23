import { request } from './axios';

// 获取任务列表
export const getTasks = (params?: { search?: string; enabled_only?: boolean }) => {
  return request({
    url: '/tasks',
    method: 'GET',
    params,
  });
};

// 获取任务详情
export const getTaskById = (taskId: number) => {
  return request({
    url: `/tasks/${taskId}`,
    method: 'GET',
  });
};

// 创建任务
export const createTask = (data: {
  name: string;
  share_id: string;
  source_folder_id: string;
  target_folder_id: string;
  folder_name?: string;
  share_password?: string;
  type: number;
  schedule?: Record<string, any>;
  interval?: number;
  is_enabled: boolean;
}) => {
  return request({
    url: '/tasks',
    method: 'POST',
    data,
  });
};

// 更新任务
export const updateTask = (
  taskId: number,
  data: {
    name?: string;
    share_id?: string;
    source_folder_id?: string;
    target_folder_id?: string;
    folder_name?: string;
    share_password?: string;
    type?: number;
    schedule?: Record<string, any>;
    interval?: number;
    is_enabled?: boolean;
  }
) => {
  return request({
    url: `/tasks/${taskId}`,
    method: 'PUT',
    data,
  });
};

// 删除任务
export const deleteTask = (taskId: number) => {
  return request({
    url: `/tasks/${taskId}`,
    method: 'DELETE',
  });
};

// 启用任务
export const enableTask = (taskId: number) => {
  return request({
    url: `/tasks/${taskId}/enable`,
    method: 'POST',
  });
};

// 禁用任务
export const disableTask = (taskId: number) => {
  return request({
    url: `/tasks/${taskId}/disable`,
    method: 'POST',
  });
};

// 立即执行任务
export const runTask = (taskId: number) => {
  return request({
    url: `/tasks/${taskId}/run`,
    method: 'POST',
  });
};

// 获取任务执行记录
export const getTaskExecutions = (taskId: number) => {
  return request({
    url: `/tasks/${taskId}/executions`,
    method: 'GET',
  });
};

// 验证分享链接
export const validateShare = (data: { share_id: string; share_password?: string }) => {
  return request({
    url: '/tasks/validate-share',
    method: 'POST',
    data,
  });
}; 