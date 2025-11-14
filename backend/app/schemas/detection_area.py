# schemas/detection_area.py
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class CameraResponse(BaseModel):
    """摄像头信息响应"""
    camera_id: str = Field(..., description="摄像头编号")
    camera_name: Optional[str] = Field(None, description="摄像头名称")
    rstp: Optional[str] = Field(None, description="RTSP地址")
    
    class Config:
        from_attributes = True


class ImageInfoResponse(BaseModel):
    """图像信息响应"""
    width: int = Field(..., description="图像宽度")
    height: int = Field(..., description="图像高度")
    path: Optional[str] = Field(None, description="图像路径")


class AnnotationConfig(BaseModel):
    """标注配置（单个区域）"""
    area_no: Optional[int] = Field(None, description="区域编号")
    machine_id: Optional[str] = Field(None, description="机台编号")
    # 其他标注字段作为动态字段
    model_config = {"extra": "allow"}


class CameraAnnotationsResponse(BaseModel):
    """摄像头标注配置响应"""
    camera_id: str = Field(..., description="摄像头编号")
    annotations: List[Dict[str, Any]] = Field(default_factory=list, description="标注配置列表")


class AnnotationSaveRequest(BaseModel):
    """保存标注配置请求"""
    annotations: List[Dict[str, Any]] = Field(..., description="标注配置列表")

