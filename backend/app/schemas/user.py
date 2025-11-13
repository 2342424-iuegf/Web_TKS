# schemas/user.py
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime

class UserBase(BaseModel):
    """用户基础模型"""
    email: Optional[EmailStr] = Field(None, description="电子邮件")
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    role: str = Field(..., min_length=3, max_length=20, description="用户角色")
    status: int = Field(1, description="用户状态")  # 1-启用, 0-禁用
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "username": "johndoe",
                "is_active": True,
                "is_superuser": False
            }
        }
    )

class UserCreate(UserBase):
    """创建用户模型"""
    password: str = Field(..., min_length=8, max_length=100, description="密码")

class UserUpdate(BaseModel):
    """更新用户模型"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    password: Optional[str] = Field(None, min_length=8, max_length=100)
    role: Optional[str] = Field(None, min_length=3, max_length=20)
    status: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

class UserInDB(UserBase):
    """数据库用户模型"""
    id: int
    hashed_password: str
    created_at: datetime
    updated_at: datetime

class UserResponse(UserBase):
    """用户响应模型"""
    id: int
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.strftime("%Y-%m-%d %H:%M:%S")
        }