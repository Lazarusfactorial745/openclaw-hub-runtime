export function extractTextFromGatewayContent(content) {
  if (!Array.isArray(content)) return '';
  return content
    .map((part) => (part && part.type === 'text' ? String(part.text ?? '') : ''))
    .filter(Boolean)
    .join('\n');
}

function formatHistoryTimestamp(timestamp) {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour12: false }) + ' CST';
}

export function normalizeAgentsList(payload) {
  const items = Array.isArray(payload?.agents) ? payload.agents : Array.isArray(payload) ? payload : [];
  return items.map((agent, index) => {
    const agentId = agent.agentId || agent.id || `agent-${index}`;
    const modelLabel = agent.model?.primary || agent.modelPrimary || agent.modelLabel || '?????';
    const sessionCount = agent.sessions?.count ?? agent.sessionCount ?? 0;
    return {
      agentId,
      label: agent.name || agent.label || agentId,
      isDefault: agent.isDefault === true || agent.default === true || agentId === 'main',
      modelLabel,
      sessionCount,
      runtimeState: '???'
    };
  });
}

export function normalizeHistoryMessages(payload, { copy, nowLabel, hashText }) {
  const items = Array.isArray(payload?.messages) ? payload.messages : [];
  return items.map((message, index) => {
    const text = extractTextFromGatewayContent(message.content);
    const senderLabel = message.senderLabel === 'openclaw-control-ui'
      ? copy.labels.controlUi
      : (message.senderLabel || copy.message.operator);

    return {
      id: message.id ?? `history:${index}:${message.role}:${hashText(text)}`,
      role: message.role === 'assistant' ? 'assistant' : 'user',
      kind: 'message',
      header: message.role === 'assistant' ? copy.message.jarvisCore : senderLabel,
      subheader: message.role === 'assistant' ? copy.message.historyReplayMain : copy.message.controlUiMain,
      text,
      timestamp: typeof message.timestamp === 'number' ? formatHistoryTimestamp(message.timestamp) : nowLabel(),
      status: 'done'
    };
  });
}

export function parseGatewayFrame(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function classifyGatewayFrame(frame) {
  if (!frame || typeof frame !== 'object') {
    return { kind: 'ignored', frame: null };
  }

  if (frame.type === 'event' && frame.event === 'connect.challenge') {
    return { kind: 'connect_challenge', frame, nonce: frame.payload?.nonce };
  }

  if (frame.type === 'res') {
    return { kind: 'response', frame };
  }

  if (frame.type !== 'event') {
    return { kind: 'ignored', frame };
  }

  if (frame.event === 'tick') return { kind: 'tick', frame };
  if (frame.event === 'health') return { kind: 'health', frame };
  if (frame.event === 'agent') return { kind: 'agent', frame };
  if (frame.event === 'chat') return { kind: 'chat', frame };
  return { kind: 'ignored', frame };
}

export function normalizeAgentRealtimeFrame(frame, { sessionKey }) {
  const payload = frame?.payload;
  const runId = payload?.runId;
  const stream = payload?.stream;

  if (!payload || !runId || payload.sessionKey !== sessionKey) {
    return null;
  }

  if (stream === 'assistant') {
    const delta = typeof payload?.data?.delta === 'string' ? payload.data.delta : '';
    const text = typeof payload?.data?.text === 'string' ? payload.data.text : '';
    return {
      kind: 'assistant_stream',
      frame,
      runId,
      delta,
      text
    };
  }

  if (stream === 'lifecycle' && payload?.data?.phase === 'end') {
    return {
      kind: 'assistant_done',
      frame,
      runId
    };
  }

  if (stream === 'error') {
    return {
      kind: 'agent_error',
      frame,
      runId,
      reason: payload?.data?.reason ? String(payload.data.reason) : 'Unknown agent stream warning'
    };
  }

  return null;
}

export function normalizeChatRealtimeFrame(frame, { sessionKey }) {
  const payload = frame?.payload;
  if (!payload || payload.sessionKey !== sessionKey) {
    return null;
  }

  const role = payload?.message?.role;
  const text = extractTextFromGatewayContent(payload?.message?.content);
  if (!text) {
    return null;
  }

  if (role === 'assistant') {
    return {
      kind: 'assistant_snapshot',
      frame,
      runId: payload.runId || null,
      seq: payload.seq,
      text,
      isFinal: payload.state === 'final'
    };
  }

  if (role === 'user') {
    return {
      kind: 'user_echo',
      frame,
      text,
      dedupeSeed: `${payload?.message?.timestamp || payload.seq}`
    };
  }

  return null;
}
