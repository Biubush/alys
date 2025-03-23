import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import * as authApi from '../../api/auth';

const ResetPassword: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  // 从本地存储获取邮箱和验证码
  useEffect(() => {
    const storedEmail = localStorage.getItem('resetEmail');
    const storedCode = localStorage.getItem('resetCode');
    
    if (!storedEmail || !storedCode) {
      message.error('验证信息已过期，请重新验证');
      navigate('/auth/forgot-password');
      return;
    }
    
    setEmail(storedEmail);
    setCode(storedCode);
  }, [navigate]);

  // 处理表单提交
  const onFinish = async (values: { password: string; confirm_password: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      // 确保邮箱和验证码已设置
      if (!email || !code) {
        throw new Error('验证信息已过期，请重新验证');
      }
      
      await authApi.resetPassword({
        email,
        verification_code: code,
        new_password: values.password
      });
      
      // 清除本地存储的重置信息
      localStorage.removeItem('resetEmail');
      localStorage.removeItem('resetCode');
      
      setSuccess(true);
      message.success('密码重置成功，请使用新密码登录');
      
      // 延迟导航到登录页面
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || '密码重置失败，请重新尝试');
      message.error('密码重置失败，请重新尝试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>重置密码</h2>
      
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
          message="密码重置成功，正在跳转到登录页面..." 
          type="success" 
          showIcon 
          style={{ marginBottom: 16 }} 
        />
      )}
      
      <Form
        form={form}
        name="reset_password"
        onFinish={onFinish}
        size="large"
        layout="vertical"
      >
        <Form.Item style={{ marginBottom: 8 }}>
          <div style={{ textAlign: 'center' }}>
            <span>为账号 </span>
            <strong>{email}</strong>
            <span> 设置新密码</span>
          </div>
        </Form.Item>
        
        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码至少6个字符' },
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="新密码" 
            autoComplete="new-password" 
          />
        </Form.Item>
        
        <Form.Item
          name="confirm_password"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="确认新密码" 
            autoComplete="new-password" 
          />
        </Form.Item>
        
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            style={{ width: '100%' }}
            loading={loading}
            disabled={success}
          >
            重置密码
          </Button>
        </Form.Item>
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/auth/login">返回登录</Link>
        </div>
      </Form>
    </div>
  );
};

export default ResetPassword; 