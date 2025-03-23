import axios, { AxiosRequestConfig } from 'axios';
import { message } from 'antd';
import store from '../store';
import { refreshToken, logout } from '../store/slices/authSlice';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// 创建axios实例
const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const { auth } = store.getState();
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 处理401错误，尝试刷新Token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const state = store.getState();
        if (state.auth.refreshToken) {
          // 尝试刷新Token
          await store.dispatch(refreshToken());
          
          // 获取新的Token
          const { auth } = store.getState();
          
          // 使用新Token重试请求
          originalRequest.headers.Authorization = `Bearer ${auth.token}`;
          return instance(originalRequest);
        } else {
          // 没有刷新Token，注销用户
          store.dispatch(logout());
          message.error('登录已过期，请重新登录');
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // 刷新Token失败，注销用户
        store.dispatch(logout());
        message.error('登录已过期，请重新登录');
        return Promise.reject(refreshError);
      }
    }
    
    // 处理其他错误
    if (error.response && error.response.data) {
      message.error(error.response.data.message || '请求失败');
    } else {
      message.error('网络错误，请稍后重试');
    }
    
    return Promise.reject(error);
  }
);

// 包装请求方法
export const request = async (config: AxiosRequestConfig) => {
  try {
    return await instance(config);
  } catch (error) {
    return Promise.reject(error);
  }
};

export default instance; 