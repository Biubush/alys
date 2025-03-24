from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from app.core.config import settings

# 创建数据库引擎
engine = create_engine(settings.DATABASE_URL)

# 创建会话工厂
db_session = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)

# 创建基础模型类
Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    """初始化数据库"""
    # 导入所有模型，确保它们在创建表之前定义
    from app.models import User, Admin, Task, Log
    # 在这里创建表
    Base.metadata.create_all(bind=engine) 