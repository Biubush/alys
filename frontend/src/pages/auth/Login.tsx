import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Divider, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import type { RootState, AppDispatch } from '../../store';

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [rememberMe, setRememberMe] = useState(true);

  // 处理表单提交
  const onFinish = async (values: { username: string; password: string }) => {
    const result = await dispatch(login({
      username: values.username,
      password: values.password,
      remember: rememberMe,
    }));
    
    if (login.fulfilled.match(result)) {
      message.success('登录成功');
      navigate('/dashboard');
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>用户登录</h2>
      
      <Form
        form={form}
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
        layout="vertical"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="用户名" 
            autoComplete="username" 
          />
        </Form.Item>
        
        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="密码" 
            autoComplete="current-password" 
          />
        </Form.Item>
        
        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Checkbox 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)}
            >
              记住我
            </Checkbox>
            <Link to="/auth/forgot-password">忘记密码?</Link>
          </div>
        </Form.Item>
        
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            style={{ width: '100%' }}
            loading={loading}
          >
            登录
          </Button>
        </Form.Item>
        
        <Divider plain>或者</Divider>
        
        <div style={{ textAlign: 'center' }}>
          <span>还没有账号? </span>
          <Link to="/auth/register">立即注册</Link>
        </div>
      </Form>
    </div>
  );
};

export default Login; 