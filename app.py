# ---------------------------------------导包------------------------------------
from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    session,
    g,
    redirect,
    url_for,
    flash,
)
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
import threading
import os
import sys
import random
import smtplib
import time
import qrcode
import logging
from email.mime.text import MIMEText
from aligo import Aligo
from pathlib import Path
from apscheduler.schedulers.background import BackgroundScheduler


# ------------------------------------自定义函数-----------------------------------
def is_pure_digit(input_str):
    return input_str.isdigit()


def nowTime() -> str:  # 获取当前时间，返回字符串(年-月-日_时-分-秒)
    return time.strftime("%Y-%m-%d_%H:%M:%S", time.localtime(time.time()))


def startThread(target, kwargs: dict = None) -> threading:  # 启动线程,输入函数名和注入的参数，返回生成的线程对象
    thread = threading.Thread(target=target, kwargs=kwargs)
    thread.start()
    return thread


def startFlask():  # 按配置启动flask
    globals
    app.run("0.0.0.0", PORT)


def startAligo(owner: str, email: str = None) -> Aligo:  # 输入用户名和邮件(可空)，登录阿里云并返回生成的阿里云对象
    globals
    if not email:
        try:
            ALIGOS[owner] = Aligo(
                name=owner, show=saveQrImg, level=logging.INFO, login_timeout=60
            )
            with app.app_context():
                User.query.filter_by(username=owner).first().online = True
                db.session.commit()
        except:
            with app.app_context():
                writeAdminDialog(f"用户{owner}扫码超时")
    else:
        ALIGOS[owner] = Aligo(
            name=owner, email=(email, "请重新登陆"), level=logging.INFO, login_timeout=60
        )


def writeDialog(owner: str, content: str):  # 输入用户名和日志内容，对指定用户进行日志的增操作
    dialog = ""
    dialog = User.query.filter(User.username == owner).first().dialog
    if countLines(dialog) >= 100:
        lines = dialog.splitlines()
        last_100_lines = lines[-99:]
        dialog = ""
        for line in last_100_lines:
            dialog = dialog + "\n" + line
    User.query.filter(User.username == owner).first().dialog = (
        str(dialog) + "\n[" + nowTime() + "]" + content
    )
    db.session.commit()
    writeAdminDialog("用户[" + owner + "]" + content)


def writeAdminDialog(content: str):  # 向管理员日志库中增加内容
    mydialog = ""
    admindialog = Admin.query.first().dialog
    if countLines(admindialog) >= 500:
        adminlines = admindialog.splitlines()
        last_500_lines = adminlines[-499:]
        for line in last_500_lines:
            mydialog = mydialog + "\n" + line
    Admin.query.first().dialog = str(admindialog) + "\n[" + nowTime() + content
    db.session.commit()


def addUser(dict: dict):  # 添加用户，输入包含用户信息的字典
    user = User(
        username=dict["username"],
        nickname=dict["nickname"],
        password=dict["password"],
        mail=dict["mail"],
    )
    with app.app_context():
        db.session.add(user)
        db.session.commit()


def getVcode() -> str:  # 创建验证码.返回其字符串
    str = ""
    for i in range(5):
        ch = chr(random.randrange(ord("0"), ord("9") + 1))
        str += ch
    return str


# 输入收件人邮箱，收件人昵称，邮件标题，邮件正文，发送指定邮件
def sendHtml(mailAdress: str, receieverName: str, Title: str, wholeText: str):
    global ADMIN
    ADMIN = Admin.query.first()
    globals
    try:
        if WEBSITE == "":
            websitehtml = (
                "<a>powerd by </a><a href='https://github.com/Biubush/alys'>alys</a>"
            )
        else:
            websitehtml = f"""<a href="{WEBSITE}">前往官网</a>"""
        # 电子邮件地址和密码
        email = ADMIN.mail_user
        password = ADMIN.mail_password
        mail_host = "smtp.163.com"
        with open("./static/css/bootstrap.min.css", "r", encoding="utf-8") as f1:
            cssfile = f1.read()
        with open("./static/js/bootstrap.bundle.min.js", "r", encoding="utf-8") as f2:
            jsfile = f2.read()
        wholeText = wholeText.replace("\n", '<br></p><p class="indented">')
        html = (
            """
            <!doctype html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Bootstrap demo</title>
                <style>
            """
            + cssfile
            + """
                </style>
                <script>
            """
            + jsfile
            + """
                </script>
                <style>
                .indented {
                    text-indent: 2em;
                }
                </style>
            </head>
            <body>
                <div class="container p-4 my-4 border">
                    <div class="row">
                        <div class="col"></div>
                        <div class="col-md-6 container p-4 my-4 border">
                            <div class="container text-center">
                                <figure class="figure text-center position-relative">
                                    <img src="https://pic.biubush.cn/i/2023/05/18/6465efdcb8954.png" class="figure-img img-fluid rounded" width="160"
                                        height="160">
                                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger text-white">
                                        Mail
                                    </span>
                                </figure>
                            </div>
                            <div class="text-center">
                                <p><small><i class="bi bi-lightbulb"></i>AliyunSubscriber</small></p>
                            </div>
                            <hr>
                            <p>尊敬的"""
            + receieverName
            + """:</p>
                            <p class="indented">您好!</p>
                            <p class="indented">"""
            + wholeText
            + """</p>
                            <br>
                            <br>
                            <div class="text-end">
                            """
            + websitehtml
            + """
                            </div>
                            <hr>
                            <div class="text-center">
                                <p><small>仅供学习交流 切勿传播使用</small></p>
                            </div>
                        </div>
                        <div class="col"></div>
                    </div>
                </div>
            </body>
            </html>
            """
        )
        # 发件人和收件人
        send_to_email = mailAdress
        subject = Title
        # 使用 MIMEText 创建邮件
        msg = MIMEText(html, "html")
        msg["Subject"] = subject
        msg["To"] = mailAdress
        msg["From"] = email
        # 连接到 SMTP 服务器
        server = smtplib.SMTP(host=mail_host, port=25)
        server.starttls()
        # 登录
        server.login(email, password)
        # 发送邮件
        server.sendmail(email, send_to_email, msg.as_string())
        # 断开连接
        server.quit()
    except:
        writeAdminDialog("发送邮件失败，请检查邮箱服务器配置")


def loginAligo(user):  # 传入User对象
    if os.path.exists(
        str(Path.home().joinpath(".aligo")) + "/" + user.username + ".json"
    ):
        startThread(startAligo, {"owner": user.username})
        user.online = True
        db.session.commit()
        globals
        if STARTUP == True:
            writeDialog(user.username, "阿里云盘登录成功")
        else:
            pass
        return True
    else:
        writeAdminDialog(f"用户{user.username}未找到阿里云盘数据，跳过")
        return False


def update():  # 更新后台
    global PORT
    global ADMIN
    global WEBSITE
    ADMIN = Admin.query.first()
    PORT = ADMIN.port
    WEBSITE = ADMIN.website


def startup():  # 初始化程序
    global PORT
    global ADMIN
    global WEBSITE
    global STARTUP
    # 创建数据库
    with app.app_context():
        if not os.path.exists("./alys.db"):
            db.create_all()
            default_admin = Admin(username="admin", password="admin", port=8587)
            db.session.add(default_admin)
            db.session.commit()
            writeAdminDialog("已创建数据库")
            # 初始化应用管理后台资料
            ADMIN = Admin.query.first()
            PORT = ADMIN.port
        else:
            # 初始化应用管理后台资料
            ADMIN = Admin.query.first()
            PORT = ADMIN.port
            WEBSITE = ADMIN.website
            # 轮询并启动aligo
            aligo_count = 0
            ban_count = 0
            for user in User.query.all():
                if not user.baned:
                    if loginAligo(user):
                        aligo_count += 1
                else:
                    ban_count += 1
                writeDialog(user.username, "alys后台已重启或更新，为您造成的不便敬请谅解")
            writeAdminDialog(
                "登录了" + str(aligo_count) + "个用户的阿里云盘,有" + str(ban_count) + "个用户被禁而未登录"
            )
            enable_count = 0
            for task in Task.query.all():
                if task.share_id and task.switch == 1:
                    addSchedule(task.name, task.owner)
                    enable_count += 1
                if task.running == 1:
                    mainJob(task.owner, task.name)
            writeAdminDialog("全部任务启用完成，共启动" + str(enable_count) + "个任务")
            STARTUP = True


def saveQrImg(qr_link: str):  # 将阿里云盘登录的二维码保存到本地
    globals
    qr_img = qrcode.make(qr_link)
    qr_img.save("./static/img/qrcode/" + USER + ".png")


def restartApp():  # 延时两秒关闭本程序
    time.sleep(2)
    os._exit(0)


def getLastLines(text: str, num: int):  # 输入文本和数字，取出该文本指定最后多少行
    lines = str(text).split("\n")
    lines = [line for line in lines if line.strip()]  # 剔除空行
    return list(reversed(lines[-num:]))


def getLog(username: str, lines: int):  # 获取某人日志的后多少行
    dialog = getLastLines(
        str(User.query.filter(User.username == username).first().dialog), lines
    )
    text = ""
    for line in dialog:
        text = text + "\n" + line
    return text


def getAdminLog(lines: int):  # 获取总日志的后多少行
    dialog = getLastLines(str(Admin.query.first().dialog), lines)
    text = ""
    for line in dialog:
        text = text + "\n" + line
    return text


def countLines(text: str) -> int:  # 取一段文本的总行数
    lines = str(text).splitlines()
    return len(lines)


def getMidStr(
    s: str, start_str: str, stop_str: str
) -> str:  # 输入欲取文本，前置文本，后置文本，取出其中间的文本并返回
    start_pos = s.find(start_str)
    if start_pos == -1:
        return None
    start_pos += len(start_str)
    stop_pos = s.find(stop_str, start_pos)
    if stop_pos == -1:
        return None
    return s[start_pos:stop_pos]


def saveFolder(
    owner: str, share_id: str, from_id: str, to_id: str, key: str = None
) -> int:  # 转存文件
    passcount = 0
    save_name_list = []
    if not key:
        share_token = ALIGOS[owner].get_share_token(share_id=share_id, share_pwd=key)
    else:
        share_token = ALIGOS[owner].get_share_token(share_id=share_id)
    filelist = ALIGOS[owner].get_share_file_list(
        share_token=share_token, parent_file_id=from_id
    )
    from_name_list = []
    from_id_dict = {}
    for file in filelist:
        from_name_list.append(file.name)
        from_id_dict[file.name] = file.file_id
    myfiles = ALIGOS[owner].get_file_list(parent_file_id=to_id)
    to_name_list = []
    for myfile in myfiles:
        to_name_list.append(myfile.name)
    for element in from_name_list:
        if element not in to_name_list:
            save_name_list.append(element)
        else:
            passcount += 1
    for name in save_name_list:
        ALIGOS[owner].share_file_saveto_drive(
            file_id=from_id_dict[name], share_token=share_token, to_parent_file_id=to_id
        )
    if len(filelist) - passcount != 0:
        writeDialog(
            owner=owner,
            content="文件保存成功,跳过"
            + str(passcount)
            + "个已存在文件,保存了"
            + str(len(filelist) - passcount)
            + "个文件",
        )
    return len(filelist) - passcount


def mainJob(owner: str, taskname: str):  # 主程序，运行任务
    flag = False
    flag2 = True
    with app.app_context():
        while Task.query.filter_by(name=taskname, owner=owner).first().switch:
            db.session.commit()
            user = User.query.filter(User.username == owner).first()
            try:
                task = Task.query.filter_by(name=taskname, owner=owner).first()
                if (
                    saveFolder(
                        owner=owner,
                        share_id=task.share_id,
                        from_id=task.from_id,
                        to_id=task.to_id,
                        key=task.key,
                    )
                    == 0
                ):
                    if not flag:
                        writeDialog(
                            owner=owner, content="任务【" + taskname + "】进入循环等待..."
                        )
                        flag = True
                        Task.query.filter_by(
                            name=taskname, owner=owner
                        ).first().running = True
                        db.session.commit()
                    time.sleep(task.interval)
                else:
                    writeDialog(owner=owner, content="任务【" + taskname + "】已完成本次更新")
                    sendHtml(
                        user.mail,
                        user.nickname,
                        "【" + taskname + "】更新完成",
                        wholeText="您部署于ALYS上的任务【"
                        + taskname
                        + "】已完成本次更新,为您保存在了{"
                        + task.folder_name
                        + "}中，请注意查收！\n感谢您对ALYS的支持与信赖，我们将持续提供稳定便捷的服务!",
                    )
                    Task.query.filter_by(
                        name=taskname, owner=owner
                    ).first().running = False
                    db.session.commit()
                    break
            except:
                Task.query.filter_by(name=taskname, owner=owner).first().switch = False
                db.session.commit()
                writeDialog(
                    owner=owner,
                    content="任务【"
                    + taskname
                    + "】运行过程中失败:任务内部出错，可能原因:1.分享被禁；2.分享取消；3.检测更新的频率过快；4.程序内部出bug",
                )
                if scheduler.get_job(job_id=taskname + "_" + owner):
                    scheduler.pause_job(job_id=taskname + "_" + owner)
                    scheduler.remove_job(job_id=taskname + "_" + owner)
                sendHtml(
                    user.mail,
                    user.nickname,
                    "【" + taskname + "】更新出错",
                    wholeText="您部署于ALYS上的任务【"
                    + taskname
                    + "】在本次运行中遇到问题，任务内部出错，可能原因:\n1.分享被禁；\n2.分享取消；\n3.检测更新的频率过快；\n4.程序内部出bug\n您可前往网站测试并排查错误",
                )
                flag2 = False
                break
        if (
            not Task.query.filter_by(name=taskname, owner=owner).first().switch
            and flag2
        ):
            writeDialog(owner=owner, content="任务【" + taskname + "】运行过程中失败:任务被禁用.")
            if scheduler.get_job(job_id=taskname + "_" + owner):
                scheduler.pause_job(job_id=taskname + "_" + owner)
                scheduler.remove_job(job_id=taskname + "_" + owner)
            sendHtml(
                user.mail,
                user.nickname,
                "【" + taskname + "】更新出错",
                wholeText="您部署于ALYS上的任务【" + taskname + "】在本次运行中遇到问题，运行过程中失败:任务被禁用。",
            )


def addSchedule(taskname: str, owner: str):  # 增加一个计划日程
    task = Task.query.filter_by(name=taskname, owner=owner).first()
    if task.type == 0:
        scheduler.add_job(
            id=taskname + "_" + owner,
            func=mainJob,
            args=[owner, taskname],
            trigger="cron",
            hour=task.hour,
            minute=task.minute,
            second=task.second,
        )
    elif task.type == 1:
        scheduler.add_job(
            id=taskname + "_" + owner,
            func=mainJob,
            args=[owner, taskname],
            trigger="cron",
            week="*",
            day_of_week=str(task.plan),
            hour=task.hour,
            minute=task.minute,
            second=task.second,
        )
    elif task.type == 2:
        scheduler.add_job(
            id=taskname + "_" + owner,
            func=mainJob,
            args=[owner, taskname],
            trigger="cron",
            month="*",
            day=str(task.plan),
            hour=task.hour,
            minute=task.minute,
            second=task.second,
        )


def banuser(username: str):  # 禁用指定用户所有任务
    try:
        user = User.query.filter_by(username=username).first()
        user.baned = True
        user.online = False
        tasks = Task.query.filter_by(owner=username).all()
        for task in tasks:
            task.switch = False
            if scheduler.get_job(job_id=task.name + "_" + task.owner):
                scheduler.pause_job(job_id=task.name + "_" + task.owner)
                scheduler.remove_job(job_id=task.name + "_" + task.owner)
        db.session.commit()
        return True
    except:
        return False


# -----------------------------------flask配置语法-------------------------------
app = Flask(__name__, static_url_path="/static")
app.debug = False
logging.basicConfig(level=logging.INFO)
app.config["JSON_AS_ASCII"] = False
app.config["SECRET_KEY"] = "h8fdh32f75y162b7rf3"
# 兼容性支持
WIN = sys.platform.startswith("win")
if WIN:
    prefix = "sqlite:///"
else:
    prefix = "sqlite:////"
app.config["SQLALCHEMY_DATABASE_URI"] = prefix + os.path.join(app.root_path, "alys.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False  # 关闭对模型修改的监控
db = SQLAlchemy(app)
migrate = Migrate(app, db)
# 用户类


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(15), unique=True)
    nickname = db.Column(db.String(20))
    password = db.Column(db.String(30))
    mail = db.Column(db.String(120))
    baned = db.Column(db.Boolean, default=False)
    online = db.Column(db.Boolean, default=False)
    dialog = db.Column(db.String, default="")


# 后台管理类


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    website = db.Column(db.String(30), default="")
    username = db.Column(db.String(15))
    password = db.Column(db.String(30))
    port = db.Column(db.Integer)
    mail_user = db.Column(db.String(30), default="biubush4alys@163.com")
    mail_password = db.Column(db.String(50), default="HJYOSDALIOBNIEAM")
    mail_sender = db.Column(db.String(30), default="biubush4alys@163.com")
    mail_receiver = db.Column(db.String(30), default="")
    dialog = db.Column(db.String, default="")


# 任务类


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner = db.Column(db.String(15))  # 所有者
    name = db.Column(db.String(30))  # 任务名称
    switch = db.Column(db.Boolean, default=False)  # 是否启用
    type = db.Column(db.Integer)  # 任务类型，0为周任务，1为日任务，2为月任务
    plan = db.Column(db.String(10))  # 任务计划，周任务填周几(1~7)，日任务不必填，月任务填几号(1~31)
    hour = db.Column(db.Integer)  # 几点
    minute = db.Column(db.Integer)  # 几分
    second = db.Column(db.Integer)  # 几秒
    share_id = db.Column(db.String(60))  # 分享的shareid
    from_id = db.Column(db.String(60))  # 订阅的文件夹
    key = db.Column(db.String(60))  # 订阅密码
    to_id = db.Column(db.String(60))  # 转移到哪个文件夹
    folder_name = db.Column(db.String(30))  # 转移到的文件夹名字
    interval = db.Column(db.Integer, default=600)  # 订阅间隔
    running = db.Column(db.Boolean, default=False)  # 是否正在运行


# 每次发送请求前的查询用户信息操作


@app.before_request
def before_request():
    g.user = None
    if "username" in session:
        g.user = User.query.filter(User.username == session["username"]).first()
    elif "admin" in session:
        g.user = Admin.query.first()


# --------------------------------------全局变量----------------------------------
ADMIN = None  # 管理员信息，包含邮件服务器
PORT = None  # 端口号
FLASK = None  # Flask实例
ALIGOS = {}  # 用于存放各个用户的阿里云盘实例
WEBSITE = None  # 个人ALYS项目域名
USER = None  # 临时用户记录，用于登录阿里云盘
STARTUP = False  # 标志初始化结束
VERSION = "V1.0.4"  # 当前版本号
# ---------------------------------------路由--------------------------------------


@app.route("/", methods=["GET"])  # 起始页
def welcome():
    if Admin.query.first().password == "admin":
        flash("请配置初始化设置")
        data = Admin.query.first()
        return render_template("startup.html", data=data)
    else:
        if not g.user:
            return render_template("welcome.html")
        else:
            return redirect(url_for("usercenter"))


@app.route("/usercenter", methods=["GET"])  # 用户中心
def usercenter():
    if not g.user:
        return redirect(url_for("welcome"))
    else:
        if "admin" in session:
            search_task = request.args.get("task")
            search_user = request.args.get("user")
            tasklist = {}
            enabled = len(Task.query.filter_by(switch=1).all())
            total = len(Task.query.all())
            print(f"search_user={search_user}")
            if search_user:
                users = User.query.filter(User.nickname.contains(search_user)).all()
            else:
                users = User.query.all()
            for user in users:
                if search_task:
                    tasklist[user.username] = Task.query.filter(
                        Task.name.contains(search_task), Task.owner == user.username
                    ).all()
                else:
                    tasklist[user.username] = Task.query.filter_by(
                        owner=user.username
                    ).all()
            members = len(users)
            online = len(User.query.filter_by(online=1).all())
            dialog = ""
            for line in getLastLines(g.user.dialog, 5):
                dialog = dialog + line + "\n"
            return render_template(
                "admin.html",
                tasklist=tasklist,
                total=total,
                enabled=enabled,
                dialog=dialog,
                members=members,
                online=online,
                users=users,
            )
        else:
            if g.user.baned != 1:
                search = request.args.get("search")
                if not search:
                    tasks = Task.query.filter_by(owner=g.user.username).all()
                    total = len(tasks)
                    enabled = len(
                        Task.query.filter_by(owner=g.user.username, switch=1).all()
                    )
                else:
                    tasks = Task.query.filter(
                        Task.name.contains(search), Task.owner == g.user.username
                    ).all()
                    total = len(tasks)
                    enabled = len(
                        Task.query.filter(
                            Task.name.contains(search),
                            Task.owner == g.user.username,
                            Task.switch == 1,
                        ).all()
                    )
                dialog = ""
                for line in getLastLines(g.user.dialog, 5):
                    dialog = dialog + line + "\n"
                # 个人中心页面
                return render_template(
                    "usercenter.html",
                    userdata=g.user,
                    tasks=tasks,
                    total=total,
                    enabled=enabled,
                    dialog=dialog,
                )
            else:
                flash("账号被封禁，请联系管理员，邮箱地址:" + Admin.query.first().mail_receiver)
                session.pop("username", None)
                return redirect(url_for("welcome"))


@app.route("/profile", methods=["GET", "POST"])  # 修改个人信息
def profile():
    if not g.user:
        return render_template("welcome.html")
    else:
        if request.method == "POST":
            passowrd = request.form.get("password")
            vpassword = request.form.get("vpassword")
            if passowrd == vpassword:
                user = User.query.filter_by(
                    username=request.form.get("username")
                ).first()
                user.nickname = request.form.get("nickname")
                user.passowrd = request.form.get("password")
                db.session.commit()
                session.pop("v-code", None)
                flash("修改信息成功！")
                return redirect(url_for("usercenter"))
            else:
                flash("两次密码输入不一致")
                return redirect(url_for("profile"))
        else:
            return render_template("profile.html", user=g.user)


@app.route("/online", methods=["GET", "POST"])  # 起始页
def online():
    global USER
    if not g.user:
        return redirect(url_for("welcome"))
    else:
        if request.method == "GET":
            USER = g.user.username
            startThread(target=startAligo, kwargs={"owner": g.user.username})
            return render_template(
                "signin.html", src="../static/img/qrcode/" + USER + ".png"
            )
        else:
            globals
            if User.query.filter_by(username=g.user.username).first().online == True:
                writeDialog(g.user.username, "通过网页扫码，登录成功")
                return '<i class="bi bi-check-circle"></i>登录成功'
            else:
                return '<i class="bi bi-x-circle"></i>尚未登录'


@app.route("/signin", methods=["POST"])  # 登录api
def signin():
    username = request.form.get("username")
    password = request.form.get("password")
    locateUser = User.query.filter_by(username=username).first()
    locateAdmin = Admin.query.filter_by(username=username).first()
    if locateUser:
        if locateUser.password == password:
            session["username"] = username
            writeAdminDialog(f"用户{username}于网页端上线")
            return redirect(url_for("usercenter"))
        else:
            flash("密码错误")
            return redirect(url_for("welcome"))
    elif locateAdmin:
        if locateAdmin.password == password:
            session["admin"] = "admin"
            return redirect(url_for("usercenter"))
        else:
            flash("管理密码错误")
            return redirect(url_for("welcome"))
    else:
        flash("查无此人，请重试")
        return redirect(url_for("welcome"))


@app.route("/folder", methods=["GET"])  # 查询文件夹
def folder():
    if not g.user:
        return redirect(url_for("welcome"))
    else:
        parentFolderID = request.args.get("id")
        if parentFolderID == None:
            parentFolderID = "root"
        folders = []
        items = ALIGOS[g.user.username].get_file_list(parentFolderID)
        for item in items:
            if item.type == "folder":
                folders.append(item)
            else:
                pass
        return render_template("folders.html", folders=folders)


@app.route("/edittask", methods=["GET", "POST"])  # 编辑任务
def edittask():
    if not g.user:
        return redirect(url_for("welcome"))
    else:
        if request.method == "POST":
            try:
                name = request.form.get("name")
                owner = g.user.username
                type = int(request.form.get("type"))
                plan = ""
                if type == 1:
                    plan = request.form.get("weekday")
                elif type == 2:
                    plan = request.form.get("monthday")
                hour = int(request.form.get("hours"))
                minute = int(request.form.get("minutes"))
                second = int(request.form.get("seconds"))
                url = request.form.get("from") + "/end"
                share_id = getMidStr(url, "s/", "/")
                from_id = getMidStr(url, "folder/", "/end")
                key = request.form.get("key")
                to_id = request.form.get("to")
                folder_name = request.form.get("foldername")
                interval = request.form.get("interval")
                old_name = request.form.get("old_name")
                task = Task.query.filter_by(name=old_name, owner=owner).first()
                task.name = name
                task.owner = owner
                task.type = type
                task.plan = plan
                task.hour = hour
                task.minute = minute
                task.second = second
                task.share_id = share_id
                task.from_id = from_id
                task.key = key
                task.to_id = to_id
                task.folder_name = folder_name
                task.interval = interval
                with app.app_context():
                    db.session.commit()
                if task.switch == 1 and scheduler.get_job(
                    job_id=old_name + "_" + owner
                ):
                    scheduler.pause_job(job_id=old_name + "_" + owner)
                    scheduler.remove_job(job_id=old_name + "_" + owner)
                    addSchedule(taskname=name, owner=g.user.username)
                writeDialog(owner=owner, content="任务【" + name + "】修改成功")
                flash("修改成功")
                return render_template("edittask.html", task=task)
            except:
                writeDialog(owner=owner, content="任务【" + name + "】修改失败")
                flash("修改失败")
                return render_template("edittask.html", task=task)
        else:
            name = request.args.get("taskname")
            owner = request.args.get("owner")
            task = Task.query.filter_by(name=name, owner=owner).first()
            return render_template("edittask.html", task=task)


@app.route("/detail", methods=["GET"])  # 任务详情
def detail():
    if not g.user:
        flash("用户未登录")
        return redirect(url_for("welcome"))
    else:
        name = request.args.get("taskname")
        owner = request.args.get("owner")
        task = Task.query.filter_by(name=name, owner=owner).first()
        return render_template("detail.html", task=task)


# ---------------------------------------API----------------------------------------


@app.route("/sendcode", methods=["POST"])  # 发送验证码
def sendcode():
    mailAdress = request.json["mailAdress"]
    v_code = getVcode()
    session["v-code"] = v_code
    try:
        sendHtml(
            mailAdress,
            "ALYS用户",
            "随机验证码",
            "您的验证码为:\n<div class='card'><div class='card-body bg-dark text-white text-center'><h1>"
            + v_code
            + "</h1></div></div>\n请勿向他人提供此验证码，以免账号安全受侵害",
        )
        return jsonify("发送成功")
    except:
        return jsonify("发送失败")


@app.route("/signup", methods=["POST"])  # 注册用户
def signup():
    if not session.get("v-code"):
        flash("请先发送验证码")
    elif request.form.get("vcode") != session["v-code"]:
        flash("验证码出错")
        return redirect(url_for("welcome"))
    else:
        if is_pure_digit(request.form.get("username")) or is_pure_digit(
            request.form.get("nickname")
        ):
            flash("用户名以及昵称都不可为纯数字")
            return redirect(url_for("welcome"))
        if not User.query.filter_by(username=request.form.get("username")).first():
            if not User.query.filter_by(mail=request.form.get("email")).first():
                if request.form.get("password") == request.form.get("vpassword"):
                    addUser(
                        {
                            "username": request.form.get("username"),
                            "nickname": request.form.get("nickname"),
                            "password": request.form.get("password"),
                            "mail": request.form.get("email"),
                        }
                    )
                    flash("注册成功！")
                    nickname = request.form.get("nickname")
                    writeAdminDialog(f"用户{nickname}注册成功")
                    session.pop("v-code", None)
                else:
                    flash("两次密码输入不一致")
            else:
                flash("该邮箱已注册，请直接登录或找回账户")
        else:
            flash("用户名已存在！请直接登录")
        return redirect(url_for("welcome"))


@app.route("/fetch", methods=["POST"])  # 找回用户
def fetch():
    if not session.get("v-code"):
        flash("请先发送验证码")
    elif request.form.get("vcode") != session["v-code"]:
        flash("验证码出错")
    else:
        user = User.query.filter_by(mail=request.form.get("email")).first()
        if user:
            sendHtml(
                user.mail,
                user.nickname,
                "寻回账号",
                f"您的账户信息为：\n用户名:{user.username}\n密码:{user.password}\n请务必保存好您的账号密码，必要的话请登录后立刻修改您的密码",
            )
            flash("验证成功，账号及密码已发放至您的邮箱，请妥善保存密码，如有必要请及时修改")
            session.pop("v-code", None)
        else:
            flash("找回账号出错：该邮箱未绑定账号")
    return redirect(url_for("welcome"))


@app.route("/signout", methods=["POST"])  # 登出
def signout():
    session.pop("username", None)
    session.pop("admin", None)
    return redirect(url_for("welcome"))


@app.route("/startup", methods=["GET", "POST"])  # 初始化
def webstartup():
    if "admin" in session or Admin.query.first().password == "admin":
        if request.method == "POST":
            if request.form.get("password") == request.form.get("verifypassword"):
                if request.form.get("password") == "":  # 不更改密码
                    if Admin.query.first().password == "admin":  # 但为默认密码
                        flash("初始化失败:不能使用默认密码")
                        return redirect(url_for("webstartup"))
                    else:  # 不为默认密码
                        if int(request.form.get("port")) == Admin.query.first().port:
                            admin = Admin.query.first()
                            admin.username = request.form.get("username")
                            if request.form.get("website"):
                                admin.website = request.form.get("website")
                            admin.mail_user = request.form.get("mail_user")
                            admin.mail_password = request.form.get("mail_password")
                            admin.mail_sender = request.form.get("mail_sender")
                            admin.mail_receiver = request.form.get("mail_receiver")
                            db.session.commit()
                            update()
                            writeAdminDialog("更新后台成功")
                            flash("更新后台成功")
                            return redirect(url_for("welcome"))
                        else:
                            admin = Admin.query.first()
                            admin.username = request.form.get("username")
                            if request.form.get("website"):
                                admin.website = request.form.get("website")
                            admin.port = int(request.form.get("port"))
                            admin.mail_user = request.form.get("mail_user")
                            admin.mail_password = request.form.get("mail_password")
                            admin.mail_sender = request.form.get("mail_sender")
                            admin.mail_receiver = request.form.get("mail_receiver")
                            db.session.commit()
                            writeAdminDialog("后台初始化成功")
                            flash("初始化成功，即将关闭后端，请重新开启后端程序")
                            startThread(restartApp)
                            return redirect(url_for("welcome"))
                else:  # 更改密码
                    if int(request.form.get("port")) == Admin.query.first().port:
                        admin = Admin.query.first()
                        admin.username = request.form.get("username")
                        admin.password = request.form.get("password")
                        if request.form.get("website"):
                            admin.website = request.form.get("website")
                        admin.mail_user = request.form.get("mail_user")
                        admin.mail_password = request.form.get("mail_password")
                        admin.mail_sender = request.form.get("mail_sender")
                        admin.mail_receiver = request.form.get("mail_receiver")
                        db.session.commit()
                        update()
                        writeAdminDialog("更新后台成功")
                        flash("更新后台成功")
                        return redirect(url_for("welcome"))
                    else:
                        admin = Admin.query.first()
                        admin.username = request.form.get("username")
                        admin.password = request.form.get("password")
                        if request.form.get("website"):
                            admin.website = request.form.get("website")
                        admin.port = int(request.form.get("port"))
                        admin.mail_user = request.form.get("mail_user")
                        admin.mail_password = request.form.get("mail_password")
                        admin.mail_sender = request.form.get("mail_sender")
                        admin.mail_receiver = request.form.get("mail_receiver")
                        db.session.commit()
                        writeAdminDialog("后台初始化成功")
                        flash("初始化成功，即将关闭后端，请重新开启后端程序")
                        startThread(restartApp)
                        return redirect(url_for("welcome"))
            else:
                flash("初始化失败:两次密码不一致")
                return redirect(url_for("webstartup"))
        else:
            data = Admin.query.first()
            return render_template("startup.html", data=data)
    else:
        flash("无访问权限，请登录管理员账户")
        return redirect(url_for("welcome"))


@app.route("/cleardialog", methods=["POST"])  # 清空日志
def cleardialog():
    if not g.user:
        return redirect(url_for("welcome"))
    else:
        User.query.filter(User.username == g.user.username).first().dialog = ""
        db.session.commit()
        return str(User.query.filter(User.username == g.user.username).first().dialog)


@app.route("/clearadmindialog", methods=["POST"])  # 清空日志
def clearadmindialog():
    if not "admin" in session:
        flash("非管理员身份")
        return redirect(url_for("welcome"))
    else:
        Admin.query.first().dialog = ""
        db.session.commit()
        return str(Admin.query.first().dialog)


@app.route("/getdialog", methods=["POST"])  # 按指定行数取日志
def getdialog():
    if not g.user:
        return redirect(url_for("welcome"))
    else:
        lines = request.json["lines"]
        dialog = getLog(g.user.username, lines)
        return jsonify({"dialog": dialog})


@app.route("/getadmindialog", methods=["POST"])  # 按指定行数取总日志
def getadmindialog():
    if not "admin" in session:
        flash("非管理员身份")
        return redirect(url_for("welcome"))
    else:
        lines = request.json["lines"]
        dialog = getAdminLog(lines)
        return jsonify({"dialog": dialog})


@app.route("/turnon", methods=["POST"])  # 启用任务
def turnon():
    if not g.user:
        return jsonify({"notice": "非法请求，未登录状态"})
    else:
        try:
            name = request.json["taskname"]
            owner = request.json["owner"]
            if ALIGOS.get(owner):
                Task.query.filter_by(name=name, owner=owner).first().switch = True
                db.session.commit()
                addSchedule(taskname=name, owner=owner)
                writeDialog(owner=owner, content="启用任务【" + name + "】成功")
                return jsonify({"notice": "启用任务成功"})
            else:
                return jsonify({"notice": "启用任务失败:阿里云盘未登录"})
        except:
            writeDialog(owner=owner, content="启用任务【" + name + "】失败")
            return jsonify({"notice": "启用任务失败"})


@app.route("/turnoff", methods=["POST"])  # 禁用任务
def turnoff():
    if not g.user:
        return jsonify({"notice": "非法请求，未登录状态"})
    else:
        try:
            name = request.json["taskname"]
            owner = request.json["owner"]
            Task.query.filter_by(name=name, owner=owner).first().switch = False
            db.session.commit()
            if scheduler.get_job(job_id=name + "_" + owner):
                scheduler.pause_job(job_id=name + "_" + owner)
                scheduler.remove_job(job_id=name + "_" + owner)
            writeDialog(owner=owner, content="禁用任务【" + name + "】成功")
            return jsonify({"notice": "禁用任务成功"})
        except:
            writeDialog(owner=owner, content="禁用任务【" + name + "】失败")
            return jsonify({"notice": "禁用任务出错"})


@app.route("/del", methods=["POST"])  # 删除任务
def deltask():
    if not g.user:
        return jsonify({"notice": "非法请求，未登录状态"})
    else:
        try:
            name = request.json["taskname"]
            owner = request.json["owner"]
            if scheduler.get_job(job_id=name + "_" + owner):
                scheduler.pause_job(job_id=name + "_" + owner)
                scheduler.remove_job(job_id=name + "_" + owner)
            db.session.delete(Task.query.filter_by(name=name, owner=owner).first())
            db.session.commit()
            writeDialog(owner=owner, content="删除任务【" + name + "】成功")
            return jsonify({"notice": "删除任务成功"})
        except:
            writeDialog(owner=owner, content="删除任务【" + name + "】失败")
            return jsonify({"notice": "删除任务失败"})


@app.route("/addtask", methods=["POST"])  # 增加任务
def addtask():
    if not g.user:
        flash("用户未登录")
        return "非法请求:尚未登录"
    elif Task.query.filter_by(
        name=request.form.get("name"), owner=g.user.username
    ).first():
        writeDialog(g.user.username, "添加任务【" + request.form.get("name") + "】失败:名称冲突")
        return "同名任务已存在，请更改名称以避免冲突"
    elif int(request.form.get("interval")) < 600:
        return "非法更新频率:更新频率小于600！"
    else:
        name = request.form.get("name")
        owner = g.user.username
        taskType = int(request.form.get("type"))
        url = request.form.get("from") + "/end"
        share_id = getMidStr(url, "s/", "/")
        parent_file_id = getMidStr(url, "folder/", "/end")
        task = None
        if share_id and parent_file_id:
            if taskType == 0:
                task = Task(
                    owner=g.user.username,
                    name=request.form.get("name"),
                    switch=True,
                    type=0,
                    plan="",
                    hour=int(request.form.get("hours")),
                    minute=int(request.form.get("minutes")),
                    second=int(request.form.get("seconds")),
                    share_id=share_id,
                    from_id=parent_file_id,
                    to_id=request.form.get("to"),
                    folder_name=request.form.get("foldername"),
                    key=request.form.get("key"),
                    interval=request.form.get("interval"),
                )
            elif taskType == 1:
                task = Task(
                    owner=g.user.username,
                    name=request.form.get("name"),
                    switch=True,
                    type=1,
                    plan=request.form.get("weekday"),
                    hour=int(request.form.get("hours")),
                    minute=int(request.form.get("minutes")),
                    second=int(request.form.get("seconds")),
                    share_id=share_id,
                    from_id=parent_file_id,
                    to_id=request.form.get("to"),
                    folder_name=request.form.get("foldername"),
                    key=request.form.get("key"),
                    interval=request.form.get("interval"),
                )
            elif taskType == 2:
                task = Task(
                    owner=g.user.username,
                    name=request.form.get("name"),
                    switch=True,
                    type=2,
                    plan=request.form.get("monthday"),
                    hour=int(request.form.get("hours")),
                    minute=int(request.form.get("minutes")),
                    second=int(request.form.get("seconds")),
                    share_id=share_id,
                    from_id=parent_file_id,
                    to_id=request.form.get("to"),
                    folder_name=request.form.get("foldername"),
                    key=request.form.get("key"),
                    interval=request.form.get("interval"),
                )
            db.session.add(task)
            db.session.commit()
            try:
                if not scheduler.get_job(job_id=name + "_" + owner):
                    addSchedule(taskname=name, owner=owner)
                    writeDialog(g.user.username, "添加任务【" + name + "】成功")
                    return "任务添加成功"
                else:
                    writeDialog(g.user.username, "添加任务【" + name + "】任务失败:任务已存在")
                    return "添加任务失败:任务已存在"
            except:
                writeDialog(g.user.username, "添加任务【" + name + "】任务失败:内部出错")
                return "添加任务失败:内部出错"
        else:
            writeDialog(g.user.username, "添加任务【" + name + "】任务失败:链接不合法！")
            return "添加任务失败:链接不合法！"


@app.route("/deluser", methods=["POST"])  # 删除用户
def deluser():
    if "admin" in session:
        try:
            global ALIGOS
            username = request.form.get("username")
            user = User.query.filter_by(username=username).first()
            if ALIGOS.get(username):
                ALIGOS[username] = None
                del ALIGOS[username]
            user.online = False
            db.session.delete(user)
            tasks = Task.query.filter_by(owner=username).all()
            for task in tasks:
                task.switch = False
                if scheduler.get_job(job_id=task.name + "_" + task.owner):
                    scheduler.pause_job(job_id=task.name + "_" + task.owner)
                    scheduler.remove_job(job_id=task.name + "_" + task.owner)
                db.session.delete(task)
            db.session.commit()
            if os.path.exists(
                str(Path.home().joinpath(".aligo")) + "/" + user.username + ".json"
            ):
                os.remove(
                    str(Path.home().joinpath(".aligo")) + "/" + user.username + ".json"
                )
            writeAdminDialog(f"删除用户{username}成功！")
            return "删除用户成功"
        except:
            writeAdminDialog(f"删除用户{username}失败！")
            return "删除用户失败"
    else:
        return "非法请求，未登录状态"


@app.route("/login", methods=["POST"])  # 登录阿里云
def login():
    if not g.user:
        return "非法请求:未登录"
    else:
        username = request.form.get("username")
        user = User.query.filter_by(username=username).first()
        globals
        if g.user.username == Admin.query.first().username:
            if not ALIGOS.get(user.username):
                if loginAligo(user):
                    writeAdminDialog("上线用户[" + user.nickname + "]阿里云盘成功")
                    return "上线成功"
                else:
                    writeAdminDialog("上线用户[" + user.nickname + "]阿里云盘失败:已过期或被封禁")
                    return "上线失败:已过期或被封禁"
            else:
                writeAdminDialog("上线用户[" + user.nickname + "]阿里云盘失败:用户当前在线")
                return "用户阿里云盘当前在线"
        elif username == g.user.username:
            if not ALIGOS.get(user.username):
                if loginAligo(user):
                    writeDialog(owner=username, content="上线阿里云盘成功")
                    return "上线成功"
                else:
                    writeDialog(owner=username, content="上线阿里云盘失败:已过期或被封禁")
                    return "上线失败:已过期或被封禁"
            else:
                writeDialog(username, "上线阿里云盘失败:当前已在线")
                return "用户阿里云盘当前在线"
        elif username != g.user.username:
            return "非法操作:企图更改其他用户的登录状态"


@app.route("/kickoff", methods=["POST"])  # 注销阿里云
def kickoff():
    if not g.user:
        return "非法请求:未登录"
    else:
        global ALIGOS
        username = request.form.get("username")
        user = User.query.filter_by(username=username).first()
        if g.user.username == Admin.query.first().username:  # 管理员身份
            if ALIGOS.get(user.username):
                ALIGOS[username] = None
                del ALIGOS[username]
                user.online = False
                tasks = Task.query.filter_by(owner=username).all()
                for task in tasks:
                    task.switch = False
                    if scheduler.get_job(job_id=task.name + "_" + task.owner):
                        scheduler.pause_job(job_id=task.name + "_" + task.owner)
                        scheduler.remove_job(job_id=task.name + "_" + task.owner)
                db.session.commit()
                if os.path.exists(
                    str(Path.home().joinpath(".aligo")) + "/" + user.username + ".json"
                ):
                    os.remove(
                        str(Path.home().joinpath(".aligo"))
                        + "/"
                        + user.username
                        + ".json"
                    )
                writeAdminDialog("下线用户[" + user.nickname + "]阿里云盘成功")
                return "下线成功"
            else:
                writeAdminDialog("下线用户[" + user.nickname + "]阿里云盘失败:用户当前离线")
                return "用户阿里云盘当前离线"
        elif username == g.user.username:  # 用户匹配
            if ALIGOS.get(username):
                ALIGOS[username] = None
                del ALIGOS[username]
                user.online = False
                tasks = Task.query.filter_by(owner=username).all()
                for task in tasks:
                    task.switch = False
                    if scheduler.get_job(job_id=task.name + "_" + task.owner):
                        scheduler.pause_job(job_id=task.name + "_" + task.owner)
                        scheduler.remove_job(job_id=task.name + "_" + task.owner)
                db.session.commit()
                if os.path.exists(
                    str(Path.home().joinpath(".aligo")) + "/" + user.username + ".json"
                ):
                    os.remove(
                        str(Path.home().joinpath(".aligo"))
                        + "/"
                        + user.username
                        + ".json"
                    )
                writeDialog(username, "下线阿里云盘成功")
                return "下线成功"
            else:
                writeDialog(username, "下线阿里云盘失败:当前已离线")
                user.online = False
                db.session.commit()
                if os.path.exists(
                    str(Path.home().joinpath(".aligo")) + "/" + user.username + ".json"
                ):
                    os.remove(
                        str(Path.home().joinpath(".aligo"))
                        + "/"
                        + user.username
                        + ".json"
                    )
                return "错误:当前离线，将删除登录数据，请尝试刷新网页"
        else:
            return "非法操作"


@app.route("/createfolder", methods=["POST"])  # 创建文件夹
def createfolder():
    if not g.user:
        return jsonify({"notice": "非法请求，未登录状态"})
    else:
        try:
            parent_id = request.json["parent_id"]
            foldername = request.json["foldername"]
            ALIGOS[g.user.username].create_folder(
                name=foldername, parent_file_id=parent_id
            )
            writeDialog(owner=g.user.username, content="创建了【" + foldername + "】文件夹")
            return jsonify({"notice": "创建成功"})
        except:
            writeDialog(owner=g.user.username, content="创建【" + foldername + "】文件夹失败")
            return jsonify({"notice": "创建失败"})


@app.route("/applytest", methods=["POST"])  # 临时测试
def applytest():
    if not g.user:
        return "非法请求，未登录状态"
    else:
        try:
            rawurl = request.form.get("from")
            url = rawurl + "/end"
            share_id = getMidStr(url, "s/", "/")
            parent_file_id = getMidStr(url, "folder/", "/end")
            to_id = request.form.get("to")
            if rawurl == "" or rawurl == "None":
                return "链接未填写正确"
            if to_id == "" or to_id == "None":
                return "选择文件夹非法"
            savecount = saveFolder(
                g.user.username,
                share_id=share_id,
                from_id=parent_file_id,
                to_id=to_id,
                key=request.form.get("key"),
            )
            if savecount == 0:
                writeDialog(owner=g.user.username, content="经过本次测试，无需要更新的文件")
            else:
                writeDialog(
                    owner=g.user.username, content="经过本次测试，更新了" + str(savecount) + "个文件"
                )
            return "测试成功,请查看日志获取详情"
        except:
            return "测试失败，可能原因是本地文件夹不存在或填写的网址无效"


@app.route("/ban", methods=["POST"])  # 封禁用户
def ban():
    if not "admin" in session:
        return "非管理员身份"
    else:
        username = request.form.get("username")
        if banuser(username):
            global ALIGOS
            ALIGOS[username] = None
            del ALIGOS[username]
            user = User.query.filter_by(username=username).first()
            user.online = False
            db.session.commit()
            if os.path.exists(
                str(Path.home().joinpath(".aligo")) + "/" + user.username + ".json"
            ):
                os.remove(
                    str(Path.home().joinpath(".aligo")) + "/" + user.username + ".json"
                )
            writeAdminDialog("封禁用户[" + username + "]成功")
            return "封禁成功"
        else:
            writeAdminDialog("封禁用户[" + username + "]失败")
            return "封禁失败"


@app.route("/unban", methods=["POST"])  # 解封用户
def unban():
    if not "admin" in session:
        return "非管理员身份"
    else:
        try:
            username = request.form.get("username")
            user = User.query.filter_by(username=username).first()
            user.baned = False
            db.session.commit()
            if not ALIGOS.get(user.username):
                loginAligo(user)
            writeAdminDialog("解封用户[" + username + "]成功")
            return "解封成功"
        except:
            writeAdminDialog("解封用户[" + username + "]失败")
            return "解封失败"


@app.route("/version", methods=["POST"])  # 获取当前版本号
def getversion():
    globals
    return VERSION


# ---------------------------------------主程序--------------------------------------
if __name__ == "__main__":
    # 设定Scheduler日程器
    scheduler = BackgroundScheduler(timezone="Asia/Shanghai")
    scheduler.start()
    # 初始化
    startup()
    # 启动flask线程
    globals
    FLASK = startThread(startFlask)
    # 由于BackgroundScheduler需要在主线程中运行，故让主线程永不终止
    while True:
        time.sleep(90000)
        neverDie = 1
        neverDie += 1
