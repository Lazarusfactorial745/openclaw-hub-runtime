# OpenClaw 本地稳定模式与登录自启设计

日期：2026-03-13

## 目标

把当前机器上的标准 `OpenClaw` 整理为：

- 使用本地网关运行
- 不依赖 `ai.todesk.com`
- 登录 Windows 后自动启动
- 不需要管理员权限
- 不影响现有 `ToDesk`/`zagent` 集成

## 已知现状

- 标准 `OpenClaw CLI` 已恢复，可执行 `openclaw --version`
- 本地网关可在 `127.0.0.1:18789` 正常运行
- `gateway.mode` 需要为 `local`
- `gateway.bind` 需要为 `loopback`
- `gateway.auth.mode` 需要为 `token`
- Windows 计划任务安装曾因权限不足失败
- `ai.todesk.com:443` 不表现为标准 OpenClaw Gateway WebSocket

## 方案对比

### 方案 A：启动文件夹 + 用户级启动脚本（推荐）

优点：

- 不需要管理员权限
- 与“登录后自动启动”需求完全匹配
- 可见、直观、易排障
- 不依赖 `schtasks` 安装服务

缺点：

- 仅在用户登录后启动

### 方案 B：HKCU Run 注册表

优点：

- 同样不需要管理员权限
- 登录后自动启动

缺点：

- 可见性比启动文件夹差
- 后续维护不如脚本 + 快捷方式直观

### 方案 C：计划任务（At logon）

优点：

- 控制粒度更高

缺点：

- 当前机器已出现权限拒绝
- 对当前需求没有明显收益

## 选定方案

采用方案 A。

## 设计

### 运行模式

标准 `OpenClaw` 固定为本地模式：

- `gateway.mode = local`
- `gateway.bind = loopback`
- `gateway.auth.mode = token`

保留 `node.json` 中与 `ai.todesk.com` 相关内容，不作为本次启动链路的一部分。

### 启动脚本职责

脚本在登录时执行，职责如下：

1. 读取本地 `OpenClaw` 配置文件
2. 检查本地网关端口是否已监听
3. 若已运行，则直接退出
4. 若未运行，则后台启动 `openclaw gateway run`
5. 把 stdout/stderr 写入固定日志文件

### 自启接入点

将启动脚本的快捷方式放入当前用户 Startup 文件夹：

- `%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup`

### 日志与排障

脚本日志放在：

- `C:\\Users\\Pengfei Ma\\AppData\\Local\\Temp\\openclaw\\startup-gateway.log`

运行日志继续使用 OpenClaw 自身日志目录。

## 验证标准

满足以下条件即视为完成：

1. `openclaw gateway status --token <token>` 返回 `RPC probe: ok`
2. `127.0.0.1:18789` 处于监听状态
3. Startup 文件夹存在自启入口
4. 启动脚本重复执行不会拉起重复实例

## 说明

- 本设计不修改 `ai.todesk.com`
- 本设计不卸载 `ToDesk`
- 本设计不创建管理员级系统服务
- 由于当前任务未要求提交版本控制，本次只写设计文档，不执行 git commit
