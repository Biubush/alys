<img src='https://github.com/Biubush/img/raw/main/webicon.png' width=200 height=200>

# 通知:
## 此仓库不再更新

到此为止，算是我个人练手项目的完结，基础的功能都在了，性能不行但好在还能用。如果可能的话，在将来会推出alys的pro版本，把该做的功能做了，从后端到前端都整改，各位可以期待一手（咕咕咕）。

# 简介

## 项目功能

> 注意:订阅的更新频率越大，检测更新的时间间隔越长，订阅失效的几率越低。为了防止订阅因频繁访问而导致任务失效，请尽量将更新频率控制在900s以上

1. 基础功能

- [x] bootstrap响应式网页，页面适配多种终端设备
- [x] 自动化阿里云盘文件的更新，分享者更新，你就更新
- [x] 单独管理员后台，方便管理
- [x] 管理员面板下用户敏感操作可视化
- [x] 有限的管理员权限，管理员只有查、删功能，无法对用户的订阅进行写操作
- [x] 简洁的用户页面，学习成本低，操作一目了然
- [x] 在添加订阅页面支持创建文件夹
- 用户间的订阅内容分享
- 更加完善的隐私限制
- 用户的订阅计划归档分类

2. 站长功能

- [x] 限制最低更新频率，给服务器减压
- [x] 没有域名情况下的邮件发送署名
- [x] 内置邮件服务器，无需自己配置
- [x] 独立的验证码发送与验证服务
- 批量管理用户和订阅

# 使用

## 在线网站

本人已经搭建了个[在线网站](https://alys.biubush.cn)(不定期维护)，各位如想体验可直接使用。后端会储存但不会泄露你的任何隐私，但出于成本考虑性能有限。

## 详细信息

详细使用请查看本人博客文章:[在线文档](https://blog.biubush.cn/archives/alys)

## 用户使用

### 注册并登录

首次进入网站请注册账号并登录

登录完毕请点击下方的"登录阿里云盘"，按照提示扫码登录

![login](https://github.com/Biubush/img/raw/main/login.png)

### 添加任务

点击搜索栏左侧的添加按钮，添加你的订阅

![addbtn](https://github.com/Biubush/img/raw/main/addbtn.png)

按照提示填写信息（注意，选中文件夹后务必点击选中按钮）

![addsub](https://github.com/Biubush/img/raw/main/addsub.png)

> 注意:即时测试按钮的作用是在你不确定自己的订阅是否有效时，即时运行一遍，给予你是否可用的反馈。

其余功能的使用基本可用凭借直觉进行操作，这也是使用web交互界面的初衷。

## 管理员使用

### 初始化

本项目默认部署在本地8587端口，运行程序后访问本机ip:8587即可访问

默认管理员账户为：

- 用户名:admin
- 密码:admin

首次启动程序将进行初始化配置，请注意按要求进行填写信息

![startup1](https://github.com/Biubush/img/raw/main/startup1.png)

注意，alys不允许你使用默认的管理员密码admin，为保障安全请务必更改

~~如果不清楚如何开启smtp服务请参考[这篇文章](https://zhuanlan.zhihu.com/p/551399559)~~

> 现已内置邮箱服务器，部署个人版无需自行配置。但出于安全考虑仍建议各位使用自己的邮件服务器。

初始化完毕后按照提示重新运行后台程序

![startup2](https://github.com/Biubush/img/raw/main/startup2.png)

### 管理后台

使用你的管理员账户登录，即可进入后台页面：

![adminlog](https://github.com/Biubush/img/raw/main/adminlog.png)

你可以清晰看到用户的每一步敏感操作

![manager](https://github.com/Biubush/img/raw/main/manager.png)

你可以查看并管理用户的状态，控制其阿里云盘是否登录，封禁和解封，删除该用户

你还可以查看每一个用户拥有的订阅任务，并管理其任务状态。

> 值得注意的是，为了保护用户的权益（其实就是懒），你无法对任务内容进行写操作！只能查看任务，对任务进行删除、禁用、启用操作！

# 部署个人版

## 二进制文件（即开即用）

去[release页面](https://github.com/Biubush/alys/releases)找到适合你内核版本的二进制压缩包，并下载解压。进入你的文件夹，输入:

```bash
chmod +x alys #给予权限
./alys #启动程序
```

windows版直接下载zip压缩包然后双击运行exe文件即可
> 注意，windows版可能打开文件时会卡住或访问不了页面，此时在终端多次按下回车即可解决

## python脚本（体积更小）

本项目使用到的第三方库：
1. [aligo](https://github.com/foyoux/aligo)，简单、易用、可扩展的阿里云盘 API 接口库
2. [flask](https://github.com/pallets/flask)，python网页程序框架
3. [apscheduler](https://github.com/agronholm/apscheduler)，定时计划库
4. [flask_sqlalchemy](https://github.com/pallets-eco/flask-sqlalchemy)，flask数据库组件

欲在本地运行python脚本，首先克隆此仓库：

```bash
git clone https://github.com/Biubush/alys #克隆仓库
cd alys #进入仓库
```

安装第三方模块（建议使用virtualenv创建独立环境后安装）:

```bash
pip install aligo flask apscheduler flask_sqlalchemy
```

运行程序：

```bash
python3 alys.py
```

# 后记

维不维护、更不更新都随缘了，主要看有没有人用以及用的人是否有这方面的需求。如果你有新的功能点子，可以提issue，有余力的话会尽力实现。
