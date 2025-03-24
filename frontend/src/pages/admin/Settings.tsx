import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  InputNumber, 
  Tabs, 
  Space, 
  Typography, 
  Divider,
  message,
  Alert,
  Spin,
  Upload,
  Tooltip,
  Row,
  Col
} from 'antd';
import { 
  SaveOutlined, 
  QuestionCircleOutlined, 
  UploadOutlined,
  SyncOutlined,
  SettingOutlined,
  UserOutlined,
  SecurityScanOutlined,
  ClockCircleOutlined,
  FileOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import type { TabsProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    allowRegistration: boolean;
    defaultUserQuota: number;
    maxTasksPerUser: number;
    logo: string;
  };
  sync: {
    maxConcurrentTasks: number;
    defaultSyncInterval: number;
    timeoutSeconds: number;
    retryCount: number;
    retryDelaySeconds: number;
    logLevel: 'debug' | 'info' | 'warning' | 'error';
  };
  storage: {
    storagePath: string;
    tempPath: string;
    maxFileSize: number;
    allowedFileTypes: string[];
    cleanTempFilesOlderThan: number;
  };
  security: {
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    lockDurationMinutes: number;
    passwordMinLength: number;
    passwordRequireNumbers: boolean;
    passwordRequireSpecialChars: boolean;
    enableTwoFactor: boolean;
  };
}

// 模拟系统设置数据
const mockSettings: SystemSettings = {
  general: {
    siteName: '阿里云盘同步系统',
    siteDescription: '便捷高效的阿里云盘文件同步管理系统',
    adminEmail: 'admin@example.com',
    allowRegistration: true,
    defaultUserQuota: 5,
    maxTasksPerUser: 10,
    logo: ''
  },
  sync: {
    maxConcurrentTasks: 5,
    defaultSyncInterval: 24,
    timeoutSeconds: 300,
    retryCount: 3,
    retryDelaySeconds: 60,
    logLevel: 'info'
  },
  storage: {
    storagePath: '/data/storage',
    tempPath: '/data/temp',
    maxFileSize: 1024, // MB
    allowedFileTypes: ['*'],
    cleanTempFilesOlderThan: 24 // hours
  },
  security: {
    sessionTimeoutMinutes: 30,
    maxLoginAttempts: 5,
    lockDurationMinutes: 30,
    passwordMinLength: 8,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: false,
    enableTwoFactor: false
  }
};

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [generalForm] = Form.useForm();
  const [syncForm] = Form.useForm();
  const [storageForm] = Form.useForm();
  const [securityForm] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 实际项目中应该从API获取设置数据
      setSettings(mockSettings);
      
      // 设置表单初始值
      generalForm.setFieldsValue(mockSettings.general);
      syncForm.setFieldsValue(mockSettings.sync);
      storageForm.setFieldsValue(mockSettings.storage);
      securityForm.setFieldsValue(mockSettings.security);
    } catch (error) {
      console.error('获取系统设置失败:', error);
      message.error('获取系统设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      const values = await generalForm.validateFields();
      saveSettings('general', values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleSaveSync = async () => {
    try {
      const values = await syncForm.validateFields();
      saveSettings('sync', values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleSaveStorage = async () => {
    try {
      const values = await storageForm.validateFields();
      saveSettings('storage', values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      const values = await securityForm.validateFields();
      saveSettings('security', values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const saveSettings = async (section: keyof SystemSettings, values: any) => {
    setSaving(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 更新本地设置数据
      if (settings) {
        setSettings({
          ...settings,
          [section]: values
        });
      }
      
      message.success('设置保存成功');
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span>
          <SettingOutlined />
          常规设置
        </span>
      ),
      children: (
        <Form
          form={generalForm}
          layout="vertical"
          initialValues={settings?.general}
        >
          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                name="siteName"
                label="网站名称"
                rules={[{ required: true, message: '请输入网站名称' }]}
              >
                <Input placeholder="请输入网站名称" />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                name="adminEmail"
                label="管理员邮箱"
                rules={[
                  { required: true, message: '请输入管理员邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入管理员邮箱" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="siteDescription"
            label="网站描述"
          >
            <TextArea rows={3} placeholder="请输入网站描述" />
          </Form.Item>
          
          <Form.Item
            name="logo"
            label="网站Logo"
          >
            <Upload
              name="logo"
              listType="picture"
              maxCount={1}
              action="/api/upload" // 实际项目中应替换为实际的上传接口
              beforeUpload={() => false} // 阻止自动上传
            >
              <Button icon={<UploadOutlined />}>选择图片</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="allowRegistration"
            label="允许用户注册"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          
          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                name="defaultUserQuota"
                label={
                  <span>
                    默认用户配额(GB)
                    <Tooltip title="新用户默认存储空间配额，单位为GB">
                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
                rules={[{ required: true, message: '请输入默认用户配额' }]}
              >
                <InputNumber min={1} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                name="maxTasksPerUser"
                label={
                  <span>
                    每用户最大任务数
                    <Tooltip title="每个用户可创建的最大同步任务数">
                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
                rules={[{ required: true, message: '请输入每用户最大任务数' }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveGeneral}
              loading={saving}
            >
              保存设置
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <SyncOutlined />
          同步设置
        </span>
      ),
      children: (
        <Form
          form={syncForm}
          layout="vertical"
          initialValues={settings?.sync}
        >
          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                name="maxConcurrentTasks"
                label={
                  <span>
                    最大并发任务数
                    <Tooltip title="系统同时执行的最大同步任务数">
                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
                rules={[{ required: true, message: '请输入最大并发任务数' }]}
              >
                <InputNumber min={1} max={20} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                name="defaultSyncInterval"
                label={
                  <span>
                    默认同步间隔(小时)
                    <Tooltip title="新创建任务的默认同步间隔时间">
                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
                rules={[{ required: true, message: '请输入默认同步间隔' }]}
              >
                <InputNumber min={1} max={168} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                name="timeoutSeconds"
                label="同步超时时间(秒)"
                rules={[{ required: true, message: '请输入同步超时时间' }]}
              >
                <InputNumber min={30} max={3600} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                name="logLevel"
                label="日志级别"
                rules={[{ required: true, message: '请选择日志级别' }]}
              >
                <Select>
                  <Option value="debug">调试</Option>
                  <Option value="info">信息</Option>
                  <Option value="warning">警告</Option>
                  <Option value="error">错误</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                name="retryCount"
                label="失败重试次数"
                rules={[{ required: true, message: '请输入失败重试次数' }]}
              >
                <InputNumber min={0} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                name="retryDelaySeconds"
                label="重试延迟时间(秒)"
                rules={[{ required: true, message: '请输入重试延迟时间' }]}
              >
                <InputNumber min={5} max={300} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveSync}
              loading={saving}
            >
              保存设置
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <DatabaseOutlined />
          存储设置
        </span>
      ),
      children: (
        <Form
          form={storageForm}
          layout="vertical"
          initialValues={settings?.storage}
        >
          <Alert
            message="警告"
            description="修改存储路径将影响现有数据，请确保新路径有足够的存储空间并且具有适当的权限。"
            type="warning"
            showIcon
            style={{ marginBottom: '20px' }}
          />
          
          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                name="storagePath"
                label="存储路径"
                rules={[{ required: true, message: '请输入存储路径' }]}
              >
                <Input placeholder="/data/storage" />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                name="tempPath"
                label="临时文件路径"
                rules={[{ required: true, message: '请输入临时文件路径' }]}
              >
                <Input placeholder="/data/temp" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                name="maxFileSize"
                label="最大文件大小(MB)"
                rules={[{ required: true, message: '请输入最大文件大小' }]}
              >
                <InputNumber min={1} max={10240} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                name="cleanTempFilesOlderThan"
                label="清理临时文件(小时)"
                rules={[{ required: true, message: '请输入清理临时文件时间' }]}
              >
                <InputNumber min={1} max={168} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="allowedFileTypes"
            label="允许的文件类型"
            extra="输入允许的文件扩展名，用逗号分隔。使用 * 表示允许所有类型。"
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="输入允许的文件类型"
              tokenSeparators={[',']}
            />
          </Form.Item>
          
          <Form.Item>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveStorage}
              loading={saving}
            >
              保存设置
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: '4',
      label: (
        <span>
          <SecurityScanOutlined />
          安全设置
        </span>
      ),
      children: (
        <Form
          form={securityForm}
          layout="vertical"
          initialValues={settings?.security}
        >
          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                name="sessionTimeoutMinutes"
                label="会话超时时间(分钟)"
                rules={[{ required: true, message: '请输入会话超时时间' }]}
              >
                <InputNumber min={5} max={1440} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                name="enableTwoFactor"
                label="启用两因素认证"
                valuePropName="checked"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">密码策略</Divider>
          
          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                name="passwordMinLength"
                label="密码最小长度"
                rules={[{ required: true, message: '请输入密码最小长度' }]}
              >
                <InputNumber min={6} max={32} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                name="passwordRequireNumbers"
                label="要求包含数字"
                valuePropName="checked"
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                name="passwordRequireSpecialChars"
                label="要求包含特殊字符"
                valuePropName="checked"
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">登录保护</Divider>
          
          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                name="maxLoginAttempts"
                label="最大登录尝试次数"
                rules={[{ required: true, message: '请输入最大登录尝试次数' }]}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                name="lockDurationMinutes"
                label="账户锁定时长(分钟)"
                rules={[{ required: true, message: '请输入账户锁定时长' }]}
              >
                <InputNumber min={5} max={1440} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveSecurity}
              loading={saving}
            >
              保存设置
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <Card>
        <Title level={3}>系统设置</Title>
        <Paragraph type="secondary">
          在这里管理系统的各项配置，修改后记得点击对应页面的保存按钮。
        </Paragraph>
        
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </div>
  );
};

export default Settings; 