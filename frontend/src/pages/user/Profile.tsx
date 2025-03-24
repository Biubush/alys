import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Divider, Avatar, Typography, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// 模拟用户数据
const mockUser = {
  id: 1,
  username: '用户1',
  email: 'user1@example.com',
  created_at: '2023-01-01',
  last_login: '2023-03-20'
};

const Profile: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    // 加载用户数据
    form.setFieldsValue({
      username: mockUser.username,
      email: mockUser.email
    });
  }, [form]);

  const handleUpdateProfile = async (values: any) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('个人资料更新成功');
    } catch (error) {
      message.error('更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('密码已成功更新');
      passwordForm.resetFields();
    } catch (error) {
      message.error('密码更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 0' }}>
      <Card>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
            <Avatar size={100} icon={<UserOutlined />} />
            <Title level={4} style={{ marginTop: '16px', marginBottom: '4px' }}>
              {mockUser.username}
            </Title>
            <Text type="secondary">注册时间: {mockUser.created_at}</Text>
            <br />
            <Text type="secondary">最后登录: {mockUser.last_login}</Text>
          </Col>
          <Col xs={24} sm={16}>
            <Title level={4}>个人资料</Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="邮箱" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  保存更改
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>

        <Divider />

        <Title level={4}>修改密码</Title>
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="currentPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="当前密码" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 8, message: '密码长度至少为8个字符' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              更新密码
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile; 