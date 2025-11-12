# Web_TKS 前后端接口设计文档

## 1. 文档概述

本文档详细描述了Web_TKS项目的前后端接口设计，涵盖了系统管理、检测区域设置、模型管理、布车分布检测、通道出入检测、落布换车检测、脱岗检测、危险区域检测、事件查询和视频查询等功能模块的API接口规范。

## 2. API基本规范

### 2.1 基础URL
- 生产环境: `https://api.web-tks.com`
- 测试环境: `https://test-api.web-tks.com`
- 开发环境: `http://localhost:8000`

### 2.2 版本控制
- API版本通过URL路径实现: `/api/v1/`

### 2.3 请求方法
- GET: 获取资源
- POST: 创建资源
- PUT: 更新资源
- DELETE: 删除资源
- PATCH: 部分更新资源

### 2.4 认证方式
- 使用JWT Token进行认证
- Token放置在请求头中: `Authorization: Bearer {token}`

### 2.5 响应格式

#### 2.5.1 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

#### 2.5.2 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "detail": "详细错误描述"
}
```

### 2.6 分页规范
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "page_size": 10,
    "pages": 10
  }
}
```

### 2.7 状态码
- 200: 请求成功
- 201: 创建成功
- 204: 删除成功
- 400: 请求参数错误
- 401: 未授权
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误

## 3. 接口设计

### 3.1 认证相关接口

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth/login` | `POST` | `backend/app/api/endpoints/user.py` | `Router` | 用户登录 | `{"username": "admin", "password": "123456"}` | `{"token": "jwt_token", "user": {"id": 1, "username": "admin", "name": "管理员"}}` |
| `/api/v1/auth/logout` | `POST` | `backend/app/api/endpoints/user.py` | `Router` | 用户登出 | N/A | `{"message": "success"}` |
| `/api/v1/auth/refresh` | `POST` | `backend/app/api/endpoints/user.py` | `Router` | 刷新Token | N/A | `{"token": "new_jwt_token"}` |
| `/api/v1/auth/me` | `GET` | `backend/app/api/endpoints/user.py` | `Router` | 获取当前用户信息 | N/A | `{"id": 1, "username": "admin", "name": "管理员", "roles": ["admin"]}` |

### 3.2 系统管理模块

#### 3.2.1 用户管理

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/users` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取用户列表 | N/A | `{"items": [{"id": 1, "username": "admin", "name": "管理员", "status": "active", "created_at": "2024-01-01T00:00:00Z"}], "total": 1, "page": 1, "page_size": 10}` |
| `/api/v1/users` | `POST` | `backend/app/api/endpoints/system.py` | `Router` | 创建新用户 | `{"username": "newuser", "password": "password123", "name": "新用户", "role_ids": [1, 2]}` | `{"id": 2, "username": "newuser", "name": "新用户", "status": "active"}` |
| `/api/v1/users/{id}` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取用户详情 | N/A | `{"id": 1, "username": "admin", "name": "管理员", "roles": [{"id": 1, "name": "管理员"}], "status": "active"}` |
| `/api/v1/users/{id}` | `PUT` | `backend/app/api/endpoints/system.py` | `Router` | 更新用户信息 | `{"name": "更新管理员", "role_ids": [1]}` | `{"id": 1, "username": "admin", "name": "更新管理员", "roles": [{"id": 1, "name": "管理员"}]}` |
| `/api/v1/users/{id}` | `DELETE` | `backend/app/api/endpoints/system.py` | `Router` | 删除用户 | N/A | `{"message": "success"}` |
| `/api/v1/users/{id}/status` | `PATCH` | `backend/app/api/endpoints/system.py` | `Router` | 更新用户状态 | `{"status": "active/inactive"}` | `{"id": 1, "status": "inactive"}` |
| `/api/v1/users/{id}/reset-password` | `POST` | `backend/app/api/endpoints/system.py` | `Router` | 重置用户密码 | `{"password": "newpassword123"}` | `{"message": "密码重置成功"}` |

#### 3.2.2 权限管理

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/roles` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取角色列表 | N/A | `{"items": [{"id": 1, "name": "管理员", "description": "系统管理员"}], "total": 1, "page": 1, "page_size": 10}` |
| `/api/v1/roles` | `POST` | `backend/app/api/endpoints/system.py` | `Router` | 创建新角色 | `{"name": "操作员", "description": "普通操作员", "permission_ids": [1, 2, 3]}` | `{"id": 2, "name": "操作员", "description": "普通操作员"}` |
| `/api/v1/roles/{id}` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取角色详情 | N/A | `{"id": 1, "name": "管理员", "permissions": [{"id": 1, "name": "user_manage", "description": "用户管理"}]}` |
| `/api/v1/roles/{id}` | `PUT` | `backend/app/api/endpoints/system.py` | `Router` | 更新角色信息 | `{"name": "高级管理员", "permission_ids": [1, 2, 3, 4]}` | `{"id": 1, "name": "高级管理员", "permissions": [...]}` |
| `/api/v1/roles/{id}` | `DELETE` | `backend/app/api/endpoints/system.py` | `Router` | 删除角色 | N/A | `{"message": "success"}` |
| `/api/v1/permissions` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取权限列表 | N/A | `{"items": [{"id": 1, "name": "user_manage", "description": "用户管理"}], "total": 10, "page": 1, "page_size": 10}` |

#### 3.2.3 参数设置

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/parameters` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取系统参数列表 | N/A | `{"code": 200, "message": "success", "data": {"items": [{"param_id": 1, "param_key": "detection_sensitivity", "param_value": "80", "param_desc": "检测灵敏度", "param_type": "number", "status": 1}], "total": 15, "page": 1, "page_size": 10}}` |
| `/api/v1/parameters` | `POST` | `backend/app/api/endpoints/system.py` | `Router` | 创建系统参数 | `{"param_key": "new_param", "param_value": "test_value", "param_desc": "新参数", "param_type": "string", "status": 1}` | `{"code": 201, "message": "success", "data": {"param_id": 16, "param_key": "new_param", "param_value": "test_value", "param_desc": "新参数", "param_type": "string", "status": 1}}` |
| `/api/v1/parameters/batch` | `PUT` | `backend/app/api/endpoints/system.py` | `Router` | 批量更新参数 | `[{"param_id": 1, "param_value": "85"}, {"param_id": 2, "param_value": "90"}]` | `{"code": 200, "message": "批量更新成功", "data": {"updated_count": 2}}` |
| `/api/v1/parameters/{param_id}` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取单个参数 | N/A | `{"code": 200, "message": "success", "data": {"param_id": 1, "param_key": "detection_sensitivity", "param_value": "80", "param_desc": "检测灵敏度", "param_type": "number", "status": 1, "created_at": "2024-01-01T00:00:00Z", "updated_at": "2024-01-01T00:00:00Z"}}` |
| `/api/v1/parameters/{param_id}` | `PUT` | `backend/app/api/endpoints/system.py` | `Router` | 更新单个参数 | `{"param_value": "90", "param_desc": "更新后的检测灵敏度", "status": 1}` | `{"code": 200, "message": "success", "data": {"param_id": 1, "param_key": "detection_sensitivity", "param_value": "90", "param_desc": "更新后的检测灵敏度", "param_type": "number", "status": 1}}` |
| `/api/v1/parameters/{param_id}` | `DELETE` | `backend/app/api/endpoints/system.py` | `Router` | 删除参数 | N/A | `{"code": 204, "message": "success", "data": null}` |
| `/api/v1/parameters/key/{param_key}` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 按参数键获取参数 | N/A | `{"code": 200, "message": "success", "data": {"param_id": 1, "param_key": "detection_sensitivity", "param_value": "80"}}` |

#### 3.2.4 摄像头管理

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/cameras` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取摄像头列表 | N/A | `{"code": 200, "message": "success", "data": {"items": [{"camera_id": "CAM001", "camera_name": "摄像头1", "rstp": "rtsp://192.168.1.101:554/stream", "is_selected": 1, "is_entry": 0, "detect_vehicle": 1, "detect_leave": 1, "detect_sleep": 1, "dept": "生产部", "clarity": 1, "remarks": "车间监控摄像头", "status": "online"}], "total": 5, "page": 1, "page_size": 10}}` |
| `/api/v1/cameras` | `POST` | `backend/app/api/endpoints/system.py` | `Router` | 添加摄像头 | `{"camera_id": "CAM002", "camera_name": "摄像头2", "rstp": "rtsp://192.168.1.102:554/stream", "is_selected": 1, "is_entry": 1, "detect_vehicle": 2, "detect_leave": 0, "detect_sleep": 1, "dept": "质量部", "clarity": 0, "remarks": "入口监控"}` | `{"code": 201, "message": "success", "data": {"camera_id": "CAM002", "camera_name": "摄像头2", "status": "offline"}}` |
| `/api/v1/cameras/{camera_id}` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取摄像头详情 | N/A | `{"code": 200, "message": "success", "data": {"camera_id": "CAM001", "camera_name": "摄像头1", "rstp": "rtsp://192.168.1.101:554/stream", "is_selected": 1, "is_entry": 0, "detect_vehicle": 1, "detect_leave": 1, "detect_sleep": 1, "dept": "生产部", "clarity": 1, "remarks": "车间监控摄像头", "status": "online"}}` |
| `/api/v1/cameras/{camera_id}` | `PUT` | `backend/app/api/endpoints/system.py` | `Router` | 更新摄像头信息 | `{"camera_name": "更新摄像头", "rstp": "rtsp://192.168.1.101:554/stream", "is_selected": 0, "is_entry": 0, "detect_vehicle": 3, "detect_leave": 0, "detect_sleep": 0, "dept": "设备部", "clarity": -1, "remarks": "更新说明"}` | `{"code": 200, "message": "success", "data": {"camera_id": "CAM001", "camera_name": "更新摄像头", "dept": "设备部"}}` |
| `/api/v1/cameras/{camera_id}` | `DELETE` | `backend/app/api/endpoints/system.py` | `Router` | 删除摄像头 | N/A | `{"code": 204, "message": "success", "data": null}` |
| `/api/v1/cameras/{camera_id}/status` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取摄像头状态 | N/A | `{"code": 200, "message": "success", "data": {"status": "online", "last_online": "2024-01-01T00:00:00Z"}}` |
| `/api/v1/cameras/{camera_id}/test-connection` | `POST` | `backend/app/api/endpoints/system.py` | `Router` | 测试摄像头连接 | N/A | `{"code": 200, "message": "success", "data": {"connected": true, "latency": 150}}` |
| `/api/v1/cameras/status` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取摄像头状态统计 | N/A | `{"code": 200, "message": "success", "data": {"total": 5, "online": 4, "offline": 1}}` |
| `/api/v1/cameras/batch` | `POST` | `backend/app/api/endpoints/system.py` | `Router` | 批量添加摄像头 | `[{"camera_id": "CAM003", "camera_name": "生产线摄像头", "rstp": "rtsp://192.168.1.103:554/stream", "is_selected": 1, "is_entry": 0, "detect_vehicle": 1, "detect_leave": 1, "detect_sleep": 1, "dept": "生产部", "clarity": 1, "remarks": "生产线监控"}]` | `{"code": 200, "message": "success", "data": {"created_count": 1, "failed_count": 0}}` |

#### 3.2.5 事件推送设置

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/push-settings` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取推送设置列表 | N/A | `{"code": 200, "message": "success", "data": {"items": [{"id": 1, "name": "MES推送", "type": "mqtt", "enabled": true}], "total": 3, "page": 1, "page_size": 10}}` |
| `/api/v1/push-settings` | `POST` | `backend/app/api/endpoints/system.py` | `Router` | 添加推送设置 | `{"name": "企业微信推送", "type": "wechat", "enabled": true, "config": {"webhook_url": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."}}` | `{"code": 201, "message": "success", "data": {"id": 4, "name": "企业微信推送", "type": "wechat", "enabled": true}}` |
| `/api/v1/push-settings/{id}` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取推送设置详情 | N/A | `{"code": 200, "message": "success", "data": {"id": 1, "name": "MES推送", "type": "mqtt", "config": {"broker": "192.168.1.200", "port": 1883}}}` |
| `/api/v1/push-settings/{id}` | `PUT` | `backend/app/api/endpoints/system.py` | `Router` | 更新推送设置 | `{"enabled": false, "config": {"broker": "192.168.1.201"}}` | `{"code": 200, "message": "success", "data": {"id": 1, "name": "MES推送", "enabled": false}}` |
| `/api/v1/push-settings/{id}` | `DELETE` | `backend/app/api/endpoints/system.py` | `Router` | 删除推送设置 | N/A | `{"code": 204, "message": "success", "data": null}` |
| `/api/v1/push-settings/{id}/test` | `POST` | `backend/app/api/endpoints/system.py` | `Router` | 测试推送连接 | N/A | `{"code": 200, "message": "success", "data": {"success": true, "message": "测试消息推送成功"}}` |

### 3.3 检测区域设置模块

#### 3.3.1 区域管理（统一接口）

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/areas` | `GET` | `backend/app/api/endpoints/area.py` | `Router` | 获取区域列表（支持按区域类型筛选） | N/A（查询参数：?area_kind=1&camera_id=1&machine_id=M001） | `{"code": 200, "message": "success", "data": {"items": [{"camera_id": "CAM001", "area_no": 1, "area_kind": 1, "machine_id": "M001", "remarks": "机台1操作区", "json": "{\"coordinates\":[[100,100],[200,100],[200,200],[100,200]]}"}], "total": 20, "page": 1, "page_size": 10}}` |
| `/api/v1/areas` | `POST` | `backend/app/api/endpoints/area.py` | `Router` | 创建区域 | `{"camera_id": "CAM002", "area_no": 1, "area_kind": 2, "machine_id": "M002", "json": "{\"coordinates\":[[150,150],[250,150],[250,250],[150,250]]}", "remarks": "机台2换车区"}` | `{"code": 201, "message": "success", "data": {"camera_id": "CAM002", "area_no": 1, "area_kind": 2, "machine_id": "M002"}}` |
| `/api/v1/areas/{camera_id}/{area_no}` | `GET` | `backend/app/api/endpoints/area.py` | `Router` | 获取区域详情 | N/A | `{"code": 200, "message": "success", "data": {"camera_id": "CAM001", "area_no": 1, "area_kind": 1, "machine_id": "M001", "json": "{\"coordinates\":[[100,100],[200,100],[200,200],[100,200]]}", "remarks": "机台1操作区"}}` |
| `/api/v1/areas/{camera_id}/{area_no}` | `PUT` | `backend/app/api/endpoints/area.py` | `Router` | 更新区域信息 | `{"area_kind": 1, "machine_id": "M001", "json": "{\"coordinates\":[[120,120],[220,120],[220,220],[120,220]]}", "remarks": "更新机台1操作区"}` | `{"code": 200, "message": "success", "data": {"camera_id": "CAM001", "area_no": 1, "area_kind": 1, "machine_id": "M001", "remarks": "更新机台1操作区"}}` |
| `/api/v1/areas/{camera_id}/{area_no}` | `DELETE` | `backend/app/api/endpoints/area.py` | `Router` | 删除区域 | N/A | `{"code": 204, "message": "success", "data": null}` |
| `/api/v1/areas/batch` | `POST` | `backend/app/api/endpoints/area.py` | `Router` | 批量创建区域 | `[{"camera_id": "CAM003", "area_no": 1, "area_kind": 3, "machine_id": "M003", "json": "{\"coordinates\":[[300,300],[400,300],[400,400],[300,400]]}", "remarks": "高压危险区"}]` | `{"code": 200, "message": "success", "data": {"created_count": 1, "failed_count": 0}}` |

#### 3.3.2 区域类型说明

| 区域类型(area_kind) | 描述 |
| :--- | :--- |
| 1 | 脱岗区域 |
| 2 | 换车区域 |
| 3 | 危险区域 |

#### 3.3.3 按类型查询区域

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/areas/off-duty` | `GET` | `backend/app/api/endpoints/area.py` | `Router` | 获取脱岗区域列表 | N/A | `{"code": 200, "message": "success", "data": {"items": [{"camera_id": "CAM001", "area_no": 1, "area_kind": 1, "machine_id": "M001", "remarks": "机台1操作区", "json": "{\"coordinates\":[[100,100],[200,100],[200,200],[100,200]]}"}], "total": 15, "page": 1, "page_size": 10}}` |
| `/api/v1/areas/car-exchange` | `GET` | `backend/app/api/endpoints/area.py` | `Router` | 获取换车区域列表 | N/A | `{"code": 200, "message": "success", "data": {"items": [{"camera_id": "CAM002", "area_no": 1, "area_kind": 2, "machine_id": "M002", "remarks": "机台2换车区", "json": "{\"coordinates\":[[150,150],[250,150],[250,250],[150,250]]}"}], "total": 10, "page": 1, "page_size": 10}}` |
| `/api/v1/areas/danger` | `GET` | `backend/app/api/endpoints/area.py` | `Router` | 获取危险区域列表 | N/A | `{"code": 200, "message": "success", "data": {"items": [{"camera_id": "CAM003", "area_no": 1, "area_kind": 3, "machine_id": "M003", "remarks": "高压危险区", "json": "{\"coordinates\":[[300,300],[400,300],[400,400],[300,400]]}"}], "total": 8, "page": 1, "page_size": 10}}` |

### 3.4 模型管理模块

#### 3.4.1 模型管理

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/models` | `GET` | `backend/app/api/endpoints/model.py` | `Router` | 获取模型列表 | N/A | `{"code": 200, "message": "success", "data": {"items": [{"model_name": "YOLOv8布车检测模型", "model_path": "/models/yolov8_vehicle_v1.0.0.pt", "modify_date": "2024-01-05T00:00:00Z", "description": "用于检测车间布车"}], "total": 20, "page": 1, "page_size": 10}}` |
| `/api/v1/models` | `POST` | `backend/app/api/endpoints/model.py` | `Router` | 上传模型文件 | `multipart/form-data: {"file": <model_file>, "model_name": "YOLOv8人群检测模型", "description": "用于检测车间人员密集度"}` | `{"code": 201, "message": "success", "data": {"model_name": "YOLOv8人群检测模型", "model_path": "/models/yolov8_people_v1.0.0.pt"}}` |
| `/api/v1/models/{model_name}` | `GET` | `backend/app/api/endpoints/model.py` | `Router` | 获取模型详情 | N/A | `{"code": 200, "message": "success", "data": {"model_name": "YOLOv8布车检测模型", "model_path": "/models/yolov8_vehicle_v1.0.0.pt", "modify_date": "2024-01-05T00:00:00Z", "description": "用于检测车间布车"}}` |
| `/api/v1/models/{model_name}` | `PUT` | `backend/app/api/endpoints/model.py` | `Router` | 更新模型信息 | `{"model_name": "更新YOLOv8布车检测模型", "description": "优化检测精度"}` | `{"code": 200, "message": "success", "data": {"model_name": "更新YOLOv8布车检测模型", "description": "优化检测精度"}}` |
| `/api/v1/models/{model_name}` | `DELETE` | `backend/app/api/endpoints/model.py` | `Router` | 删除模型 | N/A | `{"code": 204, "message": "success", "data": null}` |
| `/api/v1/models/batch` | `POST` | `backend/app/api/endpoints/model.py` | `Router` | 批量上传模型 | `multipart/form-data: {"files": [<model_file1>, <model_file2>], "models_info": "[{\"model_name\":\"模型3\",\"description\":\"模型3描述\"}]"}` | `{"code": 200, "message": "success", "data": {"created_count": 2, "failed_count": 0}}` |

#### 3.4.2 模型类型管理

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/model-types` | `GET` | `backend/app/api/endpoints/model.py` | `Router` | 获取模型类型列表 | N/A | `{"code": 200, "message": "success", "data": {"items": [{"model_type": "vehicle", "name": "布车检测", "description": "检测车间布车"}, {"model_type": "people", "name": "人员检测", "description": "检测车间人员"}], "total": 5, "page": 1, "page_size": 10}}` |
| `/api/v1/model-types` | `POST` | `backend/app/api/endpoints/model.py` | `Router` | 添加模型类型 | `{"model_type": "danger", "name": "危险行为检测", "description": "检测危险行为"}` | `{"code": 201, "message": "success", "data": {"model_type": "danger", "name": "危险行为检测"}}` |
| `/api/v1/model-types/{model_type}` | `PUT` | `backend/app/api/endpoints/model.py` | `Router` | 更新模型类型 | `{"name": "更新危险行为检测", "description": "更新检测范围"}` | `{"code": 200, "message": "success", "data": {"model_type": "danger", "name": "更新危险行为检测"}}` |
| `/api/v1/model-types/{model_type}` | `DELETE` | `backend/app/api/endpoints/model.py` | `Router` | 删除模型类型 | N/A | `{"code": 204, "message": "success", "data": null}` |

#### 3.4.3 模型版本管理

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/models/{model_id}/versions` | `GET` | `backend/app/api/endpoints/model.py` | `Router` | 获取模型版本列表 | N/A | `{"items": [{"model_id": "MODEL001", "model_version": "v1.0.0", "model_path": "/models/yolov8_vehicle_v1.0.0.pt", "status": "active", "create_time": "2024-01-01T00:00:00Z"}], "total": 3, "page": 1, "page_size": 10}` |
| `/api/v1/models/{model_id}/versions` | `POST` | `backend/app/api/endpoints/model.py` | `Router` | 上传新版本模型 | `multipart/form-data: {"file": <model_file>, "model_version": "v1.0.1", "description": "优化检测性能"}` | `{"model_id": "MODEL001", "model_version": "v1.0.1", "model_path": "/models/yolov8_vehicle_v1.0.1.pt"}` |
| `/api/v1/models/{model_id}/versions/{model_version}` | `GET` | `backend/app/api/endpoints/model.py` | `Router` | 获取模型版本详情 | N/A | `{"model_id": "MODEL001", "model_version": "v1.0.0", "model_path": "/models/yolov8_vehicle_v1.0.0.pt", "description": "初始版本", "create_time": "2024-01-01T00:00:00Z"}` |
| `/api/v1/models/{model_id}/versions/{model_version}` | `DELETE` | `backend/app/api/endpoints/model.py` | `Router` | 删除模型版本 | N/A | `{"message": "success"}` |

### 3.5 检测相关模块

#### 3.5.1 布车检测

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/detection/vehicle` | `GET` | `backend/app/api/endpoints/detection.py` | `Router` | 获取布车检测列表 | N/A | `{"items": [{"detection_id": "DET001", "camera_id": "CAM001", "vehicle_id": "V001", "vehicle_type": "cart", "location": "{\"x\": 450, \"y\": 320}", "confidence": 0.95, "detect_time": "2024-01-01T00:00:00Z", "status": "normal", "area_no": 1, "machine_id": "M001"}], "total": 100, "page": 1, "page_size": 10}` |
| `/api/v1/detection/vehicle/search` | `POST` | `backend/app/api/endpoints/detection.py` | `Router` | 搜索特定布车 | `{"vehicle_id": "V001"}` | `{"vehicle_id": "V001", "status": "normal", "location": "{\"x\": 450, \"y\": 320}", "last_seen": "2024-01-01T00:00:00Z", "camera_id": "CAM001", "area_no": 1, "machine_id": "M001"}` |
| `/api/v1/detection/vehicle/stats` | `GET` | `backend/app/api/endpoints/detection.py` | `Router` | 获取布车统计信息 | N/A | `{"total_vehicles": 50, "normal_vehicles": 48, "abnormal_vehicles": 2, "vehicle_types": [{"type": "cart", "count": 30}, {"type": "truck", "count": 20}]}` |
| `/api/v1/detection/vehicle/realtime` | `GET` | `backend/app/api/endpoints/detection.py` | `Router` | 获取实时布车状态 | N/A | `{"camera_id": "CAM001", "vehicles": [{"vehicle_id": "V001", "type": "cart", "location": "{\"x\": 450, \"y\": 320}", "confidence": 0.95, "time": "2024-01-01T00:00:00Z"}], "total_count": 5}` |

#### 3.5.2 脱岗检测

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/detection/off-duty` | `GET` | `backend/app/api/endpoints/detection.py` | `Router` | 获取脱岗记录 | N/A | `{"items": [{"detection_id": "DET002", "camera_id": "CAM002", "machine_id": "M001", "area_no": 1, "off_duty_time": "2024-01-01T00:00:00Z", "restore_time": "2024-01-01T00:10:00Z", "duration": 600, "status": "processed", "severity": "medium"}], "total": 30, "page": 1, "page_size": 10}` |
| `/api/v1/detection/off-duty/current` | `GET` | `backend/app/api/endpoints/detection.py` | `Router` | 获取当前脱岗状态 | N/A | `{"items": [{"detection_id": "DET003", "camera_id": "CAM002", "machine_id": "M001", "area_no": 1, "off_duty_time": "2024-01-01T00:00:00Z", "duration": 300, "status": "unprocessed", "severity": "high"}], "total_count": 5}` |
| `/api/v1/detection/off-duty/acknowledge` | `POST` | `backend/app/api/endpoints/detection.py` | `Router` | 确认脱岗事件 | `{"detection_id": "DET002", "handler_id": "ADMIN001", "remark": "已通知相关人员"}` | `{"detection_id": "DET002", "status": "acknowledged", "acknowledged_at": "2024-01-01T00:11:00Z"}` |

#### 3.5.3 换车检测

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/detection/change` | `GET` | `backend/app/api/endpoints/detection.py` | `Router` | 获取换车记录 | N/A | `{"items": [{"detection_id": "DET004", "camera_id": "CAM003", "machine_id": "M001", "area_no": 1, "old_vehicle_id": "V001", "new_vehicle_id": "V002", "change_time": "2024-01-01T00:00:00Z", "status": "completed", "duration": 300}], "total": 50, "page": 1, "page_size": 10}` |
| `/api/v1/detection/change/latest` | `GET` | `backend/app/api/endpoints/detection.py` | `Router` | 获取最新换车信息 | N/A | `{"detection_id": "DET004", "camera_id": "CAM003", "machine_id": "M001", "old_vehicle_id": "V001", "new_vehicle_id": "V002", "change_time": "2024-01-01T00:00:00Z", "material_info": "{\"batch\": \"B001\", \"weight\": 200}"}` |
| `/api/v1/detection/change/{detection_id}` | `GET` | `backend/app/api/endpoints/detection.py` | `Router` | 获取换车详细过程 | N/A | `{"detection_id": "DET004", "camera_id": "CAM003", "machine_id": "M001", "area_no": 1, "old_vehicle_id": "V001", "new_vehicle_id": "V002", "change_time": "2024-01-01T00:00:00Z", "steps": [{"step": "old_vehicle_arrival", "time": "2024-01-01T00:00:00Z"}, {"step": "old_vehicle_departure", "time": "2024-01-01T00:03:00Z"}, {"step": "new_vehicle_arrival", "time": "2024-01-01T00:04:00Z"}, {"step": "change_completed", "time": "2024-01-01T00:05:00Z"}]}` |

#### 3.5.4 危险区域检测

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/detection/danger` | `GET` | `backend/app/api/endpoints/detection.py` | `Router` | 获取危险区域检测记录 | N/A | `{"items": [{"detection_id": "DET005", "camera_id": "CAM004", "area_no": 1, "person_info": "{\"person_id\": \"P001\", \"confidence\": 0.92}", "detection_time": "2024-01-01T00:00:00Z", "duration": 120, "status": "processed", "severity": "high"}], "total": 20, "page": 1, "page_size": 10}` |
| `/api/v1/detection/danger/current` | `GET` | `backend/app/api/endpoints/detection.py` | `Router` | 获取当前危险区域状态 | N/A | `{"items": [{"detection_id": "DET006", "camera_id": "CAM004", "area_no": 1, "is_occupied": true, "occupant_count": 1, "duration": 60, "severity": "critical"}], "total_occupied": 2}` |
| `/api/v1/detection/danger/alerts` | `GET` | `backend/app/api/endpoints/detection.py` | `Router` | 获取实时危险区域警报 | N/A | `{"items": [{"detection_id": "DET007", "camera_id": "CAM004", "area_no": 1, "alert_time": "2024-01-01T00:00:00Z", "duration": 60, "status": "unprocessed", "severity": "critical"}], "total": 3, "page": 1, "page_size": 10}` |

#### 3.5.5 通道出入检测

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/detection/channel` | `GET` | `backend/app/api/endpoints/detection.py` | `Router` | 获取通道出入记录 | N/A | `{"items": [{"detection_id": "DET008", "camera_id": "CAM005", "channel_id": "CH001", "vehicle_id": "V001", "direction": "enter", "enter_time": "2024-01-01T00:00:00Z", "exit_time": "2024-01-01T00:05:00Z", "duration": 300}], "total": 200, "page": 1, "page_size": 10}` |
| `/api/v1/detection/channel/stats` | `GET` | `backend/app/api/endpoints/detection.py` | `Router` | 获取通道统计信息 | N/A | `{"total_entries": 150, "total_exits": 145, "current_vehicles": 5, "channels": [{"channel_id": "CH001", "name": "主通道", "entries": 100, "exits": 95}]}` |
| `/api/v1/detection/channel/alerts` | `GET` | `backend/app/api/endpoints/detection.py` | `Router` | 获取通道异常警报 | N/A | `{"items": [{"detection_id": "DET009", "camera_id": "CAM005", "channel_id": "CH001", "alert_type": "congestion", "alert_time": "2024-01-01T00:00:00Z", "status": "unprocessed", "severity": "high"}], "total": 10, "page": 1, "page_size": 10}` |

### 3.6 事件和视频查询模块

#### 3.6.1 事件查询

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/events` | `GET` | `backend/app/api/endpoints/event.py` | `Router` | 获取事件列表（支持筛选） | N/A（查询参数：?event_type=off_duty&start_time=2024-01-01&end_time=2024-01-02&severity=high&page=1&page_size=10） | `{"code": 200, "message": "success", "data": {"items": [{"event_id": "EVT20240101001", "event_type": "off_duty", "event_title": "机台1脱岗警报", "event_desc": "操作区域无人值守超过3分钟", "camera_id": "CAM001", "area_no": 1, "machine_id": "M001", "severity": "high", "status": "unprocessed", "create_time": "2024-01-01T00:00:00Z", "update_time": "2024-01-01T00:00:00Z"}], "total": 150, "page": 1, "page_size": 10}}` |
| `/api/v1/events/{event_id}` | `GET` | `backend/app/api/endpoints/event.py` | `Router` | 获取事件详情 | N/A | `{"code": 200, "message": "success", "data": {"event_id": "EVT20240101001", "event_type": "off_duty", "event_title": "机台1脱岗警报", "event_desc": "操作区域无人值守超过3分钟", "camera_id": "CAM001", "area_no": 1, "machine_id": "M001", "severity": "high", "status": "unprocessed", "related_data": "{\"detection_id\": \"DET001\", \"duration\": 180}", "create_time": "2024-01-01T00:00:00Z", "update_time": "2024-01-01T00:00:00Z", "handler_id": null, "remark": null}}` |
| `/api/v1/events/{event_id}` | `PUT` | `backend/app/api/endpoints/event.py` | `Router` | 更新事件状态 | `{"status": "processed", "handler_id": "ADMIN001", "remark": "已处理"}` | `{"code": 200, "message": "success", "data": {"event_id": "EVT20240101001", "status": "processed", "update_time": "2024-01-01T10:10:00Z", "handler_id": "ADMIN001", "remark": "已处理"}}` |
| `/api/v1/events/stats` | `GET` | `backend/app/api/endpoints/event.py` | `Router` | 获取事件统计数据 | N/A（查询参数：?period=daily&start_date=2024-01-01&end_date=2024-01-31） | `{"code": 200, "message": "success", "data": {"total": 150, "by_type": {"off_duty": 80, "danger_zone": 40, "smoke_fire": 30}, "by_status": {"unprocessed": 50, "processing": 30, "processed": 70}, "by_severity": {"high": 40, "medium": 80, "low": 30}}}` |
| `/api/v1/events/export` | `GET` | `backend/app/api/endpoints/event.py` | `Router` | 导出事件记录 | N/A（查询参数：?format=excel&event_type=all&start_time=2024-01-01&end_time=2024-01-31） | `[Excel文件下载]` |
| `/api/v1/events/types` | `GET` | `backend/app/api/endpoints/event.py` | `Router` | 获取事件类型列表 | N/A | `{"code": 200, "message": "success", "data": [{"event_type": "off_duty", "type_name": "脱岗事件"}, {"event_type": "danger_zone", "type_name": "危险区域入侵"}, {"event_type": "smoke_fire", "type_name": "烟火检测"}]}` |
| `/api/v1/events/batch/process` | `POST` | `backend/app/api/endpoints/event.py` | `Router` | 批量处理事件 | `{"event_ids": ["EVT20240101001", "EVT20240101002"], "status": "processed", "handler_id": "ADMIN001", "remark": "批量处理"}` | `{"code": 200, "message": "批量处理成功", "data": {"processed_count": 2}}` |

#### 3.6.2 视频查询

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/videos/cameras` | `GET` | `backend/app/api/endpoints/video.py` | `Router` | 获取摄像头列表 | N/A | `{"items": [{"id": 1, "name": "机台1摄像头", "location": "A区", "status": "online", "stream_url": "/api/v1/videos/stream/1", "resolution": "1080p"}], "total": 50, "page": 1, "page_size": 10}` |
| `/api/v1/videos/stream/{camera_id}` | `GET` | `backend/app/api/endpoints/video.py` | `Router` | 获取实时视频流 | N/A | `[HLS/DASH视频流数据]` |
| `/api/v1/videos/playback/{camera_id}` | `GET` | `backend/app/api/endpoints/video.py` | `Router` | 获取历史视频回放 | N/A（查询参数：?start_time=2024-01-01T10:00:00Z&end_time=2024-01-01T11:00:00Z） | `{"playback_url": "/api/v1/videos/playback/1/stream.m3u8", "available_segments": [{"start": "2024-01-01T10:00:00Z", "end": "2024-01-01T10:05:00Z", "duration": 300}]}` |
| `/api/v1/videos/snapshot/{camera_id}` | `GET` | `backend/app/api/endpoints/video.py` | `Router` | 获取摄像头快照 | N/A | `[JPEG/PNG图像数据]` |
| `/api/v1/videos/recordings` | `GET` | `backend/app/api/endpoints/video.py` | `Router` | 查询录像文件列表 | N/A（查询参数：?camera_id=1&start_date=2024-01-01&end_date=2024-01-02） | `{"items": [{"id": 1, "camera_id": 1, "camera_name": "机台1摄像头", "start_time": "2024-01-01T10:00:00Z", "end_time": "2024-01-01T11:00:00Z", "duration": 3600, "size_mb": 150, "download_url": "/api/v1/videos/recordings/1/download"}], "total": 24, "page": 1, "page_size": 10}` |
| `/api/v1/videos/recordings/{id}/download` | `GET` | `backend/app/api/endpoints/video.py` | `Router` | 下载录像文件 | N/A | `[MP4视频文件下载]` |
| `/api/v1/videos/layouts` | `GET` | `backend/app/api/endpoints/video.py` | `Router` | 获取视频布局配置 | N/A | `[{"id": 1, "name": "4分屏布局", "columns": 2, "rows": 2, "cameras": [1, 2, 3, 4]}, {"id": 2, "name": "9分屏布局", "columns": 3, "rows": 3, "cameras": [1, 2, 3, 4, 5, 6, 7, 8, 9]}]` |
| `/api/v1/videos/layouts` | `POST` | `backend/app/api/endpoints/video.py` | `Router` | 创建视频布局 | `{"name": "自定义布局", "columns": 2, "rows": 2, "cameras": [1, 3, 5, 7]}` | `{"id": 3, "name": "自定义布局", "columns": 2, "rows": 2, "cameras": [1, 3, 5, 7]}` |
| `/api/v1/videos/ptz/{camera_id}/control` | `POST` | `backend/app/api/endpoints/video.py` | `Router` | 控制摄像头PTZ | `{"action": "pan", "direction": "right", "speed": 50}` | `{"camera_id": 1, "action": "pan", "direction": "right", "status": "success"}` |

### 3.7 WebSocket和MQTT接口设计

#### 3.7.1 WebSocket接口

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 消息格式 | 示例消息 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/ws/monitor` | `WebSocket` | `backend/app/api/endpoints/websocket.py` | `WebSocket` | 实时监控数据推送 | 客户端订阅: `{"type": "subscribe", "channels": ["car_distribution", "events", "alarms"]}`<br>服务器推送: `{"type": "update", "channel": "car_distribution", "data": {...}}` | 订阅消息: `{"type": "subscribe", "channels": ["car_distribution", "events"]}`<br>推送消息: `{"type": "update", "channel": "events", "data": {"id": 101, "type": "off_duty", "title": "新脱岗警报", "severity": "high", "timestamp": "2024-01-01T10:30:00Z"}}` |
| `/ws/events` | `WebSocket` | `backend/app/api/endpoints/websocket.py` | `WebSocket` | 实时事件通知 | 客户端: N/A<br>服务器推送: `{"event_type": "new_event", "data": {...}}` | 推送消息: `{"event_type": "new_event", "data": {"id": 101, "type": "danger_zone", "location": "高压危险区", "severity": "critical", "timestamp": "2024-01-01T10:30:00Z"}}` |
| `/ws/detection/{camera_id}` | `WebSocket` | `backend/app/api/endpoints/websocket.py` | `WebSocket` | 实时检测结果推送 | 客户端: N/A<br>服务器推送: `{"type": "detection_result", "camera_id": 1, "objects": [...], "timestamp": "2024-01-01T10:30:00Z"}` | 推送消息: `{"type": "detection_result", "camera_id": 1, "objects": [{"id": 1, "type": "car", "car_id": "C001", "status": "loaded", "confidence": 0.95, "bounding_box": {"x1": 100, "y1": 100, "x2": 200, "y2": 200}}], "timestamp": "2024-01-01T10:30:00Z"}` |
| `/ws/command` | `WebSocket` | `backend/app/api/endpoints/websocket.py` | `WebSocket` | 双向命令控制通道 | 客户端发送: `{"command": "control_ptz", "camera_id": 1, "params": {...}}`<br>服务器响应: `{"command": "control_ptz", "status": "success", "message": "PTZ control executed"}` | 客户端命令: `{"command": "control_ptz", "camera_id": 1, "params": {"action": "pan", "direction": "left", "speed": 30}}`<br>服务器响应: `{"command": "control_ptz", "status": "success", "message": "PTZ control executed"}` |

#### 3.7.2 MQTT接口

| 主题路径 | QoS | 方向 | 功能描述 | 消息格式 | 示例消息 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `tks/mes/car-change` | 2 | 发布 | 落布换车信息推送至MES | `{"message_id": "MSG001", "machine_id": 1, "old_car_id": "C001", "new_car_id": "C002", "change_time": "2024-01-01T10:30:00Z", "material_info": {"batch": "B001", "weight": 200}}` | `{"message_id": "MSG001", "machine_id": 1, "old_car_id": "C001", "new_car_id": "C002", "change_time": "2024-01-01T10:30:00Z", "material_info": {"batch": "B001", "weight": 200}, "timestamp": "2024-01-01T10:30:01Z"}` |
| `tks/mes/heartbeat` | 1 | 发布 | 系统心跳消息 | `{"status": "online", "timestamp": "2024-01-01T10:30:00Z", "version": "1.0.0"}` | `{"status": "online", "timestamp": "2024-01-01T10:30:00Z", "version": "1.0.0", "services": {"detection": "active", "recognition": "active"}}` |
| `tks/mes/command/#` | 2 | 订阅 | 接收MES指令 | `{"command": "sync_machine_status", "params": {...}, "message_id": "CMD001"}` | `{"command": "sync_machine_status", "params": {"machine_id": 1, "status": "running", "batch": "B001"}, "message_id": "CMD001", "timestamp": "2024-01-01T10:30:00Z"}` |
| `tks/alerts/emergency` | 2 | 发布 | 紧急告警推送 | `{"alert_id": "ALERT001", "type": "danger_zone", "area_id": 1, "area_name": "高压危险区", "severity": "critical", "message": "检测到人员入侵高压危险区", "timestamp": "2024-01-01T10:30:00Z"}` | `{"alert_id": "ALERT001", "type": "danger_zone", "area_id": 1, "area_name": "高压危险区", "severity": "critical", "message": "检测到人员入侵高压危险区", "timestamp": "2024-01-01T10:30:00Z", "camera_id": 5}` |
| `tks/data/car-distribution` | 1 | 发布 | 布车分布数据 | `{"timestamp": "2024-01-01T10:30:00Z", "data": [{"car_id": "C001", "status": "loaded", "location": {"x": 120, "y": 150, "zone": "A区"}}], "total_count": 50}` | `{"timestamp": "2024-01-01T10:30:00Z", "data": [{"car_id": "C001", "status": "loaded", "location": {"x": 120, "y": 150, "zone": "A区"}}], "total_count": 50, "loaded_count": 35, "empty_count": 15}` |
| `tks/commands/response` | 1 | 发布 | 命令执行响应 | `{"message_id": "CMD001", "status": "success", "result": {...}, "timestamp": "2024-01-01T10:30:01Z"}` | `{"message_id": "CMD001", "status": "success", "result": {"sync_completed": true, "updated_machines": 1}, "timestamp": "2024-01-01T10:30:01Z"}` |

#### 3.7.3 实时通信配置

| 接口路径 | 方法 | 模块/文件 | 类型 | 功能描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/websocket/config` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取WebSocket配置 | N/A | `{"url": "ws://localhost:8000/ws", "reconnect_interval": 5000, "max_reconnect_attempts": 5}` |
| `/api/v1/mqtt/config` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取MQTT配置信息 | N/A | `{"broker": "192.168.1.200", "port": 1883, "username": "tks_client", "topics": ["tks/mes/car-change", "tks/alerts/emergency"]}` |
| `/api/v1/mqtt/health` | `GET` | `backend/app/api/endpoints/system.py` | `Router` | 获取MQTT连接状态 | N/A | `{"status": "connected", "last_message_time": "2024-01-01T10:30:00Z", "message_count": 1500}` |

---

## 4. 实时通信接口

### 4.1 WebSocket接口
- 连接地址: `ws://localhost:8000/ws/detection`
- 支持的事件类型:
  - `detection_update`: 检测数据更新
  - `alarm_triggered`: 告警触发
  - `camera_status`: 摄像头状态变化

### 4.2 MQTT通信
- 主题: `tks/+/+` (如 `tks/detection/cloth_car`)
- QoS: 1
- 客户端ID: 设备唯一标识

## 5. 数据模型定义

## 6. 接口安全

## 7. 接口性能考虑

## 8. 附录

---

*注: 本文档将根据项目开发进度不断更新和完善。*