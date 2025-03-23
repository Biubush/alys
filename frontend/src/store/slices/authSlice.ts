import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import * as authApi from '../../api/auth';

// 定义认证状态的类型
interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: AuthState = {
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

// 登录异步操作
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '登录失败');
    }
  }
);

// 注册异步操作
export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    username: string;
    password: string;
    email: string;
    nickname?: string;
    code: string;
  }, { rejectWithValue }) => {
    try {
      const response = await authApi.register({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        verification_code: userData.code
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '注册失败');
    }
  }
);

// 刷新令牌异步操作
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (!state.auth.refreshToken) {
        throw new Error('没有刷新令牌');
      }
      const response = await authApi.refreshToken({ refresh_token: state.auth.refreshToken });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '刷新令牌失败');
    }
  }
);

// 创建认证切片
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 注销
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      // 调用API进行服务器端注销
      authApi.logout().catch(() => {
        // 即使服务器注销失败，我们也会在客户端进行注销
      });
    },
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 登录操作处理
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        
        // 保存到localStorage
        localStorage.setItem('token', action.payload.access_token);
        localStorage.setItem('refreshToken', action.payload.refresh_token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        
        message.success('登录成功');
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string || '登录失败');
      });

    // 注册操作处理
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        message.success('注册成功，请登录');
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string || '注册失败');
      });

    // 刷新令牌操作处理
    builder
      .addCase(refreshToken.fulfilled, (state, action: PayloadAction<any>) => {
        state.token = action.payload.access_token;
        localStorage.setItem('token', action.payload.access_token);
      })
      .addCase(refreshToken.rejected, (state) => {
        // 如果刷新令牌失败，注销用户
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 