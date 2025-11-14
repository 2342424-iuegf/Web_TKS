# 导入所有模型，方便在其他地方使用
from app.models.user import User
from app.models.detection_area import Camera, LeaveArea

__all__ = ["User", "Camera", "LeaveArea"]

