import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Input, 
  Select, 
  DatePicker, 
  Popconfirm, 
  message,
  Modal,
  Form
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  EyeOutlined, 
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'locked';
  created_at: string;
  last_login: string;
  tasks_count: number;
}

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: 1,
    username: '张三',
    email: 'zhangsan@example.com',
    role: 'admin',
    status: 'active',
    created_at: '2023-02-15',
    last_login: '2023-03-21 15:30',
    tasks_count: 5
  },
  {
    id: 2,
    username: '李四',
    email: 'lisi@example.com',
    role: 'user',
    status: 'active',
    created_at: '2023-02-20',
    last_login: '2023-03-21 12:45',
    tasks_count: 3
  },
  {
    id: 3,
    username: '王五',
    email: 'wangwu@example.com',
    role: 'user',
    status: 'inactive',
    created_at: '2023-03-01',
    last_login: '2023-03-20 18:30',
    tasks_count: 0
  },
  {
    id: 4,
    username: '赵六',
    email: 'zhaoliu@example.com',
    role: 'user',
    status: 'locked',
    created_at: '2023-03-05',
    last_login: '2023-03-19 09:15',
    tasks_count: 2
  },
];

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    username: '',
    email: '',
    role: '',
    status: ''
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 在实际应用中，这里应该是调用后端API获取用户数据
      // 此处使用模拟数据
      setData(mockUsers);
      setPagination({
        ...pagination,
        total: mockUsers.length
      });
    } catch (error) {
      console.error('获取用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<User> | SorterResult<User>[]
  ) => {
    setPagination(pagination);
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchUsers();
  };

  const handleReset = () => {
    setFilters({
      username: '',
      email: '',
      role: '',
      status: ''
    });
    setPagination({ ...pagination, current: 1 });
    fetchUsers();
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (id: number) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('用户删除成功');
      fetchUsers();
    } catch (error) {
      message.error('删除失败，请稍后重试');
    }
  };

  const handleLockUser = async (id: number, locked: boolean) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success(locked ? '用户已锁定' : '用户已解锁');
      fetchUsers();
    } catch (error) {
      message.error('操作失败，请稍后重试');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingUser) {
        // 编辑用户
        message.success('用户更新成功');
      } else {
        // 添加用户
        message.success('用户创建成功');
      }
      
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('提交表单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
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
        return <Tag color="green">用户</Tag>;
      default:
        return <Tag>{role}</Tag>;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: User) => (
        <Link to={`/admin/users/${record.id}`}>{text}</Link>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => getRoleTag(role)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at'
    },
    {
      title: '最后登录',
      dataIndex: 'last_login',
      key: 'last_login'
    },
    {
      title: '任务数',
      dataIndex: 'tasks_count',
      key: 'tasks_count'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="small">
          <Button 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/users/${record.id}`)}
          >
            查看
          </Button>
          <Button 
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          {record.status === 'locked' ? (
            <Button 
              size="small"
              icon={<UnlockOutlined />}
              onClick={() => handleLockUser(record.id, false)}
            >
              解锁
            </Button>
          ) : (
            <Button 
              size="small"
              danger
              icon={<LockOutlined />}
              onClick={() => handleLockUser(record.id, true)}
            >
              锁定
            </Button>
          )}
          <Popconfirm
            title="确定要删除此用户吗?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button 
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Title level={3}>用户管理</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddUser}
          >
            添加用户
          </Button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <Space wrap>
            <Input
              placeholder="用户名"
              value={filters.username}
              onChange={e => setFilters({ ...filters, username: e.target.value })}
              style={{ width: 150 }}
            />
            <Input
              placeholder="邮箱"
              value={filters.email}
              onChange={e => setFilters({ ...filters, email: e.target.value })}
              style={{ width: 200 }}
            />
            <Select
              placeholder="角色"
              value={filters.role || undefined}
              onChange={value => setFilters({ ...filters, role: value })}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="admin">管理员</Option>
              <Option value="user">用户</Option>
            </Select>
            <Select
              placeholder="状态"
              value={filters.status || undefined}
              onChange={value => setFilters({ ...filters, status: value })}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="active">活跃</Option>
              <Option value="inactive">非活跃</Option>
              <Option value="locked">锁定</Option>
            </Select>
            <RangePicker placeholder={['注册开始', '注册结束']} />
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              onClick={handleSearch}
            >
              搜索
            </Button>
            <Button 
              onClick={handleReset}
            >
              重置
            </Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 添加/编辑用户模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
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
            <Input placeholder="请输入用户名" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          
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
              <Option value="inactive">非活跃</Option>
              <Option value="locked">锁定</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement; 