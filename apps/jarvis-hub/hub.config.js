window.HUB_CONFIG = {
  gatewayUrl: 'ws://127.0.0.1:18789',
  clientId: 'openclaw-control-ui',
  clientMode: 'webchat',
  sessionKey: 'agent:main:main',
  selectors: {
    wakeUpFlash: '#wake-up-flash',
    scroller: '#message-scroller',
    messageList: '#message-list',
    bottomSentinel: '#bottom-sentinel',
    scrollHudBadge: '#scroll-hud-badge',
    floatingConsole: '#prompt-form',
    promptForm: '#prompt-form',
    promptInput: '#prompt-input',
    sendButton: '#send-button',
    micButton: '#mic-button',
    consoleStatus: '#console-status',
    diagnostics: '.diagnostics-panel',
    sidebarLinkChip: '#sidebar-link-chip',
    agentsStatus: '#sidebar-agents-status',
    agentsList: '#sidebar-agents-list',
    latencyValue: '#latency-value',
    gatewayValue: '#gateway-value',
    voiceChip: '#voice-chip',
    linkChip: '#link-chip',
    clockLabel: '#clock-label'
  },
  features: {
    agentsList: true,
    diagnostics: true,
    reconnect: true,
    testResume: true,
    posterMode: true
  }
};
