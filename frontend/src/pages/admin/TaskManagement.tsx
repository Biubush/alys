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
  message 
} from 'antd';
import { 
  SearchOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface Task {
  id: number;
  name: string;
  user: {
    id: number;
    username: string;
  };
  source_path: string;
  target_path: string;
  schedule: string;
  status: 'active' | 'paused' | 'error' | 'completed';
  last_sync: string;
  created_at: string;
  file_count: number;
}

// 模拟任务数据
const mockTasks: Task[] = [
  {
    id: 1,
    name: '文档同步',
    user: {
      id: 1,
      username: '张三'
    },
    source_path: '/文档',
    target_path: '/本地备份/文档',
    schedule: '每天',
    status: 'active',
    last_sync: '2023-03-22 14:30:00',
    created_at: '2023-03-15 10:00:00',
    file_count: 56
  },
  {
    id: 2,
    name: '照片备份',
    user: {
      id: 2,
      username: '李四'
    },
    source_path: '/照片',
    target_path: '/本地备份/照片',
    schedule: '每周',
    status: 'paused',
    last_sync: '2023-03-20 09:15:00',
    created_at: '2023-03-10 16:45:00',
    file_count: 128
  },
  {
    id: 3,
    name: '视频同步',
    user: {
      id: 3,
      username: '王五'
    },
    source_path: '/视频',
    target_path: '/本地备份/视频',
    schedule: '每月',
    status: 'error',
    last_sync: '2023-03-18 22:10:00',
    created_at: '2023-03-01 14:30:00',
    file_count: 5
  },
  {
    id: 4,
    name: '音乐同步',
    user: {
      id: 4,
      username: '赵六'
    },
    source_path: '/音乐',
    target_path: '/本地备份/音乐',
    schedule: '每天',
    status: 'completed',
    last_sync: '2023-03-22 06:00:00',
    created_at: '2023-02-25 11:20:00',
    file_count: 87
  }
];

const TaskManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    name: '',
    username: '',
    status: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 在实际应用中，这里应该是调用后端API获取任务数据
      // 此处使用模拟数据
      setData(mockTasks);
      setPagination({
        ...pagination,
        total: mockTasks.length
      });
    } catch (error) {
      console.error('获取任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Task> | SorterResult<Task>[]
  ) => {
    setPagination(pagination);
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchTasks();
  };

  const handleReset = () => {
    setFilters({
      name: '',
      username: '',
      status: ''
    });
    setPagination({ ...pagination, current: 1 });
    fetchTasks();
  };

  const handleDeleteTask = async (id: number) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('任务删除成功');
      fetchTasks();
    } catch (error) {
      message.error('删除失败，请稍后重试');
    }
  };

  const handleToggleTaskStatus = async (id: number, status: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 更新状态
      const newStatus = status === 'active' ? 'paused' : 'active';
      const statusText = newStatus === 'active' ? '启动' : '暂停';
      
      message.success(`任务${statusText}成功`);
      fetchTasks();
    } catch (error) {
      message.error('操作失败，请稍后重试');
    }
  };

  const handleRunTask = async (id: number) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('任务启动成功');
      fetchTasks();
    } catch (error) {
      message.error('启动失败，请稍后重试');
    }
  };

  const getStatusTag = (status: string) => {
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
  };

  const columns = [
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
        <Link to={`/admin/tasks/${record.id}`}>{text}</Link>
      )
    },
    {
      title: '用户',
      dataIndex: ['user', 'username'],
      key: 'user',
      render: (text: string, record: Task) => (
        <Link to={`/admin/users/${record.user.id}`}>{text}</Link>
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
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '文件数',
      dataIndex: 'file_count',
      key: 'file_count'
    },
    {
      title: '最后同步',
      dataIndex: 'last_sync',
      key: 'last_sync'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Task) => (
        <Space size="small">
          <Button 
            size="small" 
            type="primary" 
            icon={<SyncOutlined />}
            onClick={() => handleRunTask(record.id)}
          >
            运行
          </Button>
          <Button 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/tasks/${record.id}`)}
          >
            查看
          </Button>
          {record.status === 'active' ? (
            <Button 
              size="small"
              icon={<PauseCircleOutlined />}
              onClick={() => handleToggleTaskStatus(record.id, record.status)}
            >
              暂停
            </Button>
          ) : (
            <Button 
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleToggleTaskStatus(record.id, record.status)}
            >
              启动
            </Button>
          )}
          <Popconfirm
            title="确定要删除此任务吗?"
            onConfirm={() => handleDeleteTask(record.id)}
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
          <Title level={3}>任务管理</Title>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <Space wrap>
            <Input
              placeholder="任务名称"
              value={filters.name}
              onChange={e => setFilters({ ...filters, name: e.target.value })}
              style={{ width: 200 }}
            />
            <Input
              placeholder="用户名"
              value={filters.username}
              onChange={e => setFilters({ ...filters, username: e.target.value })}
              style={{ width: 150 }}
            />
            <Select
              placeholder="状态"
              value={filters.status || undefined}
              onChange={value => setFilters({ ...filters, status: value })}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="active">运行中</Option>
              <Option value="paused">已暂停</Option>
              <Option value="error">错误</Option>
              <Option value="completed">已完成</Option>
            </Select>
            <RangePicker placeholder={['开始日期', '结束日期']} />
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
          scroll={{ x: 1300 }}
        />
      </Card>
    </div>
  );
};

export default TaskManagement; 