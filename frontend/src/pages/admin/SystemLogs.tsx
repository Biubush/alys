import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Typography, 
  Space, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Tag,
  Drawer,
  Descriptions
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface LogEntry {
  id: number;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  module: string;
  user?: {
    id: number;
    username: string;
  };
  details?: string;
  ip_address?: string;
  user_agent?: string;
}

// 模拟日志数据
const mockLogs: LogEntry[] = [
  {
    id: 1,
    timestamp: '2023-03-22 14:30:00',
    level: 'info',
    message: '用户登录成功',
    module: '身份验证',
    user: {
      id: 1,
      username: '张三'
    },
    details: 'Login success via username/password',
    ip_address: '192.168.1.100',
    user_agent: 'Chrome 110.0.0.0 / Windows 10'
  },
  {
    id: 2,
    timestamp: '2023-03-22 14:29:00',
    level: 'error',
    message: '同步任务失败',
    module: '任务管理',
    user: {
      id: 2,
      username: '李四'
    },
    details: 'Failed to sync files: Permission denied to target folder',
    ip_address: '192.168.1.101',
    user_agent: 'Firefox 102.0 / macOS 12.0'
  },
  {
    id: 3,
    timestamp: '2023-03-22 14:15:00',
    level: 'warning',
    message: '阿里云盘连接不稳定',
    module: '网络',
    details: 'Connection timeout after 30 seconds'
  },
  {
    id: 4,
    timestamp: '2023-03-22 13:45:00',
    level: 'info',
    message: '系统启动',
    module: '系统',
    details: 'System started with version 1.2.0'
  },
  {
    id: 5,
    timestamp: '2023-03-22 13:30:00',
    level: 'debug',
    message: '数据库连接池初始化',
    module: '数据库',
    details: 'Initialized database connection pool with 10 connections'
  },
  {
    id: 6,
    timestamp: '2023-03-22 12:30:00',
    level: 'error',
    message: '磁盘空间不足',
    module: '系统',
    details: 'Disk space critically low (5% remaining)'
  }
];

const SystemLogs: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    level: '',
    module: '',
    keyword: '',
    dateRange: []
  });
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 在实际应用中，这里应该是调用后端API获取日志数据
      // 此处使用模拟数据
      setData(mockLogs);
      setPagination({
        ...pagination,
        total: mockLogs.length
      });
    } catch (error) {
      console.error('获取日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<LogEntry> | SorterResult<LogEntry>[]
  ) => {
    setPagination(pagination);
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchLogs();
  };

  const handleReset = () => {
    setFilters({
      level: '',
      module: '',
      keyword: '',
      dateRange: []
    });
    setPagination({ ...pagination, current: 1 });
    fetchLogs();
  };

  const showLogDetails = (log: LogEntry) => {
    setSelectedLog(log);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const getLevelTag = (level: string) => {
    switch (level) {
      case 'info':
        return <Tag color="blue" icon={<InfoCircleOutlined />}>信息</Tag>;
      case 'warning':
        return <Tag color="orange" icon={<WarningOutlined />}>警告</Tag>;
      case 'error':
        return <Tag color="red" icon={<WarningOutlined />}>错误</Tag>;
      case 'debug':
        return <Tag color="green" icon={<CheckCircleOutlined />}>调试</Tag>;
      default:
        return <Tag>{level}</Tag>;
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
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => getLevelTag(level)
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true
    },
    {
      title: '用户',
      dataIndex: ['user', 'username'],
      key: 'user',
      width: 120,
      render: (text: string, record: LogEntry) => 
        record.user ? (
          <Space>
            <UserOutlined />
            {text}
          </Space>
        ) : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: LogEntry) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => showLogDetails(record)}
        >
          详情
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <Card>
        <Title level={3}>系统日志</Title>
        
        <div style={{ marginBottom: '20px' }}>
          <Space wrap>
            <Select
              placeholder="日志级别"
              style={{ width: 120 }}
              value={filters.level || undefined}
              onChange={value => setFilters({ ...filters, level: value })}
              allowClear
            >
              <Option value="info">信息</Option>
              <Option value="warning">警告</Option>
              <Option value="error">错误</Option>
              <Option value="debug">调试</Option>
            </Select>
            
            <Select
              placeholder="模块"
              style={{ width: 150 }}
              value={filters.module || undefined}
              onChange={value => setFilters({ ...filters, module: value })}
              allowClear
            >
              <Option value="身份验证">身份验证</Option>
              <Option value="任务管理">任务管理</Option>
              <Option value="网络">网络</Option>
              <Option value="系统">系统</Option>
              <Option value="数据库">数据库</Option>
            </Select>
            
            <Input
              placeholder="关键词搜索"
              style={{ width: 200 }}
              value={filters.keyword}
              onChange={e => setFilters({ ...filters, keyword: e.target.value })}
            />
            
            <RangePicker 
              showTime 
              placeholder={['开始时间', '结束时间']}
              // value={filters.dateRange}
              // onChange={dates => setFilters({ ...filters, dateRange: dates })}
            />
            
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              搜索
            </Button>
            
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>
      
      {/* 日志详情抽屉 */}
      <Drawer
        title="日志详情"
        width={500}
        open={drawerVisible}
        onClose={closeDrawer}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={closeDrawer}>关闭</Button>
          </div>
        }
      >
        {selectedLog && (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="ID">
                {selectedLog.id}
              </Descriptions.Item>
              <Descriptions.Item label="时间">
                <Space>
                  <ClockCircleOutlined />
                  {selectedLog.timestamp}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="级别">
                {getLevelTag(selectedLog.level)}
              </Descriptions.Item>
              <Descriptions.Item label="模块">
                {selectedLog.module}
              </Descriptions.Item>
              <Descriptions.Item label="消息">
                {selectedLog.message}
              </Descriptions.Item>
              
              {selectedLog.user && (
                <Descriptions.Item label="用户">
                  <Space>
                    <UserOutlined />
                    {selectedLog.user.username} (ID: {selectedLog.user.id})
                  </Space>
                </Descriptions.Item>
              )}
              
              {selectedLog.ip_address && (
                <Descriptions.Item label="IP地址">
                  {selectedLog.ip_address}
                </Descriptions.Item>
              )}
              
              {selectedLog.user_agent && (
                <Descriptions.Item label="用户代理">
                  {selectedLog.user_agent}
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {selectedLog.details && (
              <div style={{ marginTop: '20px' }}>
                <Title level={5}>详细信息</Title>
                <Paragraph>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {selectedLog.details}
                  </pre>
                </Paragraph>
              </div>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default SystemLogs;