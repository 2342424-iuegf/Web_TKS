# Web_TKS 快速部署指南

## 一、快速部署步骤（5分钟）

### 1. 传输项目到服务器

**使用 MobaXterm 文件传输：**
1. 在 MobaXterm 左侧文件浏览器中，进入 `/home/web1/workspace`
2. 右键点击 `workspace` 目录
3. 选择 "Upload files to current folder"
4. 选择本地的 `Web_TKS` 项目目录（或压缩包）

**或使用 SCP 命令（在本地 PowerShell）：**
```powershell
scp -r F:\project\Web_TKS web1@39.184.196.175:/home/web1/workspace/
```

### 2. SSH 连接到服务器

在 MobaXterm 中连接到服务器，或使用 SSH：
```bash
ssh web1@39.184.196.175
```

### 3. 进入项目目录

```bash
cd /home/web1/workspace/Web_TKS/backend
```

### 4. 安装系统依赖

```bash
sudo apt update
sudo apt install python3.11 python3.11-venv ffmpeg -y
```

### 5. 创建虚拟环境并安装依赖

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 6. 配置环境变量

```bash
nano .env
```

配置内容（根据实际情况修改）：
```env
DB_TYPE=mysql
DB_SERVER=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=vis_vehicle
SERVER_PORT=9527
DEBUG=False
```

### 7. 创建必要目录

```bash
mkdir -p sample
chmod 755 sample
```

### 8. 测试运行

```bash
source .venv/bin/activate
python main.py
```

如果看到 "Uvicorn running on http://0.0.0.0:9527"，说明启动成功！

### 9. 后台运行（使用 nohup）

```bash
nohup python main.py > app.log 2>&1 &
```

查看日志：
```bash
tail -f app.log
```

## 二、验证部署

### 测试 API

```bash
# 在服务器上测试
curl http://localhost:9527/api/detection/off-duty/cameras

# 从外部测试（如果防火墙允许）
curl http://39.184.196.175:9527/api/detection/off-duty/cameras
```

### 测试 RTSP 连接

```bash
cd /home/web1/workspace/Web_TKS/backend
source .venv/bin/activate
python scripts/test_rtsp.py rtsp://admin:a8888888@192.168.88.13:554/streaming/channels/401
```

## 三、常见问题快速解决

### FFmpeg 找不到
```bash
sudo apt install ffmpeg -y
```

### 端口被占用
```bash
# 查找占用进程
sudo lsof -i :9527
# 杀死进程或修改端口
```

### 数据库连接失败
- 检查 `.env` 中的数据库配置
- 测试数据库连接：`mysql -u username -p -h hostname`

### 权限问题
```bash
sudo chown -R web1:web1 /home/web1/workspace/Web_TKS
```

## 四、生产环境建议

1. **使用 systemd 管理服务**（见 DEPLOYMENT_GUIDE.md）
2. **配置 Nginx 反向代理**
3. **设置防火墙规则**
4. **配置日志轮转**
5. **定期备份数据库**

详细配置请参考 `DEPLOYMENT_GUIDE.md`

