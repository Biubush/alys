import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  message
} from 'antd';
import { 
  SaveOutlined, 
  FolderOutlined, 
  ClockCircleOutlined, 
  SyncOutlined,
  RollbackOutlined 
} from '@ant-design/icons';

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

const CreateTask: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [scheduleType, setScheduleType] = useState<string>('daily');
  
  const handleSubmit = async (values: TaskFormData) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('提交的表单数据:', values);
      message.success('任务创建成功');
      
      // 创建成功后跳转到任务列表
      navigate('/tasks');
    } catch (error) {
      console.error('创建任务失败:', error);
      message.error('创建任务失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ padding: '24px 0' }}>
      <Card>
        <Title level={3}>创建同步任务</Title>
        <Divider />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            enabled: true,
            schedule_type: 'daily',
            sync_delete: false
          }}
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
                创建任务
              </Button>
              <Button
                onClick={() => navigate('/tasks')}
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

export default CreateTask; 