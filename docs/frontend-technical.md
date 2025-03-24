# ALYS-Pro 前端技术文档

[返回文档首页](./README.md)

本文档详细描述了ALYS-Pro系统前端的技术架构、设计模式和实现细节，为开发者提供技术参考。

## 技术栈

ALYS-Pro前端采用以下技术栈：

- **核心框架**：React 18 + TypeScript 4.9
- **构建工具**：Vite 4.1
- **UI组件库**：Ant Design 5.3
- **状态管理**：Redux Toolkit 1.9 + React Redux 8.0
- **路由管理**：React Router 6.8
- **HTTP客户端**：Axios 1.3
- **表单处理**：React Hook Form 7.43 + Yup 1.0
- **样式处理**：Sass + CSS Modules
- **图表库**：@ant-design/charts
- **日期处理**：Dayjs 1.11
- **部署**：Docker + Nginx

## 项目结构

```
frontend/
├── public/                 # 静态资源目录
├── src/                    # 源代码目录
│   ├── api/                # API接口定义和请求处理
│   │   ├── auth.ts         # 认证相关API
│   │   ├── task.ts         # 任务相关API
│   │   ├── file.ts         # 文件操作API
│   │   ├── user.ts         # 用户相关API
│   │   └── index.ts        # API统一出口
│   ├── assets/             # 资源文件(图片、字体等)
│   │   ├── images/         # 图片资源
│   │   └── styles/         # 全局样式
│   ├── components/         # 可复用组件
│   │   ├── common/         # 通用组件
│   │   ├── forms/          # 表单组件
│   │   ├── layouts/        # 布局组件
│   │   └── feedback/       # 反馈组件
│   ├── hooks/              # 自定义钩子
│   │   ├── useAuth.ts      # 认证相关钩子
│   │   ├── useTask.ts      # 任务相关钩子
│   │   └── useFile.ts      # 文件操作钩子
│   ├── pages/              # 页面组件
│   │   ├── auth/           # 认证页面
│   │   ├── dashboard/      # 仪表盘页面
│   │   ├── tasks/          # 任务管理页面
│   │   ├── files/          # 文件管理页面
│   │   ├── settings/       # 设置页面
│   │   └── admin/          # 管理员页面
│   ├── router/             # 路由配置
│   │   ├── routes.tsx      # 路由定义
│   │   ├── AuthRoute.tsx   # 路由权限控制
│   │   └── index.tsx       # 路由入口
│   ├── store/              # Redux状态管理
│   │   ├── slices/         # Redux切片
│   │   ├── hooks.ts        # Redux钩子
│   │   └── index.ts        # Store配置
│   ├── styles/             # 样式文件
│   │   ├── variables.scss  # SCSS变量
│   │   ├── mixins.scss     # SCSS混合
│   │   └── global.scss     # 全局样式
│   ├── utils/              # 工具函数
│   │   ├── auth.ts         # 认证工具
│   │   ├── format.ts       # 格式化工具
│   │   ├── storage.ts      # 存储工具
│   │   └── validate.ts     # 验证工具
│   ├── App.tsx             # 应用根组件
│   ├── index.tsx           # 应用入口
│   └── vite-env.d.ts       # Vite类型声明
├── package.json            # 项目依赖和脚本
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
├── .env                    # 环境变量
├── Dockerfile              # Docker配置
└── nginx.conf              # Nginx配置
```

## 核心技术实现

### 状态管理

系统使用Redux Toolkit进行全局状态管理，按功能模块划分切片：

#### 认证状态切片

```tsx
// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '@/api/auth';
import { setToken, removeToken } from '@/utils/auth';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      setToken(response.data.access_token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      removeToken();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

#### 任务状态切片

```tsx
// src/store/slices/taskSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskApi } from '@/api/task';

export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTasks();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'task/createTask',
  async (taskData: TaskData, { rejectWithValue }) => {
    try {
      const response = await taskApi.createTask(taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create task');
    }
  }
);

const taskSlice = createSlice({
  name: 'task',
  initialState: {
    tasks: [],
    loading: false,
    error: null,
    currentTask: null,
  },
  reducers: {
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks cases
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create task cases
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentTask } = taskSlice.actions;
export default taskSlice.reducer;
```

### 路由管理

系统使用React Router进行路由管理，并实现了基于角色的路由保护：

```tsx
// src/router/routes.tsx
import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import AuthLayout from '@/components/layouts/AuthLayout';
import LoadingPage from '@/components/common/LoadingPage';

// Lazy load pages
const Dashboard = lazy(() => import('@/pages/dashboard'));
const TaskList = lazy(() => import('@/pages/tasks/TaskList'));
const TaskCreate = lazy(() => import('@/pages/tasks/TaskCreate'));
const FileManager = lazy(() => import('@/pages/files/FileManager'));
const Settings = lazy(() => import('@/pages/settings'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const AdminUsers = lazy(() => import('@/pages/admin/Users'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));

// Wrap lazy components with Suspense
const lazyLoad = (Component) => (
  <Suspense fallback={<LoadingPage />}>
    <Component />
  </Suspense>
);

const routes = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'dashboard',
        element: lazyLoad(Dashboard),
        meta: { requiresAuth: true },
      },
      {
        path: 'tasks',
        element: lazyLoad(TaskList),
        meta: { requiresAuth: true },
      },
      {
        path: 'tasks/create',
        element: lazyLoad(TaskCreate),
        meta: { requiresAuth: true },
      },
      {
        path: 'tasks/edit/:id',
        element: lazyLoad(TaskCreate),
        meta: { requiresAuth: true },
      },
      {
        path: 'files',
        element: lazyLoad(FileManager),
        meta: { requiresAuth: true },
      },
      {
        path: 'settings',
        element: lazyLoad(Settings),
        meta: { requiresAuth: true },
      },
      {
        path: 'admin',
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
          {
            path: 'users',
            element: lazyLoad(AdminUsers),
          },
          {
            path: 'settings',
            element: lazyLoad(AdminSettings),
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: lazyLoad(Login),
        meta: { requiresGuest: true },
      },
      {
        path: 'register',
        element: lazyLoad(Register),
        meta: { requiresGuest: true },
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];

export default routes;
```

#### 路由权限控制

```tsx
// src/router/AuthRoute.tsx
import { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

interface AuthRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  requiresGuest?: boolean;
  requiresAdmin?: boolean;
}

const AuthRoute: FC<AuthRouteProps> = ({
  children,
  requiresAuth = false,
  requiresGuest = false,
  requiresAdmin = false,
}) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // 如果需要认证但未登录，重定向到登录页
  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果需要访客身份但已登录，重定向到仪表盘
  if (requiresGuest && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // 如果需要管理员权限但不是管理员，重定向到仪表盘
  if (requiresAdmin && (!isAuthenticated || !user?.is_admin)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;
```

### API请求处理

系统使用Axios进行API请求，并实现了请求拦截和响应处理：

```tsx
// src/api/index.ts
import axios from 'axios';
import { message } from 'antd';
import { getToken } from '@/utils/auth';
import store from '@/store';
import { logout } from '@/store/slices/authSlice';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // 处理错误响应
    const { response } = error;
    
    if (response) {
      // 处理身份验证错误
      if (response.status === 401) {
        store.dispatch(logout());
        message.error('会话已过期，请重新登录');
      } 
      // 处理权限错误
      else if (response.status === 403) {
        message.error('您没有权限执行此操作');
      }
      // 处理服务器错误
      else if (response.status >= 500) {
        message.error('服务器错误，请稍后再试');
      }
      // 处理其他错误
      else {
        const errorMsg = response.data?.error?.message || '请求失败';
        message.error(errorMsg);
      }
    } else {
      message.error('网络错误，请检查您的网络连接');
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### 组件设计模式

系统采用组件化开发方式，主要采用以下设计模式：

#### 自定义钩子抽象逻辑

```tsx
// src/hooks/useTask.ts
import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTasks, createTask, updateTask, deleteTask } from '@/store/slices/taskSlice';
import { message } from 'antd';

export const useTask = () => {
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector((state) => state.task);
  const [currentTask, setCurrentTask] = useState(null);

  // 加载任务列表
  const loadTasks = useCallback(async () => {
    try {
      await dispatch(fetchTasks()).unwrap();
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }, [dispatch]);

  // 创建新任务
  const addTask = useCallback(async (taskData) => {
    try {
      const result = await dispatch(createTask(taskData)).unwrap();
      message.success('任务创建成功');
      return result;
    } catch (err) {
      console.error('Failed to create task:', err);
      throw err;
    }
  }, [dispatch]);

  // 更新任务
  const editTask = useCallback(async (id, taskData) => {
    try {
      const result = await dispatch(updateTask({ id, ...taskData })).unwrap();
      message.success('任务更新成功');
      return result;
    } catch (err) {
      console.error('Failed to update task:', err);
      throw err;
    }
  }, [dispatch]);

  // 删除任务
  const removeTask = useCallback(async (id) => {
    try {
      await dispatch(deleteTask(id)).unwrap();
      message.success('任务删除成功');
    } catch (err) {
      console.error('Failed to delete task:', err);
      throw err;
    }
  }, [dispatch]);

  // 获取单个任务
  const getTask = useCallback((id) => {
    return tasks.find(task => task.id === id) || null;
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    currentTask,
    setCurrentTask,
    loadTasks,
    addTask,
    editTask,
    removeTask,
    getTask,
  };
};
```

#### 高阶组件实现权限控制

```tsx
// src/hocs/withPermission.tsx
import React from 'react';
import { useAppSelector } from '@/store/hooks';
import Forbidden from '@/components/common/Forbidden';

// 权限控制HOC
export const withPermission = (requiredPermission) => (Component) => {
  return (props) => {
    const { user } = useAppSelector((state) => state.auth);
    
    // 检查用户是否具有所需权限
    const hasPermission = () => {
      if (!user) return false;
      
      // 管理员拥有所有权限
      if (user.is_admin) return true;
      
      // 检查特定权限
      return user.permissions?.includes(requiredPermission);
    };
    
    if (!hasPermission()) {
      return <Forbidden />;
    }
    
    return <Component {...props} />;
  };
};
```

#### 复合组件模式

```tsx
// src/components/forms/Form.tsx
import React, { createContext, useContext } from 'react';
import { Form as AntForm } from 'antd';
import { FormProps } from 'antd/lib/form';

// 创建上下文
const FormContext = createContext(null);

// 主Form组件
export const Form = ({ children, ...props }: FormProps) => {
  const [form] = AntForm.useForm();
  
  return (
    <FormContext.Provider value={{ form }}>
      <AntForm form={form} {...props}>
        {children}
      </AntForm>
    </FormContext.Provider>
  );
};

// Field组件
export const Field = ({ name, label, rules, children, ...props }) => {
  const { form } = useContext(FormContext);
  
  return (
    <AntForm.Item name={name} label={label} rules={rules} {...props}>
      {children}
    </AntForm.Item>
  );
};

// Submit按钮组件
export const Submit = ({ children, ...props }) => {
  return (
    <AntForm.Item>
      <button type="submit" {...props}>
        {children || '提交'}
      </button>
    </AntForm.Item>
  );
};

// 使用示例
// <Form onFinish={handleSubmit}>
//   <Field name="username" label="用户名" rules={[{ required: true }]}>
//     <Input />
//   </Field>
//   <Submit>登录</Submit>
// </Form>
```

### 国际化实现

系统支持多语言国际化：

```tsx
// src/utils/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from '@/locales/en.json';
import zhTranslation from '@/locales/zh.json';

// 配置i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      zh: {
        translation: zhTranslation,
      },
    },
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### 主题与样式管理

系统使用Ant Design主题和SCSS变量管理样式：

```tsx
// src/styles/theme.ts
import { theme } from 'antd';

export const lightThemeToken = {
  colorPrimary: '#1890ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#f5222d',
  colorInfo: '#1890ff',
  borderRadius: 4,
  wireframe: false,
};

export const darkThemeToken = {
  colorPrimary: '#1890ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#f5222d',
  colorInfo: '#1890ff',
  borderRadius: 4,
  wireframe: false,
};

export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: lightThemeToken,
};

export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: darkThemeToken,
};
```

```scss
// src/styles/variables.scss
// 颜色变量
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$error-color: #f5222d;
$info-color: #1890ff;

// 文字颜色
$text-color: rgba(0, 0, 0, 0.85);
$text-color-secondary: rgba(0, 0, 0, 0.45);

// 背景颜色
$bg-color: #f0f2f5;
$component-bg: #fff;

// 边框
$border-color: #d9d9d9;
$border-radius-base: 4px;

// 间距
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// 阴影
$shadow-1: 0 2px 8px rgba(0, 0, 0, 0.15);
$shadow-2: 0 4px 12px rgba(0, 0, 0, 0.15);
$shadow-3: 0 8px 16px rgba(0, 0, 0, 0.15);

// 响应式断点
$screen-xs: 480px;
$screen-sm: 576px;
$screen-md: 768px;
$screen-lg: 992px;
$screen-xl: 1200px;
$screen-xxl: 1600px;
```

## 性能优化

系统采用以下性能优化策略：

### 代码分割

使用React.lazy和Suspense实现组件懒加载：

```tsx
// src/router/routes.tsx
import { lazy, Suspense } from 'react';
import LoadingPage from '@/components/common/LoadingPage';

// 懒加载组件
const Dashboard = lazy(() => import('@/pages/dashboard'));
const TaskList = lazy(() => import('@/pages/tasks/TaskList'));

// 带加载状态的懒加载包装器
const lazyLoad = (Component) => (
  <Suspense fallback={<LoadingPage />}>
    <Component />
  </Suspense>
);

// 在路由中使用
const routes = [
  {
    path: 'dashboard',
    element: lazyLoad(Dashboard),
  },
  {
    path: 'tasks',
    element: lazyLoad(TaskList),
  },
];
```

### 虚拟滚动

对于长列表使用虚拟滚动优化渲染性能：

```tsx
// src/components/common/VirtualList.tsx
import React from 'react';
import { List } from 'antd';
import VirtualList from 'rc-virtual-list';

const ContainerHeight = 400;

const VirtualizedList = ({ data, itemHeight, renderItem }) => {
  const onScroll = (e) => {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === ContainerHeight) {
      // 触底加载更多逻辑
    }
  };

  return (
    <List>
      <VirtualList
        data={data}
        height={ContainerHeight}
        itemHeight={itemHeight}
        itemKey="id"
        onScroll={onScroll}
      >
        {(item) => renderItem(item)}
      </VirtualList>
    </List>
  );
};

export default VirtualizedList;
```

### 防抖与节流

对于频繁触发的事件使用防抖和节流优化：

```tsx
// src/utils/performance.ts

// 防抖函数
export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// 节流函数
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

### Memo优化

使用React.memo、useMemo和useCallback减少不必要的重渲染：

```tsx
// src/components/TaskItem.tsx
import React, { memo, useCallback } from 'react';

const TaskItem = memo(({ task, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => {
    onEdit(task.id);
  }, [task.id, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(task.id);
  }, [task.id, onDelete]);

  return (
    <div className="task-item">
      <h3>{task.name}</h3>
      <p>{task.description}</p>
      <div className="task-actions">
        <button onClick={handleEdit}>编辑</button>
        <button onClick={handleDelete}>删除</button>
      </div>
    </div>
  );
});

export default TaskItem;
```

## 测试策略

系统采用多层次测试策略：

### 单元测试

使用Jest和Testing Library测试组件和功能：

```tsx
// src/components/__tests__/TaskItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from '../TaskItem';

describe('TaskItem Component', () => {
  const mockTask = {
    id: 1,
    name: '测试任务',
    description: '测试任务描述',
  };
  
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders task correctly', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    expect(screen.getByText('测试任务')).toBeInTheDocument();
    expect(screen.getByText('测试任务描述')).toBeInTheDocument();
  });
  
  test('calls onEdit when edit button is clicked', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    fireEvent.click(screen.getByText('编辑'));
    expect(mockOnEdit).toHaveBeenCalledWith(1);
  });
  
  test('calls onDelete when delete button is clicked', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    fireEvent.click(screen.getByText('删除'));
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });
});
```

### 集成测试

测试多个组件的协同工作，特别是与Redux Store交互：

```tsx
// src/pages/__tests__/TaskList.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import TaskList from '../tasks/TaskList';
import { fetchTasks } from '@/store/slices/taskSlice';

const mockStore = configureStore([thunk]);

describe('TaskList Page', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      task: {
        tasks: [
          { id: 1, name: '任务1', status: 'active' },
          { id: 2, name: '任务2', status: 'paused' },
        ],
        loading: false,
        error: null,
      },
    });
    
    store.dispatch = jest.fn();
  });
  
  test('dispatches fetchTasks action on mount', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TaskList />
        </MemoryRouter>
      </Provider>
    );
    
    expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function));
  });
  
  test('renders task list correctly', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TaskList />
        </MemoryRouter>
      </Provider>
    );
    
    expect(screen.getByText('任务1')).toBeInTheDocument();
    expect(screen.getByText('任务2')).toBeInTheDocument();
  });
  
  test('navigates to create task page when add button is clicked', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TaskList />
        </MemoryRouter>
      </Provider>
    );
    
    fireEvent.click(screen.getByText('创建任务'));
    
    // 使用react-router-dom的测试工具验证导航
  });
});
```

## 安全考虑

系统实现了多方面的前端安全措施：

1. **CSRF防护**：API请求包含防CSRF令牌
2. **XSS防护**：使用React自动转义，避免直接使用dangerouslySetInnerHTML
3. **敏感数据处理**：不在本地存储敏感信息，所有敏感数据通过加密传输
4. **权限控制**：基于角色的前端路由和组件访问控制

## 进一步阅读

- [前端组件文档](./frontend-components.md) - 详细的UI组件说明
- [后端API接口文档](./backend-api.md) - 与前端交互的API接口
- [部署指南](./deployment-guide.md) - 系统部署和配置说明