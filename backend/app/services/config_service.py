import os
from pathlib import Path
from typing import Dict, Any
import json
from dotenv import load_dotenv, set_key

from app.core.config import settings

# 获取.env文件路径
env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"

class ConfigService:
    @staticmethod
    def get_system_settings() -> Dict[str, Any]:
        """获取系统设置"""
        config = {
            "server": {
                "host": settings.SERVER_HOST,
                "port": settings.SERVER_PORT,
                "workers": settings.SERVER_WORKERS,
                "debug": settings.DEBUG
            },
            "database": {
                "url": settings.DATABASE_URL
            },
            "aliyundrive": {
                "refresh_token": settings.ALIYUNDRIVE_REFRESH_TOKEN,
                "sync_interval_minutes": settings.SYNC_INTERVAL_MINUTES
            }
        }
        return config
    
    @staticmethod
    def update_system_settings(data: Dict[str, Any]) -> Dict[str, Any]:
        """更新系统设置"""
        # 加载当前.env文件
        load_dotenv(dotenv_path=env_path)
        
        # 更新服务器设置
        if "server" in data:
            server = data["server"]
            if "host" in server:
                set_key(env_path, "SERVER_HOST", str(server["host"]))
            if "port" in server:
                set_key(env_path, "SERVER_PORT", str(server["port"]))
            if "workers" in server:
                set_key(env_path, "SERVER_WORKERS", str(server["workers"]))
            if "debug" in server:
                set_key(env_path, "DEBUG", str(server["debug"]).lower())
        
        # 更新数据库设置
        if "database" in data and "url" in data["database"]:
            set_key(env_path, "DATABASE_URL", str(data["database"]["url"]))
        
        # 更新阿里云盘设置
        if "aliyundrive" in data:
            aliyundrive = data["aliyundrive"]
            if "refresh_token" in aliyundrive:
                set_key(env_path, "ALIYUNDRIVE_REFRESH_TOKEN", str(aliyundrive["refresh_token"]))
            if "sync_interval_minutes" in aliyundrive:
                set_key(env_path, "SYNC_INTERVAL_MINUTES", str(aliyundrive["sync_interval_minutes"]))
        
        # 重新加载设置
        load_dotenv(dotenv_path=env_path, override=True)
        
        # 返回更新后的设置
        return ConfigService.get_system_settings() 