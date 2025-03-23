import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import * as taskApi from '../../api/task';

// 定义任务状态的类型
interface TaskState {
  list: any[];
  current: any | null;
  executions: any[];
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: TaskState = {
  list: [],
  current: null,
  executions: [],
  loading: false,
  error: null,
};

// 获取任务列表异步操作
export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async (params: { search?: string; enabled_only?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTasks(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取任务列表失败');
    }
  }
);

// 获取任务详情异步操作
export const fetchTaskById = createAsyncThunk(
  'task/fetchTaskById',
  async (taskId: number, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTaskById(taskId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取任务详情失败');
    }
  }
);

// 创建任务异步操作
export const createTask = createAsyncThunk(
  'task/createTask',
  async (data: {
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
  }, { rejectWithValue }) => {
    try {
      const response = await taskApi.createTask(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '创建任务失败');
    }
  }
);

// 更新任务异步操作
export const updateTask = createAsyncThunk(
  'task/updateTask',
  async ({ taskId, data }: {
    taskId: number;
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
    };
  }, { rejectWithValue }) => {
    try {
      const response = await taskApi.updateTask(taskId, data);
      return { 
        taskId,
        ...response.data
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新任务失败');
    }
  }
);

// 删除任务异步操作
export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (taskId: number, { rejectWithValue }) => {
    try {
      await taskApi.deleteTask(taskId);
      return { taskId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '删除任务失败');
    }
  }
);

// 启用任务异步操作
export const enableTask = createAsyncThunk(
  'task/enableTask',
  async (taskId: number, { rejectWithValue }) => {
    try {
      const response = await taskApi.enableTask(taskId);
      return {
        taskId,
        ...response.data
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '启用任务失败');
    }
  }
);

// 禁用任务异步操作
export const disableTask = createAsyncThunk(
  'task/disableTask',
  async (taskId: number, { rejectWithValue }) => {
    try {
      const response = await taskApi.disableTask(taskId);
      return {
        taskId,
        ...response.data
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '禁用任务失败');
    }
  }
);

// 立即执行任务异步操作
export const runTask = createAsyncThunk(
  'task/runTask',
  async (taskId: number, { rejectWithValue }) => {
    try {
      const response = await taskApi.runTask(taskId);
      return {
        taskId,
        ...response.data
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '执行任务失败');
    }
  }
);

// 获取任务执行记录异步操作
export const fetchTaskExecutions = createAsyncThunk(
  'task/fetchTaskExecutions',
  async (taskId: number, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTaskExecutions(taskId);
      return {
        taskId,
        executions: response.data
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取任务执行记录失败');
    }
  }
);

// 验证分享链接异步操作
export const validateShare = createAsyncThunk(
  'task/validateShare',
  async (data: { share_id: string; share_password?: string }, { rejectWithValue }) => {
    try {
      const response = await taskApi.validateShare(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '验证分享链接失败');
    }
  }
);

// 创建任务切片
const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    clearCurrent: (state) => {
      state.current = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 获取任务列表
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 获取任务详情
    builder
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.current = action.payload;
        state.executions = action.payload.executions || [];
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 创建任务
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        message.success('任务创建成功');
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 更新任务
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        
        // 更新列表中的任务
        const index = state.list.findIndex(task => task.id === action.payload.taskId);
        if (index !== -1) {
          state.list[index] = { ...state.list[index], ...action.payload };
        }
        
        // 更新当前查看的任务
        if (state.current && state.current.id === action.payload.taskId) {
          state.current = { ...state.current, ...action.payload };
        }
        
        message.success('任务更新成功');
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 删除任务
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<{ taskId: number }>) => {
        state.loading = false;
        state.list = state.list.filter(task => task.id !== action.payload.taskId);
        
        if (state.current && state.current.id === action.payload.taskId) {
          state.current = null;
        }
        
        message.success('任务已删除');
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 启用任务
    builder
      .addCase(enableTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enableTask.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        
        // 更新列表中的任务
        const index = state.list.findIndex(task => task.id === action.payload.taskId);
        if (index !== -1) {
          state.list[index] = { ...state.list[index], is_enabled: true };
        }
        
        // 更新当前查看的任务
        if (state.current && state.current.id === action.payload.taskId) {
          state.current = { ...state.current, is_enabled: true };
        }
        
        message.success('任务已启用');
      })
      .addCase(enableTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 禁用任务
    builder
      .addCase(disableTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disableTask.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        
        // 更新列表中的任务
        const index = state.list.findIndex(task => task.id === action.payload.taskId);
        if (index !== -1) {
          state.list[index] = { ...state.list[index], is_enabled: false };
        }
        
        // 更新当前查看的任务
        if (state.current && state.current.id === action.payload.taskId) {
          state.current = { ...state.current, is_enabled: false };
        }
        
        message.success('任务已禁用');
      })
      .addCase(disableTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 立即执行任务
    builder
      .addCase(runTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runTask.fulfilled, (state) => {
        state.loading = false;
        message.success('任务已开始执行');
      })
      .addCase(runTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 获取任务执行记录
    builder
      .addCase(fetchTaskExecutions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskExecutions.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.executions = action.payload.executions;
      })
      .addCase(fetchTaskExecutions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });

    // 验证分享链接
    builder
      .addCase(validateShare.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateShare.fulfilled, (state) => {
        state.loading = false;
        message.success('分享链接验证成功');
      })
      .addCase(validateShare.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        message.error(action.payload as string);
      });
  },
});

export const { clearCurrent, clearError } = taskSlice.actions;
export default taskSlice.reducer; 