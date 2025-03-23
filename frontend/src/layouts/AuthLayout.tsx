import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layout, Typography, theme } from 'antd';
import { CloudSyncOutlined } from '@ant-design/icons';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

const AuthLayout: React.FC = () => {
  const { token } = theme.useToken();
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '50px 20px',
      }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 30
        }}>
          <CloudSyncOutlined style={{ fontSize: 48, color: token.colorPrimary }} />
          <Title level={2} style={{ marginTop: 8 }}>阿里云同步工具</Title>
          <Text type="secondary">轻松管理和同步您的阿里云盘文件</Text>
        </div>
        
        <div style={{ 
          width: '100%', 
          maxWidth: 400, 
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          padding: 32,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}>
          <Outlet />
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center', backgroundColor: 'transparent' }}>
        <Text type="secondary">阿里云盘同步工具 ©{new Date().getFullYear()} Created by ALYS</Text>
        <div style={{ marginTop: 8 }}>
          <Link to="/privacy" style={{ marginRight: 16 }}>隐私政策</Link>
          <Link to="/terms">服务条款</Link>
        </div>
      </Footer>
    </Layout>
  );
};

export default AuthLayout; 