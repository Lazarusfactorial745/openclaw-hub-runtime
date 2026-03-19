# OpenClaw 本地模式与登录自启实施计划

日期：2026-03-13

## 范围

目标是在当前 Windows 用户环境下，为标准 `OpenClaw` 建立稳定的本地运行模式与登录自启，不改动 `ai.todesk.com` 相关配置链路。

## 实施步骤

1. 校准本地配置
   - 确认 `gateway.mode=local`
   - 确认 `gateway.bind=loopback`
   - 确认 `gateway.auth.mode=token`
   - 若缺失 token，则生成并写入

2. 编写启动脚本
   - 位置：`C:\Users\Pengfei Ma\.openclaw\start-openclaw-gateway.ps1`
   - 行为：检测端口、避免重复启动、后台拉起网关、记录日志

3. 建立登录自启
   - 位置：当前用户 Startup 文件夹
   - 方式：创建指向启动脚本的快捷方式

4. 验证
   - 验证脚本文件存在
   - 验证 Startup 入口存在
   - 验证本地端口监听
   - 验证 `openclaw gateway status --token <token>` 返回 `RPC probe: ok`
   - 验证重复运行启动脚本不会产生重复实例

5. 交付
   - 输出关键文件路径
   - 输出当前运行状态
   - 输出后续排障命令

## 风险与处理

- 若 Startup 快捷方式创建失败，回退为直接复制 `.cmd` 启动器
- 若后台进程被 PowerShell 执行策略拦截，改用 `.cmd` 包装器调用
- 若旧实例占用端口，则保持“检测到监听即退出”的保守策略，不主动杀进程

## 验收标准

- 本地网关可用
- 登录后可自动启动
- 不依赖 `ai.todesk.com`
- 不影响 `ToDesk`
