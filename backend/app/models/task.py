from datetime import datetime
import json
from app import db

class Task(db.Model):
    """任务模型"""
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # 任务状态
    is_enabled = db.Column(db.Boolean, default=False)
    is_running = db.Column(db.Boolean, default=False)
    last_run = db.Column(db.DateTime, nullable=True)
    next_run = db.Column(db.DateTime, nullable=True)
    
    # 任务类型和调度
    type = db.Column(db.Integer)  # 0:每天, 1:每周, 2:每月
    schedule_config = db.Column(db.Text)  # JSON格式存储调度配置
    interval = db.Column(db.Integer, default=600)  # 更新间隔(秒)
    
    # 阿里云盘配置
    share_id = db.Column(db.String(64))
    source_folder_id = db.Column(db.String(64))
    target_folder_id = db.Column(db.String(64))
    folder_name = db.Column(db.String(64))
    share_password = db.Column(db.String(64), nullable=True)
    
    # 时间记录
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 执行历史记录
    execution_logs = db.relationship('TaskExecution', backref='task', lazy='dynamic', cascade='all, delete-orphan')
    
    @property
    def schedule(self):
        """获取调度配置"""
        if self.schedule_config:
            return json.loads(self.schedule_config)
        return {}
        
    @schedule.setter
    def schedule(self, config):
        """设置调度配置"""
        self.schedule_config = json.dumps(config)
        
    def get_cron_expression(self):
        """获取Cron表达式"""
        config = self.schedule
        if self.type == 0:  # 每天
            return f"{config.get('second', 0)} {config.get('minute', 0)} {config.get('hour', 0)} * * ?"
        elif self.type == 1:  # 每周
            return f"{config.get('second', 0)} {config.get('minute', 0)} {config.get('hour', 0)} ? * {config.get('day_of_week', 1)}"
        elif self.type == 2:  # 每月
            return f"{config.get('second', 0)} {config.get('minute', 0)} {config.get('hour', 0)} {config.get('day_of_month', 1)} * ?"
        return None
        
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id,
            'is_enabled': self.is_enabled,
            'is_running': self.is_running,
            'type': self.type,
            'schedule': self.schedule,
            'interval': self.interval,
            'share_id': self.share_id,
            'source_folder_id': self.source_folder_id,
            'target_folder_id': self.target_folder_id,
            'folder_name': self.folder_name,
            'last_run': self.last_run.isoformat() if self.last_run else None,
            'next_run': self.next_run.isoformat() if self.next_run else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
    def __repr__(self):
        return f'<Task {self.name}>'
        
        
class TaskExecution(db.Model):
    """任务执行记录"""
    __tablename__ = 'task_executions'
    
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'))
    
    # 执行状态
    status = db.Column(db.String(16))  # success, error, canceled
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=True)
    
    # 执行结果
    files_scanned = db.Column(db.Integer, default=0)
    files_saved = db.Column(db.Integer, default=0)
    files_skipped = db.Column(db.Integer, default=0)
    error_message = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'status': self.status,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'files_scanned': self.files_scanned,
            'files_saved': self.files_saved,
            'files_skipped': self.files_skipped,
            'error_message': self.error_message,
            'duration': (self.end_time - self.start_time).total_seconds() if self.end_time else None
        }
        
    def __repr__(self):
        return f'<TaskExecution {self.id} {self.status}>' 