# core/security.py
from datetime import datetime, timedelta
from typing import Any, Union
import bcrypt
from jose import jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码（使用bcrypt）"""
    try:
        password_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """获取密码哈希（使用bcrypt）"""
    password_bytes = password.encode('utf-8')
    # 生成盐并哈希密码（rounds=12是默认值，与passlib兼容）
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def create_token(
    subject: Union[str, Any], 
    expires_delta: timedelta,
    secret_key: str,
    algorithm: str = "HS256"
) -> str:
    """创建JWT令牌"""
    if not isinstance(subject, str):
        subject = str(subject)
    expire = datetime.utcnow() + expires_delta
    to_encode = {"exp": expire, "sub": subject}
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt

