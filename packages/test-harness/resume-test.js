export class ExtractedResumeTestHarness {
  constructor({ gatewayAdapterRef, reconnectManagerRef, dispatch, state, domCache, refs, ScrollEngine, appendRecoveryDiagnosticsLine, posterMode, COPY_ZH }) {
    this.gatewayAdapterRef = gatewayAdapterRef;
    this.reconnectManagerRef = reconnectManagerRef;
    this.dispatch = dispatch;
    this.state = state;
    this.domCache = domCache;
    this.refs = refs;
    this.ScrollEngine = ScrollEngine;
    this.appendRecoveryDiagnosticsLine = appendRecoveryDiagnosticsLine;
    this.posterMode = posterMode;
    this.COPY_ZH = COPY_ZH;
    this.active = false;
  }

  async runTestResume() {
    const gatewayAdapter = this.gatewayAdapterRef();
    const reconnectManager = this.reconnectManagerRef();
    if (this.active || !gatewayAdapter || !reconnectManager) return;
    this.active = true;

    this.state.messages = [];
    this.domCache.clear();
    this.refs.messageList.innerHTML = '';
    this.state.streaming.isPinnedToBottom = true;
    this.refs.scroller.scrollTop = this.refs.scroller.scrollHeight;
    this.ScrollEngine.requestFollow(true);
    if (!this.posterMode) {
      const cameraLock = window.setInterval(() => {
        this.state.streaming.isPinnedToBottom = true;
        this.refs.scroller.scrollTop = this.refs.scroller.scrollHeight;
        this.ScrollEngine.requestFollow(true);
      }, 100);
      window.setTimeout(() => window.clearInterval(cameraLock), 6000);
    } else {
      this.refs.scroller.scrollTop = 0;
    }

    const userPrompt = this.COPY_ZH.commands.testResumeZh;
    this.dispatch({ type: 'telemetry_update', patch: { voiceState: 'pending' } });
    this.dispatch({ type: 'user_message', text: userPrompt });

    const runId = `test-resume-${Date.now()}`;
    const fullText = this.posterMode
      ? [
          '```python',
          'def calculate_trajectory(v, a):',
          '    return (v ** 2) / (2 * a)',
          '```',
          '',
          'Trajectory solution restored successfully.'
        ].join('\n')
      : [
          'Rebuilding interrupted transmission now.',
          '',
          '```python',
          'def calculate_trajectory(v, a):',
          '    return (v ** 2) / (2 * a)',
          '```',
          '',
          'Trajectory solution restored successfully.'
        ].join('\n');

    const splitMarker = this.posterMode ? '    return (v ** 2)' : 'def calculate_trajectory(v, a):';
    const splitIndex = fullText.indexOf(splitMarker) + splitMarker.length;
    const firstLeg = fullText.slice(0, splitIndex);
    const authoritative = fullText;

    gatewayAdapter.startAssistantStream(runId);

    let cursor = 0;
    const tick = async () => {
      if (!this.active) return;
      if (cursor >= firstLeg.length) {
        window.setTimeout(async () => {
          this.appendRecoveryDiagnosticsLine(this.COPY_ZH.diagnostics.triggeringControlledDrop, this.COPY_ZH.diagnostics.critical);
          const activeArticle = gatewayAdapter.activeAssistantMessageId ? this.domCache.get(gatewayAdapter.activeAssistantMessageId) : null;
          if (activeArticle) activeArticle.classList.add('battle-damaged-stream');
          reconnectManager.captureInterruptedStream();
          reconnectManager.transitionTo('disconnected', { reason: this.COPY_ZH.diagnostics.testHarnessDrop });
          reconnectManager.transitionTo('reconnecting', { reason: this.COPY_ZH.diagnostics.testHarnessDrop, attempt: 1, delay: 2400 });

          if (this.posterMode) {
            const latestDiagnostics = Array.from(document.querySelectorAll('.diagnostics-panel')).at(-1);
            if (latestDiagnostics) latestDiagnostics.classList.add('battle-damaged');
            this.state.streaming.isPinnedToBottom = false;
            this.refs.scroller.scrollTop = 0;
            return;
          }

          window.setTimeout(async () => {
            reconnectManager.enterRecovering({ type: 'hello-ok', test: true });
            await reconnectManager.reconcileHistoryAndResume([
              {
                id: gatewayAdapter.activeAssistantMessageId || `test-history:${Date.now()}`,
                role: 'assistant',
                text: authoritative
              }
            ]);
            this.state.streaming.isPinnedToBottom = true;
            this.ScrollEngine.jumpToBottom();
            this.active = false;
          }, 900);
        }, 180);
        return;
      }

      const chunk = firstLeg.slice(cursor, cursor + 3);
      cursor += 3;
      gatewayAdapter.enqueueAssistantDelta(runId, chunk);
      window.setTimeout(tick, 50);
    };

    tick();
  }
}
