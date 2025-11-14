# api/router.py
from fastapi import APIRouter
from app.api.endpoints import user, auth, off_duty_area

# 创建主路由
router = APIRouter()

# 注册各模块路由
router.include_router(auth.router, prefix="/auth", tags=["认证"])

# 系统管理路由（用于前端/system/users等路径）
system_router = APIRouter()
system_router.include_router(user.router, prefix="/users", tags=["用户管理"])
router.include_router(system_router, prefix="/system")

# 检测区域设置路由
detection_router = APIRouter()
detection_router.include_router(
    off_duty_area.router,
    prefix="/detection/off-duty",
    tags=["机台-脱岗区域设置"]
)
router.include_router(detection_router, prefix="")