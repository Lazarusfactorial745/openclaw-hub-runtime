export function createShellContext(hubConfig = window.HUB_CONFIG || {}) {
  const selectors = hubConfig.selectors || {};
  const features = hubConfig.features || {};

  const resolveHubSelector = (key, fallbackSelector) => selectors[key] || fallbackSelector;

  const refs = {
    wakeUpFlash: document.querySelector(resolveHubSelector('wakeUpFlash', '#wake-up-flash')),
    scroller: document.querySelector(resolveHubSelector('scroller', '#message-scroller')),
    messageList: document.querySelector(resolveHubSelector('messageList', '#message-list')),
    bottomSentinel: document.querySelector(resolveHubSelector('bottomSentinel', '#bottom-sentinel')),
    scrollHudBadge: document.querySelector(resolveHubSelector('scrollHudBadge', '#scroll-hud-badge')),
    floatingConsole: document.querySelector(resolveHubSelector('floatingConsole', '#prompt-form')),
    promptForm: document.querySelector(resolveHubSelector('promptForm', '#prompt-form')),
    promptInput: document.querySelector(resolveHubSelector('promptInput', '#prompt-input')),
    sendButton: document.querySelector(resolveHubSelector('sendButton', '#send-button')),
    micButton: document.querySelector(resolveHubSelector('micButton', '#mic-button')),
    consoleStatus: document.querySelector(resolveHubSelector('consoleStatus', '#console-status')),
    voiceChip: document.querySelector(resolveHubSelector('voiceChip', '#voice-chip')),
    linkChip: document.querySelector(resolveHubSelector('linkChip', '#link-chip')),
    sidebarLinkChip: document.querySelector(resolveHubSelector('sidebarLinkChip', '#sidebar-link-chip')),
    sidebarAgentsStatus: document.querySelector(resolveHubSelector('agentsStatus', '#sidebar-agents-status')),
    sidebarAgentsList: document.querySelector(resolveHubSelector('agentsList', '#sidebar-agents-list')),
    latencyValue: document.querySelector(resolveHubSelector('latencyValue', '#latency-value')),
    gatewayValue: document.querySelector(resolveHubSelector('gatewayValue', '#gateway-value')),
    clockLabel: document.querySelector(resolveHubSelector('clockLabel', '#clock-label'))
  };

  return {
    config: hubConfig,
    features,
    refs
  };
}

export function formatNowLabel() {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date()) + ' CST';
}

export function readShellFlags(search = window.location.search) {
  const params = new URLSearchParams(search);
  return {
    posterMode: params.get('poster') === '1',
    autoResumeTest: params.get('testResume') === '1'
  };
}

export function bindShellInteractions({ refs, state, submitPrompt, ScrollEngine }) {
  refs.promptForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitPrompt(refs.promptInput.value);
  });

  refs.scrollHudBadge.addEventListener('click', () => {
    ScrollEngine.jumpToBottom();
  });

  refs.promptInput.addEventListener('input', (event) => {
    state.ui.inputValue = event.target.value;
  });

  refs.promptInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitPrompt(refs.promptInput.value);
    }
  });
}
