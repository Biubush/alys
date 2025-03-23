#!/bin/bash
set -e

# 如果没有配置文件，复制模板
if [ ! -f "/app/config.ini" ]; then
    echo "配置文件不存在，创建默认配置..."
    cp /app/config.ini.template /app/config.ini
    
    # 替换环境变量中的配置
    if [ ! -z "$DATABASE_URL" ]; then
        sed -i "s|# url = postgresql://.*|url = $DATABASE_URL|g" /app/config.ini
    fi
    
    if [ ! -z "$REDIS_URL" ]; then
        sed -i "s|# url = redis://.*|url = $REDIS_URL|g" /app/config.ini
    fi
    
    if [ ! -z "$SECRET_KEY" ]; then
        sed -i "s|secret_key = .*|secret_key = $SECRET_KEY|g" /app/config.ini
    fi
    
    if [ ! -z "$JWT_SECRET_KEY" ]; then
        sed -i "s|jwt_secret_key = .*|jwt_secret_key = $JWT_SECRET_KEY|g" /app/config.ini
    fi
    
    if [ ! -z "$ADMIN_PASSWORD" ]; then
        sed -i "s|password = ChangeThisSecurePassword!|password = $ADMIN_PASSWORD|g" /app/config.ini
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

# 应用数据库迁移
cd /app/backend
echo "应用数据库迁移..."
alembic upgrade head

# 初始化管理员账户（如果需要）
if [ ! -f "/app/.initialized" ]; then
    echo "初始化系统..."
    python -m app.initial_setup
    touch /app/.initialized
    echo "初始化完成"
fi

# 启动后端服务
echo "启动后端API服务..."
cd /app/backend
nohup python -m app.main &

# 配置Nginx服务前端文件
echo "配置Nginx服务..."
if [ ! -d "/var/www/html" ]; then
    mkdir -p /var/www/html
fi
cp -r /app/frontend/dist/* /var/www/html/

# 启动Nginx
echo "启动Nginx服务..."
nginx -g "daemon off;" 