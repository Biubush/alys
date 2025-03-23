import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import * as adminApi from '../../api/admin';

// 定义管理员状态的类型
interface AdminState {
  dashboard: {
    totalUsers: number;
    totalTasks: number;
    activeTasks: number;
    todayExecutions: number;
    recentLogs: any[];
  } | null;
  users: any[];
  userDetail: any | null;
  tasks: any[];
  taskDetail: any | null;
  logs: any[];
  executions: any[];
  settings: any | null;
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: AdminState = {
  dashboard: null,
  users: [],
  userDetail: null,
  tasks: [],
  taskDetail: null,
  logs: [],
  executions: [],
  settings: null,
  loading: false,
  error: null,
};

// 获取仪表盘数据异步操作
export const fetchDashboard = createAsyncThunk(
  'admin/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getDashboard();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取仪表盘数据失败');
    }
  }
);

// 获取用户列表异步操作
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params: { page?: number; size?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await adminApi.getUsers(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取用户列表失败');
    }
  }
);

// 获取用户详情异步操作
export const fetchUserById = createAsyncThunk(
  'admin/fetchUserById',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await adminApi.getUserById(userId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取用户详情失败');
    }
  }
);

// 禁用用户异步操作
export const banUser = createAsyncThunk(
  'admin/banUser',
  async ({ userId, notify }: { userId: number; notify?: boolean }, { rejectWithValue }) => {
    try {
      const response = await adminApi.banUser(userId, { 
        ban: true,
        send_notification: notify
      });
      return {
        userId,
        ...response.data
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '禁用用户失败');
    }
  }
);

// 启用用户异步操作
export const enableUser = createAsyncThunk(
  'admin/enableUser',
  async ({ userId, notify }: { userId: number; notify?: boolean }, { rejectWithValue }) => {
    try {
      const response = await adminApi.banUser(userId, { 
        ban: false,
        send_notification: notify
      });
      return {
        userId,
        ...response.data
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '启用用户失败');
    }
  }
);

// 重置用户密码异步操作
export const resetUserPassword = createAsyncThunk(
  'admin/resetUserPassword',
  async ({ userId, newPassword }: { userId: number; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await adminApi.resetUserPassword(userId, { new_password: newPassword });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '重置用户密码失败');
    }
  }
);

// 获取所有任务异步操作
export const fetchAllTasks = createAsyncThunk(
  'admin/fetchAllTasks',
  async (params: { user_id?: number; enabled?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAllTasks(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取任务列表失败');
    }
  }
);

// 获取管理员任务详情异步操作
export const fetchAdminTaskById = createAsyncThunk(
  'admin/fetchAdminTaskById',
  async (taskId: number, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAdminTaskById(taskId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取任务详情失败');
    }
  }
);

// 启用/禁用任务异步操作
export const toggleTask = createAsyncThunk(
  'admin/toggleTask',
  async ({ taskId, enable }: { taskId: number; enable: boolean }, { rejectWithValue }) => {
    try {
      const response = await adminApi.toggleTask(taskId, enable);
      return {
        taskId,
        enabled: enable,
        ...response.data
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || (enable ? '启用任务失败' : '禁用任务失败'));
    }
  }
);

// 获取系统日志异步操作
export const fetchSystemLogs = createAsyncThunk(
  'admin/fetchSystemLogs',
  async (params: { page?: number; size?: number; user_id?: number; action?: string; start_date?: string; end_date?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await adminApi.getSystemLogs(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取系统日志失败');
    }
  }
);

// 获取所有执行记录异步操作
export const fetchAllExecutions = createAsyncThunk(
  'admin/fetchAllExecutions',
  async (params: { page?: number; size?: number; task_id?: number; status?: string; start_date?: string; end_date?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAllExecutions(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取执行记录失败');
    }
  }
);

// 获取系统设置异步操作
export const fetchSystemSettings = createAsyncThunk(
  'admin/fetchSystemSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getSystemSettings();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取系统设置失败');
    }
  }
);

// 更新系统设置异步操作
export const updateSystemSettings = createAsyncThunk(
  'admin/updateSystemSettings',
  async (data: Record<string, any>, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateSystemSettings(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新系统设置失败');
    }
  }
);

// 添加管理员异步操作
export const addAdmin = createAsyncThunk(
  'admin/addAdmin',
  async (data: { username: string; password: string; email: string }, { rejectWithValue }) => {
    try {
      const response = await adminApi.addAdmin(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '添加管理员失败');
    }
  }
);

// 修改管理员密码异步操作
export const changeAdminPassword = createAsyncThunk(
  'admin/changeAdminPassword',
  async (data: { old_password: string; new_password: string }, { rejectWithValue }) => {
    try {
      const response = await adminApi.changeAdminPassword(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '修改密码失败');
    }
  }
);

// 创建管理员切片
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearUserDetail: (state) => {
      state.userDetail = null;
    },
    clearTaskDetail: (state) => {
      state.taskDetail = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 获取仪表盘数据
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 获取用户列表
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 获取用户详情
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.userDetail = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 禁用用户
    builder
      .addCase(banUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(banUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        
        // 更新用户列表
        const index = state.users.findIndex(user => user.id === action.payload.userId);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], is_active: false };
        }
        
        // 更新当前用户详情
        if (state.userDetail && state.userDetail.id === action.payload.userId) {
          state.userDetail = { ...state.userDetail, is_active: false };
        }
        
        message.success('用户已禁用');
      })
      .addCase(banUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 启用用户
    builder
      .addCase(enableUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enableUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        
        // 更新用户列表
        const index = state.users.findIndex(user => user.id === action.payload.userId);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], is_active: true };
        }
        
        // 更新当前用户详情
        if (state.userDetail && state.userDetail.id === action.payload.userId) {
          state.userDetail = { ...state.userDetail, is_active: true };
        }
        
        message.success('用户已启用');
      })
      .addCase(enableUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 重置用户密码
    builder
      .addCase(resetUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.loading = false;
        message.success('用户密码已重置');
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 获取所有任务
    builder
      .addCase(fetchAllTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 获取任务详情
    builder
      .addCase(fetchAdminTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminTaskById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.taskDetail = action.payload;
      })
      .addCase(fetchAdminTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 启用/禁用任务
    builder
      .addCase(toggleTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleTask.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        
        // 更新任务列表
        const index = state.tasks.findIndex(task => task.id === action.payload.taskId);
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], is_enabled: action.payload.enabled };
        }
        
        // 更新当前任务详情
        if (state.taskDetail && state.taskDetail.id === action.payload.taskId) {
          state.taskDetail = { ...state.taskDetail, is_enabled: action.payload.enabled };
        }
        
        message.success(action.payload.enabled ? '任务已启用' : '任务已禁用');
      })
      .addCase(toggleTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 获取系统日志
    builder
      .addCase(fetchSystemLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemLogs.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchSystemLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 获取所有执行记录
    builder
      .addCase(fetchAllExecutions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllExecutions.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.executions = action.payload;
      })
      .addCase(fetchAllExecutions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 获取系统设置
    builder
      .addCase(fetchSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 更新系统设置
    builder
      .addCase(updateSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSystemSettings.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.settings = action.payload;
        message.success('系统设置已更新');
      })
      .addCase(updateSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 添加管理员
    builder
      .addCase(addAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAdmin.fulfilled, (state) => {
        state.loading = false;
        message.success('管理员添加成功');
      })
      .addCase(addAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 修改管理员密码
    builder
      .addCase(changeAdminPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeAdminPassword.fulfilled, (state) => {
        state.loading = false;
        message.success('密码修改成功');
      })
      .addCase(changeAdminPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });
  },
});

export const { clearUserDetail, clearTaskDetail, clearError } = adminSlice.actions;
export default adminSlice.reducer; 