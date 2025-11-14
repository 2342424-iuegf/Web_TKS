# models/detection_area.py
from sqlalchemy import String, Text, SmallInteger, Integer
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import UniqueConstraint
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase


class DetectionAreaBase(AsyncAttrs, DeclarativeBase):
    """检测区域相关模型的基础类（不使用Base的id字段，但支持异步）"""
    pass


class Camera(DetectionAreaBase):
    """摄像头数据库模型"""
    __tablename__ = "p_camera"
    
    # 注意：p_camera表使用camera_id作为主键，没有id字段
    camera_id: Mapped[str] = mapped_column(
        String(20),
        primary_key=True,
        comment="摄像头编号"
    )
    camera_name: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        comment="摄像头名称"
    )
    rstp: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="RTSP地址"
    )
    is_selected: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        comment="是否检测"
    )
    is_entry: Mapped[int | None] = mapped_column(
        SmallInteger,
        nullable=True,
        comment="是否入口摄像头"
    )
    detect_vehicle: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        comment="场景是否有车辆:1.有车,2.无车,3.移动"
    )
    detect_leave: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        comment="是否检测脱岗"
    )
    detect_sleep: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        comment="是否检测睡岗"
    )
    dept: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="所在部门"
    )
    clarity: Mapped[int | None] = mapped_column(
        SmallInteger,
        nullable=True,
        comment="图像清晰度 1: 很清晰; 0: 清晰; -1: 不清晰"
    )
    remarks: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="说明"
    )

    def __repr__(self) -> str:
        return f"<Camera {self.camera_id}>"


class LeaveArea(DetectionAreaBase):
    """脱岗区域数据库模型（对应p_area表，area_kind=1）"""
    __tablename__ = "p_area"
    
    # 使用复合主键 (camera_id, area_no)
    camera_id: Mapped[str] = mapped_column(
        String(20),
        primary_key=True,
        comment="摄像头编号"
    )
    area_no: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        comment="区域顺序号"
    )
    area_kind: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        comment="区域类别: 1=脱岗区域; 2=换车区域; 3=危险区域"
    )
    json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="区域界定"
    )
    machine_id: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        comment="机台编号"
    )
    remarks: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="说明"
    )

    def __repr__(self) -> str:
        return f"<LeaveArea camera_id={self.camera_id} area_no={self.area_no} area_kind={self.area_kind}>"

