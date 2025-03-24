import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Radio, 
  Switch, 
  TimePicker, 
  Space, 
  Divider, 
  Typography,
  Row,
  Col,
  message,
  Spin,
  Empty,
  notification
} from 'antd';
import { 
  SaveOutlined, 
  FolderOutlined, 
  ClockCircleOutlined, 
  RollbackOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface TaskFormData {
  name: string;
  source_path: string;
  target_path: string;
  schedule_type: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  schedule_time?: string;
  schedule_day?: number | number[];
  enabled: boolean;
  description?: string;
  sync_delete: boolean;
  ignore_patterns?: string;
}

// 模拟任务数据
const mockTask = {
  id: 1,
  name: '文档同步',
  source_path: '/文档',
  target_path: '/本地备份/文档',
  schedule_type: 'daily',
  schedule_time: '14:30',
  enabled: true,
  description: '同步阿里云盘中的文档到本地备份目录',
  sync_delete: false,
  ignore_patterns: '*.tmp\n.DS_Store'
};

const EditTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [scheduleType, setScheduleType] = useState<string>('daily');
  
  useEffect(() => {
    fetchTaskData();
  }, [id]);
  
  const fetchTaskData = async () => {
    setFetching(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 实际项目中应该从API获取数据
      // 此处使用模拟数据
      const task = mockTask;
      
      // 设置表单初始值
      form.setFieldsValue({
        ...task,
        schedule_time: task.schedule_time ? dayjs(task.schedule_time, 'HH:mm') : undefined
      });
      
      setScheduleType(task.schedule_type);
    } catch (error) {
      console.error('获取任务数据失败:', error);
      notification.error({
        message: '获取任务数据失败',
        description: '无法加载任务数据，请重试'
      });
    } finally {
      setFetching(false);
    }
  };
  
  const handleSubmit = async (values: TaskFormData) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 处理时间格式
      const formattedValues = {
        ...values,
        schedule_time: values.schedule_time ? (values.schedule_time as any).format('HH:mm') : undefined
      };
      
      console.log('提交的表单数据:', formattedValues);
      message.success('任务更新成功');
      
      // 更新成功后返回任务详情页
      navigate(`/tasks/${id}`);
    } catch (error) {
      console.error('更新任务失败:', error);
      message.error('更新任务失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  if (fetching) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }
  
  if (!form.getFieldValue('name')) {
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
        <Title level={3}>编辑同步任务</Title>
        <Divider />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="任务名称"
                rules={[{ required: true, message: '请输入任务名称' }]}
              >
                <Input placeholder="请输入任务名称" />
              </Form.Item>
            </Col>
            
            <Col span={24} md={12}>
              <Form.Item
                name="source_path"
                label="源路径 (阿里云盘)"
                rules={[{ required: true, message: '请输入源路径' }]}
              >
                <Input placeholder="/照片" prefix={<FolderOutlined />} />
              </Form.Item>
            </Col>
            
            <Col span={24} md={12}>
              <Form.Item
                name="target_path"
                label="目标路径 (本地/远程)"
                rules={[{ required: true, message: '请输入目标路径' }]}
              >
                <Input placeholder="/备份/照片" prefix={<FolderOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">同步计划</Divider>
          
          <Form.Item
            name="schedule_type"
            label="同步频率"
            rules={[{ required: true }]}
          >
            <Radio.Group onChange={e => setScheduleType(e.target.value)}>
              <Radio.Button value="manual">手动</Radio.Button>
              <Radio.Button value="hourly">每小时</Radio.Button>
              <Radio.Button value="daily">每天</Radio.Button>
              <Radio.Button value="weekly">每周</Radio.Button>
              <Radio.Button value="monthly">每月</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          {scheduleType === 'manual' ? (
            <Text type="secondary">此任务将不会自动运行，需要手动触发</Text>
          ) : (
            <>
              {scheduleType === 'daily' && (
                <Form.Item
                  name="schedule_time"
                  label="同步时间"
                  rules={[{ required: true, message: '请选择同步时间' }]}
                >
                  <TimePicker format="HH:mm" placeholder="选择时间" />
                </Form.Item>
              )}
              
              {scheduleType === 'weekly' && (
                <>
                  <Form.Item
                    name="schedule_day"
                    label="同步日"
                    rules={[{ required: true, message: '请选择同步日' }]}
                  >
                    <Select placeholder="选择星期">
                      <Option value={1}>星期一</Option>
                      <Option value={2}>星期二</Option>
                      <Option value={3}>星期三</Option>
                      <Option value={4}>星期四</Option>
                      <Option value={5}>星期五</Option>
                      <Option value={6}>星期六</Option>
                      <Option value={0}>星期日</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="schedule_time"
                    label="同步时间"
                    rules={[{ required: true, message: '请选择同步时间' }]}
                  >
                    <TimePicker format="HH:mm" placeholder="选择时间" />
                  </Form.Item>
                </>
              )}
              
              {scheduleType === 'monthly' && (
                <>
                  <Form.Item
                    name="schedule_day"
                    label="同步日期"
                    rules={[{ required: true, message: '请选择同步日期' }]}
                  >
                    <Select placeholder="选择日期">
                      {Array.from({ length: 31 }, (_, i) => (
                        <Option key={i + 1} value={i + 1}>
                          {i + 1}日
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="schedule_time"
                    label="同步时间"
                    rules={[{ required: true, message: '请选择同步时间' }]}
                  >
                    <TimePicker format="HH:mm" placeholder="选择时间" />
                  </Form.Item>
                </>
              )}
            </>
          )}
          
          <Form.Item
            name="enabled"
            label="启用任务"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          
          <Divider orientation="left">高级设置</Divider>
          
          <Form.Item
            name="description"
            label="任务描述"
          >
            <TextArea rows={3} placeholder="请输入任务描述（可选）" />
          </Form.Item>
          
          <Form.Item
            name="sync_delete"
            label="同步删除"
            valuePropName="checked"
            extra="开启后，源目录中删除的文件也会在目标目录中删除"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          
          <Form.Item
            name="ignore_patterns"
            label="忽略模式"
            extra="每行一个，支持glob模式，如 *.tmp、.DS_Store 等"
          >
            <TextArea rows={3} placeholder="请输入忽略文件的模式（可选）" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                保存修改
              </Button>
              <Button
                onClick={() => navigate(`/tasks/${id}`)}
                icon={<RollbackOutlined />}
              >
                返回
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditTask; 