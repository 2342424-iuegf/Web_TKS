# api/endpoints/off_duty_area.py
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
import os
import cv2

from app.api.deps import get_db
from app.schemas.detection_area import (
    CameraResponse,
    ImageInfoResponse,
    CameraAnnotationsResponse,
    AnnotationSaveRequest
)
from app.services.detection_area import DetectionAreaService

router = APIRouter()

# 样本目录路径
SAMPLE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "sample")
os.makedirs(SAMPLE_DIR, exist_ok=True)


@router.get("/cameras", response_model=List[CameraResponse])
async def get_cameras(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> List[CameraResponse]:
    """
    获取所有启用了detect_leave功能的摄像头列表
    """
    cameras = await DetectionAreaService.get_enabled_cameras(db)
    return [CameraResponse.model_validate(camera) for camera in cameras]


@router.get("/cameras/{camera_id}/image")
async def get_camera_image(
    camera_id: str,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    获取指定摄像头的图像
    
    每次请求都重新捕获最新图像
    """
    try:
        image_path, error = await DetectionAreaService.capture_camera_image(
            camera_id, 
            db, 
            SAMPLE_DIR
        )
        
        if error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=error
            )
        
        if not image_path or not os.path.exists(image_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="图像文件不存在"
            )
        
        return FileResponse(
            image_path,
            media_type="image/jpeg",
            filename=f"camera_{camera_id}.jpg"
        )
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.exception(f"获取摄像头图像异常: camera_id={camera_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取图像失败: {str(e)}"
        )


@router.get("/cameras/{camera_id}/image_info", response_model=ImageInfoResponse)
async def get_camera_image_info(
    camera_id: str,
    db: Annotated[AsyncSession, Depends(get_db)]
) -> ImageInfoResponse:
    """
    获取指定摄像头图像的原始尺寸信息
    """
    image_path = os.path.join(SAMPLE_DIR, f"camera_{camera_id}.jpg")
    
    # 检查图像是否存在
    if not os.path.exists(image_path):
        # 如果不存在，先捕获图像
        image_path, error = await DetectionAreaService.capture_camera_image(
            camera_id,
            db,
            SAMPLE_DIR
        )
        if error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=error
            )
    
    # 读取图像获取尺寸
    try:
        image = cv2.imread(image_path)
        if image is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="无法读取图像"
            )
        
        height, width = image.shape[:2]
        return ImageInfoResponse(
            width=width,
            height=height,
            path=image_path
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取图像信息失败: {str(e)}"
        )


@router.get("/cameras/{camera_id}/annotations", response_model=CameraAnnotationsResponse)
async def get_camera_annotations(
    camera_id: str,
    db: Annotated[AsyncSession, Depends(get_db)]
) -> CameraAnnotationsResponse:
    """
    获取指定摄像头的标注配置
    """
    config, error = await DetectionAreaService.load_camera_annotations(camera_id, db)
    
    if error:
        # 如果出错，返回空注释列表而不是错误
        return CameraAnnotationsResponse(camera_id=camera_id, annotations=[])
    
    return CameraAnnotationsResponse.model_validate(config)


@router.post("/cameras/{camera_id}/annotations", status_code=status.HTTP_200_OK)
async def save_camera_annotations(
    camera_id: str,
    request: AnnotationSaveRequest,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    保存指定摄像头的标注配置
    """
    # 确保我们从前端获取annotations数组
    annotations = request.annotations if isinstance(request.annotations, list) else []
    
    success, error = await DetectionAreaService.save_camera_annotations(
        camera_id,
        annotations,
        db
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error
        )
    
    return {"success": True}


@router.get("/sample/{filename}")
async def sample_files(filename: str):
    """
    提供样本文件的访问
    """
    file_path = os.path.join(SAMPLE_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件不存在"
        )
    
    return FileResponse(
        file_path,
        media_type="image/jpeg"
    )

