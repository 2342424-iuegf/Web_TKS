# Web_TKS 项目结构文档

## 项目概述
Web_TKS是一个PC端Web应用，基于前后端分离架构设计。该项目主要用于布车监测、安全检测、视频监控等功能，支持与MES系统集成。

## 完整目录结构

```
Web_TKS/
├── backend/                     # 后端FastAPI应用
│   ├── .cursorrules             # Cursor编辑器规则配置
│   ├── .env.example             # 环境变量示例文件
│   ├── .gitignore               # Git忽略文件配置
│   ├── LICENSE                  # 许可证文件
│   ├── README.md                # 项目说明文档
│   ├── alembic.ini              # Alembic配置文件（新建）
│   ├── app/                     # 应用主目录
│   │   ├── __init__.py          # 应用初始化文件
│   │   ├── api/                 # API接口层
│   │   │   ├── __init__.py      # API包初始化
│   │   │   ├── deps.py          # API依赖注入定义
│   │   │   ├── endpoints/       # API端点目录
│   │   │   │   ├── __init__.py  # endpoints包初始化
│   │   │   │   ├── user.py      # 用户相关API端点（登录、注册、用户信息管理）
│   │   │   │   ├── system.py    # 系统管理API端点（参数设置、摄像头管理、事件推送设置）（新建）
│   │   │   │   ├── area.py      # 检测区域设置API端点（新建）
│   │   │   │   ├── model.py     # 模型管理API端点（新建）
│   │   │   │   ├── detection.py # 检测相关API端点（布车、通道、换车、脱岗、危险检测）（新建）
│   │   │   │   ├── event.py     # 事件查询API端点（新建）
│   │   │   │   └── video.py     # 视频查询API端点（新建）
│   │   │   ├── middlewares/     # 中间件目录
│   │   │   │   ├── __init__.py  # middlewares包初始化
│   │   │   │   ├── exception.py # 全局异常处理中间件
│   │   │   │   ├── logging.py   # 请求日志记录中间件
│   │   │   │   ├── response.py  # 统一响应格式中间件
│   │   │   │   └── security.py  # 安全相关中间件
│   │   │   └── router.py        # 主路由配置
│   │   ├── core/                # 核心配置和功能
│   │   │   ├── __init__.py      # core包初始化
│   │   │   ├── config.py        # 应用配置管理
│   │   │   ├── events.py        # 应用启动和关闭事件处理
│   │   │   ├── security.py      # 核心安全功能（密码处理、令牌验证等）
│   │   │   └── websocket.py     # WebSocket配置（新建）
│   │   ├── db/                  # 数据库相关
│   │   │   ├── __init__.py      # db包初始化
│   │   │   ├── base.py          # 数据库基类和表定义
│   │   │   ├── repositories/    # 数据仓库模式实现
│   │   │   │   ├── __init__.py  # repositories包初始化
│   │   │   │   ├── user.py      # 用户仓库（新建）
│   │   │   │   ├── system.py    # 系统设置仓库（新建）
│   │   │   │   ├── area.py      # 检测区域仓库（新建）
│   │   │   │   ├── model.py     # 模型仓库（新建）
│   │   │   │   ├── detection.py # 检测数据仓库（新建）
│   │   │   │   ├── event.py     # 事件仓库（新建）
│   │   │   │   └── video.py     # 视频仓库（新建）
│   │   │   └── session.py       # 数据库会话管理
│   │   ├── exceptions/          # 异常定义
│   │   │   ├── __init__.py      # exceptions包初始化（新建）
│   │   │   ├── base.py          # 基础异常类定义
│   │   │   ├── api.py           # API异常类定义（新建）
│   │   │   └── validation.py    # 验证异常类定义（新建）
│   │   ├── models/              # 数据模型
│   │   │   ├── __init__.py      # models包初始化
│   │   │   ├── user.py          # 用户数据模型定义
│   │   │   ├── system.py        # 系统设置数据模型（摄像头、参数设置等）（新建）
│   │   │   ├── area.py          # 检测区域数据模型（新建）
│   │   │   ├── model.py         # AI模型数据模型（新建）
│   │   │   ├── detection.py     # 检测数据模型（新建）
│   │   │   ├── event.py         # 事件数据模型（新建）
│   │   │   └── video.py         # 视频数据模型（新建）
│   │   ├── schemas/             # 数据验证模型
│   │   │   ├── __init__.py      # schemas包初始化
│   │   │   ├── error.py         # 错误响应模型
│   │   │   ├── token.py         # 令牌相关模型（JWT令牌定义）
│   │   │   ├── user.py          # 用户相关模型（请求/响应格式）
│   │   │   ├── system.py        # 系统设置相关模型（新建）
│   │   │   ├── area.py          # 检测区域相关模型（新建）
│   │   │   ├── model.py         # 模型相关模型（新建）
│   │   │   ├── detection.py     # 检测相关模型（新建）
│   │   │   ├── event.py         # 事件相关模型（新建）
│   │   │   └── video.py         # 视频相关模型（新建）
│   │   ├── services/            # 业务逻辑层
│   │   │   ├── __init__.py      # services包初始化
│   │   │   ├── auth.py          # 认证服务（登录验证、令牌生成等）
│   │   │   ├── system.py        # 系统管理服务（新建）
│   │   │   ├── area.py          # 区域管理服务（新建）
│   │   │   ├── model.py         # 模型管理服务（新建）
│   │   │   ├── detection.py     # 检测服务（新建）
│   │   │   ├── event.py         # 事件服务（新建）
│   │   │   ├── video.py         # 视频服务（新建）
│   │   │   ├── mqtt.py          # MQTT通信服务（新建）
│   │   │   └── ai.py            # AI模型调用服务（新建）
│   │   ├── tests/               # 测试代码
│   │   │   ├── __init__.py      # tests包初始化
│   │   │   ├── conftest.py      # 测试配置（新建）
│   │   │   ├── test_api/        # API测试（新建）
│   │   │   └── test_services/   # 服务测试（新建）
│   │   └── utils/               # 工具函数
│   │       ├── __init__.py      # utils包初始化
│   │       ├── deps.py          # 通用依赖函数
│   │       ├── logger.py        # 日志工具
│   │       ├── security.py      # 安全相关工具函数（密码哈希、令牌验证等）
│   │       ├── file.py          # 文件处理工具（新建）
│   │       ├── image.py         # 图像处理工具（新建）
│   │       └── mqtt_client.py   # MQTT客户端工具（新建）
│   ├── alembic/                 # 数据库迁移脚本目录（新建）
│   │   ├── env.py               # Alembic环境配置（新建）
│   │   ├── script.py.mako       # 迁移脚本模板（新建）
│   │   └── versions/            # 迁移版本目录（新建）
│   ├── main.py                  # 应用入口文件，初始化FastAPI应用
│   ├── requirements.txt         # Python依赖包列表
│   └── scripts/                 # 脚本目录
│       ├── alembic_upgrade.bat  # Windows环境数据库迁移脚本
│       ├── alembic_upgrade.sh   # Linux/Mac环境数据库迁移脚本
│       └── start_app.sh         # 应用启动脚本（新建）
├── front/                       # 前端React应用
│   ├── public/                  # 静态资源文件
│   │   ├── favicon.ico          # 网站图标
│   │   └── index.html           # HTML模板
│   ├── src/                     # 源代码目录
│   │   ├── api/                 # API接口定义
│   │   │   ├── auth.ts          # 认证相关API
│   │   │   ├── system.ts        # 系统管理API
│   │   │   ├── detection.ts     # 检测相关API
│   │   │   ├── model.ts         # 模型管理API
│   │   │   ├── event.ts         # 事件查询API
│   │   │   └── video.ts         # 视频相关API
│   │   ├── assets/              # 图片、图标等资源
│   │   ├── components/          # 通用组件
│   │   │   ├── common/          # 基础通用组件
│   │   │   │   ├── Button.tsx   # 自定义按钮组件
│   │   │   │   ├── Table.tsx    # 自定义表格组件
│   │   │   │   ├── Modal.tsx    # 自定义模态框组件
│   │   │   │   └── Form.tsx     # 自定义表单组件
│   │   │   ├── layout/          # 布局组件
│   │   │   │   ├── Header.tsx   # 顶部导航组件
│   │   │   │   ├── Sider.tsx    # 侧边栏组件
│   │   │   │   └── Main.tsx     # 主内容区域组件
│   │   │   └── visualization/   # 可视化组件
│   │   │       ├── Map.tsx      # 地图可视化组件
│   │   │       ├── VideoPlayer.tsx # 视频播放器组件
│   │   │       └── Chart.tsx    # 图表组件
│   │   ├── hooks/               # 自定义React钩子
│   │   │   ├── useAuth.ts       # 认证相关钩子
│   │   │   ├── useWebSocket.ts  # WebSocket连接钩子
│   │   │   └── usePermission.ts # 权限检查钩子
│   │   ├── layouts/             # 页面布局
│   │   │   ├── BasicLayout.tsx  # 基础布局
│   │   │   └── LoginLayout.tsx  # 登录页面布局
│   │   ├── locales/             # 国际化配置
│   │   ├── pages/               # 页面组件
│   │   │   ├── login/           # 登录页面
│   │   │   ├── system/          # 系统管理模块
│   │   │   │   ├── UserManagement.tsx # 用户管理页面
│   │   │   │   ├── RoleManagement.tsx # 权限管理页面
│   │   │   │   ├── ParameterSetting.tsx # 参数设置页面
│   │   │   │   ├── CameraManagement.tsx # 摄像头管理页面
│   │   │   │   └── EventPushSetting.tsx # 事件推送设置页面
│   │   │   ├── detection/       # 检测区域设置模块
│   │   │   │   ├── CarExchangeArea.tsx # 机台-换车区域设置页面
│   │   │   │   ├── OffDutyArea.tsx # 机台-脱岗区域设置页面
│   │   │   │   └── DangerArea.tsx # 危险区域设置页面
│   │   │   ├── model/           # 模型管理模块
│   │   │   │   └── ModelManagement.tsx # 布车、脱岗等模型文件管理页面
│   │   │   ├── clothCar/        # 布车分布检测模块
│   │   │   │   ├── ClothCarMonitoring.tsx # 布车分布监测页面
│   │   │   │   └── ClothCarSearch.tsx # 布车搜索定位页面
│   │   │   ├── channel/         # 通道出入检测模块
│   │   │   │   └── ChannelDetection.tsx # 通道布车出入监测页面
│   │   │   ├── clothChange/     # 落布换车检测模块
│   │   │   │   └── ClothChangeDetection.tsx # 落布换车检测页面
│   │   │   ├── offDuty/         # 脱岗检测模块
│   │   │   │   └── OffDutyDetection.tsx # 脱岗检测页面
│   │   │   ├── danger/          # 危险检测模块
│   │   │   │   └── DangerDetection.tsx # 危险区域检测页面
│   │   │   ├── event/           # 事件查询模块
│   │   │   │   └── EventQuery.tsx # 事件查询页面
│   │   │   └── video/           # 视频查询模块
│   │   │       ├── LiveVideo.tsx # 实时视频页面
│   │   │       └── VideoPlayback.tsx # 视频回放页面
│   │   ├── services/            # 业务逻辑服务
│   │   │   ├── authService.ts   # 认证服务
│   │   │   ├── systemService.ts # 系统管理服务
│   │   │   ├── detectionService.ts # 检测服务
│   │   │   └── mqttService.ts   # MQTT通信服务
│   │   ├── store/               # 状态管理
│   │   │   ├── index.ts         # Store入口
│   │   │   ├── slices/          # Redux切片
│   │   │   │   ├── authSlice.ts # 认证状态
│   │   │   │   ├── systemSlice.ts # 系统设置状态
│   │   │   │   └── detectionSlice.ts # 检测数据状态
│   │   │   └── hooks.ts         # Redux Hooks
│   │   ├── styles/              # 全局样式
│   │   │   ├── theme.ts         # 主题配置
│   │   │   ├── global.less      # 全局样式文件
│   │   │   └── mixins.less      # 样式混合
│   │   ├── types/               # TypeScript类型定义
│   │   │   ├── system.ts        # 系统相关类型
│   │   │   ├── detection.ts     # 检测相关类型
│   │   │   └── common.ts        # 通用类型
│   │   ├── utils/               # 工具函数
│   │   │   ├── request.ts       # API请求封装
│   │   │   ├── storage.ts       # 本地存储封装
│   │   │   └── date.ts          # 日期处理工具
│   │   ├── App.tsx              # 应用根组件
│   │   ├── main.tsx             # 应用入口文件
│   │   └── routes.tsx           # 路由配置
│   ├── .eslintrc.js             # ESLint配置
│   ├── .prettierrc              # Prettier配置
│   ├── tsconfig.json            # TypeScript配置
│   ├── vite.config.ts           # Vite构建配置
│   └── package.json             # 项目依赖配置
└── project_structure.md         # 项目结构文档
```

## 文件功能说明

| 文件路径 | 功能说明 |
|---------|--------|
| backend/main.py | 应用入口文件，初始化FastAPI应用 |
| backend/requirements.txt | Python依赖包列表 |
| backend/.env.example | 环境变量示例文件 |
| backend/.gitignore | Git忽略文件配置 |
| backend/LICENSE | 许可证文件 |
| backend/README.md | 项目说明文档 |
| backend/.cursorrules | Cursor编辑器规则配置 |
| backend/alembic.ini | Alembic配置文件（新建） |
| backend/app/__init__.py | 应用初始化文件 |
| backend/app/api/__init__.py | API包初始化 |
| backend/app/api/deps.py | API依赖注入定义 |
| backend/app/api/router.py | 主路由配置 |
| backend/app/api/endpoints/__init__.py | endpoints包初始化 |
| backend/app/api/endpoints/user.py | 用户相关API端点（登录、注册、用户信息管理） |
| backend/app/api/endpoints/system.py | 系统管理API端点（参数设置、摄像头管理、事件推送设置）（新建） |
| backend/app/api/endpoints/area.py | 检测区域设置API端点（新建） |
| backend/app/api/endpoints/model.py | 模型管理API端点（新建） |
| backend/app/api/endpoints/detection.py | 检测相关API端点（布车、通道、换车、脱岗、危险检测）（新建） |
| backend/app/api/endpoints/event.py | 事件查询API端点（新建） |
| backend/app/api/endpoints/video.py | 视频查询API端点（新建） |
| backend/app/api/middlewares/__init__.py | middlewares包初始化 |
| backend/app/api/middlewares/exception.py | 全局异常处理中间件 |
| backend/app/api/middlewares/logging.py | 请求日志记录中间件 |
| backend/app/api/middlewares/response.py | 统一响应格式中间件 |
| backend/app/api/middlewares/security.py | 安全相关中间件 |
| backend/app/core/__init__.py | core包初始化 |
| backend/app/core/config.py | 应用配置管理 |
| backend/app/core/events.py | 应用启动和关闭事件处理 |
| backend/app/core/security.py | 核心安全功能（密码处理、令牌验证等） |
| backend/app/core/websocket.py | WebSocket配置（新建） |
| backend/app/db/__init__.py | db包初始化 |
| backend/app/db/base.py | 数据库基类和表定义 |
| backend/app/db/session.py | 数据库会话管理 |
| backend/app/db/repositories/__init__.py | repositories包初始化 |
| backend/app/db/repositories/user.py | 用户仓库（新建） |
| backend/app/db/repositories/system.py | 系统设置仓库（新建） |
| backend/app/db/repositories/area.py | 检测区域仓库（新建） |
| backend/app/db/repositories/model.py | 模型仓库（新建） |
| backend/app/db/repositories/detection.py | 检测数据仓库（新建） |
| backend/app/db/repositories/event.py | 事件仓库（新建） |
| backend/app/db/repositories/video.py | 视频仓库（新建） |
| backend/app/exceptions/__init__.py | exceptions包初始化（新建） |
| backend/app/exceptions/base.py | 基础异常类定义 |
| backend/app/exceptions/api.py | API异常类定义（新建） |
| backend/app/exceptions/validation.py | 验证异常类定义（新建） |
| backend/app/models/__init__.py | models包初始化 |
| backend/app/models/user.py | 用户数据模型定义 |
| backend/app/models/system.py | 系统设置数据模型（摄像头、参数设置等）（新建） |
| backend/app/models/area.py | 检测区域数据模型（新建） |
| backend/app/models/model.py | AI模型数据模型（新建） |
| backend/app/models/detection.py | 检测数据模型（新建） |
| backend/app/models/event.py | 事件数据模型（新建） |
| backend/app/models/video.py | 视频数据模型（新建） |
| backend/app/schemas/__init__.py | schemas包初始化 |
| backend/app/schemas/error.py | 错误响应模型 |
| backend/app/schemas/token.py | 令牌相关模型（JWT令牌定义） |
| backend/app/schemas/user.py | 用户相关模型（请求/响应格式） |
| backend/app/schemas/system.py | 系统设置相关模型（新建） |
| backend/app/schemas/area.py | 检测区域相关模型（新建） |
| backend/app/schemas/model.py | 模型相关模型（新建） |
| backend/app/schemas/detection.py | 检测相关模型（新建） |
| backend/app/schemas/event.py | 事件相关模型（新建） |
| backend/app/schemas/video.py | 视频相关模型（新建） |
| backend/app/services/__init__.py | services包初始化 |
| backend/app/services/auth.py | 认证服务（登录验证、令牌生成等） |
| backend/app/services/system.py | 系统管理服务（新建） |
| backend/app/services/area.py | 区域管理服务（新建） |
| backend/app/services/model.py | 模型管理服务（新建） |
| backend/app/services/detection.py | 检测服务（新建） |
| backend/app/services/event.py | 事件服务（新建） |
| backend/app/services/video.py | 视频服务（新建） |
| backend/app/services/mqtt.py | MQTT通信服务（新建） |
| backend/app/services/ai.py | AI模型调用服务（新建） |
| backend/app/tests/__init__.py | tests包初始化 |
| backend/app/tests/conftest.py | 测试配置（新建） |
| backend/app/tests/test_api/ | API测试（新建） |
| backend/app/tests/test_services/ | 服务测试（新建） |
| backend/app/utils/__init__.py | utils包初始化 |
| backend/app/utils/deps.py | 通用依赖函数 |
| backend/app/utils/logger.py | 日志工具 |
| backend/app/utils/security.py | 安全相关工具函数（密码哈希、令牌验证等） |
| backend/app/utils/file.py | 文件处理工具（新建） |
| backend/app/utils/image.py | 图像处理工具（新建） |
| backend/app/utils/mqtt_client.py | MQTT客户端工具（新建） |
| backend/alembic/env.py | Alembic环境配置（新建） |
| backend/alembic/script.py.mako | 迁移脚本模板（新建） |
| backend/alembic/versions/ | 迁移版本目录（新建） |
| backend/scripts/alembic_upgrade.bat | Windows环境数据库迁移脚本 |
| backend/scripts/alembic_upgrade.sh | Linux/Mac环境数据库迁移脚本 |
| backend/scripts/start_app.sh | 应用启动脚本（新建） |
| front/public/favicon.ico | 网站图标 |
| front/public/index.html | HTML模板文件 |
| front/src/api/auth.ts | 认证相关API接口定义 |
| front/src/api/system.ts | 系统管理API接口定义 |
| front/src/api/detection.ts | 检测相关API接口定义 |
| front/src/api/model.ts | 模型管理API接口定义 |
| front/src/api/event.ts | 事件查询API接口定义 |
| front/src/api/video.ts | 视频相关API接口定义 |
| front/src/components/common/Button.tsx | 自定义按钮组件 |
| front/src/components/common/Table.tsx | 自定义表格组件 |
| front/src/components/common/Modal.tsx | 自定义模态框组件 |
| front/src/components/common/Form.tsx | 自定义表单组件 |
| front/src/components/layout/Header.tsx | 顶部导航组件 |
| front/src/components/layout/Sider.tsx | 侧边栏组件 |
| front/src/components/layout/Main.tsx | 主内容区域组件 |
| front/src/components/visualization/Map.tsx | 地图可视化组件 |
| front/src/components/visualization/VideoPlayer.tsx | 视频播放器组件 |
| front/src/components/visualization/Chart.tsx | 图表组件 |
| front/src/hooks/useAuth.ts | 认证相关自定义React钩子 |
| front/src/hooks/useWebSocket.ts | WebSocket连接自定义React钩子 |
| front/src/hooks/usePermission.ts | 权限检查自定义React钩子 |
| front/src/layouts/BasicLayout.tsx | 基础页面布局组件 |
| front/src/layouts/LoginLayout.tsx | 登录页面布局组件 |
| front/src/pages/login/index.tsx | 登录页面组件 |
| front/src/pages/system/UserManagement.tsx | 用户管理页面 |
| front/src/pages/system/RoleManagement.tsx | 权限管理页面 |
| front/src/pages/system/ParameterSetting.tsx | 参数设置页面 |
| front/src/pages/system/CameraManagement.tsx | 摄像头管理页面 |
| front/src/pages/system/EventPushSetting.tsx | 事件推送设置页面 |
| front/src/pages/detection/CarExchangeArea.tsx | 机台-换车区域设置页面 |
| front/src/pages/detection/OffDutyArea.tsx | 机台-脱岗区域设置页面 |
| front/src/pages/detection/DangerArea.tsx | 危险区域设置页面 |
| front/src/pages/model/ModelManagement.tsx | 布车、脱岗等模型文件管理页面 |
| front/src/pages/clothCar/ClothCarMonitoring.tsx | 布车分布监测页面 |
| front/src/pages/clothCar/ClothCarSearch.tsx | 布车搜索定位页面 |
| front/src/pages/channel/ChannelDetection.tsx | 通道布车出入监测页面 |
| front/src/pages/clothChange/ClothChangeDetection.tsx | 落布换车检测页面 |
| front/src/pages/offDuty/OffDutyDetection.tsx | 脱岗检测页面 |
| front/src/pages/danger/DangerDetection.tsx | 危险区域检测页面 |
| front/src/pages/event/EventQuery.tsx | 事件查询页面 |
| front/src/pages/video/LiveVideo.tsx | 实时视频页面 |
| front/src/pages/video/VideoPlayback.tsx | 视频回放页面 |
| front/src/services/authService.ts | 认证业务逻辑服务 |
| front/src/services/systemService.ts | 系统管理业务逻辑服务 |
| front/src/services/detectionService.ts | 检测业务逻辑服务 |
| front/src/services/mqttService.ts | MQTT通信服务 |
| front/src/store/index.ts | Redux Store入口文件 |
| front/src/store/slices/authSlice.ts | 认证状态管理切片 |
| front/src/store/slices/systemSlice.ts | 系统设置状态管理切片 |
| front/src/store/slices/detectionSlice.ts | 检测数据状态管理切片 |
| front/src/store/hooks.ts | Redux自定义Hooks |
| front/src/styles/theme.ts | 主题配置 |
| front/src/styles/global.less | 全局样式文件 |
| front/src/styles/mixins.less | 样式混合 |
| front/src/types/system.ts | 系统相关TypeScript类型定义 |
| front/src/types/detection.ts | 检测相关TypeScript类型定义 |
| front/src/types/common.ts | 通用TypeScript类型定义 |
| front/src/utils/request.ts | API请求封装工具函数 |
| front/src/utils/storage.ts | 本地存储封装工具函数 |
| front/src/utils/date.ts | 日期处理工具函数 |
| front/src/App.tsx | 应用根组件 |
| front/src/main.tsx | 应用入口文件 |
| front/src/routes.tsx | 路由配置文件 |
| front/.eslintrc.js | ESLint配置文件 |
| front/.prettierrc | Prettier配置文件 |
| front/tsconfig.json | TypeScript配置文件 |
| front/vite.config.ts | Vite构建配置文件 |
| front/package.json | 项目依赖配置文件 |
| project_structure.md | 项目结构文档

## 技术栈概述

### 后端技术栈
- **框架**: FastAPI 0.104.1
- **数据库**: PostgreSQL 14+
- **ORM**: SQLAlchemy 2.0+
- **认证**: JWT (JSON Web Tokens)
- **API文档**: Swagger/OpenAPI
- **日志**: structlog
- **配置管理**: Pydantic Settings
- **数据验证**: Pydantic V2
- **实时通信**: WebSocket, MQTT Client
- **AI模型集成**: TensorFlow/PyTorch (用于加载和推理模型)
- **视频处理**: OpenCV-Python
- **文件存储**: MinIO/S3兼容存储
- **任务队列**: Celery (用于异步任务处理)

### 前端技术栈
- **框架**: React 18
- **类型系统**: TypeScript 5
- **状态管理**: Redux Toolkit
- **路由**: React Router 6
- **UI组件库**: Ant Design
- **HTTP客户端**: Axios
- **样式方案**: Styled Components
- **构建工具**: Vite
- **实时通信**: Socket.IO Client
- **视频播放**: video.js

### 集成工具
- **数据库迁移**: Alembic
- **容器化**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **MQTT Broker**: EMQX/HiveMQ (用于与MES系统集成)
- **监控**: Prometheus & Grafana

### 部署环境
- **生产环境**: Kubernetes
- **开发环境**: Docker Compose

## 核心功能模块规划

### 1. 系统管理模块
- **用户管理**: 系统用户的CRUD操作，支持角色分配和权限管理
- **权限管理**: 基于RBAC（基于角色的访问控制）的权限系统，包括角色创建、权限分配等
- **参数设置**: 系统全局参数配置，如检测灵敏度、告警阈值等
- **摄像头管理**: 摄像头设备的添加、编辑、删除和状态监控
- **事件推送设置**: 配置事件推送规则、通知方式和目标系统

### 2. 检测区域设置模块
- **机台-换车区域设置**: 配置布车更换区域的监控参数和检测规则
- **机台-脱岗区域设置**: 配置操作人员脱岗检测的区域和规则
- **危险区域设置**: 配置危险区域的电子围栏和告警规则

### 3. 模型管理模块
- **模型文件管理**: 上传、更新和管理布车、脱岗等AI检测模型
- **模型版本控制**: 支持模型版本切换和回滚
- **模型性能监控**: 统计模型识别准确率和性能指标

### 4. 布车分布检测模块
- **布车分布监测**: 实时显示布车分布情况，包括位置、状态等信息
- **布车搜索定位**: 根据布车号快速定位布车位置，支持大屏显示和移动端查询

### 5. 通道出入检测模块
- **通道监测**: 监控通道内布车出入情况
- **MES集成**: 与MES系统对接，显示不同工段积布信息
- **统计分析**: 统计工序异常滞留情况，提供计划执行追踪

### 6. 落布换车检测模块
- **实时监测**: 监控关键机台落布时的布车切换信息
- **MQTT消息推送**: 将切换时间、车号等信息实时发送给MES系统
- **生产数据同步**: 支持MES系统自动进行卡号切换，实现产量、能耗数据的准确投卡分割

### 7. 脱岗检测模块
- **区域监控**: 对机台关键区域进行实时监测
- **脱岗识别**: 检测操作人员脱岗行为
- **规则配置**: 支持设置监测区域和人员离岗时限
- **告警推送**: 发生脱岗时及时推送告警信息

### 8. 危险区域检测模块
- **电子围栏**: 在有限空间等危险区域设置虚拟围栏
- **入侵检测**: 检测并记录人员闯入信息
- **实时告警**: 发现闯入行为时立即推送告警

### 9. 事件查询模块
- **事件记录**: 存储脱岗、危险、烟火等检测事件的详细信息
- **高级查询**: 支持多条件组合查询和时间范围筛选
- **事件详情**: 查看事件发生时间、地点、截图等信息
- **统计分析**: 提供事件统计报表和趋势分析

### 10. 视频查询模块
- **实时视频**: 通过WEB或APP实时查看生产现场视频
- **视频回放**: 支持历史视频检索和回放
- **视频管理**: 管理视频存储、检索和权限控制

## 集成扩展规划

### MES系统集成
- **数据接口**: 开发标准RESTful API和MQTT主题，实现与MES系统的双向数据交互
- **实时同步**: 通过MQTT协议实现生产数据、设备状态、工单信息的实时同步
- **事件触发**: 关键生产事件（如落布换车）自动触发MES系统数据更新
- **数据一致性**: 实现分布式事务或最终一致性机制，确保跨系统数据一致性

### 实时通信架构
- **WebSocket服务**: 建立WebSocket服务器，支持前端实时接收检测数据和告警信息
- **MQTT代理**: 部署MQTT代理服务器（如Mosquitto），作为设备和系统间的消息枢纽
- **消息队列**: 引入RabbitMQ或Kafka，处理高并发消息和任务队列
- **推送服务**: 实现邮件、短信、企业微信等多渠道消息推送机制

### AI模型集成
- **模型服务**: 部署TensorFlow Serving或TorchServe，提供模型推理API
- **实时推理**: 实现视频流实时分析和检测结果输出
- **模型更新机制**: 支持在线模型更新和热替换，无需重启服务
- **性能监控**: 监控模型推理性能和资源使用情况

### 数据存储扩展
- **时序数据库**: 引入InfluxDB或TimescaleDB，存储大量时序数据（如检测结果、设备状态）
- **文件存储**: 使用MinIO或云存储服务，管理视频文件、模型文件等大容量数据
- **缓存层**: 集成Redis缓存，提高数据访问性能和实时数据处理能力
- **数据归档**: 实现冷热数据分离和自动归档策略

### 安全性设计
- **网络安全**: 实现网络隔离、防火墙、入侵检测等安全措施
- **数据加密**: 敏感数据传输和存储加密，支持HTTPS/TLS
- **访问控制**: 基于OAuth 2.0和细粒度权限控制，确保系统安全访问
- **审计日志**: 记录所有关键操作和系统事件，支持安全审计和合规性检查

### 扩展性设计
- **微服务架构**: 后续可将系统拆分为微服务，提高可维护性和扩展性
- **容器化部署**: 使用Docker和Kubernetes，实现服务编排和自动伸缩
- **API网关**: 引入API网关，统一管理API访问、限流、监控等
- **配置中心**: 实现集中式配置管理，支持动态配置更新

### 监控运维
- **系统监控**: 集成Prometheus和Grafana，实现系统监控和告警
- **日志聚合**: 使用ELK或Loki，集中管理和分析系统日志
- **健康检查**: 实现服务健康检查和自动恢复机制
- **性能分析**: 集成APM工具，监控和分析系统性能

### 移动端支持
- **响应式设计**: 前端实现响应式布局，支持不同设备访问
- **Web App**: 开发PWA应用，提供接近原生的移动端体验
- **消息推送**: 支持移动端实时消息推送
- **简化功能**: 针对移动端特点，提供核心功能的简化版

本文档描述了Web_TKS项目的当前结构和功能规划。随着项目的开发，目录结构和功能可能会进一步扩展和优化。