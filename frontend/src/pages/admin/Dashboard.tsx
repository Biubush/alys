import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Typography, 
  Tag, 
  List, 
  Avatar,
  Space,
  Button
} from 'antd';
import { 
  UserOutlined, 
  CloudSyncOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

// 模拟数据
const mockStats = {
  totalUsers: 156,
  activeUsers: 89,
  totalTasks: 342,
  activeTasks: 127,
  successTasks: 98,
  failedTasks: 14,
  pendingTasks: 15,
  totalStorage: 1024 * 1024 * 1024 * 50, // 50GB
  usedStorage: 1024 * 1024 * 1024 * 32, // 32GB
};

const mockRecentUsers = [
  { id: 1, username: '张三', email: 'zhangsan@example.com', lastLogin: '2023-03-21 15:30', status: 'active' },
  { id: 2, username: '李四', email: 'lisi@example.com', lastLogin: '2023-03-21 12:45', status: 'active' },
  { id: 3, username: '王五', email: 'wangwu@example.com', lastLogin: '2023-03-20 18:30', status: 'inactive' },
  { id: 4, username: '赵六', email: 'zhaoliu@example.com', lastLogin: '2023-03-19 09:15', status: 'active' },
];

const mockRecentTasks = [
  { id: 1, name: '文档同步', user: '张三', status: 'success', time: '2023-03-22 14:30', files: 56 },
  { id: 2, name: '照片备份', user: '李四', status: 'failed', time: '2023-03-22 13:15', files: 128 },
  { id: 3, name: '视频同步', user: '王五', status: 'pending', time: '2023-03-22 12:00', files: 5 },
  { id: 4, name: '音乐同步', user: '赵六', status: 'success', time: '2023-03-22 10:45', files: 87 },
];

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getStatusTag = (status: string) => {
  switch (status) {
    case 'success':
      return <Tag color="success" icon={<CheckCircleOutlined />}>成功</Tag>;
    case 'failed':
      return <Tag color="error" icon={<ExclamationCircleOutlined />}>失败</Tag>;
    case 'pending':
      return <Tag color="processing" icon={<ClockCircleOutlined />}>等待中</Tag>;
    case 'active':
      return <Tag color="green">活跃</Tag>;
    case 'inactive':
      return <Tag color="default">非活跃</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState(mockStats);
  const [recentUsers, setRecentUsers] = useState(mockRecentUsers);
  const [recentTasks, setRecentTasks] = useState(mockRecentTasks);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 在实际应用中，这里会从API获取数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 假设从API获取的数据
      setStats(mockStats);
      setRecentUsers(mockRecentUsers);
      setRecentTasks(mockRecentTasks);
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={3}>管理员仪表板</Title>
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
            <div style={{ marginTop: '10px' }}>
              <Text type="secondary">活跃用户: {stats.activeUsers}</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={stats.totalTasks}
              prefix={<CloudSyncOutlined />}
            />
            <div style={{ marginTop: '10px' }}>
              <Text type="secondary">运行中: {stats.activeTasks}</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="同步状态"
              value={stats.successTasks}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
              suffix={`/${stats.activeTasks}`}
            />
            <div style={{ marginTop: '10px' }}>
              <Text type="danger">失败任务: {stats.failedTasks}</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="存储使用"
              value={(stats.usedStorage / stats.totalStorage * 100).toFixed(2)}
              suffix="%"
            />
            <div style={{ marginTop: '10px' }}>
              <Text type="secondary">{formatBytes(stats.usedStorage)} / {formatBytes(stats.totalStorage)}</Text>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 最近用户 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最近活跃用户" extra={<Link to="/admin/users">查看全部</Link>}>
            <List
              loading={loading}
              dataSource={recentUsers}
              renderItem={user => (
                <List.Item
                  key={user.id}
                  actions={[
                    <Link to={`/admin/users/${user.id}`} key="view">
                      <Button type="link" icon={<EyeOutlined />} size="small">
                        查看
                      </Button>
                    </Link>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={<Link to={`/admin/users/${user.id}`}>{user.username}</Link>}
                    description={user.email}
                  />
                  <div>
                    <div>{user.lastLogin}</div>
                    <div>{getStatusTag(user.status)}</div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        {/* 最近任务 */}
        <Col xs={24} lg={12}>
          <Card title="最近同步任务" extra={<Link to="/admin/tasks">查看全部</Link>}>
            <List
              loading={loading}
              dataSource={recentTasks}
              renderItem={task => (
                <List.Item
                  key={task.id}
                  actions={[
                    <Link to={`/admin/tasks/${task.id}`} key="view">
                      <Button type="link" icon={<EyeOutlined />} size="small">
                        详情
                      </Button>
                    </Link>
                  ]}
                >
                  <List.Item.Meta
                    title={<Link to={`/admin/tasks/${task.id}`}>{task.name}</Link>}
                    description={`用户: ${task.user} | 文件数: ${task.files}`}
                  />
                  <div>
                    <div>{task.time}</div>
                    <div>{getStatusTag(task.status)}</div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard; 