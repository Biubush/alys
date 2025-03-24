"""
轻量级应用适配器
用于在Flask应用启动前提供健康检查和基本API支持
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# 创建一个简单的FastAPI应用，不依赖Flask
app = FastAPI(
    title="阿里云盘同步系统",
    description="健康检查和基本API",
    version="1.0.0",
)

# CORS设置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康检查端点
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# 应用状态
@app.get("/api/status")
async def api_status():
    return {
        "success": True,
        "status": "initializing",
        "message": "应用正在启动中，请稍后再试。"
    }

# API通用错误处理
@app.get("/api/{path:path}")
@app.post("/api/{path:path}")
@app.put("/api/{path:path}")
@app.delete("/api/{path:path}")
async def api_catchall(request: Request, path: str):
    return JSONResponse(
        status_code=503,
        content={
            "success": False,
            "message": "服务正在启动中，请稍后再试。"
        }
    ) 