# ALYS-Pro 前端页面与组件文档

[返回文档首页](./README.md)

本文档详细描述了ALYS-Pro系统前端的页面结构、组件设计和使用说明。

## 页面结构

ALYS-Pro前端采用分层路由结构，主要包含以下页面：

### 公共页面

- **登录页** (`/login`)：用户登录入口
- **注册页** (`/register`)：新用户注册
- **忘记密码页** (`/forgot-password`)：密码重置功能

### 授权页面

- **首页/仪表盘** (`/dashboard`)：系统总览和快速操作入口
- **文件管理** (`/files`)：阿里云盘文件浏览和操作
- **同步任务** (`/tasks`)：同步任务管理
- **任务历史** (`/history`)：同步历史记录和日志
- **用户设置** (`/settings`)：用户偏好设置
- **帮助中心** (`/help`)：使用指南和常见问题

### 管理员页面

- **用户管理** (`/admin/users`)：系统用户管理
- **系统监控** (`/admin/monitor`)：系统资源和任务监控
- **系统设置** (`/admin/settings`)：全局系统配置

## 核心组件

### 布局组件

#### 主应用布局 (`MainLayout`)

应用主框架布局，包含以下元素：

- 顶部导航栏：用户信息、通知、快速操作
- 侧边菜单栏：功能导航菜单
- 内容区域：页面主要内容
- 页脚：版权信息和链接

![MainLayout示意图](./images/main-layout.png)

使用示例：

```tsx
import { MainLayout } from '@/components/layouts/MainLayout';

const DashboardPage = () => {
  return (
    <MainLayout title="仪表盘">
      <DashboardContent />
    </MainLayout>
  );
};
```

#### 认证布局 (`AuthLayout`)

用于登录、注册等认证页面的简化布局：

- Logo和系统名称
- 内容区域
- 简化页脚

使用示例：

```tsx
import { AuthLayout } from '@/components/layouts/AuthLayout';

const LoginPage = () => {
  return (
    <AuthLayout title="用户登录">
      <LoginForm />
    </AuthLayout>
  );
};
```

### 导航组件

#### 侧边菜单 (`SideMenu`)

响应式侧边导航菜单，特点：

- 支持多级菜单结构
- 可折叠/展开
- 支持小屏幕自动收起
- 高亮当前活动项

#### 顶部导航栏 (`Header`)

应用顶部导航栏，包含：

- 菜单折叠控制
- 用户头像和下拉菜单
- 系统通知
- 帮助入口

### 表单组件

#### 登录表单 (`LoginForm`)

用户登录表单，包含：

- 用户名/邮箱输入
- 密码输入（带显示/隐藏控制）
- 记住我选项
- 忘记密码链接
- 登录按钮

#### 用户注册表单 (`RegisterForm`)

新用户注册表单，包含：

- 用户名输入
- 邮箱输入
- 密码输入和确认
- 服务条款同意选项
- 注册按钮

#### 任务表单 (`TaskForm`)

同步任务创建/编辑表单，包含：

- 任务名称
- 本地路径选择
- 远程路径选择
- 同步方向选择
- 计划设置（支持Cron表达式）
- 文件过滤设置

代码示例：

```tsx
import { Form, Input, Select, Button, DatePicker } from 'antd';
import { FolderSelector } from '@/components/FolderSelector';

const TaskForm = ({ initialValues, onSubmit }) => {
  return (
    <Form 
      layout="vertical" 
      initialValues={initialValues}
      onFinish={onSubmit}
    >
      <Form.Item 
        name="name" 
        label="任务名称" 
        rules={[{ required: true, message: '请输入任务名称' }]}
      >
        <Input placeholder="给任务起个名字" />
      </Form.Item>
      
      <Form.Item 
        name="local_path" 
        label="本地路径" 
        rules={[{ required: true, message: '请选择本地文件夹' }]}
      >
        <FolderSelector type="local" />
      </Form.Item>
      
      <Form.Item 
        name="remote_path" 
        label="云盘路径" 
        rules={[{ required: true, message: '请选择云盘文件夹' }]}
      >
        <FolderSelector type="remote" />
      </Form.Item>
      
      <Form.Item 
        name="sync_type" 
        label="同步类型" 
        rules={[{ required: true, message: '请选择同步类型' }]}
      >
        <Select>
          <Select.Option value="upload_only">仅上传</Select.Option>
          <Select.Option value="download_only">仅下载</Select.Option>
          <Select.Option value="bidirectional">双向同步</Select.Option>
        </Select>
      </Form.Item>
      
      {/* 更多表单项... */}
      
      <Form.Item>
        <Button type="primary" htmlType="submit">保存任务</Button>
      </Form.Item>
    </Form>
  );
};
```

### 数据展示组件

#### 任务列表 (`TaskList`)

展示同步任务列表，功能包括：

- 分页显示
- 排序和筛选
- 任务状态指示器
- 快速操作（启动、暂停、删除）
- 上次同步时间和下次同步时间

#### 文件浏览器 (`FileBrowser`)

阿里云盘文件浏览组件，特点：

- 表格/网格切换视图
- 文件预览
- 文件类型图标
- 上传/下载进度显示
- 右键菜单支持

代码示例：

```tsx
import { Table, Button, Space, Tag, Dropdown } from 'antd';
import { DownloadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';

const FileBrowser = ({ path, onNavigate, onAction }) => {
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <FileTypeIcon type={record.type} />
          {record.type === 'folder' ? (
            <a onClick={() => onNavigate(record.path)}>{text}</a>
          ) : (
            <span>{text}</span>
          )}
        </Space>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size) => formatFileSize(size),
    },
    {
      title: '修改时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {record.type !== 'folder' && (
            <Button 
              icon={<DownloadOutlined />} 
              onClick={() => onAction('download', record)}
            />
          )}
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => onAction('preview', record)}
          />
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => onAction('delete', record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="file-browser">
      <div className="file-browser-header">
        <Breadcrumb path={path} onNavigate={onNavigate} />
        <Space>
          <Button type="primary" onClick={() => onAction('upload')}>上传文件</Button>
          <Button onClick={() => onAction('create-folder')}>新建文件夹</Button>
        </Space>
      </div>
      
      <Table 
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
};
```

#### 状态卡片 (`StatusCard`)

显示任务或系统状态的卡片组件：

- 状态图标和颜色
- 标题和描述
- 数值和单位
- 变化趋势指示

#### 仪表盘卡片 (`DashboardCard`)

仪表盘显示统计信息的卡片组件：

- 图标和标题
- 数值显示
- 支持环形图、折线图等小型图表
- 比较指标（同比、环比）

### 反馈组件

#### 确认对话框 (`ConfirmDialog`)

用于确认重要操作的对话框：

- 可定制标题和内容
- 警告图标和强调色
- 确认和取消按钮

#### 任务进度 (`TaskProgress`)

显示任务进度的组件：

- 进度条
- 百分比显示
- 状态文本
- 取消按钮

### 特殊组件

#### 文件路径选择器 (`PathSelector`)

用于选择本地或云盘路径：

- 树形结构显示
- 路径导航
- 搜索功能
- 最近使用记录

#### 计划任务编辑器 (`ScheduleEditor`)

用于编辑定时计划的组件：

- 友好的UI设置界面
- Cron表达式支持
- 预览下次执行时间
- 常用模式快速选择

## 页面详解

### 仪表盘页面

仪表盘页面是用户登录后的首页，提供系统概览：

**组件构成**：
- `StatusCards`：显示同步状态、文件数量等关键指标
- `RecentTasks`：最近执行的任务
- `SyncProgress`：当前正在同步的任务进度
- `StorageUsage`：云盘存储使用情况图表

**页面截图**：
![仪表盘页面](./images/dashboard.png)

### 文件管理页面

提供云盘文件浏览和管理功能：

**组件构成**：
- `PathNavigator`：路径导航栏
- `FileBrowser`：文件列表/网格视图
- `FilePreview`：文件预览面板
- `UploadZone`：文件上传区域

**页面截图**：
![文件管理页面](./images/file-manager.png)

### 任务管理页面

提供同步任务的创建和管理功能：

**组件构成**：
- `TaskList`：任务列表表格
- `TaskCreateButton`：创建新任务按钮
- `TaskForm`：任务创建/编辑表单
- `TaskFilterBar`：任务过滤和搜索工具栏

**页面截图**：
![任务管理页面](./images/task-manager.png)

## 样式与主题

系统使用Ant Design组件库，并进行了以下定制：

### 主题配置

系统支持亮色/暗色主题切换，主题配置示例：

```tsx
// theme.ts
import { theme } from 'antd';

export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
  },
};

export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
  },
};
```

### 布局适配

系统采用响应式设计，适配不同屏幕尺寸：

- 大屏幕：完整侧边栏和详细信息展示
- 中屏幕：折叠侧边栏，保持主要功能区完整
- 小屏幕：滑动侧边栏，简化操作界面

## 进一步阅读

- [前端技术文档](./frontend-technical.md) - 前端技术实现细节
- [后端API接口文档](./backend-api.md) - 与前端组件交互的API接口
- [部署指南](./deployment-guide.md) - 系统部署和配置说明 