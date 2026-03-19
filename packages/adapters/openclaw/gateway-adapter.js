import {
  classifyGatewayFrame,
  normalizeAgentRealtimeFrame,
  normalizeAgentsList,
  normalizeChatRealtimeFrame,
  normalizeHistoryMessages,
  parseGatewayFrame
} from './protocol-normalizer.js';
import { DEFAULT_COPY_ZH } from '../../shared/copy.zh-CN.js';

const GATEWAY_URL = window.HUB_CONFIG?.gatewayUrl || 'ws://127.0.0.1:18789';
const GATEWAY_CLIENT_ID = window.HUB_CONFIG?.clientId || 'openclaw-control-ui';
const GATEWAY_CLIENT_MODE = window.HUB_CONFIG?.clientMode || 'webchat';
const GATEWAY_TOKEN_STORAGE_KEY = 'jarvisHudGatewayToken';
const DEVICE_IDENTITY_STORAGE_KEY = 'jarvisHudDeviceIdentityV1';
const DEVICE_TOKEN_STORAGE_PREFIX = 'jarvisHudDeviceTokenV1:';
const DEFAULT_TOKEN_URL = new URL('../../../gateway.token', import.meta.url).toString();

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function stringHash(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function arrayBufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function normalizeDeviceMetadata(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function defaultNowLabel() {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date()) + ' CST';
}

export async function loadGatewayToken() {
  const cached = localStorage.getItem(GATEWAY_TOKEN_STORAGE_KEY);
  if (cached && cached.trim()) return cached.trim();

  const tokenUrl = window.HUB_CONFIG?.tokenUrl || DEFAULT_TOKEN_URL;
  const response = await fetch(tokenUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`gateway token unavailable: ${tokenUrl}`);
  const token = (await response.text()).trim();
  if (!token) throw new Error('gateway token file is empty');
  localStorage.setItem(GATEWAY_TOKEN_STORAGE_KEY, token);
  return token;
}

async function loadOrCreateBrowserDeviceIdentity() {
  const stored = localStorage.getItem(DEVICE_IDENTITY_STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed?.version === 1 && parsed?.deviceId && parsed?.publicJwk && parsed?.privateJwk && parsed?.rawPublicKey) {
      const privateKey = await crypto.subtle.importKey('jwk', parsed.privateJwk, { name: 'Ed25519' }, true, ['sign']);
      return { ...parsed, privateKey };
    }
  }

  const keyPair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
  const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
  const rawPublicKey = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const deviceId = arrayBufferToHex(await crypto.subtle.digest('SHA-256', rawPublicKey));
  const record = {
    version: 1,
    deviceId,
    rawPublicKey: arrayBufferToBase64Url(rawPublicKey),
    publicJwk,
    privateJwk,
    createdAtMs: Date.now()
  };
  localStorage.setItem(DEVICE_IDENTITY_STORAGE_KEY, JSON.stringify(record));
  return { ...record, privateKey: keyPair.privateKey };
}

function buildDeviceAuthPayloadV3({ deviceId, clientId, clientMode, role, scopes, signedAtMs, token, nonce, platform, deviceFamily }) {
  return [
    'v3',
    deviceId,
    clientId,
    clientMode,
    role,
    scopes.join(','),
    String(signedAtMs),
    token ?? '',
    nonce,
    normalizeDeviceMetadata(platform),
    normalizeDeviceMetadata(deviceFamily)
  ].join('|');
}

export class GatewaySocketAdapter {
  constructor({
    url = GATEWAY_URL,
    token,
    sessionKey,
    dispatch,
    copy,
    runtimeBridge,
    onHelloOk,
    onClose,
    onError,
    onTick,
    onHealth,
    onAgentFrame,
    onChatFrame,
    onHistoryHydrated
  }) {
    this.url = url;
    this.token = token;
    this.sessionKey = sessionKey;
    this.dispatch = dispatch;
    this.copy = copy || window.COPY_ZH || DEFAULT_COPY_ZH;
    this.runtimeBridge = runtimeBridge || {};
    this.onHelloOk = onHelloOk;
    this.onClose = onClose;
    this.onError = onError;
    this.onTick = onTick;
    this.onHealth = onHealth;
    this.onAgentFrame = onAgentFrame;
    this.onChatFrame = onChatFrame;
    this.onHistoryHydrated = onHistoryHydrated;
    this.ws = null;
    this.connected = false;
    this.hydrationComplete = false;
    this.isHydrating = false;
    this.historyRenderMode = 'render';
    this.queuedRealtimeEvents = [];
    this.pendingRequests = new Map();
    this.requestCounter = 0;
    this.deviceIdentity = null;
    this.deviceToken = null;
    this.healthTimer = null;
    this.mainSessionKey = sessionKey;
    this.incomingBuffer = '';
    this.flushScheduled = false;
    this.doneQueued = false;
    this.activeRunId = null;
    this.activeAssistantMessageId = null;
    this.runTextById = new Map();
    this.seenRealtimeUserKeys = new Set();
  }

  getNowLabel() {
    return typeof this.runtimeBridge.nowLabel === 'function' ? this.runtimeBridge.nowLabel() : defaultNowLabel();
  }

  getUiBridge() {
    return {
      state: this.runtimeBridge.state,
      refs: this.runtimeBridge.refs,
      domCache: this.runtimeBridge.domCache,
      Renderer: this.runtimeBridge.Renderer,
      ScrollEngine: this.runtimeBridge.ScrollEngine
    };
  }

  async connect() {
    this.dispatch({ type: 'telemetry_update', patch: { linkState: 'connecting', voiceState: 'ready' } });
    this.deviceIdentity = await loadOrCreateBrowserDeviceIdentity();
    this.deviceToken = localStorage.getItem(`${DEVICE_TOKEN_STORAGE_PREFIX}${this.deviceIdentity.deviceId}:operator`) || '';

    return await new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.addEventListener('open', () => {
        this.connected = true;
      });
      this.ws.addEventListener('message', (event) => {
        this.handleFrame(event.data, resolve, reject);
      });
      this.ws.addEventListener('close', (event) => {
        this.handleClose(event, reject);
      });
      this.ws.addEventListener('error', () => {
        this.handleError(reject);
      });
    });
  }

  disconnect() {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
    if (this.ws && this.ws.readyState < 2) {
      this.ws.close();
    }
    this.connected = false;
  }

  makeRequestId() {
    this.requestCounter += 1;
    return `req_${this.requestCounter}_${Date.now().toString(36)}`;
  }

  request(method, params, timeoutMs = 8000) {
    const id = this.makeRequestId();
    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Gateway request timed out: ${method}`));
      }, timeoutMs);

      this.pendingRequests.set(id, {
        resolve,
        reject,
        method,
        sentAt: performance.now(),
        timeoutId
      });

      this.ws.send(JSON.stringify({ type: 'req', id, method, params }));
    });
  }

  async sendConnect(nonce) {
    const signedAtMs = Date.now();
    const scopes = ['operator.read', 'operator.write', 'operator.admin', 'operator.approvals', 'operator.pairing'];
    const payload = buildDeviceAuthPayloadV3({
      deviceId: this.deviceIdentity.deviceId,
      clientId: GATEWAY_CLIENT_ID,
      clientMode: GATEWAY_CLIENT_MODE,
      role: 'operator',
      scopes,
      signedAtMs,
      token: this.token,
      nonce,
      platform: navigator.platform || 'web',
      deviceFamily: ''
    });

    const signature = arrayBufferToBase64Url(await crypto.subtle.sign(
      { name: 'Ed25519' },
      this.deviceIdentity.privateKey,
      new TextEncoder().encode(payload)
    ));

    const helloOk = await this.request('connect', {
      minProtocol: 3,
      maxProtocol: 3,
      client: {
        id: GATEWAY_CLIENT_ID,
        version: '2026.3.12',
        platform: navigator.platform || 'web',
        mode: GATEWAY_CLIENT_MODE
      },
      role: 'operator',
      scopes,
      auth: {
        token: this.token,
        ...(this.deviceToken ? { deviceToken: this.deviceToken } : {})
      },
      locale: navigator.language || 'zh-CN',
      userAgent: navigator.userAgent,
      device: {
        id: this.deviceIdentity.deviceId,
        publicKey: this.deviceIdentity.rawPublicKey,
        signature,
        signedAt: signedAtMs,
        nonce
      }
    }, 10000);

    if (helloOk?.auth?.deviceToken) {
      localStorage.setItem(`${DEVICE_TOKEN_STORAGE_PREFIX}${this.deviceIdentity.deviceId}:operator`, helloOk.auth.deviceToken);
      this.deviceToken = helloOk.auth.deviceToken;
    }

    this.mainSessionKey = helloOk?.snapshot?.sessionDefaults?.mainSessionKey || this.sessionKey;
    this.triggerWakeUpFlash();
    this.dispatch({ type: 'telemetry_update', patch: { linkState: 'linked', voiceState: 'ready' } });
    if (typeof this.onHelloOk === 'function') {
      this.onHelloOk(helloOk);
    }
    await this.bootstrapHistoryAndHealth();
    return helloOk;
  }

  async bootstrapHistoryAndHealth() {
    await this.measureHealthRtt();
    this.startHealthLoop();
    const history = await this.request('chat.history', { sessionKey: this.mainSessionKey, limit: 40 }, 12000);
    await this.hydrateHistory(history);
    this.flushQueuedRealtimeEvents();
  }

  async measureHealthRtt() {
    const sentAt = performance.now();
    await this.request('health', {}, 6000);
    const latencyMs = Math.max(1, Math.round(performance.now() - sentAt));
    this.dispatch({ type: 'telemetry_update', patch: { latencyMs, linkState: 'linked', voiceState: 'ready' } });
  }

  async loadAgentsList() {
    const payload = await this.request('agents.list', {}, 10000);
    return normalizeAgentsList(payload);
  }

  startHealthLoop() {
    if (this.healthTimer) clearInterval(this.healthTimer);
    this.healthTimer = window.setInterval(() => {
      if (!this.connected) return;
      this.measureHealthRtt().catch((error) => {
        this.emitDiagnostics(this.copy.diagnostics.healthProbeDegraded, [String(error?.message || error)], this.copy.diagnostics.warning);
      });
    }, 15000);
  }

  async hydrateHistory(payload) {
    const messages = normalizeHistoryMessages(payload, {
      copy: this.copy,
      nowLabel: () => this.getNowLabel(),
      hashText: stringHash
    });

    if (this.historyRenderMode === 'defer') {
      this.isHydrating = false;
      this.hydrationComplete = true;
      if (typeof this.onHistoryHydrated === 'function') {
        await this.onHistoryHydrated(messages);
      }
      return;
    }

    const { state, refs, domCache, Renderer, ScrollEngine } = this.getUiBridge();
    if (!state || !refs || !domCache || !Renderer || !ScrollEngine) {
      throw new Error('runtime bridge missing history projection dependencies');
    }

    state.messages = [];
    refs.messageList.innerHTML = '';
    domCache.clear();
    refs.messageList.classList.add('history-hydrating');
    this.isHydrating = true;

    if (messages.length === 0) {
      this.emitDiagnostics(this.copy.diagnostics.historyBootstrapEmpty, [this.copy.diagnostics.noArchivedMessages], this.copy.diagnostics.nominal);
    } else {
      for (const message of messages) {
        state.messages.push(message);
        Renderer.appendMessage(message);
        ScrollEngine.requestFollow(true);
        await sleep(40);
      }
    }

    this.isHydrating = false;
    this.hydrationComplete = true;
    refs.messageList.classList.remove('history-hydrating');

    if (typeof this.onHistoryHydrated === 'function') {
      await this.onHistoryHydrated(messages);
    }
  }

  flushQueuedRealtimeEvents() {
    if (this.queuedRealtimeEvents.length === 0) return;
    const queued = [...this.queuedRealtimeEvents];
    this.queuedRealtimeEvents = [];
    queued.forEach((item) => {
      if (item.kind === 'agent') this.handleAgentEvent(item.frame);
      else if (item.kind === 'chat') this.handleChatEvent(item.frame);
    });
  }

  emitDiagnostics(title, lines, level = 'Critical') {
    this.dispatch({
      type: 'system_diagnostics',
      title,
      level,
      lines,
      tokens: ['SOCKET_EVENT', 'LIVE_GATEWAY']
    });
  }

  triggerWakeUpFlash() {
    const flashNode = this.runtimeBridge.refs?.wakeUpFlash;
    if (!flashNode) return;
    flashNode.classList.remove('is-active');
    void flashNode.offsetWidth;
    flashNode.classList.add('is-active');
    window.setTimeout(() => flashNode.classList.remove('is-active'), 360);
  }

  async sendChat(text) {
    const normalized = text.trim();
    if (!normalized) return;

    this.dispatch({ type: 'telemetry_update', patch: { voiceState: 'pending' } });
    this.dispatch({ type: 'user_message', text: normalized });

    const echoKey = `${this.getNowLabel()}:${stringHash(normalized)}`;
    this.seenRealtimeUserKeys.add(echoKey);

    try {
      await this.request('chat.send', {
        sessionKey: this.mainSessionKey,
        message: normalized,
        idempotencyKey: `jarvis-send-${Date.now()}`
      }, 15000);
    } catch (error) {
      this.dispatch({ type: 'telemetry_update', patch: { voiceState: 'ready' } });
      this.emitDiagnostics(this.copy.diagnostics.chatSendFailed, [String(error?.message || error)], this.copy.diagnostics.critical);
    }
  }

  startAssistantStream(runId) {
    if (this.activeRunId === runId && this.activeAssistantMessageId) return;
    this.activeRunId = runId;
    this.runTextById.set(runId, '');
    this.doneQueued = false;
    this.dispatch({ type: 'assistant_start' });
    this.activeAssistantMessageId = this.runtimeBridge.state?.streaming?.activeMessageId || null;
  }

  enqueueAssistantDelta(runId, delta) {
    if (!delta) return;
    if (!this.activeRunId || this.activeRunId !== runId) {
      this.startAssistantStream(runId);
    }
    this.incomingBuffer += delta;
    this.scheduleFlush();
  }

  scheduleFlush() {
    if (this.flushScheduled) return;
    this.flushScheduled = true;
    requestAnimationFrame(() => {
      window.setTimeout(() => {
        this.flushScheduled = false;
        this.flushIncomingText();
      }, 22);
    });
  }

  flushIncomingText() {
    if (!this.incomingBuffer) {
      if (this.doneQueued) {
        this.doneQueued = false;
        this.finalizeAssistantStream();
      }
      return;
    }

    const maxSlice = this.incomingBuffer.length > 96 ? 28 : this.incomingBuffer.length > 32 ? 18 : 12;
    const slice = this.incomingBuffer.slice(0, Math.min(this.incomingBuffer.length, maxSlice));
    this.incomingBuffer = this.incomingBuffer.slice(slice.length);
    this.dispatch({ type: 'assistant_chunk', text: slice });

    if (this.incomingBuffer) {
      this.scheduleFlush();
    } else if (this.doneQueued) {
      this.doneQueued = false;
      requestAnimationFrame(() => this.finalizeAssistantStream());
    }
  }

  finalizeAssistantStream() {
    if (!this.activeRunId) return;
    this.dispatch({ type: 'assistant_done' });
    this.activeRunId = null;
    this.activeAssistantMessageId = null;
  }

  projectAssistantDelta(runId, nextText) {
    const previous = this.runTextById.get(runId) || '';
    if (!nextText || nextText === previous) return;
    if (!nextText.startsWith(previous)) {
      const replacementDelta = nextText.slice(previous.length) || nextText;
      this.runTextById.set(runId, nextText);
      this.enqueueAssistantDelta(runId, replacementDelta);
      return;
    }
    const delta = nextText.slice(previous.length);
    this.runTextById.set(runId, nextText);
    this.enqueueAssistantDelta(runId, delta);
  }

  handleFrame(raw, resolveConnect, rejectConnect) {
    const frame = parseGatewayFrame(raw);
    if (!frame) return;

    const classified = classifyGatewayFrame(frame);
    if (classified.kind === 'connect_challenge') {
      this.sendConnect(classified.nonce).then(resolveConnect).catch(rejectConnect);
      return;
    }

    if (classified.kind === 'response') {
      this.handleResponse(classified.frame);
      return;
    }

    if (classified.kind === 'tick') {
      if (typeof this.onTick === 'function') this.onTick(classified.frame);
      return;
    }

    if (classified.kind === 'health') {
      if (typeof this.onHealth === 'function') this.onHealth(classified.frame);
      return;
    }

    if (classified.kind === 'agent') {
      const consumed = typeof this.onAgentFrame === 'function' ? this.onAgentFrame(classified.frame) === true : false;
      if (consumed) return;
      if (!this.hydrationComplete) {
        this.queuedRealtimeEvents.push({ kind: 'agent', frame: classified.frame });
        return;
      }
      this.handleAgentEvent(classified.frame);
      return;
    }

    if (classified.kind === 'chat') {
      const consumed = typeof this.onChatFrame === 'function' ? this.onChatFrame(classified.frame) === true : false;
      if (consumed) return;
      if (!this.hydrationComplete) {
        this.queuedRealtimeEvents.push({ kind: 'chat', frame: classified.frame });
        return;
      }
      this.handleChatEvent(classified.frame);
    }
  }

  handleResponse(frame) {
    const pending = this.pendingRequests.get(frame.id);
    if (!pending) return;
    this.pendingRequests.delete(frame.id);
    clearTimeout(pending.timeoutId);
    if (frame.ok) {
      pending.resolve(frame.payload);
    } else {
      pending.reject(new Error(frame.error?.message || `Gateway request failed: ${pending.method}`));
    }
  }

  handleAgentEvent(frame) {
    const normalized = normalizeAgentRealtimeFrame(frame, { sessionKey: this.mainSessionKey });
    if (!normalized) return;

    if (normalized.kind === 'assistant_stream') {
      if (!this.activeRunId) {
        this.startAssistantStream(normalized.runId);
      }

      if (normalized.delta) {
        const previous = this.runTextById.get(normalized.runId) || '';
        this.runTextById.set(normalized.runId, previous + normalized.delta);
        this.enqueueAssistantDelta(normalized.runId, normalized.delta);
      } else if (normalized.text) {
        this.projectAssistantDelta(normalized.runId, normalized.text);
      }
      return;
    }

    if (normalized.kind === 'assistant_done') {
      this.doneQueued = true;
      if (!this.incomingBuffer) {
        this.finalizeAssistantStream();
      }
      return;
    }

    if (normalized.kind === 'agent_error') {
      this.emitDiagnostics(this.copy.diagnostics.agentStreamIssue, [normalized.reason], this.copy.diagnostics.warning);
    }
  }

  handleChatEvent(frame) {
    const normalized = normalizeChatRealtimeFrame(frame, { sessionKey: this.mainSessionKey });
    if (!normalized) return;

    if (normalized.kind === 'assistant_snapshot') {
      const runId = normalized.runId || this.activeRunId || `chat:${normalized.seq || Date.now()}`;
      if (!this.activeRunId) {
        this.startAssistantStream(runId);
      }
      this.projectAssistantDelta(runId, normalized.text);
      if (normalized.isFinal) {
        this.doneQueued = true;
        if (!this.incomingBuffer) {
          this.finalizeAssistantStream();
        }
      }
      return;
    }

    if (normalized.kind === 'user_echo') {
      const key = `${normalized.dedupeSeed}:${stringHash(normalized.text)}`;
      if (this.seenRealtimeUserKeys.has(key)) return;
      this.seenRealtimeUserKeys.add(key);
      this.dispatch({
        type: 'user_message',
        text: normalized.text
      });
    }
  }

  handleClose(event, rejectConnect) {
    this.connected = false;
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
    if (typeof this.onClose === 'function') {
      this.onClose(event);
    }
    if (rejectConnect) rejectConnect(new Error(`Gateway socket closed: ${event.code} ${event.reason || ''}`.trim()));
  }

  handleError(rejectConnect) {
    if (typeof this.onError === 'function') {
      this.onError(new Error('WebSocket transport error'));
    }
    if (rejectConnect) rejectConnect(new Error('WebSocket transport error'));
  }
}
