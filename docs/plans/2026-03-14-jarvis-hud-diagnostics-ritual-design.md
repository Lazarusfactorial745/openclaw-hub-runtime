# J.A.R.V.I.S. HUD Diagnostics Ritual Design

日期：2026-03-14

## 目标

为 `/diagnose` 触发的系统诊断面板补齐“仪式感”入场：

- 动态解压展开（Unfolding）
- 一次性全息扫描线下扫
- 展开期间的淡网格高亮

## 设计原则

- 诊断面板不是普通消息块，而是“子系统舱门”开启
- 入场必须有秩序感，不能闪现
- 扫描线只做一次，不可常驻抢戏

## 动效规则

### 1. 动态解压

- 面板先以折叠态插入消息流
- 通过 `grid-template-rows: 0fr -> 1fr` 实现内部内容展开
- 外层保持 `overflow-hidden`
- 动画时长控制在 `420ms ~ 560ms`

### 2. 全息扫描线

- 面板内部增加一条高度约 `2px` 的亮青色扫描线
- 样式：`bg-gradient-to-r from-transparent via-[#00f3ff]/40 to-transparent`
- 从顶部快速滑到底部，只执行一次
- 动画完成后进入极低透明度或直接隐藏

### 3. 展开期网格

- 面板背景在展开期间临时增强极淡的网格纹理
- 展开结束后回到常规低对比度状态

## 实现约束

- 保持单文件 `index.html`
- 不破坏现有 `append vs patch` 规则
- 仅增强 diagnostics 面板的首次插入，不影响普通用户消息和 AI 消息
