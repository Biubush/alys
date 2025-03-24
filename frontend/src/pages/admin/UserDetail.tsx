import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Button, 
  Tabs, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Spin, 
  Empty, 
  message,
  Modal,
  Form,
  Input,
  Select,
  Avatar,
  Divider
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
  DeleteOutlined,
  HistoryOutlined,
  FileOutlined,
  MailOutlined,
  KeyOutlined,
  SaveOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import type { TabsProps } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'locked';
  created_at: string;
  last_login: string;
  phone?: string;
  avatar?: string;
  tasks?: {
    id: number;
    name: string;
    status: string;
    last_sync: string;
  }[];
  logs?: {
    id: number;
    action: string;
    time: string;
    ip: string;
    details: string;
  }[];
}

// 模拟用户数据
const mockUser: User = {
  id: 2,
  username: 'user1',
  email: 'user1@example.com',
  role: 'user',
  status: 'active',
  created_at: '2023-02-05 14:22:10',
  last_login: '2023-03-22 16:45:32',
  phone: '13800138000',
  avatar: '',
  tasks: [
    {
      id: 1,
      name: '文档同步',
      status: 'active',
      last_sync: '2023-03-22 14:30:00'
    },
    {
      id: 2,
      name: '照片备份',
      status: 'paused',
      last_sync: '2023-03-20 09:15:00'
    }
  ],
  logs: [
    {
      id: 1,
      action: '登录',
      time: '2023-03-22 16:45:32',
      ip: '192.168.1.100',
      details: '通过网页登录'
    },
    {
      id: 2,
      action: '修改任务',
      time: '2023-03-22 16:50:45',
      ip: '192.168.1.100',
      details: '修改了任务 "文档同步"'
    },
    {
      id: 3,
      action: '添加任务',
      time: '2023-03-21 10:25:16',
      ip: '192.168.1.100',
      details: '创建了新任务 "照片备份"'
    },
    {
      id: 4,
      action: '登录',
      time: '2023-03-21 10:20:05',
      ip: '192.168.1.100',
      details: '通过网页登录'
    }
  ]
};

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 在实际项目中，这里应该从API获取用户数据
      setUser(mockUser);
    } catch (error) {
      console.error('获取用户详情失败:', error);
      message.error('获取用户详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = () => {
    if (!user) return;
    
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status
    });
    
    setEditModalVisible(true);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      message.success('用户信息更新成功');
      setEditModalVisible(false);
      
      // 更新用户信息
      if (user) {
        setUser({
          ...user,
          ...values
        });
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleResetPassword = () => {
    passwordForm.resetFields();
    setResetPasswordVisible(true);
  };

  const handleResetPasswordOk = async () => {
    try {
      const values = await passwordForm.validateFields();
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      message.success('密码重置成功');
      setResetPasswordVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleDeleteUser = () => {
    Modal.confirm({
      title: '删除用户',
      content: '确定要删除此用户吗？此操作不可撤销。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500));
          
          message.success('用户删除成功');
          navigate('/admin/users');
        } catch (error) {
          console.error('删除用户失败:', error);
          message.error('删除用户失败');
        }
      }
    });
  };

  const getStatusTag = (status: string) => {
    if (status === 'active') {
      return <Tag color="green">活跃</Tag>;
    } else if (status === 'inactive') {
      return <Tag color="orange">未激活</Tag>;
    } else {
      return <Tag color="red">已锁定</Tag>;
    }
  };

  const getTaskStatusTag = (status: string) => {
    if (status === 'active') {
      return <Tag color="green">运行中</Tag>;
    } else if (status === 'paused') {
      return <Tag color="orange">已暂停</Tag>;
    } else if (status === 'error') {
      return <Tag color="red">错误</Tag>;
    } else {
      return <Tag color="blue">已完成</Tag>;
    }
  };

  const taskColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <a href={`/tasks/${record.id}`}>{text}</a>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getTaskStatusTag(status)
    },
    {
      title: '最后同步',
      dataIndex: 'last_sync',
      key: 'last_sync'
    },
    {
      title: '操作',
      key: 'action',
      render: (record: any) => (
        <Button 
          size="small" 
          type="primary"
          onClick={() => window.location.href = `/tasks/${record.id}`}
        >
          查看
        </Button>
      )
    }
  ];

  const logColumns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time'
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action'
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip'
    },
    {
      title: '详情',
      dataIndex: 'details',
      key: 'details'
    }
  ];

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span>
          <FileOutlined />
          同步任务
        </span>
      ),
      children: user?.tasks && user.tasks.length > 0 ? (
        <Table
          columns={taskColumns}
          dataSource={user.tasks}
          rowKey="id"
          pagination={false}
        />
      ) : (
        <Empty description="暂无同步任务" />
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <HistoryOutlined />
          操作日志
        </span>
      ),
      children: user?.logs && user.logs.length > 0 ? (
        <Table
          columns={logColumns}
          dataSource={user.logs}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      ) : (
        <Empty description="暂无操作日志" />
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <Empty
          description="未找到用户信息"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button 
            type="primary" 
            onClick={() => navigate('/admin/users')}
          >
            返回用户列表
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={3}>用户详情</Title>
          <Space>
            <Button 
              icon={<EditOutlined />} 
              onClick={handleEditUser}
            >
              编辑用户
            </Button>
            <Button 
              icon={<KeyOutlined />} 
              onClick={handleResetPassword}
            >
              重置密码
            </Button>
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={handleDeleteUser}
            >
              删除用户
            </Button>
            <Button 
              type="primary" 
              onClick={() => navigate('/admin/users')}
            >
              返回列表
            </Button>
          </Space>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <Avatar 
            size={64} 
            icon={<UserOutlined />} 
            style={{ marginRight: '20px' }}
          />
          <div>
            <Title level={4} style={{ marginBottom: '5px' }}>{user.username}</Title>
            <Space>
              <Tag color={user.role === 'admin' ? 'purple' : 'blue'}>
                {user.role === 'admin' ? '管理员' : '普通用户'}
              </Tag>
              {getStatusTag(user.status)}
            </Space>
          </div>
        </div>
        
        <Divider />
        
        <Descriptions title="基本信息" bordered column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}>
          <Descriptions.Item label="用户ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="邮箱">
            <MailOutlined /> {user.email}
          </Descriptions.Item>
          <Descriptions.Item label="电话号码">
            {user.phone || '未设置'}
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">{user.created_at}</Descriptions.Item>
          <Descriptions.Item label="最后登录">{user.last_login}</Descriptions.Item>
          <Descriptions.Item label="状态">{getStatusTag(user.status)}</Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
      
      <Modal
        title="编辑用户"
        open={editModalVisible}
        onOk={handleEditModalOk}
        onCancel={() => setEditModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="电话号码"
          >
            <Input placeholder="请输入电话号码" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="admin">管理员</Option>
              <Option value="user">普通用户</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">活跃</Option>
              <Option value="inactive">未激活</Option>
              <Option value="locked">已锁定</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title="重置密码"
        open={resetPasswordVisible}
        onOk={handleResetPasswordOk}
        onCancel={() => setResetPasswordVisible(false)}
        okText="重置"
        cancelText="取消"
      >
        <Form
          form={passwordForm}
          layout="vertical"
        >
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能小于6位' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="确认密码"
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
            <Input.Password prefix={<LockOutlined />} placeholder="请确认新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserDetail; 