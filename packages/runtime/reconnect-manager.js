export class ExtractedReconnectManager {
  constructor({
    adapterFactory,
    dispatch,
    sessionKey,
    onInputLockChange,
    onWakeFlash,
    appendRecoveryDiagnosticsLine,
    forceOrphanedCursor,
    Renderer,
    COPY_ZH,
    sleep
  }) {
    this.adapterFactory = adapterFactory;
    this.dispatch = dispatch;
    this.sessionKey = sessionKey;
    this.onInputLockChange = onInputLockChange;
    this.onWakeFlash = onWakeFlash;
    this.appendRecoveryDiagnosticsLine = appendRecoveryDiagnosticsLine;
    this.forceOrphanedCursor = forceOrphanedCursor;
    this.Renderer = Renderer;
    this.COPY_ZH = COPY_ZH;
    this.sleep = sleep;
    this.activeAdapter = null;
    this.phase = 'disconnected';
    this.attempt = 0;
    this.maxAttempts = 5;
    this.reconnectTimerId = null;
    this.lastDisconnectReason = null;
    this.nextDelayMs = 0;
    this.queuedRealtimeEvents = [];
    this.appliedReplayKeys = new Set();
    this.recoveringHelloOk = null;
    this.streamRecovery = {
      activeRunId: null,
      activeAssistantMessageId: null,
      textAtDisconnect: '',
      hadOpenCursor: false,
      interruptedAtMs: 0,
      awaitingResume: false
    };
  }

  async start() {
    await this.connectFresh();
  }

  stop() {
    this.cancelReconnectTimer();
    if (this.activeAdapter) {
      this.activeAdapter.disconnect();
      this.activeAdapter = null;
    }
    this.transitionTo('disconnected');
  }

  async connectFresh() {
    this.cancelReconnectTimer();
    const adapter = this.adapterFactory();
    adapter.__disconnectHandled = false;
    adapter.historyRenderMode = this.streamRecovery.awaitingResume ? 'defer' : 'render';
    this.activeAdapter = adapter;
    this.bindAdapter(adapter);
    this.transitionTo('connecting');
    await adapter.connect();
  }

  bindAdapter(adapter) {
    adapter.onHelloOk = (helloOk) => {
      this.attempt = 0;
      if (this.streamRecovery.awaitingResume || this.phase === 'reconnecting') {
        this.enterRecovering(helloOk);
        return;
      }
      this.transitionTo('connected');
      if (typeof this.onWakeFlash === 'function') this.onWakeFlash();
    };
    adapter.onClose = (event) => {
      this.handleAdapterDisconnect(adapter, event?.reason || 'socket closed');
    };
    adapter.onError = (error) => {
      this.handleAdapterDisconnect(adapter, error?.message || 'transport error');
    };
    adapter.onTick = () => {};
    adapter.onHealth = () => {};
    adapter.onAgentFrame = (frame) => {
      if (this.phase === 'recovering' || this.phase === 'reconnecting') {
        this.queueRealtimeFrame({ kind: 'agent', frame });
        return true;
      }
      return false;
    };
    adapter.onChatFrame = (frame) => {
      if (this.phase === 'recovering' || this.phase === 'reconnecting') {
        this.queueRealtimeFrame({ kind: 'chat', frame });
        return true;
      }
      return false;
    };
    adapter.onHistoryHydrated = async (messages) => {
      if (this.phase === 'recovering') {
        await this.reconcileHistoryAndResume(messages);
      }
    };
  }

  captureInterruptedStream() {
    const adapter = this.activeAdapter;
    if (adapter && adapter.activeRunId && adapter.activeAssistantMessageId) {
      const textAtDisconnect = adapter.runTextById.get(adapter.activeRunId) || '';
      this.streamRecovery = {
        activeRunId: adapter.activeRunId,
        activeAssistantMessageId: adapter.activeAssistantMessageId,
        textAtDisconnect,
        hadOpenCursor: true,
        interruptedAtMs: Date.now(),
        awaitingResume: true
      };
      this.Renderer.patchAssistantMessage(adapter.activeAssistantMessageId, textAtDisconnect, 'orphaned');
      return;
    }
    this.forceOrphanedCursor();
  }

  handleAdapterDisconnect(adapter, reason) {
    if (adapter !== this.activeAdapter) return;
    if (adapter.__disconnectHandled) return;
    adapter.__disconnectHandled = true;
    this.captureInterruptedStream();
    this.transitionTo('disconnected', { reason });
    this.scheduleReconnect(reason);
  }

  cancelReconnectTimer() {
    if (this.reconnectTimerId) {
      clearTimeout(this.reconnectTimerId);
      this.reconnectTimerId = null;
    }
  }

  computeBackoffDelay(attempt) {
    const base = Math.min(8000, 2000 * (2 ** Math.max(0, attempt - 1)));
    const jitter = Math.round(base * 0.1);
    const drift = Math.floor((Math.random() * ((jitter * 2) + 1)) - jitter);
    return Math.max(250, base + drift);
  }

  scheduleReconnect(reason) {
    if (this.phase === 'failed') return;
    this.cancelReconnectTimer();
    this.attempt += 1;
    if (this.attempt > this.maxAttempts) {
      this.transitionTo('failed', { reason });
      return;
    }
    const delay = this.computeBackoffDelay(this.attempt);
    this.transitionTo('reconnecting', { reason, attempt: this.attempt, delay });
    this.appendRecoveryDiagnosticsLine(`[系统] 正在重连... 第 ${this.attempt}/${this.maxAttempts} 次 [等待中]`, this.COPY_ZH.diagnostics.warning);
    this.reconnectTimerId = window.setTimeout(async () => {
      this.reconnectTimerId = null;
      try {
        await this.connectFresh();
        this.appendRecoveryDiagnosticsLine(`[系统] 正在重连... 第 ${this.attempt}/${this.maxAttempts} 次 [已恢复]`, this.COPY_ZH.diagnostics.nominal);
      } catch (error) {
        this.appendRecoveryDiagnosticsLine(`[系统] 正在重连... 第 ${this.attempt}/${this.maxAttempts} 次 [失败]`, this.COPY_ZH.diagnostics.critical);
        this.scheduleReconnect(error?.message || reason);
      }
    }, delay);
  }

  enterRecovering(helloOk) {
    this.recoveringHelloOk = helloOk;
    this.transitionTo('recovering', { helloOk });
    if (typeof this.onWakeFlash === 'function') this.onWakeFlash();
  }

  queueRealtimeFrame(entry) {
    const key = this.makeFrameKey(entry.frame);
    if (this.appliedReplayKeys.has(key)) return;
    if (this.queuedRealtimeEvents.some((item) => item.key === key)) return;
    this.queuedRealtimeEvents.push({ ...entry, key });
  }

  makeFrameKey(frame) {
    const payload = frame?.payload ?? {};
    const seq = frame?.seq ?? payload?.seq ?? 'na';
    const runId = payload?.runId ?? payload?.sessionKey ?? 'na';
    const stateKey = payload?.state ?? payload?.stream ?? 'na';
    return `${frame?.event}:${runId}:${seq}:${stateKey}`;
  }

  async reconcileHistoryAndResume(messages) {
    this.appendRecoveryDiagnosticsLine(this.COPY_ZH.diagnostics.syncingHistory, this.COPY_ZH.diagnostics.warning);
    await this.sleep(380);

    if (!this.streamRecovery.awaitingResume) {
      this.replayQueuedFrames();
      this.transitionTo('connected');
      return;
    }

    const latestAssistant = [...messages].reverse().find((message) => message.role === 'assistant');
    const capturedText = this.streamRecovery.textAtDisconnect || '';

    if (latestAssistant && capturedText && latestAssistant.text.startsWith(capturedText)) {
      const delta = latestAssistant.text.slice(capturedText.length);
      this.appendRecoveryDiagnosticsLine(this.COPY_ZH.diagnostics.historyPrefixExtended, this.COPY_ZH.diagnostics.nominal);
      if (delta && this.activeAdapter) {
        const recoveredRunId = this.streamRecovery.activeRunId || `recovered:${Date.now()}`;
        this.activeAdapter.activeRunId = recoveredRunId;
        this.activeAdapter.activeAssistantMessageId = this.streamRecovery.activeAssistantMessageId;
        this.activeAdapter.runTextById.set(recoveredRunId, capturedText);
        this.activeAdapter.enqueueAssistantDelta(recoveredRunId, delta);
      }
    } else if (latestAssistant && latestAssistant.text === capturedText) {
      this.appendRecoveryDiagnosticsLine(this.COPY_ZH.diagnostics.historySnapshotMatch, this.COPY_ZH.diagnostics.nominal);
    } else {
      this.appendRecoveryDiagnosticsLine(this.COPY_ZH.diagnostics.recoveredViaResync, this.COPY_ZH.diagnostics.warning);
      if (this.streamRecovery.activeAssistantMessageId && capturedText) {
        this.Renderer.patchAssistantMessage(this.streamRecovery.activeAssistantMessageId, capturedText, 'hidden');
      }
    }

    this.streamRecovery.awaitingResume = false;
    this.replayQueuedFrames();
    this.transitionTo('connected');
  }

  replayQueuedFrames() {
    if (!this.activeAdapter || this.queuedRealtimeEvents.length === 0) return;
    const queue = [...this.queuedRealtimeEvents].sort((left, right) => {
      const leftSeq = left.frame?.seq ?? left.frame?.payload?.seq ?? 0;
      const rightSeq = right.frame?.seq ?? right.frame?.payload?.seq ?? 0;
      return leftSeq - rightSeq;
    });
    this.queuedRealtimeEvents = [];
    queue.forEach((entry) => {
      this.appliedReplayKeys.add(entry.key);
      if (entry.kind === 'agent') this.activeAdapter.handleAgentEvent(entry.frame);
      else if (entry.kind === 'chat') this.activeAdapter.handleChatEvent(entry.frame);
    });
  }

  transitionTo(phase, meta = {}) {
    this.phase = phase;
    if (phase === 'connecting') {
      this.onInputLockChange?.('soft');
      this.dispatch({ type: 'telemetry_update', patch: { linkState: 'connecting' } });
      this.appendRecoveryDiagnosticsLine(this.COPY_ZH.diagnostics.connectMainSession(this.sessionKey), this.COPY_ZH.diagnostics.warning);
      return;
    }
    if (phase === 'connected') {
      this.cancelReconnectTimer();
      this.onInputLockChange?.('none');
      this.dispatch({ type: 'telemetry_update', patch: { linkState: 'linked' } });
      this.appendRecoveryDiagnosticsLine(this.COPY_ZH.diagnostics.linkRestored, this.COPY_ZH.diagnostics.nominal);
      return;
    }
    if (phase === 'disconnected') {
      this.onInputLockChange?.('hard');
      this.dispatch({ type: 'telemetry_update', patch: { linkState: 'offline', voiceState: 'offline' } });
      this.appendRecoveryDiagnosticsLine(this.COPY_ZH.diagnostics.connectionLost(meta.reason || '未知原因'), this.COPY_ZH.diagnostics.critical);
      this.forceOrphanedCursor();
      return;
    }
    if (phase === 'reconnecting') {
      this.onInputLockChange?.('hard');
      this.dispatch({ type: 'telemetry_update', patch: { linkState: 'offline', voiceState: 'offline', latencyMs: 0 } });
      this.appendRecoveryDiagnosticsLine(this.COPY_ZH.diagnostics.recoveryTimer(meta.delay ?? 0), this.COPY_ZH.diagnostics.warning);
      this.forceOrphanedCursor();
      return;
    }
    if (phase === 'recovering') {
      this.onInputLockChange?.('hard');
      this.dispatch({ type: 'telemetry_update', patch: { linkState: 'connecting', voiceState: 'pending' } });
      this.appendRecoveryDiagnosticsLine(this.COPY_ZH.diagnostics.linkRestored, this.COPY_ZH.diagnostics.nominal);
      return;
    }
    if (phase === 'failed') {
      this.onInputLockChange?.('hard');
      this.dispatch({ type: 'telemetry_update', patch: { linkState: 'offline', voiceState: 'offline', latencyMs: 0 } });
      this.appendRecoveryDiagnosticsLine(this.COPY_ZH.diagnostics.recoveryFailed, this.COPY_ZH.diagnostics.critical);
    }
  }
}
