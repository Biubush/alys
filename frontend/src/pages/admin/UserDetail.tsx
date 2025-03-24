import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Typography, 
  Button, 
  Space, 
  Divider, 
  Spin, 
  Tag, 
  Tabs,
  Empty,
  Table,
  List,
  Avatar,
  Popconfirm,
  message
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CloudSyncOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'locked';
  created_at: string;
  last_login: string;
  login_count: number;
  tasks_count: number;
  storage_used: number;
}

interface Task {
  id: number;
  name: string;
  source_path: string;
  target_path: string;
  schedule: string;
  status: string;
  last_sync: string;
}

interface LoginLog {
  id: number;
  time: string;
  ip: string;
  device: string;
  success: boolean;
}

// 模拟用户数据
const mockUser: User = {
  id: 1,
  username: '张三',
  email: 'zhangsan@example.com',
  role: 'admin',
  status: 'active',
  created_at: '2023-02-15 10:30:00',
  last_login: '2023-03-21 15:30:00',
  login_count: 42,
  tasks_count: 5,
  storage_used: 1024 * 1024 * 1024 * 2 // 2GB
};

// 模拟任务数据
const mockTasks: Task[] = [
  {
    id: 1,
    name: '文档同步',
    source_path: '/文档',
    target_path: '/本地备份/文档',
    schedule: '每天',
    status: 'active',
    last_sync: '2023-03-22 14:30:00'
  },
  {
    id: 2,
    name: '照片备份',
    source_path: '/照片',
    target_path: '/本地备份/照片',
    schedule: '每周',
    status: 'paused',
    last_sync: '2023-03-20 09:15:00'
  }
];

// 模拟登录日志
const mockLoginLogs: LoginLog[] = [
  {
    id: 1,
    time: '2023-03-21 15:30:00',
    ip: '192.168.1.100',
    device: 'Chrome / Windows 10',
    success: true
  },
  {
    id: 2,
    time: '2023-03-20 09:45:00',
    ip: '192.168.1.100',
    device: 'Firefox / Windows 10',
    success: true
  },
  {
    id: 3,
    time: '2023-03-18 18:20:00',
    ip: '192.168.1.102',
    device: 'Safari / macOS',
    success: false
  }
];

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  
  useEffect(() => {
    fetchUserDetails();
  }, [id]);
  
  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 实际项目中应该从API获取数据
      setUser(mockUser);
      setTasks(mockTasks);
      setLoginLogs(mockLoginLogs);
    } catch (error) {
      console.error('获取用户详情失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLockUser = async (locked: boolean) => {
    if (!user) return;
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success(locked ? '用户已锁定' : '用户已解锁');
      setUser({ ...user, status: locked ? 'locked' : 'active' });
    } catch (error) {
      message.error('操作失败，请稍后重试');
    }
  };
  
  const handleDeleteUser = async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('用户删除成功');
      navigate('/admin/users');
    } catch (error) {
      message.error('删除失败，请稍后重试');
    }
  };
  
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color="green">活跃</Tag>;
      case 'inactive':
        return <Tag color="orange">非活跃</Tag>;
      case 'locked':
        return <Tag color="red">已锁定</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  
  const getRoleTag = (role: string) => {
    switch (role) {
      case 'admin':
        return <Tag color="blue">管理员</Tag>;
      case 'user':
        return <Tag color="green">普通用户</Tag>;
      default:
        return <Tag>{role}</Tag>;
    }
  };
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
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
          <Button type="primary" onClick={() => navigate('/admin/users')}>
            返回用户列表
          </Button>
        </div>
      </Card>
    );
  }
  
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
      render: (text: string, record: Task) => (
        <a onClick={() => navigate(`/admin/tasks/${record.id}`)}>{text}</a>
      )
    },
    {
      title: '源路径',
      dataIndex: 'source_path',
      key: 'source_path',
      ellipsis: true
    },
    {
      title: '目标路径',
      dataIndex: 'target_path',
      key: 'target_path',
      ellipsis: true
    },
    {
      title: '计划',
      dataIndex: 'schedule',
      key: 'schedule'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        let text = '运行中';
        
        if (status === 'paused') {
          color = 'orange';
          text = '已暂停';
        } else if (status === 'error') {
          color = 'red';
          text = '错误';
        } else if (status === 'completed') {
          color = 'blue';
          text = '已完成';
        }
        
        return (
          <Tag color={color}>
            {text}
          </Tag>
        );
      }
    },
    {
      title: '最后同步',
      dataIndex: 'last_sync',
      key: 'last_sync'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Task) => (
        <Button 
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/admin/tasks/${record.id}`)}
        >
          查看
        </Button>
      )
    }
  ];
  
  return (
    <div style={{ padding: '24px 0' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={3}>
            <UserOutlined /> {user.username}
          </Title>
          <Space>
            <Button 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/admin/users/${id}/edit`)}
            >
              编辑用户
            </Button>
            {user.status === 'locked' ? (
              <Button 
                icon={<UnlockOutlined />} 
                onClick={() => handleLockUser(false)}
              >
                解锁用户
              </Button>
            ) : (
              <Button 
                danger
                icon={<LockOutlined />} 
                onClick={() => handleLockUser(true)}
              >
                锁定用户
              </Button>
            )}
            <Popconfirm
              title="确定要删除此用户吗?"
              description="删除后将无法恢复，用户的所有数据将被清除。"
              onConfirm={handleDeleteUser}
              okText="是"
              cancelText="否"
            >
              <Button danger icon={<DeleteOutlined />}>
                删除用户
              </Button>
            </Popconfirm>
          </Space>
        </div>
        
        <Descriptions title="用户信息" bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="状态">{getStatusTag(user.status)}</Descriptions.Item>
          <Descriptions.Item label="角色">{getRoleTag(user.role)}</Descriptions.Item>
          <Descriptions.Item label="邮箱">
            <Space>
              <MailOutlined />
              {user.email}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">
            <Space>
              <ClockCircleOutlined />
              {user.created_at}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="最后登录">
            <Space>
              <ClockCircleOutlined />
              {user.last_login}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="登录次数">{user.login_count}</Descriptions.Item>
          <Descriptions.Item label="任务数">{user.tasks_count}</Descriptions.Item>
          <Descriptions.Item label="存储使用">
            <Space>
              <CloudSyncOutlined />
              {formatBytes(user.storage_used)}
            </Space>
          </Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Tabs defaultActiveKey="tasks">
          <TabPane tab="用户任务" key="tasks">
            {tasks.length > 0 ? (
              <Table
                columns={taskColumns}
                dataSource={tasks}
                rowKey="id"
                pagination={false}
              />
            ) : (
              <Empty description="该用户暂无任务" />
            )}
          </TabPane>
          
          <TabPane tab="登录记录" key="loginLogs">
            {loginLogs.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={loginLogs}
                renderItem={log => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<UserOutlined />} 
                          style={{ backgroundColor: log.success ? '#52c41a' : '#f5222d' }} 
                        />
                      }
                      title={
                        <Space>
                          <Text>{log.time}</Text>
                          {log.success ? (
                            <Tag color="success">成功</Tag>
                          ) : (
                            <Tag color="error">失败</Tag>
                          )}
                        </Space>
                      }
                      description={`IP地址: ${log.ip} | 设备: ${log.device}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无登录记录" />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default UserDetail; 