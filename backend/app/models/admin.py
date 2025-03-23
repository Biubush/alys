from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class Admin(db.Model):
    """管理员模型"""
    __tablename__ = 'admins'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), unique=True, index=True, nullable=False)
    password_hash = db.Column(db.String(128))
    
    # 系统配置
    website = db.Column(db.String(128), default='')
    port = db.Column(db.Integer, default=8587)
    
    # 邮件配置
    mail_user = db.Column(db.String(64), default='')
    mail_password = db.Column(db.String(128), default='')
    mail_sender = db.Column(db.String(64), default='')
    mail_receiver = db.Column(db.String(64), default='')
    
    # 时间记录
    last_login = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
        
    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'username': self.username,
            'website': self.website,
            'port': self.port,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_sensitive:
            data.update({
                'mail_user': self.mail_user,
                'mail_password': '******',  # 不返回真实密码
                'mail_sender': self.mail_sender,
                'mail_receiver': self.mail_receiver
            })
            
        return data
        
    def __repr__(self):
        return f'<Admin {self.username}>' 