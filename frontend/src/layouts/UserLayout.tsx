import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Badge, Space, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CloudOutlined,
  ScheduleOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
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
    label: <Link to="/dashboard">仪表盘</Link>,
  },
  {
    key: 'tasks',
    icon: <ScheduleOutlined />,
    label: <Link to="/tasks">任务管理</Link>,
  },
  {
    key: 'aliyun',
    icon: <CloudOutlined />,
    label: <Link to="/aliyun-login">阿里云登录</Link>,
  },
  {
    key: 'logs',
    icon: <HistoryOutlined />,
    label: <Link to="/logs">操作日志</Link>,
  },
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: <Link to="/profile">个人资料</Link>,
  },
];

const UserLayout: React.FC = () => {
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
  
  // 下拉菜单项
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
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
    
    if (path.startsWith('/dashboard')) return ['dashboard'];
    if (path.startsWith('/tasks')) return ['tasks'];
    if (path.startsWith('/aliyun-login')) return ['aliyun'];
    if (path.startsWith('/logs')) return ['logs'];
    if (path.startsWith('/profile')) return ['profile'];
    
    return ['dashboard'];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        width={220}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ height: 64, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <h1 style={{ margin: 0, fontSize: collapsed ? '18px' : '20px', fontWeight: 'bold', color: token.colorPrimary }}>
            {collapsed ? 'ALYS' : '阿里云同步'}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKey()}
          items={getMenuItems()}
          style={{ borderRight: 0 }}
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
                  src={user?.avatar}
                  style={{ backgroundColor: token.colorPrimary }}
                />
                {!collapsed && <span>{user?.username || '用户'}</span>}
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

export default UserLayout; 