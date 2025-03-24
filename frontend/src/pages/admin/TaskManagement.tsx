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
  Badge,
  Tooltip,
  Modal,
  Drawer,
  Descriptions,
  Divider,
  Progress,
  Statistic,
  Row,
  Col
} from 'antd';
import { 
  SearchOutlined, 
  SyncOutlined, 
  PauseCircleOutlined, 
  PlayCircleOutlined,
  DeleteOutlined, 
  EditOutlined, 
  EyeOutlined,
  UserOutlined,
  FileOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  FolderOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface Task {
  id: number;
  name: string;
  source_path: string;
  target_path: string;
  schedule: string;
  status: 'active' | 'paused' | 'error' | 'completed';
  last_sync: string;
  created_at: string;
  user_id: number;
  user_name: string;
  file_count?: number;
  sync_size?: number;
  error_count?: number;
  next_run?: string;
}

interface TaskLog {
  id: number;
  time: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// 模拟任务数据
const mockTasks: Task[] = [
  {
    id: 1,
    name: '文档同步',
    source_path: '/文档',
    target_path: '/本地备份/文档',
    schedule: '每天',
    status: 'active',
    last_sync: '2023-03-22 14:30:00',
    created_at: '2023-03-15 10:00:00',
    user_id: 1,
    user_name: 'admin',
    file_count: 256,
    sync_size: 5 * 1024 * 1024 * 1024, // 5GB
    error_count: 0,
    next_run: '2023-03-23 14:30:00'
  },
  {
    id: 2,
    name: '照片备份',
    source_path: '/照片',
    target_path: '/本地备份/照片',
    schedule: '每周',
    status: 'paused',
    last_sync: '2023-03-20 09:15:00',
    created_at: '2023-03-10 16:45:00',
    user_id: 2,
    user_name: 'user1',
    file_count: 1024,
    sync_size: 25 * 1024 * 1024 * 1024, // 25GB
    error_count: 0,
    next_run: '待启动'
  },
  {
    id: 3,
    name: '视频同步',
    source_path: '/视频',
    target_path: '/本地备份/视频',
    schedule: '每月',
    status: 'error',
    last_sync: '2023-03-18 22:10:00',
    created_at: '2023-03-01 14:30:00',
    user_id: 2,
    user_name: 'user1',
    file_count: 128,
    sync_size: 75 * 1024 * 1024 * 1024, // 75GB
    error_count: 3,
    next_run: '待处理'
  },
  {
    id: 4,
    name: '音乐同步',
    source_path: '/音乐',
    target_path: '/本地备份/音乐',
    schedule: '每天',
    status: 'completed',
    last_sync: '2023-03-22 06:00:00',
    created_at: '2023-02-25 11:20:00',
    user_id: 3,
    user_name: 'user2',
    file_count: 512,
    sync_size: 12 * 1024 * 1024 * 1024, // 12GB
    error_count: 0,
    next_run: '2023-03-23 06:00:00'
  },
  {
    id: 5,
    name: '工作文件同步',
    source_path: '/工作',
    target_path: '/本地备份/工作',
    schedule: '每6小时',
    status: 'active',
    last_sync: '2023-03-22 18:00:00',
    created_at: '2023-03-05 09:30:00',
    user_id: 4,
    user_name: 'user3',
    file_count: 384,
    sync_size: 8 * 1024 * 1024 * 1024, // 8GB
    error_count: 0,
    next_run: '2023-03-23 00:00:00'
  }
];

// 模拟任务日志
const mockTaskLogs: TaskLog[] = [
  {
    id: 1,
    time: '2023-03-22 14:30:00',
    type: 'success',
    message: '成功同步了8个文件'
  },
  {
    id: 2,
    time: '2023-03-22 14:29:30',
    type: 'error',
    message: '无法同步文件 "报告.docx"，权限不足'
  },
  {
    id: 3,
    time: '2023-03-22 14:29:00',
    type: 'warning',
    message: '文件 "图片.jpg" 已存在但内容不同，已覆盖'
  },
  {
    id: 4,
    time: '2023-03-22 14:28:00',
    type: 'info',
    message: '开始同步任务'
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
    status: '',
    user: ''
  });
  const [taskDetailVisible, setTaskDetailVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);

  useEffect(() => {
    fetchTasks();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 过滤任务（模拟后端筛选）
      let filteredTasks = [...mockTasks];
      
      if (filters.status) {
        filteredTasks = filteredTasks.filter(task => task.status === filters.status);
      }
      
      if (filters.user) {
        filteredTasks = filteredTasks.filter(task => task.user_name === filters.user);
      }
      
      if (filters.name) {
        const keyword = filters.name.toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
          task.name.toLowerCase().includes(keyword) || 
          task.source_path.toLowerCase().includes(keyword) ||
          task.target_path.toLowerCase().includes(keyword)
        );
      }
      
      setData(filteredTasks);
      setPagination({
        ...pagination,
        total: filteredTasks.length
      });
    } catch (error) {
      console.error('获取任务列表失败:', error);
      message.error('获取任务列表失败');
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
      status: '',
      user: ''
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

  const handlePauseTask = async (id: number) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('任务已暂停');
      fetchTasks();
    } catch (error) {
      message.error('暂停失败，请稍后重试');
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    // 获取任务日志
    setTaskLogs(mockTaskLogs);
    setTaskDetailVisible(true);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusTag = (status: string) => {
    let color = 'green';
    let text = '运行中';
    let icon = <SyncOutlined spin />;
    
    if (status === 'paused') {
      color = 'orange';
      text = '已暂停';
      icon = <PauseCircleOutlined />;
    } else if (status === 'error') {
      color = 'red';
      text = '错误';
      icon = <WarningOutlined />;
    } else if (status === 'completed') {
      color = 'blue';
      text = '已完成';
      icon = <CheckCircleOutlined />;
    }
    
    return (
      <Tag color={color} icon={icon}>
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
      width: 150,
      render: (text: string, record: Task) => (
        <a onClick={() => handleViewTask(record)}>{text}</a>
      )
    },
    {
      title: '用户',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 120,
      render: (text: string, record: Task) => (
        <Link to={`/admin/users/${record.user_id}`}>
          <UserOutlined /> {text}
        </Link>
      )
    },
    {
      title: '源路径',
      dataIndex: 'source_path',
      key: 'source_path',
      width: 150,
      ellipsis: true
    },
    {
      title: '目标路径',
      dataIndex: 'target_path',
      key: 'target_path',
      width: 150,
      ellipsis: true
    },
    {
      title: '计划',
      dataIndex: 'schedule',
      key: 'schedule',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '文件数',
      dataIndex: 'file_count',
      key: 'file_count',
      width: 100
    },
    {
      title: '同步大小',
      dataIndex: 'sync_size',
      key: 'sync_size',
      width: 120,
      render: (size?: number) => size ? formatBytes(size) : '-'
    },
    {
      title: '最后同步',
      dataIndex: 'last_sync',
      key: 'last_sync',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Task) => (
        <Space size="small">
          {record.status === 'active' ? (
            <Button 
              size="small" 
              icon={<PauseCircleOutlined />}
              onClick={() => handlePauseTask(record.id)}
            >
              暂停
            </Button>
          ) : (
            <Button 
              size="small" 
              type="primary" 
              icon={<PlayCircleOutlined />}
              onClick={() => handleRunTask(record.id)}
              disabled={record.status === 'completed'}
            >
              启动
            </Button>
          )}
          <Button 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewTask(record)}
          >
            查看
          </Button>
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
              placeholder="搜索任务名称或路径"
              value={filters.name}
              onChange={e => setFilters({ ...filters, name: e.target.value })}
              style={{ width: 250 }}
              allowClear
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
            <Select
              placeholder="用户"
              value={filters.user || undefined}
              onChange={value => setFilters({ ...filters, user: value })}
              allowClear
              style={{ width: 150 }}
            >
              <Option value="admin">admin</Option>
              <Option value="user1">user1</Option>
              <Option value="user2">user2</Option>
              <Option value="user3">user3</Option>
            </Select>
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
          scroll={{ x: 1500 }}
        />
      </Card>
      
      <Drawer
        title="任务详情"
        placement="right"
        width={700}
        onClose={() => setTaskDetailVisible(false)}
        open={taskDetailVisible}
      >
        {selectedTask && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <Title level={4}>{selectedTask.name}</Title>
              <Space>
                {selectedTask.status === 'active' ? (
                  <Button 
                    icon={<PauseCircleOutlined />} 
                    onClick={() => handlePauseTask(selectedTask.id)}
                  >
                    暂停任务
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    icon={<PlayCircleOutlined />} 
                    onClick={() => handleRunTask(selectedTask.id)}
                    disabled={selectedTask.status === 'completed'}
                  >
                    启动任务
                  </Button>
                )}
              </Space>
            </div>
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic 
                  title="文件数量" 
                  value={selectedTask.file_count || 0} 
                  prefix={<FileOutlined />} 
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="同步大小" 
                  value={selectedTask.sync_size ? formatBytes(selectedTask.sync_size) : '0 Bytes'}
                  prefix={<FolderOutlined />} 
                />
              </Col>
            </Row>
            
            <Divider />
            
            <Descriptions title="基本信息" bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label="ID">{selectedTask.id}</Descriptions.Item>
              <Descriptions.Item label="用户">
                <Link to={`/admin/users/${selectedTask.user_id}`}>
                  <UserOutlined /> {selectedTask.user_name}
                </Link>
              </Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(selectedTask.status)}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedTask.created_at}</Descriptions.Item>
              <Descriptions.Item label="最后同步">{selectedTask.last_sync}</Descriptions.Item>
              <Descriptions.Item label="下次同步">{selectedTask.next_run}</Descriptions.Item>
              <Descriptions.Item label="计划">{selectedTask.schedule}</Descriptions.Item>
              <Descriptions.Item label="错误数">
                <span style={{ color: selectedTask.error_count ? '#ff4d4f' : '#52c41a' }}>
                  {selectedTask.error_count || 0}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="源路径" span={2}>
                <Text code>{selectedTask.source_path}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="目标路径" span={2}>
                <Text code>{selectedTask.target_path}</Text>
              </Descriptions.Item>
            </Descriptions>
            
            <Divider orientation="left">
              <Space>
                <HistoryOutlined />
                同步日志
              </Space>
            </Divider>
            
            <Table
              dataSource={taskLogs}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: '时间',
                  dataIndex: 'time',
                  key: 'time',
                  width: 180
                },
                {
                  title: '类型',
                  dataIndex: 'type',
                  key: 'type',
                  width: 100,
                  render: (type: string) => {
                    let icon;
                    let color;
                    let text;
                    
                    switch (type) {
                      case 'success':
                        icon = <CheckCircleOutlined />;
                        color = 'green';
                        text = '成功';
                        break;
                      case 'error':
                        icon = <WarningOutlined />;
                        color = 'red';
                        text = '错误';
                        break;
                      case 'warning':
                        icon = <WarningOutlined />;
                        color = 'orange';
                        text = '警告';
                        break;
                      default:
                        icon = <InfoCircleOutlined />;
                        color = 'blue';
                        text = '信息';
                    }
                    
                    return <Tag icon={icon} color={color}>{text}</Tag>;
                  }
                },
                {
                  title: '消息',
                  dataIndex: 'message',
                  key: 'message'
                }
              ]}
            />
          </>
        )}
      </Drawer>
    </div>
  );
};

export default TaskManagement; 