#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
数据库初始化脚本
在应用启动前执行，确保数据库结构已正确创建
"""

import os
import sys
import logging
from sqlalchemy import inspect

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# 导入数据库模型和配置
from app.database import db_session, init_db, engine
from app.models import User, Task, TaskExecution
from app.core.config import settings as Config

def init_database():
    """初始化数据库结构和基础数据"""
    logger.info("开始初始化数据库...")
    
    # 检查数据库文件是否存在，如果不存在则创建
    db_dir = os.path.dirname(Config.DATABASE_URL.replace('sqlite:///', ''))
    if not os.path.exists(db_dir):
        logger.info(f"创建数据目录: {db_dir}")
        os.makedirs(db_dir, exist_ok=True)
    
    # 初始化数据库表结构
    logger.info("初始化数据库表结构...")
    init_db()
    
    # 检查是否需要创建管理员账户
    inspector = inspect(engine)
    if inspector.has_table('user'):
        admin_exists = db_session.query(User).filter_by(
            username=Config.ADMIN_USERNAME
        ).first() is not None
        
        if not admin_exists and Config.ADMIN_USERNAME and Config.ADMIN_PASSWORD:
            logger.info("创建管理员账户...")
            admin_user = User(
                username=Config.ADMIN_USERNAME,
                email=Config.ADMIN_EMAIL,
                is_admin=True
            )
            admin_user.set_password(Config.ADMIN_PASSWORD)
            db_session.add(admin_user)
            db_session.commit()
            logger.info(f"管理员账户创建成功: {Config.ADMIN_USERNAME}")
    
    logger.info("数据库初始化完成！")

if __name__ == "__main__":
    init_database() 