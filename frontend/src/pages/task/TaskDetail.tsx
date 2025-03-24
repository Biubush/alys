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
  Alert
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
  FolderOutlined
} from '@ant-design/icons';

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
}

interface SyncLog {
  id: number;
  time: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
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
  error_count: 2
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

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

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
    } catch (error) {
      console.error('获取任务详情失败:', error);
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
    } catch (error) {
      console.error('运行任务失败:', error);
    }
  };

  const handlePauseTask = async () => {
    if (!task) return;
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setTask({ ...task, status: 'paused' });
    } catch (error) {
      console.error('暂停任务失败:', error);
    }
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

  if (!task) {
    return (
      <Card>
        <Empty
          description="未找到任务信息"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button type="primary" onClick={() => navigate('/tasks')}>
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
              >
                运行任务
              </Button>
            )}
            <Button 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/tasks/${id}/edit`)}
            >
              编辑任务
            </Button>
            <Button 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => {
                // 应该增加确认对话框
                navigate('/tasks');
              }}
            >
              删除任务
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
          <Descriptions.Item label="状态">{getStatusTag(task.status)}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{task.created_at}</Descriptions.Item>
          <Descriptions.Item label="最后同步">{task.last_sync}</Descriptions.Item>
          <Descriptions.Item label="计划" span={2}>{task.schedule}</Descriptions.Item>
          <Descriptions.Item label="源路径" span={3}>
            <Text code>{task.source_path}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="目标路径" span={3}>
            <Text code>{task.target_path}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="描述" span={3}>
            {task.description || '无描述'}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Title level={4}>同步日志</Title>
        {syncLogs.length > 0 ? (
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
                icon = <ClockCircleOutlined />;
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
        )}
      </Card>
    </div>
  );
};

export default TaskDetail; 