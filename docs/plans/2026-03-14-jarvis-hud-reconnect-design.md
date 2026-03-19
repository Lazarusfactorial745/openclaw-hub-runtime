# J.A.R.V.I.S. HUD Reconnect Design

日期：2026-03-14

## 目标

在不污染现有 Renderer / Store / Scroll Engine 的前提下，引入一个独立的 `ReconnectManager`，负责：

- 连接状态流转
- 输入区软锁 / 硬锁
- 断线后诊断面板追加
- 为后续恢复、对账、续写预留骨架

## 核心原则

- `GatewaySocketAdapter` 只做传输和上报
- `ReconnectManager` 负责连接编排
- UI 通过高层接口更新：
  - `applyInputLockState(mode)`
  - `appendRecoveryDiagnosticsLine(text, severity)`

## 第一阶段范围

本轮只实现 Step 1-4：

1. UI 辅助钩子
2. Adapter 生命周期钩子
3. `ReconnectManager` 骨架
4. `bootstrap()` 装配式改造

暂不实现：

- 指数退避重连调度
- 断线半句续命对账
- queued realtime replay

## 交付标准

- 页面继续正常连接真实 Gateway
- `ReconnectManager.start()` 接管启动
- 输入区锁控制函数存在并可调用
- Adapter 能通过 hook 上报 `hello-ok / close / error / tick / health / agent / chat`
