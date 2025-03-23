import os
import configparser
from typing import Any, Dict, Optional, Union
from pydantic import BaseSettings, PostgresDsn, validator

# 配置文件位置
CONFIG_FILE_PATH = os.environ.get("CONFIG_FILE", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "config.ini"))

class Settings(BaseSettings):
    # 读取配置文件
    config = configparser.ConfigParser()
    if os.path.exists(CONFIG_FILE_PATH):
        config.read(CONFIG_FILE_PATH)
    
    # 数据库配置
    POSTGRES_SERVER: str = config.get("database", "host", fallback="localhost")
    POSTGRES_PORT: str = config.get("database", "port", fallback="5432")
    POSTGRES_USER: str = config.get("database", "username", fallback="aliyundrive")
    POSTGRES_PASSWORD: str = config.get("database", "password", fallback="")
    POSTGRES_DB: str = config.get("database", "database", fallback="aliyundrive_sync")
    DATABASE_URL: Optional[PostgresDsn] = config.get("database", "url", fallback=None)

    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if v:
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            user=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            host=values.get("POSTGRES_SERVER"),
            port=values.get("POSTGRES_PORT"),
            path=f"/{values.get('POSTGRES_DB') or ''}",
        )

    # Redis配置
    REDIS_HOST: str = config.get("redis", "host", fallback="localhost")
    REDIS_PORT: int = config.getint("redis", "port", fallback=6379)
    REDIS_DB: int = config.getint("redis", "db", fallback=0)
    REDIS_URL: str = config.get("redis", "url", fallback=None)

    @validator("REDIS_URL", pre=True)
    def assemble_redis_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if v:
            return v
        return f"redis://{values.get('REDIS_HOST')}:{values.get('REDIS_PORT')}/{values.get('REDIS_DB')}"

    # 安全配置
    SECRET_KEY: str = config.get("security", "secret_key", fallback="secret-key")
    JWT_SECRET_KEY: str = config.get("security", "jwt_secret_key", fallback="jwt-secret-key")
    JWT_ALGORITHM: str = config.get("security", "jwt_algorithm", fallback="HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = config.getint("security", "jwt_access_token_expire_minutes", fallback=30)
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = config.getint("security", "jwt_refresh_token_expire_days", fallback=7)

    # 邮件配置
    MAIL_SERVER: str = config.get("mail", "server", fallback="")
    MAIL_PORT: int = config.getint("mail", "port", fallback=587)
    MAIL_USERNAME: str = config.get("mail", "username", fallback="")
    MAIL_PASSWORD: str = config.get("mail", "password", fallback="")
    MAIL_FROM: str = config.get("mail", "from_address", fallback="noreply@example.com")
    MAIL_TLS: bool = config.getboolean("mail", "tls", fallback=True)
    MAIL_SSL: bool = config.getboolean("mail", "ssl", fallback=False)

    # 任务配置
    MAX_TASKS_PER_USER: int = config.getint("task", "max_tasks_per_user", fallback=10)
    MAX_CONCURRENT_TASKS: int = config.getint("task", "max_concurrent_tasks", fallback=5)
    DEFAULT_TASK_TIMEOUT: int = config.getint("task", "default_task_timeout", fallback=3600)
    RETRY_COUNT: int = config.getint("task", "retry_count", fallback=3)
    RETRY_INTERVAL: int = config.getint("task", "retry_interval", fallback=300)

    # 服务器配置
    SERVER_HOST: str = config.get("server", "host", fallback="0.0.0.0")
    SERVER_PORT: int = config.getint("server", "port", fallback=8000)
    SERVER_WORKERS: int = config.getint("server", "workers", fallback=4)
    DEBUG: bool = config.getboolean("server", "debug", fallback=False)

    # 管理员配置
    ADMIN_USERNAME: str = config.get("admin", "username", fallback="admin")
    ADMIN_EMAIL: str = config.get("admin", "email", fallback="admin@example.com")
    ADMIN_PASSWORD: str = config.get("admin", "password", fallback="admin")

    # 阿里云盘配置
    ALIYUNDRIVE_REFRESH_TOKEN_INTERVAL: int = config.getint("aliyundrive", "refresh_token_interval", fallback=86400)

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings() 