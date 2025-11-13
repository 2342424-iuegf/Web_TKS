# api/endpoints/user.py
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.api.deps import get_db, get_current_user
from app.schemas.user import UserCreate, UserResponse, UserUpdate, UserStatusUpdate
from app.models.user import User
from app.services.auth import AuthService

router = APIRouter()

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> UserResponse:
    """
    创建新用户（需要管理员权限）
    """
    # 检查当前用户是否为管理员
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # 使用AuthService创建用户
    user = await AuthService.create_user(user_in, db)
    # 使用model_validate自动转换
    return UserResponse.model_validate(user)

@router.get("", response_model=dict)
async def get_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    username: Optional[str] = Query(None, description="用户名搜索"),
    page: int = Query(1, ge=1, description="页码"),
    pageSize: int = Query(10, ge=1, le=100, description="每页数量")
) -> dict:
    """
    获取用户列表（支持分页和搜索）
    """
    # 构建查询
    query = select(User)
    count_query = select(func.count()).select_from(User)
    
    # 如果提供了用户名搜索
    if username:
        query = query.where(User.username.like(f"%{username}%"))
        count_query = count_query.where(User.username.like(f"%{username}%"))
    
    # 获取总数
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # 分页
    offset = (page - 1) * pageSize
    query = query.offset(offset).limit(pageSize)
    
    # 执行查询
    result = await db.execute(query)
    users = result.scalars().all()
    
    # 转换为响应格式
    user_list = [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "roleName": "管理员" if user.role == "admin" else "普通用户",
            "status": user.status,
            "createTime": user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else "",
            "nickname": user.username,  # 如果没有nickname字段，使用username
            "phone": ""  # 如果没有phone字段，返回空字符串
        }
        for user in users
    ]
    
    return {
        "list": user_list,
        "total": total,
        "page": page,
        "pageSize": pageSize
    }

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> UserResponse:
    """
    获取单个用户信息
    """
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse.model_validate(user)

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> UserResponse:
    """
    更新用户信息
    """
    # 检查权限：只有管理员或用户本人可以更新
    if not current_user.is_superuser and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = await AuthService.update_user(user_id, user_update, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse.model_validate(user)

@router.put("/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: int,
    status_update: UserStatusUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> UserResponse:
    """
    更新用户状态
    """
    # 检查权限：只有管理员可以更新状态
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.status = status_update.status
    await db.commit()
    await db.refresh(user)
    
    return UserResponse.model_validate(user)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    删除用户
    """
    # 检查权限：只有管理员可以删除用户
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # 不能删除自己
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    await db.delete(user)
    await db.commit()
