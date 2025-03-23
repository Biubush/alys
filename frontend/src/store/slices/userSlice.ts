import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import * as userApi from '../../api/user';

// 定义用户状态的类型
interface UserState {
  profile: any | null;
  aliyunLoggedIn: boolean;
  folders: any[];
  logs: any[];
  executions: any[];
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: UserState = {
  profile: null,
  aliyunLoggedIn: false,
  folders: [],
  logs: [],
  executions: [],
  loading: false,
  error: null,
};

// 获取用户资料异步操作
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getUserProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取用户资料失败');
    }
  }
);

// 更新用户资料异步操作
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: { nickname?: string; email?: string }, { rejectWithValue }) => {
    try {
      const response = await userApi.updateUserProfile(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新用户资料失败');
    }
  }
);

// 修改密码异步操作
export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (data: { old_password: string; new_password: string }, { rejectWithValue }) => {
    try {
      const response = await userApi.changePassword(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '修改密码失败');
    }
  }
);

// 登录阿里云盘异步操作
export const loginAliyun = createAsyncThunk(
  'user/loginAliyun',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.loginAliyun();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '登录阿里云盘失败');
    }
  }
);

// 获取阿里云盘文件夹异步操作
export const fetchAliyunFolders = createAsyncThunk(
  'user/fetchAliyunFolders',
  async (parentId: string = 'root', { rejectWithValue }) => {
    try {
      const response = await userApi.getAliyunFolders(parentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取阿里云盘文件夹失败');
    }
  }
);

// 获取用户日志异步操作
export const fetchUserLogs = createAsyncThunk(
  'user/fetchLogs',
  async (params: {
    page?: number;
    per_page?: number;
    level?: string;
    category?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await userApi.getUserLogs(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取用户日志失败');
    }
  }
);

// 获取任务执行记录异步操作
export const fetchUserExecutions = createAsyncThunk(
  'user/fetchExecutions',
  async (params: {
    page?: number;
    per_page?: number;
    status?: string;
    task_id?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await userApi.getUserExecutions(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取任务执行记录失败');
    }
  }
);

// 创建用户切片
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 获取用户资料
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.profile = action.payload;
        state.aliyunLoggedIn = action.payload.is_aliyun_logged_in || false;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 更新用户资料
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.profile = { ...state.profile, ...action.payload };
        message.success('个人资料已更新');
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 修改密码
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        message.success('密码已修改');
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 登录阿里云盘
    builder
      .addCase(loginAliyun.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAliyun.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // 设置二维码URL或其他返回数据
        state.aliyunLoggedIn = true;
      })
      .addCase(loginAliyun.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 获取阿里云盘文件夹
    builder
      .addCase(fetchAliyunFolders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAliyunFolders.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.folders = action.payload.folders || [];
      })
      .addCase(fetchAliyunFolders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 获取用户日志
    builder
      .addCase(fetchUserLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserLogs.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.logs = action.payload.logs || [];
      })
      .addCase(fetchUserLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 获取任务执行记录
    builder
      .addCase(fetchUserExecutions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserExecutions.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.executions = action.payload.executions || [];
      })
      .addCase(fetchUserExecutions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer; 