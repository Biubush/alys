from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.api import api_bp
from app.models import Task, TaskExecution, User
from app.services.task_service import TaskService
from app.services.aligo_service import AligoService
from app.utils.helpers import is_valid_aliyun_url, is_valid_cron_expression

task_service = TaskService()
aligo_service = AligoService()

# 获取任务列表
@api_bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    """获取任务列表API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以管理任务'}), 403
        
    user_id = identity.get('id')
    
    # 搜索参数
    search = request.args.get('search', '')
    enabled_only = request.args.get('enabled_only', 'false').lower() == 'true'
    
    tasks = task_service.get_tasks(
        user_id=user_id,
        search=search,
        enabled_only=enabled_only
    )
    
    # 格式化输出
    task_list = [{
        'id': task.id,
        'name': task.name,
        'type': task.type,
        'share_id': task.share_id,
        'source_folder_id': task.source_folder_id,
        'target_folder_id': task.target_folder_id,
        'folder_name': task.folder_name,
        'share_password': task.share_password,
        'schedule': task.schedule,
        'interval': task.interval,
        'next_run': task.next_run.isoformat() if task.next_run else None,
        'is_enabled': task.is_enabled,
        'is_running': task.is_running,
        'created_at': task.created_at.isoformat()
    } for task in tasks]
    
    return jsonify({
        'success': True,
        'data': task_list
    }), 200

# 获取任务详情
@api_bp.route('/tasks/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    """获取任务详情API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以查看任务'}), 403
        
    user_id = identity.get('id')
    
    task = task_service.get_task(task_id=task_id, user_id=user_id)
    
    if not task:
        return jsonify({'success': False, 'message': '任务不存在或无权访问'}), 404
        
    # 获取最近的执行记录
    executions = task_service.get_task_executions(
        task_id=task_id,
        user_id=user_id,
        limit=5
    )
    
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
    
    # 获取目标文件夹信息
    folder_name = None
    try:
        client = aligo_service.get_client(user_id)
        if client:
            folder = client.get_file(file_id=task.target_folder_id)
            if folder:
                folder_name = folder.name
    except Exception:
        # 如果获取不到文件夹信息，不影响主流程
        pass
    
    return jsonify({
        'success': True,
        'data': {
            'id': task.id,
            'name': task.name,
            'type': task.type,
            'share_id': task.share_id,
            'source_folder_id': task.source_folder_id,
            'target_folder_id': task.target_folder_id,
            'target_folder_name': folder_name,
            'share_password': task.share_password,
            'schedule': task.schedule,
            'interval': task.interval,
            'next_run': task.next_run.isoformat() if task.next_run else None,
            'is_enabled': task.is_enabled,
            'is_running': task.is_running,
            'created_at': task.created_at.isoformat(),
            'executions': execution_list
        }
    }), 200

# 创建任务
@api_bp.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    """创建任务API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以创建任务'}), 403
        
    user_id = identity.get('id')
    data = request.json
    
    # 检查用户是否登录阿里云盘
    user = User.query.get(user_id)
    if not user.is_online:
        return jsonify({'success': False, 'message': '请先登录阿里云盘'}), 400
    
    # 验证必要字段
    for field in ['name', 'share_id', 'source_folder_id', 'target_folder_id', 'schedule']:
        if field not in data:
            return jsonify({'success': False, 'message': f'缺少必要字段: {field}'}), 400
            
    # 验证分享链接格式
    if not is_valid_aliyun_url(data['share_id']):
        return jsonify({'success': False, 'message': '分享链接格式不正确'}), 400
        
    # 若定时表达式自定义则校验cron表达式
    if data.get('type') == 2 and 'schedule' not in data:
        return jsonify({'success': False, 'message': '缺少必要的调度配置'}), 400
        
    try:
        task = task_service.create_task(data=data, user_id=user_id)
        
        return jsonify({
            'success': True,
            'message': '任务创建成功',
            'data': {
                'id': task.id,
                'name': task.name,
                'next_run': task.next_run.isoformat() if task.next_run else None
            }
        }), 201
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'任务创建失败: {str(e)}'}), 500

# 更新任务
@api_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """更新任务API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以更新任务'}), 403
        
    user_id = identity.get('id')
    data = request.json
    
    # 检查用户是否登录阿里云盘
    user = User.query.get(user_id)
    if not user.is_online:
        return jsonify({'success': False, 'message': '请先登录阿里云盘'}), 400
    
    # 检查任务是否存在
    task = task_service.get_task(task_id=task_id, user_id=user_id)
    if not task:
        return jsonify({'success': False, 'message': '任务不存在或无权访问'}), 404
        
    # 验证分享链接格式
    if 'share_id' in data and not is_valid_aliyun_url(data['share_id']):
        return jsonify({'success': False, 'message': '分享链接格式不正确'}), 400
        
    # 若定时表达式自定义则校验cron表达式
    if data.get('type') == 2 and 'schedule' not in data:
        return jsonify({'success': False, 'message': '缺少必要的调度配置'}), 400
        
    try:
        updated_task = task_service.update_task(
            task_id=task_id,
            data=data,
            user_id=user_id
        )
        
        return jsonify({
            'success': True,
            'message': '任务更新成功',
            'data': {
                'id': updated_task.id,
                'name': updated_task.name,
                'next_run': updated_task.next_run.isoformat() if updated_task.next_run else None
            }
        }), 200
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'任务更新失败: {str(e)}'}), 500

# 删除任务
@api_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """删除任务API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以删除任务'}), 403
        
    user_id = identity.get('id')
    
    try:
        result = task_service.delete_task(task_id=task_id, user_id=user_id)
        if not result:
            return jsonify({'success': False, 'message': '任务不存在或无权删除'}), 404
            
        return jsonify({
            'success': True,
            'message': '任务删除成功'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'任务删除失败: {str(e)}'}), 500

# 启用/禁用任务
@api_bp.route('/tasks/<int:task_id>/toggle', methods=['POST'])
@jwt_required()
def toggle_task(task_id):
    """启用/禁用任务API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以管理任务'}), 403
        
    user_id = identity.get('id')
    data = request.json
    
    # 验证参数
    if 'enable' not in data:
        return jsonify({'success': False, 'message': '缺少必要参数: enable'}), 400
        
    enable = bool(data['enable'])
    
    try:
        result = task_service.toggle_task(
            task_id=task_id,
            user_id=user_id,
            enable=enable
        )
        
        if not result:
            return jsonify({'success': False, 'message': '任务不存在或无权操作'}), 404
            
        status = '启用' if enable else '禁用'
        return jsonify({
            'success': True,
            'message': f'任务已{status}'
        }), 200
    except Exception as e:
        status = '启用' if enable else '禁用'
        return jsonify({'success': False, 'message': f'任务{status}失败: {str(e)}'}), 500

# 立即执行任务
@api_bp.route('/tasks/<int:task_id>/run', methods=['POST'])
@jwt_required()
def run_task(task_id):
    """立即执行任务API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以执行任务'}), 403
        
    user_id = identity.get('id')
    
    # 检查用户是否登录阿里云盘
    user = User.query.get(user_id)
    if not user.is_online:
        return jsonify({'success': False, 'message': '请先登录阿里云盘'}), 400
    
    try:
        execution = task_service.run_task_now(task_id=task_id, user_id=user_id)
        
        if not execution:
            return jsonify({'success': False, 'message': '任务不存在或无权执行'}), 404
            
        return jsonify({
            'success': True,
            'message': '任务已开始执行',
            'data': {
                'execution_id': execution.id,
                'task_id': execution.task_id,
                'status': execution.status,
                'start_time': execution.start_time.isoformat()
            }
        }), 202
    except Exception as e:
        return jsonify({'success': False, 'message': f'任务执行失败: {str(e)}'}), 500

# 获取任务执行记录
@api_bp.route('/tasks/<int:task_id>/executions', methods=['GET'])
@jwt_required()
def get_task_executions(task_id):
    """获取任务执行记录API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以查看任务执行记录'}), 403
        
    user_id = identity.get('id')
    
    # 获取记录条数限制
    limit = request.args.get('limit', '10')
    try:
        limit = int(limit)
        limit = min(max(limit, 1), 50)  # 限制范围1-50
    except ValueError:
        limit = 10
    
    executions = task_service.get_task_executions(
        task_id=task_id,
        user_id=user_id,
        limit=limit
    )
    
    if executions is None:
        return jsonify({'success': False, 'message': '任务不存在或无权访问'}), 404
        
    execution_list = [{
        'id': exe.id,
        'task_id': exe.task_id,
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
        'data': execution_list
    }), 200

# 获取任务执行状态
@api_bp.route('/executions/<int:execution_id>', methods=['GET'])
@jwt_required()
def get_execution_status(execution_id):
    """获取任务执行状态API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以查看任务执行状态'}), 403
        
    user_id = identity.get('id')
    
    # 获取执行记录
    execution = TaskExecution.query.get(execution_id)
    if not execution:
        return jsonify({'success': False, 'message': '执行记录不存在'}), 404
        
    # 检查权限
    task = Task.query.get(execution.task_id)
    if not task or task.user_id != user_id:
        return jsonify({'success': False, 'message': '无权访问该执行记录'}), 403
        
    return jsonify({
        'success': True,
        'data': {
            'id': execution.id,
            'task_id': execution.task_id,
            'task_name': task.name,
            'status': execution.status,
            'start_time': execution.start_time.isoformat() if execution.start_time else None,
            'end_time': execution.end_time.isoformat() if execution.end_time else None,
            'duration': (execution.end_time - execution.start_time).total_seconds() if (execution.end_time and execution.start_time) else None,
            'files_scanned': execution.files_scanned,
            'files_saved': execution.files_saved,
            'files_skipped': execution.files_skipped,
            'error_message': execution.error_message
        }
    }), 200

# 获取用户文件夹列表
@api_bp.route('/folders', methods=['GET'])
@jwt_required()
def get_user_folders():
    """获取用户文件夹列表API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以查看文件夹'}), 403
        
    user_id = identity.get('id')
    
    # 获取目标文件夹参数
    parent_folder_id = request.args.get('parent_id', 'root')
    
    # 检查用户是否登录阿里云盘
    user = User.query.get(user_id)
    if not user.is_online:
        return jsonify({'success': False, 'message': '请先登录阿里云盘'}), 400
    
    try:
        folders = aligo_service.get_user_folders(
            user_id=user_id,
            parent_folder_id=parent_folder_id
        )
        
        folder_list = [{
            'id': folder.file_id,
            'name': folder.name,
            'parent_id': folder.parent_file_id,
            'created_at': folder.created_at.isoformat() if hasattr(folder, 'created_at') and folder.created_at else None,
            'updated_at': folder.updated_at.isoformat() if hasattr(folder, 'updated_at') and folder.updated_at else None
        } for folder in folders]
        
        return jsonify({
            'success': True,
            'data': folder_list
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'获取文件夹列表失败: {str(e)}'}), 500

# 获取分享文件详情
@api_bp.route('/share-info', methods=['POST'])
@jwt_required()
def get_share_info():
    """获取分享文件详情API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以获取分享文件信息'}), 403
        
    user_id = identity.get('id')
    data = request.json
    
    # 验证必要字段
    for field in ['share_id']:
        if field not in data:
            return jsonify({'success': False, 'message': f'缺少必要字段: {field}'}), 400
            
    # 验证分享链接格式
    if not is_valid_aliyun_url(data['share_id']):
        return jsonify({'success': False, 'message': '分享链接格式不正确'}), 400
    
    # 从链接中提取share_id
    share_id = data.get('share_id')
    share_password = data.get('share_password', '')
    
    # 检查用户是否登录阿里云盘
    user = User.query.get(user_id)
    if not user.is_online:
        return jsonify({'success': False, 'message': '请先登录阿里云盘'}), 400
    
    try:
        # 获取分享文件夹内容
        client = aligo_service.get_client(user_id)
        share_info = client.get_share_info(share_id=share_id)
        share_token = client.get_share_token(share_id=share_id, share_pwd=share_password)
        share_folder = client.get_share_folder_by_anonymous(share_token=share_token)
        
        # 返回文件夹内容
        folder_list = [{
            'id': folder.file_id,
            'name': folder.name,
            'type': folder.type,
            'is_folder': folder.type == 'folder',
            'updated_at': folder.updated_at.isoformat() if hasattr(folder, 'updated_at') and folder.updated_at else None
        } for folder in share_folder.items]
        
        return jsonify({
            'success': True,
            'data': {
                'share_name': share_info.share_name,
                'creator_name': share_info.creator_name,
                'created_at': share_info.created_at.isoformat() if hasattr(share_info, 'created_at') and share_info.created_at else None,
                'folders': folder_list
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'获取分享文件信息失败: {str(e)}'}), 500 