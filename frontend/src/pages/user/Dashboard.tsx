import React, { useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Button, Typography, Tooltip } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  SyncOutlined, 
  FileOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '../../store/slices/taskSlice';
import { fetchUserExecutions } from '../../store/slices/userSlice';
import type { RootState, AppDispatch } from '../../store';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { list: tasks, loading: tasksLoading } = useSelector((state: RootState) => state.task);
  const { executions, loading: executionsLoading } = useSelector((state: RootState) => state.user);
  
  useEffect(() => {
    // 获取任务列表和最近执行记录
    dispatch(fetchTasks());
    dispatch(fetchUserExecutions());
  }, [dispatch]);
  
  // 统计数据
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(task => task.is_enabled).length;
  const completedTasks = executions.filter(execution => execution.status === 'success').length;
  const totalFilesScanned = executions.reduce((total, exe) => total + (exe.files_scanned || 0), 0);
  
  // 最近执行记录列
  const executionColumns = [
    {
      title: '任务名称',
      dataIndex: 'task_name',
      key: 'task_name',
      render: (text: string, record: any) => (
        <a onClick={() => navigate(`/tasks/${record.task_id}`)}>{text}</a>
      ),
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'success') {
          return <Text type="success"><CheckCircleOutlined /> 成功</Text>;
        } else if (status === 'running') {
          return <Text type="warning"><SyncOutlined spin /> 运行中</Text>;
        } else {
          return <Text type="danger"><ClockCircleOutlined /> 失败</Text>;
        }
      },
    },
    {
      title: '扫描文件数',
      dataIndex: 'files_scanned',
      key: 'files_scanned',
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      render: (text: string, record: any) => {
        if (record.status === 'running') return '运行中';
        
        const duration = record.end_time ? 
          (new Date(record.end_time).getTime() - new Date(record.start_time).getTime()) / 1000 :
          0;
        
        if (duration < 60) {
          return `${duration.toFixed(0)}秒`;
        } else if (duration < 3600) {
          return `${Math.floor(duration / 60)}分${Math.floor(duration % 60)}秒`;
        } else {
          return `${Math.floor(duration / 3600)}时${Math.floor((duration % 3600) / 60)}分`;
        }
      }
    },
  ];
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2}>仪表盘</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/tasks/create')}
        >
          新建任务
        </Button>
      </div>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="总任务数" 
              value={totalTasks} 
              prefix={<FileOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="活跃任务" 
              value={activeTasks} 
              prefix={<SyncOutlined />} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="成功执行" 
              value={completedTasks} 
              prefix={<CheckCircleOutlined />} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="扫描文件总数" 
              value={totalFilesScanned} 
              prefix={<FileOutlined />} 
            />
          </Card>
        </Col>
      </Row>
      
      <Card 
        title="最近执行记录" 
        extra={<Button type="link" onClick={() => navigate('/logs')}>查看全部</Button>}
      >
        <Table 
          dataSource={executions.slice(0, 5)} 
          columns={executionColumns} 
          rowKey="id" 
          loading={tasksLoading || executionsLoading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Dashboard; 