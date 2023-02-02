<img src='https://github.com/Biubush/img/raw/main/webicon.png' width=200 height=200>

# 简介

## 项目功能

1. 基础功能

- [x] 自动化阿里云盘文件的更新，分享者更新，你就更新
- [x] 单独管理员后台
- [x] 管理员面板下用户敏感操作可视化
- [x] 有限的管理员权限，管理员只有查、删功能，无法对用户的订阅进行写操作
- [x] 简洁的用户页面，学习成本低，操作一目了然
- 用户间的订阅内容分享
- 更加完善的隐私限制
- 用户的订阅计划归档分类

2. 站长功能

- [x] 限制最低更新频率，给服务器减压
- [x] 没有域名情况下的邮件发送署名
- [x] 内置邮件服务器，无需自己配置
- 批量管理用户和订阅

## 项目背景

不感兴趣的建议直接略过，这一部分显得很啰嗦繁杂，只是作者的杂谈闲聊，算是我写这个程序的心路历程吧。

本人闲来无事喜欢看剧和追番，但发现要不就得充会员、要不就是被禁，为了白嫖，一开始在盗版网站找资源看。但盗版资源质量参差不齐，大多画质偏低。

这时候注意到了阿里云盘，由于阿里云盘的推广活动，很多用户为了扩容进行了高质量剧集的搬运，并且及时更新，而阿里云支持在线1080P播放，这正是我所需要的。

但很快我发现一个问题，剧集一般一周一更，要想看最新剧集就得每周去链接里保存最新的，这就显得很不人性化。于是我尝试找解决方案，发现其实阿里云盘是存在订阅服务的，分享者更新了文件，用户可以接收通知。

但阿里云在订阅这方面做出了限制，只有特权用户才可以开通订阅功能，普通用户享受不到“分享者更新，订阅者更新”的服务。于是，自己在学习之余做出了这么个程序。初心就是解放双手，完全自动化。

一开始只是自己用，写了并无交互界面的纯脚本版本。但给朋友室友过发现不少人有这方面的需求，但并不是每个人都有python编写的基础。恰好那段时间在看前端bootstrap5的文档，学习简单的网页编写，就诞生了一个念头：把脚本放在网站上，用界面交互降低学习成本。于是雪球越滚越大，原本是想用脚本减轻工作的，结果写这个程序逐级成为更大的工作。

很快我就找到了flask框架这一方向，于是一边学习一边落实项目。可以说，这个项目就是综合我目前掌握的知识用来第一次实战。所以，代码里还保留着初学时残存的屎山，重写已经没耐心了索性留下，算是记录了我的成长经历。

初学者可以拿这个项目当python网页程序学习一下，请酌情取舍，取其精华去其糟粕。

## 项目框架

在本项目里，你可以学习到：
1. flask框架，请求处理、路由、api
2. bootsrtap5的网页案例，各个组件是怎样实例化的，如何排版
3. 前后端的通信，通过jquery传递前后端数据
4. 基于flask_sqlalchemy对sqlite数据库的增删改查

# 使用

## 在线网站

本人已经搭建了个[在线网站](https://alys.biubush.cn)，各位如想体验可直接使用

## 详细使用

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

~~> 如果不清楚如何开启smtp服务请参考[这篇文章](https://zhuanlan.zhihu.com/p/551399559)~~

> 现已内置邮箱服务器，部署个人版无需自行配置。但出于安全考虑仍建议各位使用自己的stp服务器。

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

去[release页面](https://github.com/Biubush/alys/releases)找到适合你内核版本的二进制压缩包，并下载。进入你的文件夹，输入:

```bash
chmod +x alys #给予权限
./alys #启动程序
```

windows版直接下载zip压缩包然后双击运行exe文件即可（server版可能缺少部分dll库，请自行安装解决）

## python脚本（体积更小）

本项目使用到的第三方库：
1. [aligo](https://github.com/foyoux/aligo)，简单、易用、可扩展的阿里云盘 API 接口库
2. [flask](https://github.com/pallets/flask)，python网页程序框架
3. [apscheduler](https://github.com/agronholm/apscheduler)，定时计划库
4. [flask_sqlalchemy](https://github.com/pallets-eco/flask-sqlalchemy)，flask数据库组件

欲在本地运行python脚本，首先保存此仓库：

```bash
git clone https://github.com/Biubush/alys #克隆仓库
cd alys #进入仓库
```

安装第三方模块（你也可以使用virtualenv创建独立环境）:

```bash
pip install aligo flask apscheduler flask_sqlalchemy
```

运行程序：

```bash
python3 alys.py
```

# 后记

更不更新都随缘了，主要看有没有人用以及用的人是否有这方面的需求。如果你有新的功能点子，可以提issue，我尽力满足。