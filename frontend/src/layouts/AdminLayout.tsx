import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Badge, Space, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ScheduleOutlined,
  HistoryOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  ShieldOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import type { RootState, AppDispatch } from '../store';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

// 侧边栏菜单项
const getMenuItems = (): MenuProps['items'] => [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: <Link to="/admin/dashboard">仪表盘</Link>,
  },
  {
    key: 'users',
    icon: <UserOutlined />,
    label: <Link to="/admin/users">用户管理</Link>,
  },
  {
    key: 'tasks',
    icon: <ScheduleOutlined />,
    label: <Link to="/admin/tasks">任务管理</Link>,
  },
  {
    key: 'logs',
    icon: <HistoryOutlined />,
    label: <Link to="/admin/logs">系统日志</Link>,
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: <Link to="/admin/settings">系统设置</Link>,
  },
];

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  
  // 从Redux获取用户信息
  const { user } = useSelector((state: RootState) => state.auth);
  
  // 处理登出
  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };
  
  // 处理切换到用户界面
  const handleSwitchToUser = () => {
    navigate('/dashboard');
  };
  
  // 下拉菜单项
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'switch',
      icon: <UserOutlined />,
      label: '切换到用户界面',
      onClick: handleSwitchToUser,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '管理员设置',
      onClick: () => navigate('/admin/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];
  
  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    
    if (path.startsWith('/admin/dashboard')) return ['dashboard'];
    if (path.startsWith('/admin/users')) return ['users'];
    if (path.startsWith('/admin/tasks')) return ['tasks'];
    if (path.startsWith('/admin/logs')) return ['logs'];
    if (path.startsWith('/admin/settings')) return ['settings'];
    
    return ['dashboard'];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        width={220}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          height: 64, 
          padding: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'flex-start',
          color: 'white',
        }}>
          <ShieldOutlined style={{ fontSize: '20px', marginRight: collapsed ? '0' : '8px' }} />
          {!collapsed && <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>管理员控制台</h1>}
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={getSelectedKey()}
          items={getMenuItems()}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 16px', 
          background: token.colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <Space size={16}>
            <Badge count={0} dot>
              <Button type="text" icon={<BellOutlined style={{ fontSize: '18px' }} />} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#f56a00' }}
                />
                {!collapsed && <span>{user?.username || '管理员'}</span>}
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{
          margin: '24px 16px',
          padding: 24,
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          minHeight: 280,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 