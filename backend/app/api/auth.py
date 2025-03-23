from flask import request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, get_jwt_identity,
    jwt_required, get_jwt
)
from app import db, jwt
from app.api import api_bp
from app.models import User, Admin, Log
from app.services.mail_service import MailService
from app.services.aligo_service import AligoService
from datetime import datetime, timezone, timedelta

mail_service = MailService()
aligo_service = AligoService()

# 注册API
@api_bp.route('/auth/register', methods=['POST'])
def register():
    """用户注册API"""
    data = request.json
    
    # 验证必要字段
    for field in ['username', 'password', 'email', 'nickname', 'code']:
        if field not in data:
            return jsonify({'success': False, 'message': f'缺少必要字段: {field}'}), 400
            
    # 验证用户名是否已存在
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'success': False, 'message': '用户名已存在'}), 400
        
    # 验证邮箱是否已存在
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'message': '邮箱已注册'}), 400
        
    # 验证验证码
    verify_result = mail_service.verify_code(
        email=data['email'],
        code=data['code'],
        purpose='register'
    )
    
    if not verify_result['success']:
        return jsonify(verify_result), 400
        
    # 创建用户
    user = User(
        username=data['username'],
        nickname=data['nickname'],
        email=data['email']
    )
    user.password = data['password']
    
    try:
        db.session.add(user)
        db.session.commit()
        
        # 记录日志
        log = Log(
            user_id=user.id,
            level='success',
            category='auth',
            message=f'用户注册成功: {user.username}',
            ip_address=request.remote_addr
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '注册成功',
            'data': {
                'username': user.username,
                'nickname': user.nickname,
                'email': user.email
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'注册失败: {str(e)}'}), 500

# 登录API
@api_bp.route('/auth/login', methods=['POST'])
def login():
    """用户登录API"""
    data = request.json
    
    # 验证必要字段
    for field in ['username', 'password']:
        if field not in data:
            return jsonify({'success': False, 'message': f'缺少必要字段: {field}'}), 400
            
    # 查找用户
    user = User.query.filter_by(username=data['username']).first()
    if not user:
        # 尝试以管理员身份登录
        admin = Admin.query.filter_by(username=data['username']).first()
        if admin and admin.verify_password(data['password']):
            # 管理员登录
            access_token = create_access_token(
                identity={'id': admin.id, 'role': 'admin'},
                additional_claims={'role': 'admin'}
            )
            refresh_token = create_refresh_token(
                identity={'id': admin.id, 'role': 'admin'},
                additional_claims={'role': 'admin'}
            )
            
            # 更新管理员登录时间
            admin.last_login = datetime.now(timezone.utc)
            db.session.commit()
            
            # 记录日志
            log = Log(
                admin_id=admin.id,
                level='success',
                category='auth',
                message=f'管理员登录: {admin.username}',
                ip_address=request.remote_addr
            )
            db.session.add(log)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': '管理员登录成功',
                'data': {
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'username': admin.username,
                    'role': 'admin'
                }
            }), 200
        else:
            return jsonify({'success': False, 'message': '用户名或密码错误'}), 401
            
    # 验证用户密码
    if not user.verify_password(data['password']):
        return jsonify({'success': False, 'message': '用户名或密码错误'}), 401
        
    # 检查用户是否被禁用
    if user.is_banned:
        return jsonify({'success': False, 'message': '账号已被禁用，请联系管理员'}), 403
        
    # 创建TOKEN
    access_token = create_access_token(
        identity={'id': user.id, 'role': 'user'},
        additional_claims={'role': 'user'}
    )
    refresh_token = create_refresh_token(
        identity={'id': user.id, 'role': 'user'},
        additional_claims={'role': 'user'}
    )
    
    # 更新用户登录时间
    user.last_login = datetime.now(timezone.utc)
    db.session.commit()
    
    # 记录日志
    log = Log(
        user_id=user.id,
        level='success',
        category='auth',
        message=f'用户登录: {user.username}',
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': '登录成功',
        'data': {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'username': user.username,
            'nickname': user.nickname,
            'role': 'user',
            'is_online': user.is_online  # 阿里云盘登录状态
        }
    }), 200

# 刷新TOKEN
@api_bp.route('/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """刷新TOKEN"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    access_token = create_access_token(
        identity=identity,
        additional_claims={'role': role}
    )
    
    return jsonify({
        'success': True,
        'message': '刷新成功',
        'data': {
            'access_token': access_token
        }
    }), 200

# 登出API
@api_bp.route('/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    """用户登出API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    # 记录日志
    if role == 'admin':
        admin_id = identity.get('id')
        log = Log(
            admin_id=admin_id,
            level='info',
            category='auth',
            message=f'管理员登出',
            ip_address=request.remote_addr
        )
    else:
        user_id = identity.get('id')
        log = Log(
            user_id=user_id,
            level='info',
            category='auth',
            message=f'用户登出',
            ip_address=request.remote_addr
        )
    
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': '登出成功'
    }), 200

# 发送验证码
@api_bp.route('/auth/send-code', methods=['POST'])
def send_verification_code():
    """发送验证码API"""
    data = request.json
    
    if 'email' not in data:
        return jsonify({'success': False, 'message': '缺少必要字段: email'}), 400
        
    purpose = data.get('purpose', 'register')
    expires_in = data.get('expires_in', 10)
    
    result = mail_service.send_verification_code(
        email=data['email'],
        purpose=purpose,
        expires_in=expires_in
    )
    
    return jsonify(result), 200 if result['success'] else 400

# 验证验证码
@api_bp.route('/auth/verify-code', methods=['POST'])
def verify_code():
    """验证验证码API"""
    data = request.json
    
    # 验证必要字段
    for field in ['email', 'code', 'purpose']:
        if field not in data:
            return jsonify({'success': False, 'message': f'缺少必要字段: {field}'}), 400
            
    result = mail_service.verify_code(
        email=data['email'],
        code=data['code'],
        purpose=data['purpose']
    )
    
    return jsonify(result), 200 if result['success'] else 400

# 找回账号
@api_bp.route('/auth/recover-account', methods=['POST'])
def recover_account():
    """找回账号API"""
    data = request.json
    
    # 验证必要字段
    for field in ['email', 'code']:
        if field not in data:
            return jsonify({'success': False, 'message': f'缺少必要字段: {field}'}), 400
            
    # 验证验证码
    verify_result = mail_service.verify_code(
        email=data['email'],
        code=data['code'],
        purpose='reset_password'
    )
    
    if not verify_result['success']:
        return jsonify(verify_result), 400
        
    # 查找用户
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({'success': False, 'message': '未找到该邮箱对应的账号'}), 404
        
    # 发送账号找回邮件
    mail_result = mail_service.send_account_recovery_email(
        user_email=user.email,
        user_name=user.nickname,
        username=user.username,
        password='******'  # 不直接发送密码
    )
    
    if not mail_result['success']:
        return jsonify(mail_result), 500
        
    # 记录日志
    log = Log(
        user_id=user.id,
        level='info',
        category='auth',
        message=f'账号找回: {user.username}',
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': '账号找回成功，已将信息发送到您的邮箱'
    }), 200

# 重置密码
@api_bp.route('/auth/reset-password', methods=['POST'])
def reset_password():
    """重置密码API"""
    data = request.json
    
    # 验证必要字段
    for field in ['email', 'code', 'new_password']:
        if field not in data:
            return jsonify({'success': False, 'message': f'缺少必要字段: {field}'}), 400
            
    # 验证验证码
    verify_result = mail_service.verify_code(
        email=data['email'],
        code=data['code'],
        purpose='reset_password'
    )
    
    if not verify_result['success']:
        return jsonify(verify_result), 400
        
    # 查找用户
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({'success': False, 'message': '未找到该邮箱对应的账号'}), 404
        
    # 更新密码
    user.password = data['new_password']
    db.session.commit()
    
    # 记录日志
    log = Log(
        user_id=user.id,
        level='success',
        category='auth',
        message=f'密码重置成功: {user.username}',
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': '密码重置成功'
    }), 200

# 阿里云盘登录
@api_bp.route('/auth/aliyun-login', methods=['POST'])
@jwt_required()
def aliyun_login():
    """阿里云盘登录API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以登录阿里云盘'}), 403
        
    user_id = identity.get('id')
    
    result = aligo_service.login(user_id=user_id)
    
    return jsonify(result), 200 if result['success'] else 500

# 检查阿里云盘登录状态
@api_bp.route('/auth/aliyun-status', methods=['GET'])
@jwt_required()
def aliyun_status():
    """检查阿里云盘登录状态API"""
    identity = get_jwt_identity()
    role = get_jwt().get('role', 'user')
    
    if role != 'user':
        return jsonify({'success': False, 'message': '只有普通用户可以检查阿里云盘状态'}), 403
        
    user_id = identity.get('id')
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': '用户不存在'}), 404
        
    client = aligo_service.get_client(user_id)
    
    return jsonify({
        'success': True,
        'data': {
            'is_online': user.is_online and client is not None
        }
    }), 200 