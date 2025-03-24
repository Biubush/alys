from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
from flask_caching import Cache
from celery import Celery
from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import settings

# 初始化扩展但不绑定到应用
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()
cache = Cache()
cors = CORS()
celery = Celery(__name__, broker=settings.CELERY_BROKER_URL if hasattr(settings, 'CELERY_BROKER_URL') else 'redis://localhost:6379/0')

# 初始化调度器
scheduler = BackgroundScheduler(
    job_defaults={
        'max_instances': 3,
        'coalesce': True,
        'misfire_grace_time': 60
    }
)

def create_app(config_name='default'):
    """应用工厂函数"""
    app = Flask(__name__)
    app.config.from_object(settings)
    
    # 初始化扩展
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    cache.init_app(app)
    cors.init_app(app)
    
    # 配置Celery
    celery.conf.update(app.config)
    
    # 注册蓝图
    from .api import api_bp
    app.register_blueprint(api_bp, url_prefix='/v1')
    
    # 启动调度器
    if not scheduler.running:
        scheduler.start()
    
    return app

def create_celery(app=None):
    """创建Celery实例"""
    app = app or create_app()
    
    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)
                
    celery.Task = ContextTask
    return celery 