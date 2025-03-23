import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store';
import AppRoutes from './routes';
import './styles/index.css';
import type { RootState, AppDispatch } from './store';

// 用于获取用户登录状态和身份的包装器组件
const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    // 这里可以添加初始化逻辑，例如从localStorage恢复会话
    // 或者检查令牌有效性等
  }, [dispatch]);
  
  return (
    <AppRoutes 
      isAuthenticated={isAuthenticated} 
      isAdmin={user?.role === 'admin'} 
    />
  );
};

// 主应用组件
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <ConfigProvider locale={zhCN}>
          <AppContent />
        </ConfigProvider>
      </Router>
    </Provider>
  );
};

export default App; 