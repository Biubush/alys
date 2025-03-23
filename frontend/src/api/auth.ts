import axios from '../utils/axios';

// 登录接口
export const login = (data: { username: string; password: string; remember?: boolean }) => {
  return axios.post('/auth/login', data);
};

// 刷新令牌接口
export const refreshToken = (data: { refresh_token: string }) => {
  return axios.post('/auth/refresh', data);
};

// 登出接口
export const logout = () => {
  return axios.post('/auth/logout');
};

// 注册接口
export const register = (data: { 
  username: string; 
  email: string; 
  password: string; 
  verification_code: string 
}) => {
  return axios.post('/auth/register', data);
};

// 发送验证码接口
export const sendVerificationCode = (data: { 
  email: string; 
  purpose?: 'register' | 'reset_password'; 
}) => {
  return axios.post('/auth/send-code', data);
};

// 验证密码重置验证码接口
export const verifyResetCode = (data: { 
  email: string; 
  verification_code: string 
}) => {
  return axios.post('/auth/verify-reset-code', data);
};

// 重置密码接口
export const resetPassword = (data: { 
  email: string; 
  verification_code: string; 
  new_password: string 
}) => {
  return axios.post('/auth/reset-password', data);
}; 