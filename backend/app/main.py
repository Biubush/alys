from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings

# 创建FastAPI应用
app = FastAPI(
    title="阿里云盘同步系统",
    description="阿里云盘同步系统API",
    version="1.0.0",
)

# CORS设置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应该限制来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康检查路由
@app.get("/health")
def health_check():
    return {"status": "ok"}

# API状态
@app.get("/api/status")
def api_status():
    return {
        "success": True,
        "status": "running",
        "message": "服务正在运行中"
    }

# 登录接口
@app.post("/api/auth/login")
async def login(request: Request):
    try:
        data = await request.json()
        username = data.get("username", "")
        password = data.get("password", "")
        
        # 简化的登录处理
        if username == settings.ADMIN_USERNAME and password == settings.ADMIN_PASSWORD:
            return {
                "success": True,
                "data": {
                    "token": "temporary_token",
                    "user": {
                        "id": 1,
                        "username": username,
                        "is_admin": True
                    }
                }
            }
        else:
            return JSONResponse(
                status_code=401,
                content={
                    "success": False,
                    "message": "用户名或密码错误"
                }
            )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": f"服务器错误: {str(e)}"
            }
        )

# 添加一个临时路由来处理其他所有请求
@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def catch_all_api(request: Request, path: str):
    return JSONResponse(
        status_code=501,
        content={
            "success": False,
            "message": "API功能正在开发中",
            "path": path
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app", 
        host=settings.SERVER_HOST, 
        port=settings.SERVER_PORT,
        reload=settings.DEBUG,
        workers=settings.SERVER_WORKERS
    ) 