# services/detection_area.py
import os
import json
import tempfile
import subprocess
import time
import asyncio
from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import cv2
import logging

from app.models.detection_area import Camera, LeaveArea
from app.core.config import settings

logger = logging.getLogger(__name__)


class DetectionAreaService:
    """脱岗区域检测服务"""
    
    @staticmethod
    async def get_enabled_cameras(db: AsyncSession) -> List[Camera]:
        """
        获取所有启用了detect_leave功能的摄像头列表
        """
        stmt = select(Camera).where(Camera.detect_leave == 1).order_by(Camera.camera_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())
    
    @staticmethod
    def get_frame_from_rtsp(rtsp_url: str, max_retries: int = 3, timeout: int = 30) -> Tuple[Optional[Any], Optional[str]]:
        """
        使用FFmpeg从RTSP流获取一帧图像（同步函数，需要在异步上下文中通过run_in_executor调用）
        
        参数:
            rtsp_url: RTSP流地址
            max_retries: 最大重试次数
            timeout: 超时时间(秒)
        
        返回:
            (image, error_message): 成功返回(图像, None)，失败返回(None, 错误信息)
        """
        retry_count = 0
        
        # 检查FFmpeg是否可用（支持Windows和Linux）
        ffmpeg_cmd = None
        
        # 首先检查配置中是否指定了FFmpeg路径
        if settings.FFMPEG_PATH and os.path.exists(settings.FFMPEG_PATH):
            ffmpeg_cmd = settings.FFMPEG_PATH
            logger.info(f"使用配置中的FFmpeg路径: {ffmpeg_cmd}")
        else:
            # 尝试多种可能的命令名称
            ffmpeg_commands = []
            if os.name == 'nt':  # Windows系统
                ffmpeg_commands = ['ffmpeg.exe', 'ffmpeg']
            else:  # Linux/Mac系统
                ffmpeg_commands = ['ffmpeg']
            
            for cmd in ffmpeg_commands:
                try:
                    result = subprocess.run(
                        [cmd, '-version'], 
                        stdout=subprocess.PIPE, 
                        stderr=subprocess.PIPE, 
                        timeout=5,
                        check=True
                    )
                    ffmpeg_cmd = cmd
                    logger.info(f"FFmpeg检查成功，使用命令: {cmd}")
                    break
                except FileNotFoundError:
                    continue
                except (subprocess.TimeoutExpired, subprocess.CalledProcessError) as e:
                    logger.warning(f"FFmpeg命令 {cmd} 执行失败: {str(e)}")
                    continue
            
            if not ffmpeg_cmd:
                # 如果所有命令都失败，尝试使用shutil.which查找
                import shutil
                
                # 尝试在系统PATH中查找（合并系统PATH和当前PATH）
                # 获取系统PATH（Windows）
                system_path = None
                if os.name == 'nt':
                    try:
                        import winreg
                        # 从注册表获取系统PATH
                        with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, 
                                          r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment") as key:
                            system_path = winreg.QueryValueEx(key, "Path")[0]
                    except Exception as e:
                        logger.debug(f"无法从注册表获取系统PATH: {e}")
                
                # 合并PATH环境变量
                original_path = os.environ.get('PATH', '')
                if system_path:
                    # 合并系统PATH和当前PATH
                    combined_path = f"{system_path};{original_path}" if os.name == 'nt' else f"{system_path}:{original_path}"
                    os.environ['PATH'] = combined_path
                    logger.debug(f"合并后的PATH: {combined_path[:200]}...")
                
                # 使用shutil.which查找
                ffmpeg_path = shutil.which('ffmpeg') or shutil.which('ffmpeg.exe')
                
                # 恢复原始PATH
                if system_path:
                    os.environ['PATH'] = original_path
                
                if ffmpeg_path:
                    ffmpeg_cmd = ffmpeg_path
                    logger.info(f"通过shutil.which找到FFmpeg: {ffmpeg_path}")
                else:
                    # 尝试常见安装位置（Windows）
                    common_paths = []
                    if os.name == 'nt':
                        # Windows常见FFmpeg安装位置
                        common_paths = [
                            r"C:\ffmpeg\bin\ffmpeg.exe",
                            r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
                            r"C:\Program Files (x86)\ffmpeg\bin\ffmpeg.exe",
                            os.path.expanduser(r"~\ffmpeg\bin\ffmpeg.exe"),
                        ]
                        # 检查系统PATH中的常见位置
                        if system_path:
                            for path_dir in system_path.split(';'):
                                if path_dir.strip():
                                    potential_path = os.path.join(path_dir.strip(), 'ffmpeg.exe')
                                    if os.path.exists(potential_path):
                                        common_paths.insert(0, potential_path)
                    
                    for path in common_paths:
                        if os.path.exists(path):
                            try:
                                result = subprocess.run(
                                    [path, '-version'], 
                                    stdout=subprocess.PIPE, 
                                    stderr=subprocess.PIPE, 
                                    timeout=5,
                                    check=True
                                )
                                ffmpeg_cmd = path
                                logger.info(f"在常见位置找到FFmpeg: {path}")
                                break
                            except Exception:
                                continue
                    
                    if not ffmpeg_cmd:
                        # 获取PATH环境变量用于调试
                        path_env = os.environ.get('PATH', '')
                        logger.error(f"FFmpeg未找到。PATH环境变量: {path_env[:200]}...")
                        return None, f"FFmpeg未安装或不在PATH中。请确保FFmpeg已正确安装并在系统PATH环境变量中，或在.env文件中设置FFMPEG_PATH。当前PATH: {path_env[:100]}..."
        
        # 验证FFmpeg是否可用
        try:
            result = subprocess.run(
                [ffmpeg_cmd, '-version'], 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE, 
                timeout=5,
                check=True
            )
            logger.debug(f"FFmpeg验证成功: {result.stdout.decode('utf-8', errors='ignore')[:100]}")
        except Exception as e:
            logger.error(f"FFmpeg验证失败: {str(e)}")
            return None, f"FFmpeg验证失败: {str(e)}"
        
        while retry_count < max_retries:
            # 创建临时文件
            temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
            temp_path = temp_file.name
            temp_file.close()
            
            logger.debug(f"尝试获取RTSP图像 (尝试 {retry_count + 1}/{max_retries}): {rtsp_url}")
            
            # 构建FFmpeg命令
            # 优化：减少分析时间，加快连接速度
            ffmpeg_cmd_list = [
                ffmpeg_cmd,  # 使用检测到的FFmpeg命令
                '-y',                      # 覆盖输出文件
                '-rtsp_transport', 'tcp',  # 使用TCP传输RTSP流
                '-analyzeduration', '2000000',  # 减少分析时长（2秒），加快连接
                '-probesize', '1000000',   # 减少探测大小，加快连接
                '-flags', 'low_delay',     # 低延迟模式
                '-fflags', 'discardcorrupt+genpts+nobuffer', # 丢弃损坏的包，生成PTS，不缓冲
                '-i', rtsp_url,            # 输入流
                '-vframes', '1',           # 只获取一帧视频
                '-q:v', '2',               # 质量设置（2是较好的平衡）
                '-vsync', '0',             # 不同步视频
                '-an',                     # 不处理音频
                temp_path                  # 输出文件
            ]
            
            logger.info(f"执行FFmpeg命令: {' '.join(ffmpeg_cmd_list)}")
            logger.info(f"RTSP地址: {rtsp_url}")
            
            # 执行FFmpeg命令
            try:
                process = subprocess.Popen(
                    ffmpeg_cmd_list,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
                
                logger.info(f"FFmpeg进程已启动，等待完成（超时时间: {timeout}秒）...")
                stdout, stderr = process.communicate(timeout=timeout)
                
                logger.info(f"FFmpeg执行完成，返回码: {process.returncode}")
                if stderr:
                    logger.debug(f"FFmpeg stderr: {stderr.decode('utf-8', errors='ignore')[:500]}")
                
                # 检查FFmpeg是否成功
                if process.returncode != 0:
                    error_msg = stderr.decode('utf-8', errors='ignore')
                    logger.error(f"FFmpeg执行失败 (返回码: {process.returncode}): {error_msg[:500]}")
                    retry_count += 1
                    if retry_count < max_retries:
                        logger.info(f"将在2秒后重试 (尝试 {retry_count + 1}/{max_retries})...")
                        time.sleep(2)
                        continue
                    # 清理临时文件
                    try:
                        os.unlink(temp_path)
                    except:
                        pass
                    return None, f"FFmpeg获取图像失败: {error_msg[:200]}"
                
                # 检查文件是否存在且大小大于0
                if not os.path.exists(temp_path) or os.path.getsize(temp_path) == 0:
                    retry_count += 1
                    if retry_count < max_retries:
                        time.sleep(2)
                        continue
                    return None, "生成的图像文件无效或为空"
                
                # 读取图像
                try:
                    image = cv2.imread(temp_path)
                    if image is None or image.size == 0:
                        retry_count += 1
                        if retry_count < max_retries:
                            time.sleep(2)
                            continue
                        return None, "无法读取生成的图像"
                    
                    # 清理临时文件
                    try:
                        os.unlink(temp_path)
                    except:
                        pass
                    
                    return image, None
                    
                except Exception as e:
                    retry_count += 1
                    if retry_count < max_retries:
                        time.sleep(2)
                        continue
                    return None, f"读取图像时出错: {str(e)}"
                    
            except subprocess.TimeoutExpired:
                logger.warning(f"FFmpeg执行超时 (超时时间: {timeout}秒)")
                process.kill()
                process.wait()  # 等待进程完全终止
                retry_count += 1
                if retry_count < max_retries:
                    logger.info(f"将在2秒后重试 (尝试 {retry_count + 1}/{max_retries})...")
                    time.sleep(2)
                    continue
                # 清理临时文件
                try:
                    if os.path.exists(temp_path):
                        os.unlink(temp_path)
                except:
                    pass
                return None, f"FFmpeg获取图像超时（超时时间: {timeout}秒）。请检查RTSP地址是否可访问"
                
            except Exception as e:
                retry_count += 1
                if retry_count < max_retries:
                    time.sleep(2)
                    continue
                return None, f"执行FFmpeg时出错: {str(e)}"
        
        return None, f"达到最大重试次数 {max_retries}"
    
    @staticmethod
    async def capture_camera_image(
        camera_id: str, 
        db: AsyncSession,
        sample_dir: Optional[str] = None
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        捕获指定摄像头的图像
        
        参数:
            camera_id: 摄像头ID
            db: 数据库会话
            sample_dir: 样本目录路径
        
        返回:
            (image_path, error): 成功返回(图像路径, None)，失败返回(None, 错误信息)
        """
        try:
            # 获取摄像头信息
            stmt = select(Camera).where(
                Camera.camera_id == camera_id,
                Camera.detect_leave == 1
            )
            result = await db.execute(stmt)
            camera = result.scalar_one_or_none()
            
            if not camera:
                return None, f"未找到摄像头 {camera_id} 或该摄像头未启用脱岗检测"
            
            if not camera.rstp:
                return None, f"摄像头 {camera_id} 没有RTSP地址"
            
            logger.info(f"开始从RTSP获取图像: camera_id={camera_id}, rtsp={camera.rstp}")
            
            # 使用FFmpeg获取图像（在异步上下文中运行同步函数）
            loop = asyncio.get_event_loop()
            image, error = await loop.run_in_executor(
                None,
                DetectionAreaService.get_frame_from_rtsp,
                camera.rstp
            )
            
            if error or image is None:
                logger.error(f"获取图像失败: camera_id={camera_id}, error={error}")
                return None, error or "获取图像失败"
            
            logger.info(f"成功获取图像: camera_id={camera_id}, image_size={image.shape if image is not None else 'None'}")
            
            # 保存图像
            if sample_dir is None:
                # 使用默认目录
                sample_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "sample")
            
            os.makedirs(sample_dir, exist_ok=True)
            image_path = os.path.join(sample_dir, f"camera_{camera_id}.jpg")
            
            logger.info(f"保存图像到: {image_path}")
            
            # 使用PNG格式保存，确保像素精确一致
            success = cv2.imwrite(image_path, image, [cv2.IMWRITE_PNG_COMPRESSION, 0])
            
            if not success:
                logger.error(f"保存图像失败: image_path={image_path}")
                return None, "保存图像文件失败"
            
            if not os.path.exists(image_path):
                logger.error(f"图像文件不存在: image_path={image_path}")
                return None, "图像文件保存失败"
            
            logger.info(f"图像保存成功: image_path={image_path}, file_size={os.path.getsize(image_path)}")
            
            return image_path, None
            
        except Exception as e:
            logger.exception(f"捕获摄像头图像异常: camera_id={camera_id}, error={str(e)}")
            return None, f"捕获摄像头图像失败: {str(e)}"
    
    @staticmethod
    async def load_camera_annotations(
        camera_id: str,
        db: AsyncSession
    ) -> Tuple[Dict[str, Any], Optional[str]]:
        """
        从数据库加载摄像头的标注配置（只加载脱岗区域，area_kind=1）
        
        参数:
            camera_id: 摄像头ID
            db: 数据库会话
        
        返回:
            (config, error): 成功返回(配置字典, None)，失败返回({}, 错误信息)
        """
        try:
            # 只查询脱岗区域（area_kind=1）
            stmt = select(LeaveArea).where(
                LeaveArea.camera_id == camera_id,
                LeaveArea.area_kind == 1
            )
            result = await db.execute(stmt)
            areas = result.scalars().all()
            
            if areas:
                # 将数据库中的区域数据转换为前端需要的格式
                annotations = []
                for area in areas:
                    if area.json:
                        try:
                            # 尝试解析JSON字符串
                            area_json = json.loads(area.json)
                            # 添加区域ID和机器ID
                            area_json['area_no'] = area.area_no
                            area_json['machine_id'] = area.machine_id
                            annotations.append(area_json)
                        except Exception as e:
                            # 解析失败，跳过
                            continue
                
                return {"camera_id": camera_id, "annotations": annotations}, None
            else:
                return {"camera_id": camera_id, "annotations": []}, None
                
        except Exception as e:
            return {}, f"从数据库读取JSON配置失败: {e}"
    
    @staticmethod
    async def save_camera_annotations(
        camera_id: str,
        annotations: List[Dict[str, Any]],
        db: AsyncSession
    ) -> Tuple[bool, Optional[str]]:
        """
        保存摄像头的标注配置到数据库（只保存脱岗区域，area_kind=1）
        
        参数:
            camera_id: 摄像头ID
            annotations: 标注配置列表
            db: 数据库会话
        
        返回:
            (success, error): 成功返回(True, None)，失败返回(False, 错误信息)
        """
        try:
            # 先删除该摄像头的所有脱岗区域配置（area_kind=1）
            stmt = select(LeaveArea).where(
                LeaveArea.camera_id == camera_id,
                LeaveArea.area_kind == 1
            )
            result = await db.execute(stmt)
            existing_areas = result.scalars().all()
            
            for area in existing_areas:
                await db.delete(area)
            
            # 逐个保存每个区域的配置
            for i, annotation in enumerate(annotations):
                # 提取area_no和machine_id
                area_no = annotation.get('area_no', i + 1)
                machine_id = annotation.get('machine_id', f'AUTO{i+1}')
                
                # 移除area_no和machine_id，避免重复
                annotation_copy = annotation.copy()
                if 'area_no' in annotation_copy:
                    del annotation_copy['area_no']
                if 'machine_id' in annotation_copy:
                    del annotation_copy['machine_id']
                
                # 将annotation转换为JSON字符串
                annotation_json = json.dumps(annotation_copy, ensure_ascii=False)
                
                # 创建新的区域记录，设置area_kind=1（脱岗区域）
                leave_area = LeaveArea(
                    camera_id=camera_id,
                    area_no=area_no,
                    area_kind=1,  # 脱岗区域
                    json=annotation_json,
                    machine_id=machine_id,
                    remarks=f'自动保存-区域{area_no}'
                )
                db.add(leave_area)
            
            await db.commit()
            return True, None
            
        except Exception as e:
            await db.rollback()
            return False, f"保存JSON配置失败: {e}"

