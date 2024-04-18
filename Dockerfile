# 使用官方的 Debian Buster Slim 作为基础镜像
FROM debian:buster-slim

# 设置工作目录
WORKDIR /app

# 将本地的 init.sh 脚本复制到镜像中的 /app 目录下
COPY init.sh /app/init.sh

# 安装 curl 和 wget
RUN apt-get update && apt-get install -y curl wget python3 python3-pip git

# 开放容器的 8587 端口
EXPOSE 8587

# 定义容器启动时执行的命令，即运行 init.sh 脚本
CMD ["/bin/bash", "/app/init.sh"]