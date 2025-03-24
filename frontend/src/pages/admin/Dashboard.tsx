import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Progress, List, Space, Spin, Alert } from 'antd';
import { 
  UserOutlined, 
  FileOutlined, 
  CloudSyncOutlined, 
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  HddOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

interface StatisticsData {
  totalUsers: number;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  errorTasks: number;
  diskUsage: number;
  diskTotal: number;
  recentSyncs: {
    id: number;
    taskName: string;
    time: string;
    status: 'success' | 'error' | 'warning';
    message: string;
  }[];
  topTasks: {
    id: number;
    name: string;
    fileCount: number;
    syncSize: number;
  }[];
}

// 模拟数据
const mockStatistics: StatisticsData = {
  totalUsers: 12,
  totalTasks: 24,
  activeTasks: 16,
  completedTasks: 6,
  errorTasks: 2,
  diskUsage: 128 * 1024 * 1024 * 1024, // 128GB
  diskTotal: 500 * 1024 * 1024 * 1024, // 500GB
  recentSyncs: [
    {
      id: 1,
      taskName: '文档同步',
      time: '2023-03-23 14:35:22',
      status: 'success',
      message: '成功同步 25 个文件'
    },
    {
      id: 2,
      taskName: '照片备份',
      time: '2023-03-23 12:22:15',
      status: 'error',
      message: '无法连接到阿里云盘'
    },
    {
      id: 3,
      taskName: '视频同步',
      time: '2023-03-23 10:15:43',
      status: 'warning',
      message: '3 个文件无法同步'
    },
    {
      id: 4,
      taskName: '音乐同步',
      time: '2023-03-23 08:05:11',
      status: 'success',
      message: '成功同步 12 个文件'
    }
  ],
  topTasks: [
    {
      id: 1,
      name: '文档同步',
      fileCount: 1256,
      syncSize: 5 * 1024 * 1024 * 1024 // 5GB
    },
    {
      id: 2,
      name: '照片备份',
      fileCount: 3256,
      syncSize: 25 * 1024 * 1024 * 1024 // 25GB
    },
    {
      id: 3,
      name: '视频同步',
      fileCount: 512,
      syncSize: 75 * 1024 * 1024 * 1024 // 75GB
    },
    {
      id: 4,
      name: '音乐同步',
      fileCount: 2048,
      syncSize: 12 * 1024 * 1024 * 1024 // 12GB
    }
  ]
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 实际项目中这里应该调用后端API
      setStats(mockStatistics);
    } catch (err) {
      console.error('获取统计数据失败:', err);
      setError('获取统计数据失败，请稍后重试');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <Alert
        message="错误"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  if (!stats) {
    return (
      <Alert
        message="数据不可用"
        description="无法加载仪表盘数据"
        type="warning"
        showIcon
      />
    );
  }

  const diskUsagePercent = Math.round((stats.diskUsage / stats.diskTotal) * 100);

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={3}>系统概览</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="任务总数"
              value={stats.totalTasks}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="活跃任务"
              value={stats.activeTasks}
              prefix={<CloudSyncOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="错误任务"
              value={stats.errorTasks}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} md={12}>
          <Card title="磁盘使用情况">
            <Statistic
              title="已使用空间"
              value={formatBytes(stats.diskUsage)}
              suffix={` / ${formatBytes(stats.diskTotal)}`}
              prefix={<HddOutlined />}
            />
            <div style={{ marginTop: '20px' }}>
              <Progress
                percent={diskUsagePercent}
                status={diskUsagePercent > 90 ? 'exception' : 'normal'}
                strokeWidth={12}
              />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="最近同步">
            <List
              dataSource={stats.recentSyncs}
              renderItem={item => {
                let icon;
                
                if (item.status === 'success') {
                  icon = <CheckCircleOutlined style={{ color: '#52c41a' }} />;
                } else if (item.status === 'error') {
                  icon = <WarningOutlined style={{ color: '#ff4d4f' }} />;
                } else {
                  icon = <ClockCircleOutlined style={{ color: '#faad14' }} />;
                }
                
                return (
                  <List.Item>
                    <Space>
                      {icon}
                      <Link to={`/tasks/${item.id}`}>{item.taskName}</Link>
                      <Text type="secondary" style={{ marginLeft: '8px' }}>{item.time}</Text>
                      <Text>{item.message}</Text>
                    </Space>
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="热门任务">
            <Table
              dataSource={stats.topTasks}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: '任务名称',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record) => <Link to={`/tasks/${record.id}`}>{text}</Link>
                },
                {
                  title: '文件数',
                  dataIndex: 'fileCount',
                  key: 'fileCount',
                  sorter: (a, b) => a.fileCount - b.fileCount
                },
                {
                  title: '同步大小',
                  dataIndex: 'syncSize',
                  key: 'syncSize',
                  sorter: (a, b) => a.syncSize - b.syncSize,
                  render: (size) => formatBytes(size)
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 