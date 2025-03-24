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
  Timeline,
  Empty,
  Statistic,
  Row,
  Col,
  Alert,
  Tabs,
  Table,
  Modal,
  message
} from 'antd';
import {
  SyncOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  FileOutlined,
  FolderOutlined,
  UserOutlined,
  RollbackOutlined,
  HistoryOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import type { TabsProps } from 'antd';

const { Title, Text } = Typography;

interface Task {
  id: number;
  name: string;
  source_path: string;
  target_path: string;
  schedule: string;
  status: 'active' | 'paused' | 'error' | 'completed';
  last_sync: string;
  created_at: string;
  description?: string;
  file_count?: number;
  sync_count?: number;
  sync_size?: number;
  error_count?: number;
  user_id: number;
  user_name: string;
  next_run?: string;
  ignore_patterns?: string;
  sync_delete?: boolean;
}

interface SyncLog {
  id: number;
  time: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface SyncFile {
  id: number;
  name: string;
  path: string;
  size: number;
  status: 'synced' | 'pending' | 'error';
  last_sync: string;
  error_message?: string;
}

// 模拟任务数据
const mockTask: Task = {
  id: 1,
  name: '文档同步',
  source_path: '/文档',
  target_path: '/本地备份/文档',
  schedule: '每天',
  status: 'active',
  last_sync: '2023-03-22 14:30:00',
  created_at: '2023-03-15 10:00:00',
  description: '同步阿里云盘中的文档到本地备份目录',
  file_count: 256,
  sync_count: 10,
  sync_size: 1024 * 1024 * 50, // 50MB
  error_count: 2,
  user_id: 2,
  user_name: 'user1',
  next_run: '2023-03-23 14:30:00',
  ignore_patterns: '*.tmp\n.DS_Store',
  sync_delete: true
};

// 模拟同步日志
const mockSyncLogs: SyncLog[] = [
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
  },
  {
    id: 5,
    time: '2023-03-20 09:15:00',
    type: 'success',
    message: '成功同步了12个文件'
  }
];

// 模拟同步文件列表
const mockSyncFiles: SyncFile[] = [
  {
    id: 1,
    name: '工作报告.docx',
    path: '/文档/工作报告.docx',
    size: 2.5 * 1024 * 1024, // 2.5MB
    status: 'synced',
    last_sync: '2023-03-22 14:30:00'
  },
  {
    id: 2,
    name: '项目计划.xlsx',
    path: '/文档/项目计划.xlsx',
    size: 1.8 * 1024 * 1024, // 1.8MB
    status: 'synced',
    last_sync: '2023-03-22 14:29:45'
  },
  {
    id: 3,
    name: '会议记录.docx',
    path: '/文档/会议记录.docx',
    size: 1.2 * 1024 * 1024, // 1.2MB
    status: 'synced',
    last_sync: '2023-03-22 14:29:30'
  },
  {
    id: 4,
    name: '报告.docx',
    path: '/文档/财务/报告.docx',
    size: 3.1 * 1024 * 1024, // 3.1MB
    status: 'error',
    last_sync: '2023-03-22 14:29:30',
    error_message: '权限不足'
  },
  {
    id: 5,
    name: '图片.jpg',
    path: '/文档/图片.jpg',
    size: 4.7 * 1024 * 1024, // 4.7MB
    status: 'synced',
    last_sync: '2023-03-22 14:29:00'
  }
];

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [syncFiles, setSyncFiles] = useState<SyncFile[]>([]);
  const [activeTabKey, setActiveTabKey] = useState('1');

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 实际项目中应该从API获取数据
      setTask(mockTask);
      setSyncLogs(mockSyncLogs);
      setSyncFiles(mockSyncFiles);
    } catch (error) {
      console.error('获取任务详情失败:', error);
      message.error('获取任务详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRunTask = async () => {
    if (!task) return;
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setTask({ ...task, status: 'active' });
      message.success('任务已启动');
    } catch (error) {
      console.error('运行任务失败:', error);
      message.error('运行任务失败');
    }
  };

  const handlePauseTask = async () => {
    if (!task) return;
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setTask({ ...task, status: 'paused' });
      message.success('任务已暂停');
    } catch (error) {
      console.error('暂停任务失败:', error);
      message.error('暂停任务失败');
    }
  };

  const handleDeleteTask = () => {
    Modal.confirm({
      title: '删除任务',
      content: '确定要删除此任务吗？此操作不可撤销。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500));
          message.success('任务删除成功');
          navigate('/admin/tasks');
        } catch (error) {
          console.error('删除任务失败:', error);
          message.error('删除任务失败');
        }
      }
    });
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

  const getFileStatusTag = (status: string) => {
    if (status === 'synced') {
      return <Tag color="green" icon={<CheckCircleOutlined />}>已同步</Tag>;
    } else if (status === 'pending') {
      return <Tag color="blue" icon={<ClockCircleOutlined />}>等待同步</Tag>;
    } else {
      return <Tag color="red" icon={<WarningOutlined />}>错误</Tag>;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileColumns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      ellipsis: true
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatBytes(size)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getFileStatusTag(status)
    },
    {
      title: '最后同步',
      dataIndex: 'last_sync',
      key: 'last_sync'
    },
    {
      title: '错误信息',
      dataIndex: 'error_message',
      key: 'error_message',
      render: (text: string) => text || '-'
    }
  ];

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span>
          <HistoryOutlined />
          同步日志
        </span>
      ),
      children: syncLogs.length > 0 ? (
        <Timeline>
          {syncLogs.map(log => {
            let color = 'blue';
            let icon = null;
            
            if (log.type === 'success') {
              color = 'green';
              icon = <CheckCircleOutlined />;
            } else if (log.type === 'error') {
              color = 'red';
              icon = <WarningOutlined />;
            } else if (log.type === 'warning') {
              color = 'orange';
              icon = <WarningOutlined />;
            } else if (log.type === 'info') {
              icon = <InfoCircleOutlined />;
            }
            
            return (
              <Timeline.Item key={log.id} color={color} dot={icon}>
                <p><Text type="secondary">{log.time}</Text></p>
                <p>{log.message}</p>
              </Timeline.Item>
            );
          })}
        </Timeline>
      ) : (
        <Empty description="暂无同步日志" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <FileOutlined />
          同步文件
        </span>
      ),
      children: syncFiles.length > 0 ? (
        <Table
          columns={fileColumns}
          dataSource={syncFiles}
          rowKey="id"
          pagination={false}
        />
      ) : (
        <Empty description="暂无同步文件" image={Empty.PRESENTED_IMAGE_SIMPLE} />
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

  if (!task) {
    return (
      <Card>
        <Empty
          description="未找到任务信息"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button type="primary" onClick={() => navigate('/admin/tasks')}>
            返回任务列表
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={3}>{task.name}</Title>
          <Space>
            {task.status === 'active' ? (
              <Button 
                icon={<PauseCircleOutlined />} 
                onClick={handlePauseTask}
              >
                暂停任务
              </Button>
            ) : (
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />} 
                onClick={handleRunTask}
                disabled={task.status === 'completed'}
              >
                运行任务
              </Button>
            )}
            <Button 
              danger 
              icon={<DeleteOutlined />}
              onClick={handleDeleteTask}
            >
              删除任务
            </Button>
            <Button 
              icon={<RollbackOutlined />}
              onClick={() => navigate('/admin/tasks')}
            >
              返回列表
            </Button>
          </Space>
        </div>

        {task.status === 'error' && (
          <Alert
            message="任务执行失败"
            description="上次同步过程中出现错误，请检查日志并解决问题后重新运行任务。"
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        )}

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Statistic 
              title="文件数量" 
              value={task.file_count || 0} 
              prefix={<FileOutlined />} 
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic 
              title="已同步" 
              value={task.sync_count || 0} 
              prefix={<SyncOutlined />} 
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic 
              title="同步大小" 
              value={formatBytes(task.sync_size || 0)}
              prefix={<FolderOutlined />} 
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic 
              title="错误数" 
              value={task.error_count || 0}
              valueStyle={{ color: task.error_count ? '#cf1322' : '#3f8600' }}
              prefix={<WarningOutlined />} 
            />
          </Col>
        </Row>

        <Divider />

        <Descriptions title="任务信息" bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="ID">{task.id}</Descriptions.Item>
          <Descriptions.Item label="用户">
            <a href={`/admin/users/${task.user_id}`}>
              <UserOutlined /> {task.user_name}
            </a>
          </Descriptions.Item>
          <Descriptions.Item label="状态">{getStatusTag(task.status)}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{task.created_at}</Descriptions.Item>
          <Descriptions.Item label="最后同步">{task.last_sync}</Descriptions.Item>
          <Descriptions.Item label="下次同步">{task.next_run || '-'}</Descriptions.Item>
          <Descriptions.Item label="计划" span={2}>{task.schedule}</Descriptions.Item>
          <Descriptions.Item label="同步删除">
            <Tag color={task.sync_delete ? 'green' : 'orange'}>
              {task.sync_delete ? '是' : '否'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="源路径" span={3}>
            <Text code>{task.source_path}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="目标路径" span={3}>
            <Text code>{task.target_path}</Text>
          </Descriptions.Item>
          {task.description && (
            <Descriptions.Item label="描述" span={3}>
              {task.description}
            </Descriptions.Item>
          )}
          {task.ignore_patterns && (
            <Descriptions.Item label="忽略模式" span={3}>
              <pre style={{ margin: 0 }}>{task.ignore_patterns}</pre>
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider />

        <Tabs 
          activeKey={activeTabKey} 
          onChange={setActiveTabKey}
          items={items}
        />
      </Card>
    </div>
  );
};

export default TaskDetail; 