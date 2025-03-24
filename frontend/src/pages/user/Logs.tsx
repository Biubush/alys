import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Input, DatePicker, Select, Space, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface Log {
  id: number;
  task_name: string;
  operation: string;
  status: 'success' | 'error' | 'warning' | 'info';
  details: string;
  created_at: string;
}

// 模拟日志数据
const mockLogs: Log[] = [
  {
    id: 1,
    task_name: '文档同步',
    operation: '文件同步',
    status: 'success',
    details: '成功同步了10个文件',
    created_at: '2023-03-22 14:30:00'
  },
  {
    id: 2,
    task_name: '照片备份',
    operation: '文件检查',
    status: 'info',
    details: '检查了100个文件，无更新',
    created_at: '2023-03-22 13:15:00'
  },
  {
    id: 3,
    task_name: '视频同步',
    operation: '文件删除',
    status: 'warning',
    details: '删除了5个过期文件',
    created_at: '2023-03-21 18:45:00'
  },
  {
    id: 4,
    task_name: '文档同步',
    operation: '权限检查',
    status: 'error',
    details: '无法访问目标文件夹，权限不足',
    created_at: '2023-03-21 09:20:00'
  },
  {
    id: 5,
    task_name: '照片备份',
    operation: '文件上传',
    status: 'success',
    details: '上传了25张新照片',
    created_at: '2023-03-20 11:30:00'
  }
];

const Logs: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Log[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    taskName: '',
    operation: '',
    status: '',
    dateRange: []
  });

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
    sorter: SorterResult<Log> | SorterResult<Log>[]
  ) => {
    setPagination(pagination);
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchLogs();
  };

  const handleReset = () => {
    setFilters({
      taskName: '',
      operation: '',
      status: '',
      dateRange: []
    });
    setPagination({ ...pagination, current: 1 });
    fetchLogs();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '任务名称',
      dataIndex: 'task_name',
      key: 'task_name',
      width: 150
    },
    {
      title: '操作类型',
      dataIndex: 'operation',
      key: 'operation',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        let color = 'green';
        if (status === 'error') color = 'red';
        if (status === 'warning') color = 'orange';
        if (status === 'info') color = 'blue';
        
        return (
          <Tag color={color}>
            {status.toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: '详情',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      sorter: (a: Log, b: Log) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <Card>
        <Title level={3}>操作日志</Title>
        
        <div style={{ marginBottom: '20px' }}>
          <Space wrap style={{ marginBottom: '16px' }}>
            <Input
              placeholder="任务名称"
              value={filters.taskName}
              onChange={e => setFilters({ ...filters, taskName: e.target.value })}
              style={{ width: 150 }}
            />
            <Input
              placeholder="操作类型"
              value={filters.operation}
              onChange={e => setFilters({ ...filters, operation: e.target.value })}
              style={{ width: 150 }}
            />
            <Select
              placeholder="状态"
              value={filters.status || undefined}
              onChange={value => setFilters({ ...filters, status: value })}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="success">成功</Option>
              <Option value="error">错误</Option>
              <Option value="warning">警告</Option>
              <Option value="info">信息</Option>
            </Select>
            <RangePicker />
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              onClick={handleSearch}
            >
              搜索
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
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
        />
      </Card>
    </div>
  );
};

export default Logs; 