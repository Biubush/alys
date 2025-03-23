from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.api import api_bp
from app.models import User, Log, Task, TaskExecution
from app.services.mail_service import MailService
from app.services.user_service import UserService
from app.services.aligo_service import AligoService

mail_service = MailService()
user_service = UserService()
aligo_service = AligoService()

# 获取用户资料
@api_bp.route('/user/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """获取用户资料API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以查看资料'}), 403
        
    user_id = identity.get('id')
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': '用户不存在'}), 404
    
    # 获取统计数据
    task_count = Task.query.filter_by(user_id=user_id).count()
    active_task_count = Task.query.filter_by(user_id=user_id, is_enabled=True).count()
    
    # 获取阿里云盘登录状态
    aliyun_status = user.is_online
    if aliyun_status:
        try:
            client = aligo_service.get_client(user_id)
            aliyun_status = client is not None
        except:
            aliyun_status = False
    
    return jsonify({
        'success': True,
        'data': {
            'username': user.username,
            'nickname': user.nickname,
            'email': user.email,
            'is_online': aliyun_status,
            'created_at': user.created_at.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'task_count': task_count,
            'active_task_count': active_task_count
        }
    }), 200

# 更新用户资料
@api_bp.route('/user/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    """更新用户资料API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以更新资料'}), 403
        
    user_id = identity.get('id')
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': '用户不存在'}), 404
        
    data = request.json
    allowed_fields = ['nickname']
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    
    if not update_data:
        return jsonify({'success': False, 'message': '没有提供可更新的字段'}), 400
    
    try:
        # 更新用户信息
        for key, value in update_data.items():
            setattr(user, key, value)
            
        db.session.commit()
        
        # 记录日志
        log = Log(
            user_id=user_id,
            level='info',
            category='user',
            message=f'用户资料更新',
            ip_address=request.remote_addr
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '资料更新成功',
            'data': {
                'username': user.username,
                'nickname': user.nickname,
                'email': user.email
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'资料更新失败: {str(e)}'}), 500

# 修改密码
@api_bp.route('/user/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """修改密码API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以修改密码'}), 403
        
    user_id = identity.get('id')
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': '用户不存在'}), 404
        
    data = request.json
    
    # 验证必要字段
    for field in ['current_password', 'new_password']:
        if field not in data:
            return jsonify({'success': False, 'message': f'缺少必要字段: {field}'}), 400
            
    # 验证当前密码
    if not user.verify_password(data['current_password']):
        return jsonify({'success': False, 'message': '当前密码不正确'}), 401
        
    try:
        # 更新密码
        user.password = data['new_password']
        db.session.commit()
        
        # 记录日志
        log = Log(
            user_id=user_id,
            level='success',
            category='user',
            message='密码修改成功',
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

# 获取用户统计数据
@api_bp.route('/user/statistics', methods=['GET'])
@jwt_required()
def get_user_statistics():
    """获取用户统计数据API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以查看统计数据'}), 403
        
    user_id = identity.get('id')
    
    # 获取统计数据
    stats = user_service.get_user_statistics(user_id)
    
    return jsonify({
        'success': True,
        'data': stats
    }), 200

# 获取用户操作日志
@api_bp.route('/user/logs', methods=['GET'])
@jwt_required()
def get_user_logs():
    """获取用户操作日志API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以查看操作日志'}), 403
        
    user_id = identity.get('id')
    
    # 获取分页参数
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(max(per_page, 10), 100)  # 限制每页显示范围
    
    # 获取筛选参数
    level = request.args.get('level')
    category = request.args.get('category')
    
    # 构建查询
    query = Log.query.filter_by(user_id=user_id)
    
    if level:
        query = query.filter_by(level=level)
    if category:
        query = query.filter_by(category=category)
    
    # 分页查询
    pagination = query.order_by(Log.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    logs = pagination.items
    
    # 格式化结果
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
@api_bp.route('/user/task-executions', methods=['GET'])
@jwt_required()
def get_user_task_executions():
    """获取用户任务执行历史API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以查看任务执行历史'}), 403
        
    user_id = identity.get('id')
    
    # 获取分页参数
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(max(per_page, 10), 100)  # 限制每页显示范围
    
    # 获取筛选参数
    status = request.args.get('status')
    task_id = request.args.get('task_id', type=int)
    
    # 获取用户的任务ID列表
    task_ids = [task.id for task in Task.query.filter_by(user_id=user_id)]
    
    if not task_ids:
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
    
    # 构建查询
    query = TaskExecution.query.filter(TaskExecution.task_id.in_(task_ids))
    
    if status:
        query = query.filter_by(status=status)
    if task_id:
        query = query.filter_by(task_id=task_id)
    
    # 分页查询
    pagination = query.order_by(TaskExecution.start_time.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    executions = pagination.items
    
    # 获取任务名称映射
    task_names = {task.id: task.name for task in Task.query.filter(Task.id.in_([exe.task_id for exe in executions]))}
    
    # 格式化结果
    execution_list = [{
        'id': exe.id,
        'task_id': exe.task_id,
        'task_name': task_names.get(exe.task_id, 'Unknown'),
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