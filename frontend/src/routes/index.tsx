import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Spin } from 'antd';

// 布局组件
const UserLayout = lazy(() => import('../layouts/UserLayout'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const AuthLayout = lazy(() => import('../layouts/AuthLayout'));

// 身份验证页面
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));

// 用户页面
const Dashboard = lazy(() => import('../pages/user/Dashboard'));
const Profile = lazy(() => import('../pages/user/Profile'));
const AliyunLogin = lazy(() => import('../pages/user/AliyunLogin'));
const TaskList = lazy(() => import('../pages/task/TaskList'));
const TaskDetail = lazy(() => import('../pages/task/TaskDetail'));
const CreateTask = lazy(() => import('../pages/task/CreateTask'));
const EditTask = lazy(() => import('../pages/task/EditTask'));
const Logs = lazy(() => import('../pages/user/Logs'));

// 管理员页面
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const UserDetail = lazy(() => import('../pages/admin/UserDetail'));
const TaskManagement = lazy(() => import('../pages/admin/TaskManagement'));
const AdminTaskDetail = lazy(() => import('../pages/admin/TaskDetail'));
const SystemLogs = lazy(() => import('../pages/admin/SystemLogs'));
const Settings = lazy(() => import('../pages/admin/Settings'));

// 加载中组件
const LoadingComponent: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

// 路由守卫 - 检查是否已登录
interface PrivateRouteProps {
  element: React.ReactNode;
  isAuthenticated: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/auth/login" />;
};

// 路由守卫 - 检查是否是管理员
interface AdminRouteProps {
  element: React.ReactNode;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ element, isAuthenticated, isAdmin }) => {
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  
  return isAdmin ? element : <Navigate to="/dashboard" />;
};

// 路由守卫 - 已登录用户禁止访问
interface PublicRouteProps {
  element: React.ReactNode;
  isAuthenticated: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ element, isAuthenticated }) => {
  return !isAuthenticated ? element : <Navigate to="/dashboard" />;
};

// 路由配置
interface AppRoutesProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ isAuthenticated, isAdmin }) => {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <Routes>
        {/* 公共路由 */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/auth/login'} />} />
        
        {/* 身份验证路由 */}
        <Route path="/auth" element={<PublicRoute element={<AuthLayout />} isAuthenticated={isAuthenticated} />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="" element={<Navigate to="/auth/login" />} />
        </Route>
        
        {/* 用户路由 */}
        <Route path="/" element={<PrivateRoute element={<UserLayout />} isAuthenticated={isAuthenticated} />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="aliyun-login" element={<AliyunLogin />} />
          <Route path="tasks" element={<TaskList />} />
          <Route path="tasks/create" element={<CreateTask />} />
          <Route path="tasks/:id" element={<TaskDetail />} />
          <Route path="tasks/:id/edit" element={<EditTask />} />
          <Route path="logs" element={<Logs />} />
        </Route>
        
        {/* 管理员路由 */}
        <Route path="/admin" element={<AdminRoute element={<AdminLayout />} isAuthenticated={isAuthenticated} isAdmin={isAdmin} />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="tasks" element={<TaskManagement />} />
          <Route path="tasks/:id" element={<AdminTaskDetail />} />
          <Route path="logs" element={<SystemLogs />} />
          <Route path="settings" element={<Settings />} />
          <Route path="" element={<Navigate to="/admin/dashboard" />} />
        </Route>
        
        {/* 404 页面 */}
        <Route path="*" element={<div>404 - 页面未找到</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 