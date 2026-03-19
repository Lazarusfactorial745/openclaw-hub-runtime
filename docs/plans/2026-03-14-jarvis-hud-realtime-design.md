# J.A.R.V.I.S. HUD Realtime Gateway Design

日期：2026-03-14

## 目标

在已打通真实 `connect + hello-ok + health + chat.history(main)` 的基础上，接入：

- `chat.send`
- `agent` 实时流事件
- `chat` 快照广播事件

并将其投影为既有的：

- `assistant_start`
- `assistant_chunk`
- `assistant_done`

## 已确认的本机协议事实

- `chat.send` 的 `params.message` 是字符串，而不是消息对象
- `agent` 事件可提供：
  - `stream: "assistant"`
  - `data.text`
  - `data.delta`
- `chat` 事件可提供：
  - `state: "delta" | "final"`
  - `message.role`
  - `message.content[]`

## 设计原则

- 保持 Renderer / Store / Scroll Engine 纯净
- 优先使用 `agent` 事件中的真实 `delta`
- `chat` 事件作为快照兜底 / 去重确认 / 完成态确认
- 继续保留现有 soft throttling 和独立光标机制

## 接管策略

### 发送

- 用户点击发送按钮
- UI 先本地 append 用户消息
- 立即通过 `chat.send(sessionKey, messageString, idempotencyKey)` 发到网关
- 同时进入 `voiceState = pending`

### 实时流

- 看到 `agent.stream === "assistant"` 且存在 `data.delta`
  - 若当前无激活 assistant 流，则先 `assistant_start`
  - 再把 `delta` 喂入现有缓冲池
- 看到 `agent.stream === "lifecycle"` 且 `phase === "end"`
  - 触发 `assistant_done`

### 快照兜底

- `chat.state === "delta"` / `final` 到来时
  - 若 delta 事件缺失，可用快照差分推导增量
  - `final` 可作为完成确认

## 去重策略

- `runId` 作为实时 assistant 流的主键
- 维护：
  - `activeRunId`
  - `runTextById`
  - `seenUserMessageKeys`
- 防止历史回灌和实时广播重复 append

## UI 要点

- 保留 soft throttling
- 保留光标咬尾逻辑
- 保留脱底时 HUD 回底按钮
- 真实失败时通过 Diagnostics Panel 反馈
