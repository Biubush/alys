from flask import Blueprint

# 创建API蓝图
api_bp = Blueprint('api', __name__, url_prefix='/api/v1')

# 导入路由模块
from app.api import auth, user, task, admin

# 定义路由错误处理
@api_bp.errorhandler(404)
def handle_not_found(e):
    """API 404错误处理"""
    return {
        'success': False,
        'message': '请求的API不存在'
    }, 404
    
@api_bp.errorhandler(500)
def handle_server_error(e):
    """API 500错误处理"""
    return {
        'success': False,
        'message': '服务器内部错误'
    }, 500
    
@api_bp.errorhandler(405)
def handle_method_not_allowed(e):
    """API 405错误处理"""
    return {
        'success': False,
        'message': '请求方法不允许'
    }, 405 