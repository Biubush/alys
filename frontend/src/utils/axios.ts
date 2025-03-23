import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

// 创建axios实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从Redux store或localStorage获取token
    const state = store.getState();
    const token = state.auth.token;
    
    // 如果有token则添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;
      
      // 未认证，可能是token过期
      if (status === 401) {
        // 清除用户信息并重定向到登录页面
        store.dispatch(logout());
        window.location.href = '/auth/login';
        message.error('登录已过期，请重新登录');
      } 
      // 服务器错误
      else if (status >= 500) {
        message.error('服务器错误，请稍后再试');
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message.error('网络错误，请检查您的网络连接');
    } else {
      // 设置请求时发生的错误
      message.error('请求错误，请稍后再试');
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