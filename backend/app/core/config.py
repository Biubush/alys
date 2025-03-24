import os
from pathlib import Path
from typing import Any, Dict
from pydantic import BaseModel, validator
from dotenv import load_dotenv

# 加载.env文件
env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings(BaseModel):
    # 服务器配置
    SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", "8000"))
    SERVER_WORKERS: int = int(os.getenv("SERVER_WORKERS", "1"))
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    
    # 数据库配置
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    
    # JWT配置
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # 管理员账户配置
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@example.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")
    
    # 阿里云盘配置
    ALIYUNDRIVE_REFRESH_TOKEN: str = os.getenv("ALIYUNDRIVE_REFRESH_TOKEN", "")
    SYNC_INTERVAL_MINUTES: int = int(os.getenv("SYNC_INTERVAL_MINUTES", "30"))
    
    class Config:
        case_sensitive = True

    @validator("DATABASE_URL")
    def validate_database_url(cls, v: str) -> str:
        if v.startswith("sqlite:///"):
            # 确保SQLite数据库的目录存在
            db_path = Path(v.replace("sqlite:///", ""))
            if not db_path.is_absolute():
                db_path = Path(__file__).resolve().parent.parent.parent / db_path
            os.makedirs(db_path.parent, exist_ok=True)
        return v

settings = Settings() 