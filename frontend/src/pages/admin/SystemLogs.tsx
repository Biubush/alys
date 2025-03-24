import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Typography, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Tooltip,
  Badge,
  Drawer,
  Descriptions,
  Alert
} from 'antd';
import { 
  SearchOutlined, 
  DownloadOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  UserOutlined,
  FileOutlined
} from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface SystemLog {
  id: number;
  level: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  category: string;
  message: string;
  user?: string;
  ip?: string;
  details?: string;
}

// 模拟日志数据
const mockLogs: SystemLog[] = [
  {
    id: 1,
    level: 'info',
    timestamp: '2023-03-23 14:35:22',
    category: 'user',
    message: '用户登录',
    user: 'admin',
    ip: '192.168.1.100',
    details: '管理员通过Web界面登录系统'
  },
  {
    id: 2,
    level: 'warning',
    timestamp: '2023-03-23 13:22:15',
    category: 'sync',
    message: '同步部分失败',
    user: 'user1',
    ip: '192.168.1.101',
    details: '任务 "文档同步" 中有3个文件同步失败：\n- /文档/报告.docx (权限不足)\n- /文档/合同.pdf (文件正在使用中)\n- /文档/数据.xlsx (网络错误)'
  },
  {
    id: 3,
    level: 'error',
    timestamp: '2023-03-23 12:15:43',
    category: 'system',
    message: '系统错误',
    details: '数据库连接超时，后台服务重启'
  },
  {
    id: 4,
    level: 'success',
    timestamp: '2023-03-23 11:05:11',
    category: 'task',
    message: '任务创建成功',
    user: 'user2',
    ip: '192.168.1.102',
    details: '用户 user2 创建了新的同步任务 "照片备份"'
  },
  {
    id: 5,
    level: 'info',
    timestamp: '2023-03-23 10:30:25',
    category: 'api',
    message: 'API调用',
    user: 'system',
    ip: '127.0.0.1',
    details: '系统服务调用阿里云盘API获取文件列表'
  },
  {
    id: 6,
    level: 'warning',
    timestamp: '2023-03-22 22:15:30',
    category: 'system',
    message: '磁盘空间不足',
    details: '系统存储空间低于20%，建议清理空间'
  },
  {
    id: 7,
    level: 'info',
    timestamp: '2023-03-22 18:40:12',
    category: 'user',
    message: '用户注销',
    user: 'user3',
    ip: '192.168.1.103',
    details: '用户主动注销登录'
  },
  {
    id: 8,
    level: 'error',
    timestamp: '2023-03-22 15:22:08',
    category: 'sync',
    message: '同步失败',
    user: 'user1',
    ip: '192.168.1.101',
    details: '任务 "视频同步" 同步失败，无法连接到阿里云盘服务'
  }
];

const SystemLogs: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    keyword: '',
    dateRange: null as [moment.Moment, moment.Moment] | null
  });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 筛选日志（模拟后端筛选）
      let filteredLogs = [...mockLogs];
      
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }
      
      if (filters.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filters.category);
      }
      
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.message.toLowerCase().includes(keyword) || 
          (log.details && log.details.toLowerCase().includes(keyword)) ||
          (log.user && log.user.toLowerCase().includes(keyword))
        );
      }
      
      setLogs(filteredLogs);
      setPagination({
        ...pagination,
        total: filteredLogs.length
      });
    } catch (error) {
      console.error('获取系统日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination(newPagination);
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchLogs();
  };

  const handleReset = () => {
    setFilters({
      level: '',
      category: '',
      keyword: '',
      dateRange: null
    });
    setPagination({ ...pagination, current: 1 });
    fetchLogs();
  };

  const handleExport = () => {
    // 实际应用中应该调用API导出日志
    alert('导出日志功能将在实际应用中实现');
  };

  const handleClear = () => {
    // 实际应用中应该调用API清空日志
    alert('清空日志功能将在实际应用中实现');
  };

  const handleViewDetails = (log: SystemLog) => {
    setSelectedLog(log);
    setDrawerVisible(true);
  };

  const getLevelTag = (level: string) => {
    if (level === 'info') {
      return <Tag icon={<InfoCircleOutlined />} color="blue">信息</Tag>;
    } else if (level === 'warning') {
      return <Tag icon={<WarningOutlined />} color="orange">警告</Tag>;
    } else if (level === 'error') {
      return <Tag icon={<ExclamationCircleOutlined />} color="red">错误</Tag>;
    } else {
      return <Tag icon={<CheckCircleOutlined />} color="green">成功</Tag>;
    }
  };

  const getCategoryTag = (category: string) => {
    if (category === 'user') {
      return <Tag color="purple">用户</Tag>;
    } else if (category === 'system') {
      return <Tag color="cyan">系统</Tag>;
    } else if (category === 'sync') {
      return <Tag color="blue">同步</Tag>;
    } else if (category === 'task') {
      return <Tag color="green">任务</Tag>;
    } else {
      return <Tag color="default">API</Tag>;
    }
  };

  const getBadge = (level: string) => {
    if (level === 'info') {
      return <Badge status="processing" />;
    } else if (level === 'warning') {
      return <Badge status="warning" />;
    } else if (level === 'error') {
      return <Badge status="error" />;
    } else {
      return <Badge status="success" />;
    }
  };

  const columns = [
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => getLevelTag(level)
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      sorter: (a: SystemLog, b: SystemLog) => a.timestamp.localeCompare(b.timestamp)
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => getCategoryTag(category)
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      render: (message: string, record: SystemLog) => (
        <a onClick={() => handleViewDetails(record)}>
          {getBadge(record.level)} {message}
        </a>
      )
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 120,
      render: (user: string) => user ? <><UserOutlined /> {user}</> : '-'
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140,
      render: (ip: string) => ip || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: SystemLog) => (
        <Button 
          type="text" 
          size="small" 
          onClick={() => handleViewDetails(record)}
        >
          查看
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Title level={3}>系统日志</Title>
          <Space>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
            >
              导出日志
            </Button>
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={handleClear}
            >
              清空日志
            </Button>
          </Space>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <Space wrap>
            <Select
              placeholder="日志级别"
              value={filters.level || undefined}
              onChange={value => setFilters({ ...filters, level: value })}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="info">信息</Option>
              <Option value="warning">警告</Option>
              <Option value="error">错误</Option>
              <Option value="success">成功</Option>
            </Select>
            
            <Select
              placeholder="日志类别"
              value={filters.category || undefined}
              onChange={value => setFilters({ ...filters, category: value })}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="user">用户</Option>
              <Option value="system">系统</Option>
              <Option value="sync">同步</Option>
              <Option value="task">任务</Option>
              <Option value="api">API</Option>
            </Select>
            
            <RangePicker 
              placeholder={['开始日期', '结束日期']}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates as any })}
            />
            
            <Input.Search
              placeholder="搜索关键词"
              allowClear
              value={filters.keyword}
              onChange={e => setFilters({ ...filters, keyword: e.target.value })}
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
            
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>
      
      <Drawer
        title="日志详情"
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedLog && (
          <>
            <div style={{ marginBottom: '16px' }}>
              {getLevelTag(selectedLog.level)}
              <Text style={{ marginLeft: '8px' }}>{selectedLog.message}</Text>
            </div>
            
            <Descriptions bordered column={1}>
              <Descriptions.Item label="ID">{selectedLog.id}</Descriptions.Item>
              <Descriptions.Item label="时间">{selectedLog.timestamp}</Descriptions.Item>
              <Descriptions.Item label="类别">{getCategoryTag(selectedLog.category)}</Descriptions.Item>
              {selectedLog.user && (
                <Descriptions.Item label="用户">
                  <UserOutlined /> {selectedLog.user}
                </Descriptions.Item>
              )}
              {selectedLog.ip && (
                <Descriptions.Item label="IP地址">{selectedLog.ip}</Descriptions.Item>
              )}
              {selectedLog.details && (
                <Descriptions.Item label="详细信息">
                  <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{selectedLog.details}</pre>
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {selectedLog.level === 'error' && (
              <Alert
                message="错误信息"
                description="此日志记录了系统错误，可能需要管理员关注并解决问题。"
                type="error"
                showIcon
                style={{ marginTop: '16px' }}
              />
            )}
            
            {selectedLog.level === 'warning' && (
              <Alert
                message="警告信息"
                description="此日志记录了系统警告，建议关注并采取相应措施。"
                type="warning"
                showIcon
                style={{ marginTop: '16px' }}
              />
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default SystemLogs; 