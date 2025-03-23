import { request } from './axios';

// 获取用户资料
export const getUserProfile = () => {
  return request({
    url: '/users/profile',
    method: 'GET',
  });
};

// 更新用户资料
export const updateUserProfile = (data: { nickname?: string; email?: string }) => {
  return request({
    url: '/users/profile',
    method: 'PUT',
    data,
  });
};

// 修改密码
export const changePassword = (data: { old_password: string; new_password: string }) => {
  return request({
    url: '/users/change-password',
    method: 'POST',
    data,
  });
};

// 登录阿里云盘
export const loginAliyun = () => {
  return request({
    url: '/users/aliyun/login',
    method: 'GET',
  });
};

// 获取阿里云盘文件夹
export const getAliyunFolders = (parentId = 'root') => {
  return request({
    url: '/users/aliyun/folders',
    method: 'GET',
    params: {
      parent_id: parentId,
    },
  });
};

// 获取用户日志
export const getUserLogs = (params: {
  page?: number;
  per_page?: number;
  level?: string;
  category?: string;
}) => {
  return request({
    url: '/users/logs',
    method: 'GET',
    params,
  });
};

// 获取任务执行记录
export const getUserExecutions = (params: {
  page?: number;
  per_page?: number;
  status?: string;
  task_id?: number;
}) => {
  return request({
    url: '/users/executions',
    method: 'GET',
    params,
  });
}; 