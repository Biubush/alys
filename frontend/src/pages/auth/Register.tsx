import React, { useState } from 'react';
import { Form, Input, Button, Divider, message, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import * as authApi from '../../api/auth';
import type { RootState, AppDispatch } from '../../store';

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 处理获取验证码
  const handleGetVerificationCode = async () => {
    try {
      // 验证邮箱字段
      await form.validateFields(['email']);
      const email = form.getFieldValue('email');
      
      setSendingCode(true);
      const response = await authApi.sendVerificationCode({ email });
      
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
    } catch (error) {
      // 表单验证失败或发送请求失败
      message.error('发送验证码失败，请检查邮箱地址是否正确');
    } finally {
      setSendingCode(false);
    }
  };

  // 处理表单提交
  const onFinish = async (values: {
    username: string;
    email: string;
    password: string;
    verification_code: string;
  }) => {
    const result = await dispatch(register({
      username: values.username,
      email: values.email,
      password: values.password,
      verification_code: values.verification_code,
    }));
    
    if (register.fulfilled.match(result)) {
      message.success('注册成功，欢迎加入');
      navigate('/dashboard');
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>新用户注册</h2>
      
      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        size="large"
        layout="vertical"
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 3, message: '用户名至少3个字符' },
            { max: 20, message: '用户名最多20个字符' },
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="用户名" 
            autoComplete="username" 
          />
        </Form.Item>
        
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
        
        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6个字符' },
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="密码" 
            autoComplete="new-password" 
          />
        </Form.Item>
        
        <Form.Item
          name="confirm_password"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认密码' },
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
            placeholder="确认密码" 
            autoComplete="new-password" 
          />
        </Form.Item>
        
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            style={{ width: '100%' }}
            loading={loading}
          >
            注册
          </Button>
        </Form.Item>
        
        <Divider plain>或者</Divider>
        
        <div style={{ textAlign: 'center' }}>
          <span>已有账号? </span>
          <Link to="/auth/login">立即登录</Link>
        </div>
      </Form>
    </div>
  );
};

export default Register; 