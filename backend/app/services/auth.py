# services/auth.py
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt

from app.core.config import settings
from app.core.security import verify_password, get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

class AuthService:
    """认证服务"""
    
    @staticmethod
    async def authenticate(
        username: str, 
        password: str, 
        db: AsyncSession
    ) -> Optional[User]:
        """验证用户（支持username或email登录）"""
        # 先尝试用username查找
        query = select(User).where(User.username == username)
        result = await db.execute(query)
        user = result.scalar_one_or_none()
        
        # 如果username没找到，尝试用email查找
        if not user:
            query = select(User).where(User.email == username)
            result = await db.execute(query)
            user = result.scalar_one_or_none()
        
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def create_access_token(
        subject: str | int,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """创建访问令牌"""
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode = {"exp": expire, "sub": str(subject)}
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.SECRET_KEY, 
            algorithm="HS256"
        )
        return encoded_jwt

    @staticmethod
    def create_refresh_token(
        subject: str | int,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """创建刷新令牌"""
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode = {"exp": expire, "sub": str(subject)}
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.SECRET_KEY, 
            algorithm="HS256"
        )
        return encoded_jwt

    @staticmethod
    async def get_user_by_email(
        email: str,
        db: AsyncSession
    ) -> Optional[User]:
        """通过邮箱获取用户"""
        query = select(User).where(User.email == email)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create_user(
        user_create: UserCreate,
        db: AsyncSession
    ) -> User:
        """创建用户"""
        # 检查用户名是否已存在
        query = select(User).where(User.username == user_create.username)
        result = await db.execute(query)
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # 如果提供了邮箱，检查邮箱是否已存在
        if user_create.email:
            existing_user = await AuthService.get_user_by_email(
                user_create.email, 
                db
            )
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # 创建新用户
        db_user = User(
            email=user_create.email,
            username=user_create.username,
            password_hash=get_password_hash(user_create.password),
            status=user_create.status,
            role=user_create.role
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

    @staticmethod
    async def update_user(
        user_id: int,
        user_update: UserUpdate,
        db: AsyncSession
    ) -> Optional[User]:
        """更新用户信息"""
        # 获取用户
        user = await db.get(User, user_id)
        if not user:
            return None
            
        # 更新用户信息
        update_data = user_update.model_dump(exclude_unset=True)
        if "password" in update_data:
            user.password_hash = get_password_hash(update_data.pop("password"))
        
        if "email" in update_data:
            user.email = update_data.pop("email")
        if "username" in update_data:
            user.username = update_data.pop("username")
        if "role" in update_data:
            user.role = update_data.pop("role")
        if "status" in update_data:
            user.status = update_data.pop("status")
            
        await db.commit()
        await db.refresh(user)
        return user
