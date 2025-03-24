import React, { useState } from 'react';
import { Card, Button, Typography, Divider, message, Spin, Space, Alert } from 'antd';
import { LoginOutlined, QrcodeOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const AliyunLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleGetQrCode = async () => {
    setLoading(true);
    setLoginStatus('loading');
    
    try {
      // 模拟API调用获取二维码
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟返回二维码URL（实际项目中会从后端获取）
      setQrCodeUrl('https://example.com/qrcode');
      setLoginStatus('idle');
      
      // 模拟轮询检查登录状态
      const checkStatusInterval = setInterval(async () => {
        // 这里应该是实际的API调用检查登录状态
        // 模拟随机登录成功
        if (Math.random() > 0.7) {
          clearInterval(checkStatusInterval);
          setLoginStatus('success');
          message.success('阿里云盘账号授权成功');
        }
      }, 2000);
      
      // 超时处理
      setTimeout(() => {
        clearInterval(checkStatusInterval);
        if (loginStatus !== 'success') {
          setLoginStatus('error');
          setQrCodeUrl(null);
          message.error('二维码已过期，请重新获取');
        }
      }, 60000);
      
    } catch (error) {
      message.error('获取二维码失败，请重试');
      setLoginStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 0' }}>
      <Card>
        <Title level={3}>阿里云盘账号授权</Title>
        <Divider />
        
        <Paragraph>
          为了能够同步您的阿里云盘文件，我们需要您授权访问您的阿里云盘账号。请扫描下方二维码完成授权。
        </Paragraph>
        
        <Space direction="vertical" style={{ width: '100%', marginTop: '24px' }}>
          {loginStatus === 'success' && (
            <Alert
              message="授权成功"
              description="您已成功授权阿里云盘账号，现在可以创建同步任务了。"
              type="success"
              showIcon
            />
          )}
          
          {loginStatus === 'error' && (
            <Alert
              message="授权失败"
              description="授权过程中出现错误，请重新尝试。"
              type="error"
              showIcon
            />
          )}
          
          <div style={{ textAlign: 'center', margin: '24px 0' }}>
            {qrCodeUrl ? (
              <div>
                <img 
                  src={qrCodeUrl} 
                  alt="阿里云盘授权二维码" 
                  style={{ width: '200px', height: '200px', border: '1px solid #f0f0f0' }} 
                />
                <br />
                <Text type="secondary">请使用阿里云盘APP扫描二维码授权</Text>
                {loginStatus === 'loading' && (
                  <div style={{ marginTop: '16px' }}>
                    <Spin tip="等待扫描..." />
                  </div>
                )}
              </div>
            ) : (
              <Button 
                type="primary" 
                icon={<QrcodeOutlined />} 
                size="large"
                onClick={handleGetQrCode}
                loading={loading}
              >
                获取授权二维码
              </Button>
            )}
          </div>
          
          {qrCodeUrl && loginStatus !== 'success' && (
            <Button 
              type="default" 
              onClick={() => setQrCodeUrl(null)}
              style={{ marginTop: '16px' }}
            >
              取消授权
            </Button>
          )}
          
          {loginStatus === 'success' && (
            <Button 
              type="primary" 
              icon={<LoginOutlined />}
              href="/tasks/create"
              style={{ marginTop: '16px' }}
            >
              创建同步任务
            </Button>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default AliyunLogin; 