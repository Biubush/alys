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
  Drawer,
  Form,
  Input,
  Select,
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
  EyeOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
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

interface FileItem {
  id: number;
  name: string;
  path: string;
  size: number;
  type: string;
  sync_status: 'synced' | 'pending' | 'error';
  last_modified: string;
}

// 模拟任务数据
const mockTask: Task = {
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

// 模拟文件列表
const mockFiles: FileItem[] = [
  {
    id: 1,
    name: '工作报告.docx',
    path: '/文档/工作报告.docx',
    size: 1024 * 1024 * 2, // 2MB
    type: 'document',
    sync_status: 'synced',
    last_modified: '2023-03-22 10:30:00'
  },
  {
    id: 2,
    name: '会议记录.pdf',
    path: '/文档/会议记录.pdf',
    size: 1024 * 1024 * 5, // 5MB
    type: 'document',
    sync_status: 'synced',
    last_modified: '2023-03-21 16:45:00'
  },
  {
    id: 3,
    name: '项目计划.xlsx',
    path: '/文档/项目计划.xlsx',
    size: 1024 * 512, // 512KB
    type: 'document',
    sync_status: 'pending',
    last_modified: '2023-03-22 09:15:00'
  },
  {
    id: 4,
    name: '错误文件.txt',
    path: '/文档/错误文件.txt',
    size: 1024 * 10, // 10KB
    type: 'document',
    sync_status: 'error',
    last_modified: '2023-03-22 11:30:00'
  }
];

const AdminTaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();

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
      setFiles(mockFiles);
      
      // 设置表单初始值
      form.setFieldsValue({
        name: mockTask.name,
        source_path: mockTask.source_path,
        target_path: mockTask.target_path,
        status: mockTask.status,
        description: mockTask.description
      });
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
      message.success('任务已启动');
      setTask({ ...task, status: 'active' });
    } catch (error) {
      message.error('启动任务失败');
    }
  };

  const handlePauseTask = async () => {
    if (!task) return;
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('任务已暂停');
      setTask({ ...task, status: 'paused' });
    } catch (error) {
      message.error('暂停任务失败');
    }
  };

  const handleDeleteTask = async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('任务删除成功');
      navigate('/admin/tasks');
    } catch (error) {
      message.error('删除任务失败');
    }
  };

  const showEditDrawer = () => {
    setDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      message.success('任务更新成功');
      setDrawerVisible(false);
      
      // 更新本地任务数据
      if (task) {
        setTask({
          ...task,
          ...values
        });
      }
    } catch (error) {
      console.error('提交表单失败:', error);
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

  const getFileSyncStatusTag = (status: string) => {
    if (status === 'synced') {
      return <Tag color="success" icon={<CheckCircleOutlined />}>已同步</Tag>;
    } else if (status === 'pending') {
      return <Tag color="processing" icon={<SyncOutlined spin />}>等待中</Tag>;
    } else if (status === 'error') {
      return <Tag color="error" icon={<WarningOutlined />}>错误</Tag>;
    }
    return <Tag>{status}</Tag>;
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
      title: '类型',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: '同步状态',
      dataIndex: 'sync_status',
      key: 'sync_status',
      render: (status: string) => getFileSyncStatusTag(status)
    },
    {
      title: '最后修改',
      dataIndex: 'last_modified',
      key: 'last_modified'
    }
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
              >
                运行任务
              </Button>
            )}
            <Button 
              icon={<EditOutlined />} 
              onClick={showEditDrawer}
            >
              编辑任务
            </Button>
            <Button 
              danger 
              icon={<DeleteOutlined />}
              onClick={handleDeleteTask}
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
            <Card>
              <Statistic 
                title="文件数量" 
                value={task.file_count || 0} 
                prefix={<FileOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="已同步" 
                value={task.sync_count || 0} 
                prefix={<SyncOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="同步大小" 
                value={formatBytes(task.sync_size || 0)}
                prefix={<FolderOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="错误数" 
                value={task.error_count || 0}
                valueStyle={{ color: task.error_count ? '#cf1322' : '#3f8600' }}
                prefix={<WarningOutlined />} 
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        <Descriptions title="任务信息" bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="ID">{task.id}</Descriptions.Item>
          <Descriptions.Item label="状态">{getStatusTag(task.status)}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{task.created_at}</Descriptions.Item>
          <Descriptions.Item label="最后同步">{task.last_sync}</Descriptions.Item>
          <Descriptions.Item label="计划">{task.schedule}</Descriptions.Item>
          <Descriptions.Item label="用户">
            <Link to={`/admin/users/${task.user.id}`}>
              <Space>
                <UserOutlined />
                {task.user.username}
              </Space>
            </Link>
          </Descriptions.Item>
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

        <Tabs defaultActiveKey="logs">
          <TabPane tab="同步日志" key="logs">
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
          </TabPane>
          
          <TabPane tab="文件列表" key="files">
            <Table 
              columns={fileColumns} 
              dataSource={files} 
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 编辑任务抽屉 */}
      <Drawer
        title="编辑任务"
        width={500}
        onClose={handleDrawerClose}
        open={drawerVisible}
        extra={
          <Space>
            <Button onClick={handleDrawerClose}>取消</Button>
            <Button type="primary" onClick={handleFormSubmit}>
              保存
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          
          <Form.Item
            name="source_path"
            label="源路径 (阿里云盘)"
            rules={[{ required: true, message: '请输入源路径' }]}
          >
            <Input placeholder="/照片" prefix={<FolderOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="target_path"
            label="目标路径 (本地/远程)"
            rules={[{ required: true, message: '请输入目标路径' }]}
          >
            <Input placeholder="/备份/照片" prefix={<FolderOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">运行中</Option>
              <Option value="paused">已暂停</Option>
              <Option value="error">错误</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="任务描述"
          >
            <TextArea rows={4} placeholder="请输入任务描述（可选）" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default AdminTaskDetail;