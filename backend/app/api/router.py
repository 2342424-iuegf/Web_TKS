# api/router.py
from fastapi import APIRouter
from app.api.endpoints import user, auth

# 创建主路由
router = APIRouter()

# 注册各模块路由
router.include_router(auth.router, prefix="/auth", tags=["认证"])

# 系统管理路由（用于前端/system/users等路径）
system_router = APIRouter()
system_router.include_router(user.router, prefix="/users", tags=["系统-用户管理"])
router.include_router(system_router, prefix="/system", tags=["系统管理"])