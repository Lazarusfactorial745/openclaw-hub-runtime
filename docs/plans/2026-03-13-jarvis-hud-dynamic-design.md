# J.A.R.V.I.S. HUD Chat Dynamic Layer Design

日期：2026-03-13

## 目标

在现有高保真 HUD 静态 Demo 的基础上，加入前端动态适配层（Mock / Adapter Layer），先不直接连接真实 OpenClaw Gateway。动态层需要完整跑通以下体验：

- 用户消息提交
- AI 流式逐字输出
- 光标伴随并在完成后进入低频待机
- 防遮挡自动滚动
- `isPinnedToBottom` 用户意图保护
- 实时状态指示灯联动
- 诊断面板注入能力

## 实现边界

- 保持单文件 `index.html`
- 不引入前端框架
- 使用原生 JS + 最小状态容器
- 所有动态行为通过统一事件流驱动

## 事件模型

- `user_message`
- `assistant_start`
- `assistant_chunk`
- `assistant_done`
- `system_diagnostics`
- `telemetry_update`

## 模块划分

### Adapter

- 负责发出事件
- 当前阶段使用 Mock 定时器与预设剧本
- 后续真实接入时只替换此层

### Store

- 保存最小状态
- 负责 `dispatch(event)`
- 不操作 DOM

### Renderer

- 新消息 `append`
- 流式中的 AI 消息 `patch`
- 遥测状态局部刷新
- 严禁全量重绘消息流

### Scroll Engine

- 维护 `isPinnedToBottom`
- 使用底部 sentinel 进行防遮挡定位
- 仅在用户贴底时自动滚动

### Telemetry

- 维护 latency、voice state、link state
- 当前阶段由 mock 周期更新
- 后续可替换为真实网关状态

## 状态设计

### 应用状态

- `messages`
- `telemetry`
- `streaming`
- `ui`

### 流式状态

- `idle`
- `user_submitted`
- `assistant_pending`
- `assistant_streaming`
- `assistant_settling`
- `assistant_done`

## 剧本 A：正常对话流

1. 用户点击发送
2. 插入用户消息
3. 顶部 / 底部状态进入 `VOICE PENDING`
4. 创建 AI 空壳消息并显示光标
5. 使用随机节奏逐段发送 `assistant_chunk`
6. 每帧最多一次写入 DOM
7. 若用户仍贴底，则自动滚动到输入框上方安全线
8. 结束时把光标降为慢闪待机
9. 遥测恢复常规状态

## 核心渲染法则

- 新增用 `append`
- 更新用 `patch`
- 严禁全量重绘消息流
- 光标必须是独立 DOM 节点，不能拼进字符串
- 流式文本更新后，必须在下一帧测量并决定是否滚动

## 验证目标

- 点击发送后能跑完整 Happy Path
- AI 文本逐字输出，光标始终跟随
- 用户上滑后停止强制自动滚动
- 遥测数值与颜色能实时联动
- 页面依旧没有全局滚动条
