from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.api import api_bp
from app.models import User, Admin, Task, TaskExecution, Log
from app.services.admin_service import AdminService
from app.services.mail_service import MailService
from datetime import datetime

admin_service = AdminService()
mail_service = MailService()

# 角色检查装饰器
def admin_required(fn):
    """管理员权限检查装饰器"""
    @jwt_required()
    def wrapper(*args, **kwargs):
        identity = get_jwt_identity()
        role = get_jwt().get('role')
        
        if role != 'admin':
            return jsonify({'success': False, 'message': '需要管理员权限'}), 403
            
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

# 获取管理员资料
@api_bp.route('/admin/profile', methods=['GET'])
@admin_required
def get_admin_profile():
    """获取管理员资料API"""
    identity = get_jwt_identity()
    admin_id = identity.get('id')
    admin = Admin.query.get(admin_id)
    
    if not admin:
        return jsonify({'success': False, 'message': '管理员不存在'}), 404
        
    return jsonify({
        'success': True,
        'data': {
            'id': admin.id,
            'username': admin.username,
            'email': admin.email,
            'created_at': admin.created_at.isoformat(),
            'last_login': admin.last_login.isoformat() if admin.last_login else None
        }
    }), 200

# 修改管理员密码
@api_bp.route('/admin/change-password', methods=['POST'])
@admin_required
def admin_change_password():
    """管理员修改密码API"""
    identity = get_jwt_identity()
    admin_id = identity.get('id')
    admin = Admin.query.get(admin_id)
    
    if not admin:
        return jsonify({'success': False, 'message': '管理员不存在'}), 404
        
    data = request.json
    
    # 验证必要字段
    for field in ['current_password', 'new_password']:
        if field not in data:
            return jsonify({'success': False, 'message': f'缺少必要字段: {field}'}), 400
            
    # 验证当前密码
    if not admin.verify_password(data['current_password']):
        return jsonify({'success': False, 'message': '当前密码不正确'}), 401
        
    try:
        # 更新密码
        admin.password = data['new_password']
        db.session.commit()
        
        # 记录日志
        log = Log(
            admin_id=admin_id,
            level='success',
            category='admin',
            message='管理员密码修改成功',
            ip_address=request.remote_addr
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '密码修改成功'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'密码修改失败: {str(e)}'}), 500

# 获取系统统计数据
@api_bp.route('/admin/statistics', methods=['GET'])
@admin_required
def get_system_statistics():
    """获取系统统计数据API"""
    stats = admin_service.get_system_statistics()
    
    return jsonify({
        'success': True,
        'data': stats
    }), 200

# 获取用户列表
@api_bp.route('/admin/users', methods=['GET'])
@admin_required
def get_users():
    """获取用户列表API"""
    # 获取分页参数
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(max(per_page, 10), 100)  # 限制每页显示范围
    
    # 获取搜索参数
    search = request.args.get('search', '')
    
    # 构建查询
    query = User.query
    
    if search:
        query = query.filter(
            (User.username.contains(search)) |
            (User.nickname.contains(search)) |
            (User.email.contains(search))
        )
    
    # 分页查询
    pagination = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    users = pagination.items
    
    # 格式化结果
    user_list = [{
        'id': user.id,
        'username': user.username,
        'nickname': user.nickname,
        'email': user.email,
        'is_banned': user.is_banned,
        'is_online': user.is_online,
        'task_count': Task.query.filter_by(user_id=user.id).count(),
        'created_at': user.created_at.isoformat(),
        'last_login': user.last_login.isoformat() if user.last_login else None
    } for user in users]
    
    return jsonify({
        'success': True,
        'data': {
            'users': user_list,
            'pagination': {
                'total': pagination.total,
                'pages': pagination.pages,
                'page': page,
                'per_page': per_page,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }
    }), 200

# 获取用户详情
@api_bp.route('/admin/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user_detail(user_id):
    """获取用户详情API"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': '用户不存在'}), 404
        
    # 获取用户任务列表
    tasks = Task.query.filter_by(user_id=user_id).all()
    task_list = [{
        'id': task.id,
        'name': task.name,
        'share_id': task.share_id,
        'type': task.type,
        'is_enabled': task.is_enabled,
        'next_run': task.next_run.isoformat() if task.next_run else None,
        'created_at': task.created_at.isoformat()
    } for task in tasks]
    
    # 获取用户最近的日志
    logs = Log.query.filter_by(user_id=user_id).order_by(Log.created_at.desc()).limit(10).all()
    log_list = [{
        'id': log.id,
        'level': log.level,
        'category': log.category,
        'message': log.message,
        'ip_address': log.ip_address,
        'created_at': log.created_at.isoformat()
    } for log in logs]
    
    return jsonify({
        'success': True,
        'data': {
            'id': user.id,
            'username': user.username,
            'nickname': user.nickname,
            'email': user.email,
            'is_banned': user.is_banned,
            'is_online': user.is_online,
            'created_at': user.created_at.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'tasks': task_list,
            'logs': log_list
        }
    }), 200

# 禁用/启用用户
@api_bp.route('/admin/users/<int:user_id>/toggle-ban', methods=['POST'])
@admin_required
def toggle_user_ban(user_id):
    """禁用/启用用户API"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': '用户不存在'}), 404
        
    data = request.json
    
    # 验证参数
    if 'ban' not in data:
        return jsonify({'success': False, 'message': '缺少必要参数: ban'}), 400
        
    ban = bool(data['ban'])
    reason = data.get('reason', '管理员操作')
    
    try:
        # 更新用户状态
        user.is_banned = ban
        db.session.commit()
        
        # 记录日志
        status = '禁用' if ban else '启用'
        log = Log(
            admin_id=get_jwt_identity().get('id'),
            user_id=user_id,
            level='warning' if ban else 'info',
            category='admin',
            message=f'管理员{status}用户 {user.username}: {reason}',
            ip_address=request.remote_addr
        )
        db.session.add(log)
        db.session.commit()
        
        # 如果禁用用户，同时禁用其所有任务
        if ban:
            tasks = Task.query.filter_by(user_id=user_id, is_enabled=True).all()
            for task in tasks:
                task.is_enabled = False
                
            db.session.commit()
            
            # 通知用户
            if 'send_notification' in data and data['send_notification']:
                try:
                    mail_service.send_email(
                        to=user.email,
                        subject='账号状态变更通知',
                        template='account_banned.html',
                        user_name=user.nickname or user.username,
                        reason=reason,
                        contact_email=Admin.query.first().email  # 使用第一个管理员的邮箱作为联系方式
                    )
                except Exception as e:
                    # 发送邮件失败不影响主流程
                    pass
        
        return jsonify({
            'success': True,
            'message': f'用户已{status}',
            'data': {
                'is_banned': user.is_banned
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        status = '禁用' if ban else '启用'
        return jsonify({'success': False, 'message': f'用户{status}失败: {str(e)}'}), 500

# 重置用户密码
@api_bp.route('/admin/users/<int:user_id>/reset-password', methods=['POST'])
@admin_required
def reset_user_password(user_id):
    """重置用户密码API"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': '用户不存在'}), 404
        
    try:
        # 生成随机密码
        import random
        import string
        new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
        
        # 更新用户密码
        user.password = new_password
        db.session.commit()
        
        # 记录日志
        log = Log(
            admin_id=get_jwt_identity().get('id'),
            user_id=user_id,
            level='warning',
            category='admin',
            message=f'管理员重置用户 {user.username} 的密码',
            ip_address=request.remote_addr
        )
        db.session.add(log)
        db.session.commit()
        
        # 发送邮件通知用户
        mail_result = mail_service.send_account_recovery_email(
            user_email=user.email,
            user_name=user.nickname or user.username,
            username=user.username,
            password=new_password
        )
        
        if not mail_result['success']:
            return jsonify({'success': True, 'message': '密码已重置，但邮件发送失败，请手动通知用户新密码'}), 200
        
        return jsonify({
            'success': True,
            'message': '密码已重置并发送到用户邮箱'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'密码重置失败: {str(e)}'}), 500

# 获取所有任务列表
@api_bp.route('/admin/tasks', methods=['GET'])
@admin_required
def get_all_tasks():
    """获取所有任务列表API"""
    # 获取分页参数
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(max(per_page, 10), 100)  # 限制每页显示范围
    
    # 获取搜索参数
    search = request.args.get('search', '')
    user_id = request.args.get('user_id', type=int)
    enabled = request.args.get('enabled')
    if enabled is not None:
        enabled = enabled.lower() == 'true'
    
    # 构建查询
    query = Task.query
    
    if search:
        query = query.filter(Task.name.contains(search))
    if user_id:
        query = query.filter_by(user_id=user_id)
    if enabled is not None:
        query = query.filter_by(is_enabled=enabled)
    
    # 分页查询
    pagination = query.order_by(Task.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    tasks = pagination.items
    
    # 获取用户名映射
    user_ids = [task.user_id for task in tasks]
    users = User.query.filter(User.id.in_(user_ids)).all()
    user_map = {user.id: user.username for user in users}
    
    # 格式化结果
    task_list = [{
        'id': task.id,
        'name': task.name,
        'user_id': task.user_id,
        'username': user_map.get(task.user_id, 'Unknown'),
        'share_id': task.share_id,
        'type': task.type,
        'is_enabled': task.is_enabled,
        'next_run': task.next_run.isoformat() if task.next_run else None,
        'created_at': task.created_at.isoformat()
    } for task in tasks]
    
    return jsonify({
        'success': True,
        'data': {
            'tasks': task_list,
            'pagination': {
                'total': pagination.total,
                'pages': pagination.pages,
                'page': page,
                'per_page': per_page,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }
    }), 200

# 获取任务详情
@api_bp.route('/admin/tasks/<int:task_id>', methods=['GET'])
@admin_required
def get_task_detail(task_id):
    """获取任务详情API"""
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'success': False, 'message': '任务不存在'}), 404
        
    # 获取用户信息
    user = User.query.get(task.user_id)
    
    # 获取最近的执行记录
    executions = TaskExecution.query.filter_by(task_id=task_id).order_by(
        TaskExecution.start_time.desc()
    ).limit(10).all()
    
    execution_list = [{
        'id': exe.id,
        'status': exe.status,
        'start_time': exe.start_time.isoformat() if exe.start_time else None,
        'end_time': exe.end_time.isoformat() if exe.end_time else None,
        'files_scanned': exe.files_scanned,
        'files_saved': exe.files_saved,
        'files_skipped': exe.files_skipped,
        'error_message': exe.error_message
    } for exe in executions]
    
    return jsonify({
        'success': True,
        'data': {
            'id': task.id,
            'name': task.name,
            'user_id': task.user_id,
            'username': user.username if user else 'Unknown',
            'share_id': task.share_id,
            'source_folder_id': task.source_folder_id,
            'target_folder_id': task.target_folder_id,
            'folder_name': task.folder_name,
            'share_password': task.share_password,
            'type': task.type,
            'schedule': task.schedule,
            'interval': task.interval,
            'next_run': task.next_run.isoformat() if task.next_run else None,
            'is_enabled': task.is_enabled,
            'created_at': task.created_at.isoformat(),
            'executions': execution_list
        }
    }), 200

# 禁用/启用任务
@api_bp.route('/admin/tasks/<int:task_id>/toggle', methods=['POST'])
@admin_required
def admin_toggle_task(task_id):
    """禁用/启用任务API"""
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'success': False, 'message': '任务不存在'}), 404
        
    data = request.json
    
    # 验证参数
    if 'enable' not in data:
        return jsonify({'success': False, 'message': '缺少必要参数: enable'}), 400
        
    enable = bool(data['enable'])
    reason = data.get('reason', '管理员操作')
    
    try:
        result = admin_service.toggle_task(
            task_id=task_id,
            enable=enable,
            admin_id=get_jwt_identity().get('id'),
            reason=reason,
            ip_address=request.remote_addr
        )
        
        if not result:
            return jsonify({'success': False, 'message': '任务启用/禁用失败'}), 500
            
        status = '启用' if enable else '禁用'
        return jsonify({
            'success': True,
            'message': f'任务已{status}',
            'data': {
                'is_enabled': task.is_enabled
            }
        }), 200
    except Exception as e:
        status = '启用' if enable else '禁用'
        return jsonify({'success': False, 'message': f'任务{status}失败: {str(e)}'}), 500

# 获取系统日志
@api_bp.route('/admin/logs', methods=['GET'])
@admin_required
def get_system_logs():
    """获取系统日志API"""
    # 获取分页参数
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(max(per_page, 10), 100)  # 限制每页显示范围
    
    # 获取筛选参数
    level = request.args.get('level')
    category = request.args.get('category')
    user_id = request.args.get('user_id', type=int)
    admin_id = request.args.get('admin_id', type=int)
    
    # 构建查询
    query = Log.query
    
    if level:
        query = query.filter_by(level=level)
    if category:
        query = query.filter_by(category=category)
    if user_id:
        query = query.filter_by(user_id=user_id)
    if admin_id:
        query = query.filter_by(admin_id=admin_id)
    
    # 分页查询
    pagination = query.order_by(Log.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    logs = pagination.items
    
    # 获取用户和管理员名称映射
    user_ids = [log.user_id for log in logs if log.user_id]
    admin_ids = [log.admin_id for log in logs if log.admin_id]
    
    users = User.query.filter(User.id.in_(user_ids)).all() if user_ids else []
    admins = Admin.query.filter(Admin.id.in_(admin_ids)).all() if admin_ids else []
    
    user_map = {user.id: user.username for user in users}
    admin_map = {admin.id: admin.username for admin in admins}
    
    # 格式化结果
    log_list = [{
        'id': log.id,
        'level': log.level,
        'category': log.category,
        'message': log.message,
        'user_id': log.user_id,
        'username': user_map.get(log.user_id) if log.user_id else None,
        'admin_id': log.admin_id,
        'admin_name': admin_map.get(log.admin_id) if log.admin_id else None,
        'ip_address': log.ip_address,
        'created_at': log.created_at.isoformat()
    } for log in logs]
    
    return jsonify({
        'success': True,
        'data': {
            'logs': log_list,
            'pagination': {
                'total': pagination.total,
                'pages': pagination.pages,
                'page': page,
                'per_page': per_page,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }
    }), 200

# 获取任务执行历史
@api_bp.route('/admin/task-executions', methods=['GET'])
@admin_required
def get_all_task_executions():
    """获取所有任务执行历史API"""
    # 获取分页参数
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(max(per_page, 10), 100)  # 限制每页显示范围
    
    # 获取筛选参数
    status = request.args.get('status')
    task_id = request.args.get('task_id', type=int)
    user_id = request.args.get('user_id', type=int)
    
    # 构建查询
    query = TaskExecution.query
    
    if status:
        query = query.filter_by(status=status)
    if task_id:
        query = query.filter_by(task_id=task_id)
    if user_id:
        # 获取用户的所有任务ID
        task_ids = [task.id for task in Task.query.filter_by(user_id=user_id)]
        if task_ids:
            query = query.filter(TaskExecution.task_id.in_(task_ids))
        else:
            # 用户没有任务，返回空结果
            return jsonify({
                'success': True,
                'data': {
                    'executions': [],
                    'pagination': {
                        'total': 0,
                        'pages': 0,
                        'page': page,
                        'per_page': per_page,
                        'has_next': False,
                        'has_prev': False
                    }
                }
            }), 200
    
    # 分页查询
    pagination = query.order_by(TaskExecution.start_time.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    executions = pagination.items
    
    # 获取任务和用户信息
    task_ids = {exe.task_id for exe in executions}
    tasks = Task.query.filter(Task.id.in_(task_ids)).all()
    task_map = {task.id: {'name': task.name, 'user_id': task.user_id} for task in tasks}
    
    user_ids = {task['user_id'] for task in task_map.values()}
    users = User.query.filter(User.id.in_(user_ids)).all()
    user_map = {user.id: user.username for user in users}
    
    # 格式化结果
    execution_list = [{
        'id': exe.id,
        'task_id': exe.task_id,
        'task_name': task_map.get(exe.task_id, {}).get('name', 'Unknown'),
        'user_id': task_map.get(exe.task_id, {}).get('user_id'),
        'username': user_map.get(task_map.get(exe.task_id, {}).get('user_id'), 'Unknown'),
        'status': exe.status,
        'start_time': exe.start_time.isoformat() if exe.start_time else None,
        'end_time': exe.end_time.isoformat() if exe.end_time else None,
        'duration': (exe.end_time - exe.start_time).total_seconds() if (exe.end_time and exe.start_time) else None,
        'files_scanned': exe.files_scanned,
        'files_saved': exe.files_saved,
        'files_skipped': exe.files_skipped,
        'error_message': exe.error_message
    } for exe in executions]
    
    return jsonify({
        'success': True,
        'data': {
            'executions': execution_list,
            'pagination': {
                'total': pagination.total,
                'pages': pagination.pages,
                'page': page,
                'per_page': per_page,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }
    }), 200

# 添加管理员
@api_bp.route('/admin/admins', methods=['POST'])
@admin_required
def add_admin():
    """添加管理员API"""
    data = request.json
    
    # 验证必要字段
    for field in ['username', 'password', 'email']:
        if field not in data:
            return jsonify({'success': False, 'message': f'缺少必要字段: {field}'}), 400
            
    # 验证用户名是否已存在
    if Admin.query.filter_by(username=data['username']).first():
        return jsonify({'success': False, 'message': '管理员用户名已存在'}), 400
        
    # 验证邮箱是否已存在
    if Admin.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'message': '管理员邮箱已注册'}), 400
        
    try:
        # 创建管理员
        admin = Admin(
            username=data['username'],
            email=data['email']
        )
        admin.password = data['password']
        
        db.session.add(admin)
        db.session.commit()
        
        # 记录日志
        log = Log(
            admin_id=get_jwt_identity().get('id'),
            level='info',
            category='admin',
            message=f'添加新管理员: {admin.username}',
            ip_address=request.remote_addr
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '管理员添加成功',
            'data': {
                'id': admin.id,
                'username': admin.username,
                'email': admin.email
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'管理员添加失败: {str(e)}'}), 500

# 获取管理员列表
@api_bp.route('/admin/admins', methods=['GET'])
@admin_required
def get_admins():
    """获取管理员列表API"""
    admins = Admin.query.all()
    
    admin_list = [{
        'id': admin.id,
        'username': admin.username,
        'email': admin.email,
        'created_at': admin.created_at.isoformat(),
        'last_login': admin.last_login.isoformat() if admin.last_login else None
    } for admin in admins]
    
    return jsonify({
        'success': True,
        'data': admin_list
    }), 200 