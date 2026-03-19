# J.A.R.V.I.S. HUD Battle-Damaged Poster Design

日期：2026-03-14

## 目标

为 `/test-resume` 增加一个作品集级 `poster` 模式，固定定格在“断线战损瞬间”，以便导出海报级截图。

## 构图目标

- 画面中心必须是断裂中的 assistant 气泡与半截代码
- 失联光标需要醒目、橙色、低频呼吸
- Diagnostics 面板必须是压迫感主视觉
- 底部输入岛必须保持幽暗硬锁态

## 海报模式规则

- 通过 URL 触发：`?testResume=1&poster=1`
- 自动运行 `/test-resume`
- 不自动进入恢复完成态，而是在断线重连前暂停，停留于 battle-damaged frame
- 隐藏不必要的 HUD 浮层（如回到底部按钮）
- 提高 Diagnostics 面板的视觉权重

## 视觉强化

- 橙色失联光标更亮、更粗、更有外发光
- Diagnostics 面板标题与日志行的对比度更高
- 轻度提升诊断面板尺寸 / 阴影 / 边框压迫感
- 让消息舞台更靠近画面中心，减少无意义留白
