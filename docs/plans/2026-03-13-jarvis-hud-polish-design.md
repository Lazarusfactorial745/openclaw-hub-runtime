# J.A.R.V.I.S. HUD Dynamic Polish Design

日期：2026-03-13

## 目标

在现有动态 HUD 聊天原型基础上，继续打磨两个核心体验：

- 流式 fenced code block 渲染
- 用户脱底后的 HUD 风格“回到底部”悬浮提示

暂不处理：

- 行内代码
- 标题 / 列表 / 粗体等富文本 Markdown
- 诊断面板动态解压动效

## 设计原则

- 聚焦硬核开发者终端感，不做博客式富文本
- 代码块不是普通文本，而是独立“子终端面板”
- 回到底部按钮不是普通按钮，而是 HUD 导航提示

## 代码块渲染规则

- 只支持 fenced code block：
  - 开始：```lang
  - 结束：```
- Renderer 需要具备一个轻量状态扫描器：
  - 普通文本模式
  - 代码块模式
- 代码块容器样式：
  - 背景：`bg-[#03070c]/90`
  - 左侧细高亮线：`border-l-2 border-[#00f3ff]`
  - 独立玻璃边框与弱辉光
- 语言标签：
  - 右上角
  - `font-mono text-[10px] uppercase text-[#00f3ff]/50`
- 流式输出时：
  - 代码块文本也遵循现有 buffer 节流
  - 不能因为 chunk 边界把代码块拆坏

## 回到底部 HUD 按钮

- 触发条件：
  - `isPinnedToBottom === false`
  - 且 AI 正在 `assistant_streaming`
- 样式：
  - 半透明青色 HUD 悬浮控件
  - 轻微闪烁
  - 中心箭头 / “NEW DATA STREAMING...” 标签
  - 周围可有极淡圆弧边框
- 位置：
  - 输入框上方中央
  - 不遮挡消息内容阅读
- 交互：
  - 点击后平滑滚动回到底部
  - 并重新激活 `isPinnedToBottom`

## 实现约束

- 继续保持单文件 `index.html`
- 继续遵守“append vs patch，禁止全量重绘”
- 代码块渲染必须与当前 Store / Renderer / Scroll Engine 架构兼容
