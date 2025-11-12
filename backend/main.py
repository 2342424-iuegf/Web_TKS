# main.py
from app import app
from app.core.config import settings

if __name__ == "__main__":
    import uvicorn
    # 当启用reload和workers时，需要使用导入字符串
    uvicorn.run(
        "app:app",  # 使用正确的格式：<module>:<attribute>
        host=settings.SERVER_HOST, 
        port=settings.SERVER_PORT,
        reload=settings.DEBUG,
        workers=settings.WORKERS
    )