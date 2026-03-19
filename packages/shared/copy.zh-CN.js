export const DEFAULT_COPY_ZH = {
  sidebar: {
    neuralInterface: '神经接口',
    chatPrimaryChannel: '聊天 // 主通道',
    linkActive: '已连接',
    linkConnecting: '连接中',
    linkOffline: '离线',
    runtimeStatus: '运行状态',
    model: '模型',
    gateway: '网关',
    latency: '延迟'
  },
  topbar: {
    conversationSurface: '对话界面',
    chatPrimaryChannel: '聊天 // 主通道',
    linkActive: '神经链接已激活',
    linkConnecting: '神经链接连接中',
    linkLost: '连接已丢失',
    voiceReady: '语音已就绪',
    voicePending: '语音等待中',
    voiceOffline: '语音离线',
    sessionA07: '会话 A-07',
    nodeLocalhost: '节点 / 本机'
  },
  message: {
    operator: '操作员',
    localUserVoicePending: '本地用户 // 语音等待中',
    historyReplayMain: '历史回放 // 主会话',
    responseStreamHud: '响应流 // HUD 渲染',
    controlUiMain: '控制界面 // 主会话',
    jarvisCore: '贾维斯核心'
  },
  labels: {
    controlUi: '控制界面'
  },
  diagnostics: {
    title: '系统诊断',
    criticalSocketDisconnected: '严重故障 :: 连接已断开',
    warning: '警告',
    critical: '严重',
    nominal: '正常',
    liveGateway: '实时网关',
    recoveryProtocol: '恢复协议',
    socketEvent: '连接事件',
    syncingHistory: '[系统] 正在同步历史记录...',
    recoveredViaResync: '[系统] 已通过重同步恢复',
    historyPrefixExtended: '[系统] 历史已对账 // 检测到前缀延长',
    historySnapshotMatch: '[系统] 历史已对账 // 快照一致',
    connectMainSession: (sessionKey) => `[系统] 正在连接主会话 // ${sessionKey}`,
    connectionLost: (reason) => `[系统] 连接已丢失 // ${reason}`,
    reconnectPending: (attempt, max) => `[系统] 正在重连... 第 ${attempt}/${max} 次 [等待中]`,
    reconnectFailed: (attempt, max) => `[系统] 正在重连... 第 ${attempt}/${max} 次 [失败]`,
    reconnectRestored: (attempt, max) => `[系统] 正在重连... 第 ${attempt}/${max} 次 [已恢复]`,
    recoveryTimer: (delayMs) => `[系统] 恢复计时器已启动 // ${delayMs}ms 后重试`,
    recoveryFailed: '[系统] 恢复失败 // 需要人工介入',
    linkRestored: '[系统] 链路已恢复',
    triggeringControlledDrop: '[系统] 触发受控断链',
    testHarnessDrop: '测试剧本强制断链',
    gatewayBootstrapFailed: '严重故障 // 网关启动失败',
    gatewayAdapterMissing: '严重故障 // 网关适配器缺失',
    chatSendFailed: '严重故障 // 发送失败',
    websocketErrorLine1: '浏览器无法稳定连接到 ws://127.0.0.1:18789。',
    websocketErrorLine2: '请检查网关令牌、allowedOrigins 与安全上下文配置。',
    phase1LockTitle: '实时发送 // 第一阶段锁定',
    phase1LockLine1: 'GatewaySocketAdapter 已接入 connect、health 和 chat.history(main)。',
    phase1LockLine2: 'chat.send 的实时接管将在下一阶段完全打通。',
    historyBootstrapEmpty: '历史引导 // 主会话为空',
    noArchivedMessages: '当前主会话没有归档消息。',
    healthProbeDegraded: '健康探测 // 降级',
    agentStreamIssue: '警告 // 智能体流异常',
    manualDiagnoseTitle: '音频通道 // 可恢复性降级',
    manualDiagnoseWarn: '警告 :: 插件 <qqvoice> 桥接未配置，已切入回退通道。',
    manualDiagnosePath: '路径 :: C:\\Users\\Pengfei Ma\\.openclaw\\skills\\voice 缺少运行时清单。',
    manualDiagnoseNote: '说明 :: 已接受 <qqfile> 附件，但 TTS 中继仍处于被动态。',
    manualDiagnoseHint: '提示 :: 启用凭证来源后，重新绑定语音路由即可恢复实时播报。'
  },
  input: {
    armed: '指令控制台 // 语音输入已待命',
    pending: '指令控制台 // 语音通道等待中',
    offline: '指令控制台 // 语音离线',
    recovering: '指令控制台 // 恢复进行中',
    degraded: '指令控制台 // 链路降级',
    newDataStreaming: '新数据流入中...',
    placeholderDefault: '输入指令、系统提示词或操作请求...',
    placeholderOffline: '连接已丢失 // 输入已暂停',
    placeholderDegraded: '高延迟 // 请谨慎操作'
  },
  telemetry: {
    warmPath: '热路径',
    degraded: '降级',
    offline: '离线'
  },
  commands: {
    diagnoseEn: '/diagnose',
    diagnoseZh: '/诊断',
    testResumeEn: '/test-resume',
    testResumeZh: '/测试续写'
  }
};
