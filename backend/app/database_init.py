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
try:
    # 尝试导入
    logger.info("导入数据库模块和模型...")
    from app.database import db_session, init_db, engine
    from app.models import User, Task, TaskExecution
    from app.core.config import settings as Config
    
    def init_database():
        """初始化数据库结构和基础数据"""
        logger.info("开始初始化数据库...")
        
        # 检查数据库文件是否存在，如果不存在则创建
        if Config.DATABASE_URL.startswith('sqlite:///'):
            db_path = Config.DATABASE_URL.replace('sqlite:///', '')
            # 确保路径是绝对路径
            if not os.path.isabs(db_path):
                db_path = os.path.join('/app', db_path)
            
            db_dir = os.path.dirname(db_path)
            logger.info(f"数据库路径: {db_path}")
            logger.info(f"数据库目录: {db_dir}")
            
            if not os.path.exists(db_dir):
                logger.info(f"创建数据目录: {db_dir}")
                os.makedirs(db_dir, exist_ok=True)
        
        # 初始化数据库表结构
        logger.info("初始化数据库表结构...")
        try:
            init_db()
            logger.info("数据库表结构初始化成功")
        except Exception as e:
            logger.error(f"初始化数据库表结构时出错: {str(e)}")
            raise
        
        # 检查是否需要创建管理员账户
        try:
            inspector = inspect(engine)
            if inspector.has_table('users'):  # 确认表名是否正确
                logger.info("检查管理员账户...")
                
                # 使用原始SQL查询检查管理员是否存在
                result = engine.execute(
                    f"SELECT COUNT(*) FROM users WHERE username = '{Config.ADMIN_USERNAME}' AND is_admin = 1"
                ).scalar()
                
                admin_exists = result > 0
                
                if not admin_exists and Config.ADMIN_USERNAME and Config.ADMIN_PASSWORD:
                    logger.info("创建管理员账户...")
                    # 从app/__init__.py导入create_app并创建应用上下文
                    from app import create_app
                    from werkzeug.security import generate_password_hash
                    
                    app = create_app()
                    with app.app_context():
                        # 使用SQLAlchemy ORM创建管理员用户
                        from app import db
                        admin_user = User(
                            username=Config.ADMIN_USERNAME,
                            email=Config.ADMIN_EMAIL,
                            is_admin=True
                        )
                        if hasattr(admin_user, 'set_password'):
                            admin_user.set_password(Config.ADMIN_PASSWORD)
                        else:
                            admin_user.password_hash = generate_password_hash(Config.ADMIN_PASSWORD)
                        
                        db.session.add(admin_user)
                        db.session.commit()
                        
                    logger.info(f"管理员账户创建成功: {Config.ADMIN_USERNAME}")
            else:
                logger.warning("未找到users表，跳过管理员账户创建")
        except Exception as e:
            logger.error(f"创建管理员账户时出错: {str(e)}")
            # 继续执行，不要因为无法创建管理员而中断整个初始化过程
        
        logger.info("数据库初始化完成！")

except ImportError as e:
    logger.error(f"导入错误: {str(e)}")
    logger.error("无法导入必要的模块，数据库初始化失败")
    
    def init_database():
        """空函数，当导入失败时调用"""
        logger.error("由于导入错误，数据库初始化被跳过")
        return

if __name__ == "__main__":
    try:
        init_database()
    except Exception as e:
        logger.error(f"数据库初始化过程中出错: {str(e)}")
        sys.exit(1) 