import logging
from datetime import datetime
from app import celery, db
from app.models import Task, TaskExecution, User, Log
from app.services.aligo_service import AligoService
from app.services.mail_service import MailService

@celery.task(bind=True, max_retries=3, default_retry_delay=60)
def save_folder_task(self, user_id, task_id, execution_id=None):
    """保存文件夹任务
    
    Args:
        user_id: 用户ID
        task_id: 任务ID
        execution_id: 执行记录ID
    
    Returns:
        执行结果
    """
    logger = logging.getLogger(__name__)
    aligo_service = AligoService()
    mail_service = MailService()
    
    logger.info(f"Start executing task {task_id} for user {user_id}")
    
    try:
        # 获取任务和执行记录
        task = Task.query.get(task_id)
        execution = None
        if execution_id:
            execution = TaskExecution.query.get(execution_id)
            
        if not task:
            logger.error(f"Task {task_id} not found")
            return {'success': False, 'message': '任务不存在'}
            
        user = User.query.get(user_id)
        if not user:
            logger.error(f"User {user_id} not found")
            return {'success': False, 'message': '用户不存在'}
            
        # 保存文件
        result = aligo_service.save_shared_files(
            user_id=user_id,
            share_id=task.share_id,
            source_folder_id=task.source_folder_id,
            target_folder_id=task.target_folder_id,
            share_password=task.share_password
        )
        
        # 更新任务状态
        task.is_running = False
        
        # 更新执行记录
        if execution:
            execution.end_time = datetime.utcnow()
            execution.status = 'success' if result.get('success', False) else 'error'
            execution.files_scanned = result.get('total', 0)
            execution.files_saved = result.get('saved', 0)
            execution.files_skipped = result.get('skipped', 0)
            execution.error_message = result.get('message', None)
            
        db.session.commit()
        
        # 发送通知邮件
        if result.get('success', False) and result.get('saved', 0) > 0:
            mail_service.send_task_success_email(
                user_email=user.email,
                user_name=user.nickname,
                task_name=task.name,
                folder_name=task.folder_name,
                files_total=result.get('total', 0),
                files_saved=result.get('saved', 0),
                files_skipped=result.get('skipped', 0)
            )
        elif not result.get('success', False):
            mail_service.send_task_error_email(
                user_email=user.email,
                user_name=user.nickname,
                task_name=task.name,
                error_message=result.get('message', '未知错误')
            )
            
        # 记录日志
        _log_message(
            user_id=user_id,
            level='success' if result.get('success', False) else 'error',
            category='task',
            message=f"任务 {task.name} 执行{'成功' if result.get('success', False) else '失败'}",
            details=f"共扫描{result.get('total', 0)}个文件，保存{result.get('saved', 0)}个，跳过{result.get('skipped', 0)}个" if result.get('success', False) else result.get('message', '未知错误')
        )
        
        logger.info(f"Task {task_id} execution completed with result: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Error executing task {task_id}: {str(e)}")
        
        # 更新任务状态
        if task:
            task.is_running = False
            
        # 更新执行记录
        if execution:
            execution.end_time = datetime.utcnow()
            execution.status = 'error'
            execution.error_message = str(e)
            
        db.session.commit()
        
        # 记录日志
        _log_message(
            user_id=user_id,
            level='error',
            category='task',
            message=f"任务执行异常",
            details=str(e)
        )
        
        # 重试任务
        try:
            raise self.retry(exc=e)
        except Exception as retry_exc:
            logger.error(f"Failed to retry task {task_id}: {str(retry_exc)}")
            return {'success': False, 'message': f'任务执行异常: {str(e)}'}


def _log_message(user_id, level, category, message, details=None):
    """记录日志
    
    Args:
        user_id: 用户ID
        level: 日志级别
        category: 日志类别
        message: 日志消息
        details: 详细信息
    """
    log = Log(
        user_id=user_id,
        level=level,
        category=category,
        message=message,
        details=details
    )
    db.session.add(log)
    db.session.commit() 