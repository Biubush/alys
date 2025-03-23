import logging
import json
from datetime import datetime, timedelta
from app import db, scheduler
from app.models import Task, TaskExecution, User, Log
from app.services.aligo_service import AligoService
from app.tasks.file_tasks import save_folder_task
from app.utils.helpers import get_share_id_from_url

class TaskService:
    """任务服务类"""
    
    def __init__(self):
        self._logger = logging.getLogger(__name__)
        self._aligo_service = AligoService()
    
    def get_tasks(self, user_id, search=None, enabled_only=False):
        """获取用户任务列表
        
        Args:
            user_id: 用户ID
            search: 搜索关键词
            enabled_only: 是否只返回已启用的任务
            
        Returns:
            任务列表
        """
        query = Task.query.filter_by(user_id=user_id)
        
        if search:
            query = query.filter(Task.name.contains(search))
            
        if enabled_only:
            query = query.filter_by(is_enabled=True)
            
        tasks = query.all()
        return [task.to_dict() for task in tasks]
    
    def get_task(self, task_id, user_id=None):
        """获取单个任务详情
        
        Args:
            task_id: 任务ID
            user_id: 用户ID(可选，用于验证任务所有权)
            
        Returns:
            任务详情或None
        """
        query = Task.query.filter_by(id=task_id)
        
        if user_id:
            query = query.filter_by(user_id=user_id)
            
        task = query.first()
        return task.to_dict() if task else None
    
    def create_task(self, data, user_id):
        """创建新任务
        
        Args:
            data: 任务数据
            user_id: 用户ID
            
        Returns:
            新创建的任务或错误信息
        """
        # 检查用户
        user = User.query.get(user_id)
        if not user:
            return {'success': False, 'message': '用户不存在'}
            
        # 检查任务名称是否已存在
        if Task.query.filter_by(name=data.get('name'), user_id=user_id).first():
            return {'success': False, 'message': '同名任务已存在'}
            
        # 检查更新频率
        interval = data.get('interval', 600)
        if interval < 600:
            return {'success': False, 'message': '更新频率不能小于600秒'}
            
        # 提取分享ID和文件夹ID
        share_id = data.get('share_id', '')
        source_folder_id = data.get('source_folder_id')
        
        # 检查必要参数
        if not share_id or not source_folder_id:
            return {'success': False, 'message': '分享链接或文件夹ID无效'}
            
        # 处理share_id
        try:
            # 如果是URL，提取实际的share_id
            if share_id.startswith('http'):
                share_id = get_share_id_from_url(share_id)
        except:
            return {'success': False, 'message': '无法解析分享ID'}
            
        # 创建调度配置
        schedule_config = {
            'hour': data.get('hour', 0),
            'minute': data.get('minute', 0),
            'second': data.get('second', 0)
        }
        
        task_type = data.get('type', 0)
        if task_type == 1:  # 每周
            schedule_config['day_of_week'] = data.get('day_of_week', 1)
        elif task_type == 2:  # 每月
            schedule_config['day_of_month'] = data.get('day_of_month', 1)
            
        # 创建任务
        task = Task(
            name=data.get('name'),
            user_id=user_id,
            is_enabled=data.get('is_enabled', True),
            type=task_type,
            schedule_config=json.dumps(schedule_config),
            interval=interval,
            share_id=share_id,
            source_folder_id=source_folder_id,
            target_folder_id=data.get('target_folder_id'),
            folder_name=data.get('folder_name'),
            share_password=data.get('share_password')
        )
        
        try:
            db.session.add(task)
            db.session.commit()
            
            # 如果任务已启用，添加到调度器
            if task.is_enabled:
                self._schedule_task(task)
                
            # 记录日志
            self._log_message(
                user_id=user_id,
                level='success',
                category='task',
                message=f'创建任务成功: {task.name}'
            )
            
            return {'success': True, 'task': task.to_dict()}
            
        except Exception as e:
            db.session.rollback()
            self._logger.error(f"Failed to create task for user {user_id}: {str(e)}")
            return {'success': False, 'message': f'创建任务失败: {str(e)}'}
    
    def update_task(self, task_id, data, user_id):
        """更新任务
        
        Args:
            task_id: 任务ID
            data: 更新数据
            user_id: 用户ID
            
        Returns:
            更新后的任务或错误信息
        """
        # 查找任务
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        if not task:
            return {'success': False, 'message': '任务不存在或无权限修改'}
            
        # 如果要修改任务名称，检查是否重名
        if 'name' in data and data['name'] != task.name:
            if Task.query.filter_by(name=data['name'], user_id=user_id).first():
                return {'success': False, 'message': '同名任务已存在'}
            task.name = data['name']
            
        # 更新基本属性
        for field in ['interval', 'target_folder_id', 'folder_name', 'share_password']:
            if field in data:
                setattr(task, field, data[field])
                
        # 检查更新频率
        if task.interval < 600:
            return {'success': False, 'message': '更新频率不能小于600秒'}
            
        # 更新分享链接和文件夹ID
        if 'share_id' in data:
            try:
                task.share_id = get_share_id_from_url(data['share_id'])
            except:
                return {'success': False, 'message': '无法解析分享ID'}
                
        if 'source_folder_id' in data:
            task.source_folder_id = data['source_folder_id']
            
        # 更新调度配置
        if 'type' in data or any(k in data for k in ['hour', 'minute', 'second', 'day_of_week', 'day_of_month']):
            schedule_config = task.schedule if hasattr(task, 'schedule') else {}
            
            if 'type' in data:
                task.type = data['type']
                
            for field in ['hour', 'minute', 'second']:
                if field in data:
                    schedule_config[field] = data[field]
                    
            if task.type == 1 and 'day_of_week' in data:
                schedule_config['day_of_week'] = data['day_of_week']
            elif task.type == 2 and 'day_of_month' in data:
                schedule_config['day_of_month'] = data['day_of_month']
                
            task.schedule = schedule_config
            
        # 处理任务启用状态
        was_enabled = task.is_enabled
        if 'is_enabled' in data:
            task.is_enabled = data['is_enabled']
            
        try:
            db.session.commit()
            
            # 更新调度器中的任务
            job_id = f"task_{task.id}"
            
            # 如果任务状态改变或调度配置改变，更新调度器
            if was_enabled != task.is_enabled or 'type' in data or any(k in data for k in ['hour', 'minute', 'second', 'day_of_week', 'day_of_month']):
                # 移除现有任务
                if scheduler.get_job(job_id):
                    scheduler.remove_job(job_id)
                    
                # 如果任务启用，重新添加到调度器
                if task.is_enabled:
                    self._schedule_task(task)
            
            # 记录日志
            self._log_message(
                user_id=user_id,
                level='success',
                category='task',
                message=f'更新任务成功: {task.name}'
            )
            
            return {'success': True, 'task': task.to_dict()}
            
        except Exception as e:
            db.session.rollback()
            self._logger.error(f"Failed to update task {task_id} for user {user_id}: {str(e)}")
            return {'success': False, 'message': f'更新任务失败: {str(e)}'}
    
    def delete_task(self, task_id, user_id):
        """删除任务
        
        Args:
            task_id: 任务ID
            user_id: 用户ID
            
        Returns:
            操作结果
        """
        # 查找任务
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        if not task:
            return {'success': False, 'message': '任务不存在或无权限删除'}
            
        try:
            # 任务名称用于日志记录
            task_name = task.name
            
            # 从调度器中移除任务
            job_id = f"task_{task.id}"
            if scheduler.get_job(job_id):
                scheduler.remove_job(job_id)
                
            # 删除任务
            db.session.delete(task)
            db.session.commit()
            
            # 记录日志
            self._log_message(
                user_id=user_id,
                level='success',
                category='task',
                message=f'删除任务成功: {task_name}'
            )
            
            return {'success': True, 'message': '删除任务成功'}
            
        except Exception as e:
            db.session.rollback()
            self._logger.error(f"Failed to delete task {task_id} for user {user_id}: {str(e)}")
            return {'success': False, 'message': f'删除任务失败: {str(e)}'}
    
    def toggle_task(self, task_id, user_id, enable=True):
        """启用或禁用任务
        
        Args:
            task_id: 任务ID
            user_id: 用户ID
            enable: 是否启用
            
        Returns:
            操作结果
        """
        # 查找任务
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        if not task:
            return {'success': False, 'message': '任务不存在或无权限操作'}
            
        if task.is_enabled == enable:
            return {'success': True, 'message': f'任务已经{"启用" if enable else "禁用"}'}
            
        try:
            task.is_enabled = enable
            db.session.commit()
            
            # 更新调度器
            job_id = f"task_{task.id}"
            
            if enable:
                # 如果启用任务，添加到调度器
                self._schedule_task(task)
            else:
                # 如果禁用任务，从调度器中移除
                if scheduler.get_job(job_id):
                    scheduler.remove_job(job_id)
                    
            # 记录日志
            self._log_message(
                user_id=user_id,
                level='success',
                category='task',
                message=f'{"启用" if enable else "禁用"}任务成功: {task.name}'
            )
            
            return {'success': True, 'message': f'{"启用" if enable else "禁用"}任务成功'}
            
        except Exception as e:
            db.session.rollback()
            self._logger.error(f"Failed to toggle task {task_id} for user {user_id}: {str(e)}")
            return {'success': False, 'message': f'操作失败: {str(e)}'}
    
    def run_task_now(self, task_id, user_id):
        """立即运行任务
        
        Args:
            task_id: 任务ID
            user_id: 用户ID
            
        Returns:
            操作结果
        """
        # 查找任务
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        if not task:
            return {'success': False, 'message': '任务不存在或无权限操作'}
            
        if task.is_running:
            return {'success': False, 'message': '任务正在运行中'}
            
        try:
            # 更新任务状态
            task.is_running = True
            task.last_run = datetime.utcnow()
            db.session.commit()
            
            # 创建执行记录
            execution = TaskExecution(
                task_id=task.id,
                status='running',
                start_time=datetime.utcnow()
            )
            db.session.add(execution)
            db.session.commit()
            
            # 异步执行任务
            save_folder_task.delay(
                user_id=user_id,
                task_id=task.id,
                execution_id=execution.id
            )
            
            # 记录日志
            self._log_message(
                user_id=user_id,
                level='info',
                category='task',
                message=f'手动执行任务: {task.name}'
            )
            
            return {'success': True, 'message': '任务已开始执行'}
            
        except Exception as e:
            db.session.rollback()
            self._logger.error(f"Failed to run task {task_id} for user {user_id}: {str(e)}")
            return {'success': False, 'message': f'执行任务失败: {str(e)}'}
    
    def get_task_executions(self, task_id, user_id, limit=10):
        """获取任务执行历史
        
        Args:
            task_id: 任务ID
            user_id: 用户ID
            limit: 返回记录数量
            
        Returns:
            执行历史记录
        """
        # 验证任务所有权
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        if not task:
            return {'success': False, 'message': '任务不存在或无权限查看'}
            
        try:
            executions = TaskExecution.query.filter_by(task_id=task_id)\
                .order_by(TaskExecution.start_time.desc())\
                .limit(limit).all()
                
            return {
                'success': True, 
                'executions': [execution.to_dict() for execution in executions]
            }
            
        except Exception as e:
            self._logger.error(f"Failed to get executions for task {task_id}: {str(e)}")
            return {'success': False, 'message': f'获取执行历史失败: {str(e)}'}
    
    def _schedule_task(self, task):
        """添加任务到调度器
        
        Args:
            task: 任务对象
        """
        job_id = f"task_{task.id}"
        
        # 创建Cron表达式
        cron_expression = task.get_cron_expression()
        if not cron_expression:
            self._logger.error(f"Invalid cron expression for task {task.id}")
            return
            
        # 添加到调度器
        scheduler.add_job(
            id=job_id,
            func=self._execute_task,
            args=[task.id],
            trigger='cron',
            **self._parse_cron_expression(cron_expression),
            replace_existing=True
        )
        
        # 计算下次执行时间
        import croniter
        import pytz
        from datetime import datetime
        
        try:
            cron = croniter.croniter(cron_expression, datetime.utcnow())
            next_run = cron.get_next(datetime)
            
            task.next_run = next_run
            db.session.commit()
        except Exception as e:
            self._logger.error(f"Failed to compute next run time for task {task.id}: {str(e)}")
    
    def _execute_task(self, task_id):
        """执行任务
        
        Args:
            task_id: 任务ID
        """
        # 查找任务
        task = Task.query.get(task_id)
        if not task or not task.is_enabled:
            return
            
        if task.is_running:
            self._logger.warning(f"Task {task_id} is already running")
            return
            
        try:
            # 更新任务状态
            task.is_running = True
            task.last_run = datetime.utcnow()
            db.session.commit()
            
            # 创建执行记录
            execution = TaskExecution(
                task_id=task.id,
                status='running',
                start_time=datetime.utcnow()
            )
            db.session.add(execution)
            db.session.commit()
            
            # 异步执行任务
            save_folder_task.delay(
                user_id=task.user_id,
                task_id=task.id,
                execution_id=execution.id
            )
            
            # 记录日志
            self._log_message(
                user_id=task.user_id,
                level='info',
                category='task',
                message=f'自动执行任务: {task.name}'
            )
            
        except Exception as e:
            self._logger.error(f"Failed to execute task {task_id}: {str(e)}")
            if task:
                task.is_running = False
                db.session.commit()
    
    def _parse_cron_expression(self, expression):
        """解析Cron表达式到APScheduler参数
        
        Args:
            expression: Cron表达式
            
        Returns:
            APScheduler参数字典
        """
        parts = expression.split()
        if len(parts) < 6:
            raise ValueError("Invalid cron expression")
            
        result = {}
        if parts[0] != '*':
            result['second'] = parts[0]
        if parts[1] != '*':
            result['minute'] = parts[1]
        if parts[2] != '*':
            result['hour'] = parts[2]
            
        # 处理日期部分
        if parts[3] != '*' and parts[3] != '?':
            result['day'] = parts[3]
        if parts[4] != '*' and parts[4] != '?':
            result['month'] = parts[4]
        if parts[5] != '*' and parts[5] != '?':
            result['day_of_week'] = parts[5]
            
        return result
    
    def _log_message(self, user_id, level, category, message, details=None):
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