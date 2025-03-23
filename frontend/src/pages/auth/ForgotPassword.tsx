import React, { useState } from 'react';
import { Form, Input, Button, message, Row, Col, Alert } from 'antd';
import { MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import * as authApi from '../../api/auth';

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 处理获取验证码
  const handleGetVerificationCode = async () => {
    try {
      // 验证邮箱字段
      await form.validateFields(['email']);
      const email = form.getFieldValue('email');
      
      setSendingCode(true);
      setError(null);
      
      const response = await authApi.sendVerificationCode({ 
        email, 
        purpose: 'reset_password' 
      });
      
      message.success('验证码已发送，请查收邮件');
      
      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      // 表单验证失败或发送请求失败
      setError(error.response?.data?.message || '发送验证码失败，请检查邮箱地址是否正确');
      message.error('发送验证码失败，请检查邮箱地址是否正确');
    } finally {
      setSendingCode(false);
    }
  };

  // 处理表单提交
  const onFinish = async (values: {
    email: string;
    verification_code: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      await authApi.verifyResetCode({
        email: values.email,
        verification_code: values.verification_code
      });
      
      // 存储邮箱，以便在重置密码页面使用
      localStorage.setItem('resetEmail', values.email);
      localStorage.setItem('resetCode', values.verification_code);
      
      setSuccess(true);
      message.success('验证成功，请重置您的密码');
      
      // 延迟导航到重置密码页面
      setTimeout(() => {
        navigate('/auth/reset-password');
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.message || '验证失败，请检查验证码是否正确');
      message.error('验证失败，请检查验证码是否正确');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>找回密码</h2>
      
      {error && (
        <Alert 
          message={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }} 
        />
      )}
      
      {success && (
        <Alert 
          message="验证成功，正在跳转到重置密码页面..." 
          type="success" 
          showIcon 
          style={{ marginBottom: 16 }} 
        />
      )}
      
      <Form
        form={form}
        name="forgot_password"
        onFinish={onFinish}
        size="large"
        layout="vertical"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入邮箱地址' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input 
            prefix={<MailOutlined />} 
            placeholder="邮箱地址" 
            autoComplete="email" 
          />
        </Form.Item>
        
        <Form.Item
          name="verification_code"
          rules={[{ required: true, message: '请输入验证码' }]}
        >
          <Row gutter={8}>
            <Col span={16}>
              <Input 
                prefix={<SafetyOutlined />} 
                placeholder="验证码" 
              />
            </Col>
            <Col span={8}>
              <Button 
                style={{ width: '100%' }} 
                onClick={handleGetVerificationCode}
                disabled={countdown > 0 || sendingCode}
                loading={sendingCode}
              >
                {countdown > 0 ? `${countdown}秒` : '获取验证码'}
              </Button>
            </Col>
          </Row>
        </Form.Item>
        
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            style={{ width: '100%' }}
            loading={loading}
            disabled={success}
          >
            验证
          </Button>
        </Form.Item>
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/auth/login">返回登录</Link>
        </div>
      </Form>
    </div>
  );
};

export default ForgotPassword; 