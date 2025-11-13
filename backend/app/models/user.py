# models/user.py
from sqlalchemy import String, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class User(Base):
    """用户数据库模型"""
    __tablename__ = "users"
    
    username: Mapped[str] = mapped_column(
        String(50), 
        unique=True, 
        index=True,
        nullable=False,
        comment="用户名"
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="密码哈希"
    )
    email: Mapped[str] = mapped_column(
        String(100), 
        unique=True, 
        index=True,
        nullable=True,
        comment="邮箱"
    )
    role: Mapped[str] = mapped_column(
        String(20),
        default="user",
        nullable=False,
        comment="用户角色：admin/user"
    )
    status: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
        comment="状态：0-禁用，1-启用"
    )

    @property
    def hashed_password(self) -> str:
        """兼容属性：返回password_hash"""
        return self.password_hash
    
    @hashed_password.setter
    def hashed_password(self, value: str):
        """兼容属性：设置password_hash"""
        self.password_hash = value
    
    @property
    def is_active(self) -> bool:
        """兼容属性：status转换为bool"""
        return self.status == 1
    
    @is_active.setter
    def is_active(self, value: bool):
        """兼容属性：bool转换为status"""
        self.status = 1 if value else 0
    
    @property
    def is_superuser(self) -> bool:
        """兼容属性：role转换为bool"""
        return self.role == "admin"
    
    @is_superuser.setter
    def is_superuser(self, value: bool):
        """兼容属性：bool转换为role"""
        self.role = "admin" if value else "user"

    def __repr__(self) -> str:
        return f"<User {self.username}>"