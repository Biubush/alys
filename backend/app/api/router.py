from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.wsgi import WSGIMiddleware

from app import create_app

# 创建Flask应用
flask_app = create_app()

# 创建FastAPI路由器
api_router = APIRouter()

# 为Flask API创建代理路由
@api_router.get("/{path:path}")
@api_router.post("/{path:path}")
@api_router.put("/{path:path}")
@api_router.delete("/{path:path}")
async def flask_proxy(request: Request, path: str):
    """
    代理路由，将FastAPI请求转发到Flask应用
    """
    # 在此处可以添加日志或请求处理逻辑
    return JSONResponse({"message": "请通过WSGI中间件访问Flask应用"}) 