# Web_TKS 项目部署到服务器指南

## 一、部署概述

将 Web_TKS 项目从本地开发环境迁移到服务器（Ubuntu 22.04.5 LTS），以便能够访问摄像头RTSP流。

## 二、服务器信息

- **服务器地址**: 39.184.196.175
- **用户名**: web1
- **工作目录**: `/home/web1/workspace`
- **操作系统**: Ubuntu 22.04.5 LTS

## 三、迁移步骤

### 步骤1: 准备项目文件

#### 方法1: 使用 Git（推荐）

如果项目已提交到 Git 仓库：

```bash
# 在服务器上克隆项目
cd /home/web1/workspace
git clone <你的Git仓库地址> Web_TKS
cd Web_TKS
```

#### 方法2: 使用 SCP 传输

在本地 Windows 机器上，使用 PowerShell 或 CMD：

```powershell
# 传输整个项目目录
scp -r F:\project\Web_TKS web1@39.184.196.175:/home/web1/workspace/
```

或者使用 MobaXterm 的文件传输功能：
1. 在 MobaXterm 左侧文件浏览器中，右键点击 `workspace` 目录
2. 选择上传文件/目录
3. 选择本地的 `Web_TKS` 项目目录

#### 方法3: 使用压缩包传输

在本地：

```powershell
# 压缩项目（排除不必要的文件）
# 在项目根目录执行
tar -czf Web_TKS.tar.gz --exclude='node_modules' --exclude='.venv' --exclude='__pycache__' --exclude='*.pyc' --exclude='.git' Web_TKS
```

在服务器上：

```bash
# 解压项目
cd /home/web1/workspace
tar -xzf Web_TKS.tar.gz
cd Web_TKS
```

### 步骤2: 安装系统依赖

在服务器上执行：

```bash
# 更新系统包
sudo apt update

# 安装 Python 3.11+（如果未安装）
sudo apt install python3.11 python3.11-venv python3.11-dev -y

# 安装 FFmpeg（必需）
sudo apt install ffmpeg -y

# 安装 MySQL 客户端库（如果使用 MySQL）
sudo apt install libmysqlclient-dev pkg-config -y

# 安装其他可能需要的依赖
sudo apt install build-essential -y
```

验证 FFmpeg 安装：

```bash
ffmpeg -version
```

### 步骤3: 配置后端环境

```bash
cd /home/web1/workspace/Web_TKS/backend

# 创建虚拟环境
python3.11 -m venv .venv

# 激活虚拟环境
source .venv/bin/activate

# 升级 pip
pip install --upgrade pip

# 安装 Python 依赖
pip install -r requirements.txt
```

### 步骤4: 配置环境变量

创建 `.env` 文件：

```bash
cd /home/web1/workspace/Web_TKS/backend
cp .env.example .env  # 如果有示例文件
# 或者直接创建
nano .env
```

`.env` 文件内容示例：

```env
# 项目配置
PROJECT_NAME=Web_TKS
PROJECT_DESCRIPTION=Web_TKS 布车监测系统
VERSION=1.0.0
API_V1_STR=/api
DEBUG=False

# 服务器配置
SERVER_HOST=0.0.0.0
SERVER_PORT=9527

# 数据库配置
DB_TYPE=mysql
DB_SERVER=localhost  # 或数据库服务器地址
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=vis_vehicle

# FFmpeg配置（可选，如果FFmpeg不在PATH中）
# FFMPEG_PATH=/usr/bin/ffmpeg

# JWT密钥（生产环境请使用强密钥）
SECRET_KEY=your_secret_key_here

# CORS配置
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://your_domain.com
```

### 步骤5: 配置数据库

确保数据库服务器可访问，并创建数据库（如果不存在）：

```sql
CREATE DATABASE IF NOT EXISTS vis_vehicle CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 步骤6: 创建必要的目录

```bash
cd /home/web1/workspace/Web_TKS/backend

# 创建图像存储目录
mkdir -p sample

# 确保目录有写权限
chmod 755 sample
```

### 步骤7: 测试后端服务

```bash
cd /home/web1/workspace/Web_TKS/backend
source .venv/bin/activate

# 测试启动（前台运行，用于调试）
python main.py
```

如果启动成功，应该看到类似输出：
```
INFO:     Started server process [xxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:9527
```

### 步骤8: 配置前端环境（如果需要）

```bash
cd /home/web1/workspace/Web_TKS/front

# 安装 Node.js（如果未安装）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 步骤9: 使用进程管理器运行（生产环境）

#### 使用 systemd（推荐）

创建服务文件：

```bash
sudo nano /etc/systemd/system/web-tks-backend.service
```

服务文件内容：

```ini
[Unit]
Description=Web_TKS Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=web1
WorkingDirectory=/home/web1/workspace/Web_TKS/backend
Environment="PATH=/home/web1/workspace/Web_TKS/backend/.venv/bin"
ExecStart=/home/web1/workspace/Web_TKS/backend/.venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
# 重新加载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start web-tks-backend

# 设置开机自启
sudo systemctl enable web-tks-backend

# 查看服务状态
sudo systemctl status web-tks-backend

# 查看日志
sudo journalctl -u web-tks-backend -f
```

#### 使用 Supervisor（备选）

安装 Supervisor：

```bash
sudo apt install supervisor -y
```

创建配置文件：

```bash
sudo nano /etc/supervisor/conf.d/web-tks-backend.conf
```

配置文件内容：

```ini
[program:web-tks-backend]
command=/home/web1/workspace/Web_TKS/backend/.venv/bin/python main.py
directory=/home/web1/workspace/Web_TKS/backend
user=web1
autostart=true
autorestart=true
stderr_logfile=/var/log/web-tks-backend.err.log
stdout_logfile=/var/log/web-tks-backend.out.log
environment=PATH="/home/web1/workspace/Web_TKS/backend/.venv/bin"
```

启动服务：

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start web-tks-backend
```

### 步骤10: 配置 Nginx 反向代理（可选）

如果需要通过域名访问：

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/web-tks
```

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name your_domain.com;

    # 后端API
    location /api {
        proxy_pass http://127.0.0.1:9527;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 前端静态文件
    location / {
        root /home/web1/workspace/Web_TKS/front/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/web-tks /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 四、防火墙配置

如果服务器有防火墙，需要开放端口：

```bash
# UFW（Ubuntu防火墙）
sudo ufw allow 9527/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

## 五、验证部署

### 1. 检查后端服务

```bash
# 检查服务是否运行
curl http://localhost:9527/docs

# 或者从外部访问
curl http://39.184.196.175:9527/docs
```

### 2. 测试摄像头图像获取

```bash
# 使用测试脚本
cd /home/web1/workspace/Web_TKS/backend
source .venv/bin/activate
python scripts/test_rtsp.py rtsp://admin:a8888888@192.168.88.13:554/streaming/channels/401
```

### 3. 检查日志

```bash
# 如果使用 systemd
sudo journalctl -u web-tks-backend -f

# 如果使用 supervisor
sudo supervisorctl tail -f web-tks-backend
```

## 六、常见问题

### 1. FFmpeg 找不到

```bash
# 检查 FFmpeg 是否安装
which ffmpeg
ffmpeg -version

# 如果未安装
sudo apt install ffmpeg -y
```

### 2. 数据库连接失败

- 检查数据库服务器是否可访问
- 检查 `.env` 文件中的数据库配置
- 检查防火墙是否阻止了数据库端口

### 3. 权限问题

```bash
# 确保项目目录权限正确
sudo chown -R web1:web1 /home/web1/workspace/Web_TKS
chmod -R 755 /home/web1/workspace/Web_TKS
```

### 4. 端口被占用

```bash
# 检查端口占用
sudo netstat -tulpn | grep 9527
# 或
sudo lsof -i :9527

# 如果被占用，修改 .env 中的 SERVER_PORT
```

### 5. RTSP 连接超时

- 确保服务器能够访问摄像头网络（ping 测试）
- 检查 RTSP 地址格式是否正确
- 检查摄像头是否开启 RTSP 服务

## 七、文件传输清单

需要传输的文件和目录：

```
Web_TKS/
├── backend/          # 后端代码（必需）
│   ├── app/         # 应用代码
│   ├── main.py      # 启动文件
│   ├── requirements.txt  # Python依赖
│   └── .env         # 环境变量（需要配置）
├── front/           # 前端代码（如果需要在服务器上构建）
│   ├── src/
│   ├── package.json
│   └── ...
├── sql/             # SQL脚本（可选）
└── README.md        # 文档（可选）
```

不需要传输的文件：
- `node_modules/` - 前端依赖（服务器上重新安装）
- `.venv/` - Python虚拟环境（服务器上重新创建）
- `__pycache__/` - Python缓存
- `.git/` - Git仓库（如果使用Git克隆）

## 八、快速部署脚本

创建自动化部署脚本 `deploy.sh`：

```bash
#!/bin/bash
# Web_TKS 快速部署脚本

set -e

PROJECT_DIR="/home/web1/workspace/Web_TKS"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "开始部署 Web_TKS..."

# 1. 进入项目目录
cd $PROJECT_DIR

# 2. 创建虚拟环境
echo "创建虚拟环境..."
cd $BACKEND_DIR
python3.11 -m venv .venv
source .venv/bin/activate

# 3. 安装依赖
echo "安装Python依赖..."
pip install --upgrade pip
pip install -r requirements.txt

# 4. 创建必要目录
echo "创建必要目录..."
mkdir -p sample
chmod 755 sample

# 5. 检查 .env 文件
if [ ! -f .env ]; then
    echo "警告: .env 文件不存在，请手动创建并配置"
fi

# 6. 验证 FFmpeg
echo "验证 FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo "FFmpeg 未安装，正在安装..."
    sudo apt install ffmpeg -y
fi

echo "部署完成！"
echo "请确保："
echo "1. .env 文件已正确配置"
echo "2. 数据库可访问"
echo "3. 运行: source .venv/bin/activate && python main.py"
```

使用脚本：

```bash
chmod +x deploy.sh
./deploy.sh
```

## 九、维护和更新

### 更新代码

如果使用 Git：

```bash
cd /home/web1/workspace/Web_TKS
git pull origin main
cd backend
source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart web-tks-backend
```

### 查看日志

```bash
# systemd
sudo journalctl -u web-tks-backend -n 100 -f

# supervisor
sudo supervisorctl tail -f web-tks-backend
```

### 备份

```bash
# 备份数据库
mysqldump -u username -p vis_vehicle > backup_$(date +%Y%m%d).sql

# 备份项目配置
tar -czf web-tks-backup-$(date +%Y%m%d).tar.gz \
    --exclude='.venv' \
    --exclude='__pycache__' \
    --exclude='sample' \
    /home/web1/workspace/Web_TKS
```

## 十、注意事项

1. **安全性**
   - 生产环境设置 `DEBUG=False`
   - 使用强密码和密钥
   - 配置防火墙规则
   - 使用 HTTPS（配置 SSL 证书）

2. **性能**
   - 使用进程管理器（systemd/supervisor）管理服务
   - 配置适当的 worker 数量
   - 监控资源使用情况

3. **网络**
   - 确保服务器能够访问摄像头网络
   - 检查防火墙和路由配置
   - RTSP 流可能需要较大的带宽

4. **日志**
   - 定期清理日志文件
   - 配置日志轮转
   - 监控错误日志

## 十一、联系和支持

如遇到问题，请检查：
1. 后端日志：`sudo journalctl -u web-tks-backend -f`
2. 系统日志：`/var/log/syslog`
3. Nginx 日志（如果使用）：`/var/log/nginx/error.log`

