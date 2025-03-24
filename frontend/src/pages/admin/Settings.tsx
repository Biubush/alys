import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  InputNumber, 
  Space, 
  Divider, 
  Tabs,
  Alert,
  message,
  Upload,
  Radio
} from 'antd';
import {
  SaveOutlined,
  UploadOutlined,
  ReloadOutlined,
  SyncOutlined,
  CloudServerOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface SystemSettings {
  app_name: string;
  app_url: string;
  app_logo?: string;
  admin_email: string;
  enable_registration: boolean;
  max_users: number;
  default_user_quota: number;
  file_size_limit: number;
  storage_path: string;
  enable_auto_sync: boolean;
  auto_sync_interval: number;
  aliyun_url: string;
}

interface EmailSettings {
  smtp_server: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: 'none' | 'tls' | 'ssl';
  from_email: string;
  from_name: string;
  enable_email_notifications: boolean;
}

interface BackupSettings {
  enable_auto_backup: boolean;
  backup_interval: number;
  backup_retention: number;
  backup_path: string;
  include_user_files: boolean;
}

// 模拟系统设置数据
const mockSystemSettings: SystemSettings = {
  app_name: '阿里云盘同步工具',
  app_url: 'http://localhost:8000',
  admin_email: 'admin@example.com',
  enable_registration: true,
  max_users: 100,
  default_user_quota: 1024 * 1024 * 1024 * 5, // 5GB
  file_size_limit: 1024 * 1024 * 200, // 200MB
  storage_path: '/data/storage',
  enable_auto_sync: true,
  auto_sync_interval: 60, // 60分钟
  aliyun_url: 'https://www.aliyundrive.com/'
};

// 模拟邮件设置数据
const mockEmailSettings: EmailSettings = {
  smtp_server: 'smtp.example.com',
  smtp_port: 587,
  smtp_username: 'notify@example.com',
  smtp_password: 'password123',
  smtp_encryption: 'tls',
  from_email: 'notify@example.com',
  from_name: '阿里云盘同步通知',
  enable_email_notifications: true
};

// 模拟备份设置数据
const mockBackupSettings: BackupSettings = {
  enable_auto_backup: true,
  backup_interval: 24, // 24小时
  backup_retention: 7, // 7天
  backup_path: '/data/backups',
  include_user_files: false
};

const Settings: React.FC = () => {
  const [systemForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [backupForm] = Form.useForm();
  const [loadingSys, setLoadingSys] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [runningBackup, setRunningBackup] = useState(false);

  useEffect(() => {
    // 初始化表单值
    systemForm.setFieldsValue(mockSystemSettings);
    emailForm.setFieldsValue(mockEmailSettings);
    backupForm.setFieldsValue(mockBackupSettings);
  }, []);

  const handleSystemSubmit = async (values: SystemSettings) => {
    setLoadingSys(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('System settings:', values);
      message.success('系统设置已保存');
    } catch (error) {
      console.error('保存系统设置失败:', error);
      message.error('保存系统设置失败');
    } finally {
      setLoadingSys(false);
    }
  };

  const handleEmailSubmit = async (values: EmailSettings) => {
    setLoadingEmail(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Email settings:', values);
      message.success('邮件设置已保存');
    } catch (error) {
      console.error('保存邮件设置失败:', error);
      message.error('保存邮件设置失败');
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleBackupSubmit = async (values: BackupSettings) => {
    setLoadingBackup(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Backup settings:', values);
      message.success('备份设置已保存');
    } catch (error) {
      console.error('保存备份设置失败:', error);
      message.error('保存备份设置失败');
    } finally {
      setLoadingBackup(false);
    }
  };

  const testEmailSettings = async () => {
    try {
      // 验证表单
      await emailForm.validateFields();
      
      setTestingEmail(true);
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success('测试邮件已发送，请检查收件箱');
    } catch (error) {
      console.error('测试邮件发送失败:', error);
      message.error('测试邮件发送失败');
    } finally {
      setTestingEmail(false);
    }
  };

  const runManualBackup = async () => {
    try {
      // 验证表单
      await backupForm.validateFields();
      
      setRunningBackup(true);
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 3000));
      message.success('手动备份已完成');
    } catch (error) {
      console.error('手动备份失败:', error);
      message.error('手动备份失败');
    } finally {
      setRunningBackup(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传JPG/PNG格式的图片!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <Card>
        <Title level={3}>
          <SettingOutlined /> 系统设置
        </Title>
        
        <Tabs defaultActiveKey="system">
          <TabPane 
            tab={
              <span>
                <CloudServerOutlined /> 基本设置
              </span>
            } 
            key="system"
          >
            <Form
              form={systemForm}
              layout="vertical"
              onFinish={handleSystemSubmit}
            >
              <Alert
                message="这些设置将影响整个系统的行为，请谨慎修改"
                type="info"
                showIcon
                style={{ marginBottom: '20px' }}
              />
              
              <Title level={4}>应用设置</Title>
              <Form.Item
                name="app_name"
                label="应用名称"
                rules={[{ required: true, message: '请输入应用名称' }]}
              >
                <Input placeholder="请输入应用名称" />
              </Form.Item>
              
              <Form.Item
                name="app_url"
                label="应用URL"
                rules={[{ required: true, message: '请输入应用URL' }]}
              >
                <Input placeholder="请输入应用URL" />
              </Form.Item>
              
              <Form.Item
                name="app_logo"
                label="应用Logo"
              >
                <Upload
                  name="logo"
                  listType="picture"
                  maxCount={1}
                  beforeUpload={beforeUpload}
                >
                  <Button icon={<UploadOutlined />}>上传Logo</Button>
                </Upload>
              </Form.Item>
              
              <Form.Item
                name="admin_email"
                label="管理员邮箱"
                rules={[
                  { required: true, message: '请输入管理员邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入管理员邮箱" />
              </Form.Item>
              
              <Divider />
              
              <Title level={4}>用户设置</Title>
              <Form.Item
                name="enable_registration"
                label="允许注册"
                valuePropName="checked"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
              
              <Form.Item
                name="max_users"
                label="最大用户数"
                rules={[{ required: true, message: '请输入最大用户数' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="default_user_quota"
                label="默认用户存储配额"
                rules={[{ required: true, message: '请输入默认用户存储配额' }]}
              >
                <InputNumber
                  min={1024 * 1024 * 100} // 100MB
                  step={1024 * 1024 * 100} // 100MB
                  style={{ width: '100%' }}
                  formatter={value => formatBytes(value as number)}
                  parser={value => {
                    // 简单处理，实际应用需要更复杂的解析
                    const num = parseFloat(value!.replace(/[^\d.]/g, ''));
                    if (value!.includes('GB')) {
                      return num * 1024 * 1024 * 1024;
                    } else if (value!.includes('MB')) {
                      return num * 1024 * 1024;
                    }
                    return num;
                  }}
                />
              </Form.Item>
              
              <Form.Item
                name="file_size_limit"
                label="文件大小限制"
                rules={[{ required: true, message: '请输入文件大小限制' }]}
              >
                <InputNumber
                  min={1024 * 1024} // 1MB
                  step={1024 * 1024 * 10} // 10MB
                  style={{ width: '100%' }}
                  formatter={value => formatBytes(value as number)}
                  parser={value => {
                    const num = parseFloat(value!.replace(/[^\d.]/g, ''));
                    if (value!.includes('GB')) {
                      return num * 1024 * 1024 * 1024;
                    } else if (value!.includes('MB')) {
                      return num * 1024 * 1024;
                    }
                    return num;
                  }}
                />
              </Form.Item>
              
              <Divider />
              
              <Title level={4}>存储设置</Title>
              <Form.Item
                name="storage_path"
                label="存储路径"
                rules={[{ required: true, message: '请输入存储路径' }]}
              >
                <Input placeholder="请输入存储路径" />
              </Form.Item>
              
              <Divider />
              
              <Title level={4}>同步设置</Title>
              <Form.Item
                name="enable_auto_sync"
                label="自动同步"
                valuePropName="checked"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
              
              <Form.Item
                name="auto_sync_interval"
                label="自动同步间隔 (分钟)"
                rules={[{ required: true, message: '请输入自动同步间隔' }]}
              >
                <InputNumber min={5} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="aliyun_url"
                label="阿里云盘URL"
                rules={[{ required: true, message: '请输入阿里云盘URL' }]}
              >
                <Input placeholder="请输入阿里云盘URL" />
              </Form.Item>
              
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loadingSys}
                >
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <MailOutlined /> 邮件设置
              </span>
            } 
            key="email"
          >
            <Form
              form={emailForm}
              layout="vertical"
              onFinish={handleEmailSubmit}
            >
              <Alert
                message="邮件设置用于发送系统通知和用户验证邮件"
                type="info"
                showIcon
                style={{ marginBottom: '20px' }}
              />
              
              <Form.Item
                name="smtp_server"
                label="SMTP服务器"
                rules={[{ required: true, message: '请输入SMTP服务器地址' }]}
              >
                <Input placeholder="例如: smtp.gmail.com" />
              </Form.Item>
              
              <Form.Item
                name="smtp_port"
                label="SMTP端口"
                rules={[{ required: true, message: '请输入SMTP端口' }]}
              >
                <InputNumber min={1} max={65535} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="smtp_encryption"
                label="加密方式"
                rules={[{ required: true, message: '请选择加密方式' }]}
              >
                <Radio.Group>
                  <Radio value="none">无</Radio>
                  <Radio value="tls">TLS</Radio>
                  <Radio value="ssl">SSL</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item
                name="smtp_username"
                label="SMTP用户名"
                rules={[{ required: true, message: '请输入SMTP用户名' }]}
              >
                <Input placeholder="请输入SMTP用户名" />
              </Form.Item>
              
              <Form.Item
                name="smtp_password"
                label="SMTP密码"
                rules={[{ required: true, message: '请输入SMTP密码' }]}
              >
                <Input.Password placeholder="请输入SMTP密码" />
              </Form.Item>
              
              <Form.Item
                name="from_email"
                label="发件人邮箱"
                rules={[
                  { required: true, message: '请输入发件人邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入发件人邮箱" />
              </Form.Item>
              
              <Form.Item
                name="from_name"
                label="发件人名称"
                rules={[{ required: true, message: '请输入发件人名称' }]}
              >
                <Input placeholder="请输入发件人名称" />
              </Form.Item>
              
              <Form.Item
                name="enable_email_notifications"
                label="启用邮件通知"
                valuePropName="checked"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
              
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loadingEmail}
                  >
                    保存设置
                  </Button>
                  <Button
                    icon={<MailOutlined />}
                    onClick={testEmailSettings}
                    loading={testingEmail}
                  >
                    测试邮件设置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <DatabaseOutlined /> 备份设置
              </span>
            } 
            key="backup"
          >
            <Form
              form={backupForm}
              layout="vertical"
              onFinish={handleBackupSubmit}
            >
              <Alert
                message="备份设置用于定期备份系统数据和用户文件"
                type="info"
                showIcon
                style={{ marginBottom: '20px' }}
              />
              
              <Form.Item
                name="enable_auto_backup"
                label="自动备份"
                valuePropName="checked"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
              
              <Form.Item
                name="backup_interval"
                label="备份间隔 (小时)"
                rules={[{ required: true, message: '请输入备份间隔' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="backup_retention"
                label="备份保留时间 (天)"
                rules={[{ required: true, message: '请输入备份保留时间' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="backup_path"
                label="备份路径"
                rules={[{ required: true, message: '请输入备份路径' }]}
              >
                <Input placeholder="请输入备份路径" />
              </Form.Item>
              
              <Form.Item
                name="include_user_files"
                label="包含用户文件"
                valuePropName="checked"
                extra="启用后将备份所有用户文件，可能占用大量存储空间"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
              
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loadingBackup}
                  >
                    保存设置
                  </Button>
                  <Button
                    icon={<DatabaseOutlined />}
                    onClick={runManualBackup}
                    loading={runningBackup}
                  >
                    立即备份
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Settings; 