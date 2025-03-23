#!/bin/bash
set -e

# 如果存在挂载的配置文件，则使用它
if [ -f "/app/config.ini" ]; then
    echo "使用挂载的配置文件"
else
    # 如果没有配置文件，复制模板
    echo "配置文件不存在，创建默认配置..."
    cp /app/config.ini.template /app/config.ini
    
    # 替换环境变量中的配置
    if [ ! -z "$DATABASE_URL" ]; then
        sed -i "s|# url = postgresql://.*|url = $DATABASE_URL|g" /app/config.ini
    fi
    
    if [ ! -z "$REDIS_URL" ]; then
        sed -i "s|# url = redis://.*|url = $REDIS_URL|g" /app/config.ini
    fi
fi

# 设置配置文件路径环境变量
export CONFIG_FILE="/app/config.ini"

# 等待数据库准备好
echo "等待PostgreSQL..."
DB_HOST=$(grep -oP 'host = \K.*' /app/config.ini | head -1 || echo "db")
DB_PORT=$(grep -oP 'port = \K.*' /app/config.ini | head -1 || echo "5432")

until nc -z $DB_HOST $DB_PORT; do
  >&2 echo "PostgreSQL尚未就绪 - 等待..."
  sleep 1
done
echo "PostgreSQL已就绪"

# 等待Redis准备好
echo "等待Redis..."
REDIS_HOST=$(grep -oP 'host = \K.*' /app/config.ini | tail -1 || echo "redis")
REDIS_PORT=$(grep -oP 'port = \K.*' /app/config.ini | tail -1 || echo "6379")

until nc -z $REDIS_HOST $REDIS_PORT; do
  >&2 echo "Redis尚未就绪 - 等待..."
  sleep 1
done
echo "Redis已就绪"

# 启动Celery Worker或Beat
echo "启动Celery服务..."
exec "$@" 