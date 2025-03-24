from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.wsgi import WSGIMiddleware

from app.api.router import api_router, flask_app
from app.core.config import settings

app = FastAPI(
    title="阿里云盘同步系统",
    description="阿里云盘同步系统API",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
    openapi_url="/api/v1/openapi.json",
)

# CORS设置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应该限制来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 集成Flask应用
app.mount("/api/v1", WSGIMiddleware(flask_app))

# 健康检查
@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}

# 包含FastAPI路由
# 注释掉此行，因为我们使用了Flask应用来处理API
# app.include_router(api_router, prefix="/api/v1")

# 自定义文档
@app.get("/api/v1/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url="/api/v1/openapi.json",
        title="阿里云盘同步系统 API",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css",
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