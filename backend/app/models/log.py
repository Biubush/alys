from datetime import datetime
from app import db

class Log(db.Model):
    """系统日志模型"""
    __tablename__ = 'logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('admins.id'), nullable=True)
    
    # 日志类型
    level = db.Column(db.String(16))  # info, warning, error, success
    category = db.Column(db.String(32))  # system, auth, task, file, admin
    
    # 日志内容
    message = db.Column(db.Text, nullable=False)
    details = db.Column(db.Text, nullable=True)
    
    # IP地址
    ip_address = db.Column(db.String(64), nullable=True)
    
    # 时间记录
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'admin_id': self.admin_id,
            'level': self.level,
            'category': self.category,
            'message': self.message,
            'details': self.details,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat()
        }
        
    def __repr__(self):
        return f'<Log {self.id} {self.level}:{self.category}>'
        

class VerificationCode(db.Model):
    """验证码模型"""
    __tablename__ = 'verification_codes'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(64), index=True, nullable=False)
    code = db.Column(db.String(10), nullable=False)
    purpose = db.Column(db.String(32))  # register, reset_password, login
    is_used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    
    def is_valid(self):
        """检查验证码是否有效"""
        return not self.is_used and datetime.utcnow() < self.expires_at
        
    def __repr__(self):
        return f'<VerificationCode {self.email}>' 