# 环境变量配置说明

## 创建 .env 文件

在 `backend` 目录下创建 `.env` 文件，配置以下内容：

```env
# 项目基础配置
PROJECT_NAME=Web_TKS
PROJECT_DESCRIPTION=Web_TKS智能检测系统
VERSION=0.1.0
API_V1_STR=/api
DEBUG=True

# 服务器配置
SERVER_HOST=0.0.0.0
SERVER_PORT=9527
WORKERS=1

# 安全配置（生产环境请修改为强随机字符串）
SECRET_KEY=your-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=11520
REFRESH_TOKEN_EXPIRE_MINUTES=43200

# CORS配置 (多个用逗号分隔，无需空格)
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# 数据库配置 (MySQL)
DB_TYPE=mysql
DB_SERVER=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=web_tks

# Redis配置 (可选)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## 重要提示

1. **SECRET_KEY**: 生产环境必须使用强随机字符串，可以使用以下命令生成：
   ```python
   import secrets
   print(secrets.token_urlsafe(32))
   ```

2. **DB_PASSWORD**: 替换为你的MySQL密码

3. **DB_NAME**: 确保MySQL中已创建该数据库：
   ```sql
   CREATE DATABASE web_tks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **CORS配置**: 根据前端实际地址配置，多个地址用逗号分隔

