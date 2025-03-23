import logging
from sqlalchemy.orm import Session

from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.user import User
from app.core.config import settings
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    # 创建表（如果不存在）
    Base.metadata.create_all(bind=engine)
    
    # 检查是否已存在管理员账户
    admin = db.query(User).filter(User.role == "admin").first()
    if admin:
        logger.info("管理员账户已存在，跳过创建")
        return
    
    # 创建管理员账户
    admin_user = User(
        username=settings.ADMIN_USERNAME,
        email=settings.ADMIN_EMAIL,
        password_hash=get_password_hash(settings.ADMIN_PASSWORD),
        role="admin",
        is_active=True
    )
    
    db.add(admin_user)
    db.commit()
    logger.info(f"成功创建管理员账户：{settings.ADMIN_USERNAME}")

def main():
    logger.info("创建初始数据")
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    logger.info("初始数据创建完成")

if __name__ == "__main__":
    main() 