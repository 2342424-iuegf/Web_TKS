# core/config.py
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator
import secrets

class Settings(BaseSettings):
    # 基础配置
    PROJECT_NAME: str = "FastAPI Template"
    PROJECT_DESCRIPTION: str = "A FastAPI backend template"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"
    DEBUG: bool = True
    
    # 服务器配置
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 9527
    WORKERS: int = 1
    
    # 安全配置
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    
    # CORS配置
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | List[str] | None) -> List[str]:
        if v is None or v == "":
            return []
        if isinstance(v, str):
            # 处理空字符串
            if not v.strip():
                return []
            # 处理 JSON 格式的字符串
            if v.strip().startswith("["):
                import json
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            # 处理逗号分隔的字符串
            return [i.strip() for i in v.split(",") if i.strip()]
        if isinstance(v, list):
            return v
        return []

    # 数据库配置 (支持MySQL和PostgreSQL)
    DB_TYPE: str = "mysql"  # mysql 或 postgresql
    DB_SERVER: str = "localhost"
    DB_PORT: str = "3306"
    DB_USER: str = "root"
    DB_PASSWORD: str = "password"
    DB_NAME: str = "vis_vehicle"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """根据DB_TYPE返回对应的数据库连接URI"""
        if self.DB_TYPE.lower() == "mysql":
            return f"mysql+asyncmy://{self.DB_USER}:{self.DB_PASSWORD}@" \
                f"{self.DB_SERVER}:{self.DB_PORT}/{self.DB_NAME}"
        else:
            # PostgreSQL
            return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@" \
                f"{self.DB_SERVER}:{self.DB_PORT}/{self.DB_NAME}"

    # Redis配置
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0
    
    class Config:
        case_sensitive = True
        env_file = ".env"

# 创建设置实例
settings = Settings()