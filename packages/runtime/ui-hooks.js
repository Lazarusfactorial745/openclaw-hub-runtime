export function createInputLockStateHook({ refs, state, COPY_ZH }) {
  return function applyInputLockState(mode) {
    const isSoft = mode === 'soft';
    const isHard = mode === 'hard';

    refs.promptInput.disabled = isHard;
    refs.sendButton.disabled = isHard;
    refs.micButton.disabled = isHard;

    refs.promptInput.classList.remove('opacity-60', 'cursor-not-allowed');
    refs.sendButton.classList.remove('opacity-50', 'pointer-events-none');
    refs.micButton.classList.remove('opacity-50', 'pointer-events-none');

    if (isSoft || isHard) {
      refs.promptInput.classList.add('opacity-60');
    }
    if (isHard) {
      refs.promptInput.classList.add('cursor-not-allowed');
      refs.sendButton.classList.add('opacity-50', 'pointer-events-none');
      refs.micButton.classList.add('opacity-50', 'pointer-events-none');
      refs.consoleStatus.textContent = COPY_ZH.input.recovering;
      refs.promptInput.placeholder = COPY_ZH.input.placeholderOffline;
    } else if (isSoft) {
      refs.consoleStatus.textContent = COPY_ZH.input.degraded;
      refs.promptInput.placeholder = COPY_ZH.input.placeholderDegraded;
    } else {
      refs.consoleStatus.textContent = state.telemetry.voiceState === 'pending'
        ? COPY_ZH.input.pending
        : state.telemetry.voiceState === 'offline'
          ? COPY_ZH.input.offline
          : COPY_ZH.input.armed;
      refs.promptInput.placeholder = COPY_ZH.input.placeholderDefault;
    }
  };
}

export function createRecoveryDiagnosticsAppender({ dispatch, state, domCache, COPY_ZH, requestFollow }) {
  let recoveryDiagnosticsPanelId = null;

  return function appendRecoveryDiagnosticsLine(text, severity = 'Critical') {
    if (!recoveryDiagnosticsPanelId) {
      recoveryDiagnosticsPanelId = dispatch({
        type: 'system_diagnostics',
        title: COPY_ZH.diagnostics.criticalSocketDisconnected,
        level: severity,
        lines: [text],
        tokens: [COPY_ZH.diagnostics.recoveryProtocol, COPY_ZH.diagnostics.liveGateway]
      });
      return recoveryDiagnosticsPanelId;
    }

    const message = state.messages.find((item) => item.id === recoveryDiagnosticsPanelId);
    const panel = domCache.get(recoveryDiagnosticsPanelId);
    if (!message || !panel) {
      recoveryDiagnosticsPanelId = dispatch({
        type: 'system_diagnostics',
        title: COPY_ZH.diagnostics.criticalSocketDisconnected,
        level: severity,
        lines: [text],
        tokens: [COPY_ZH.diagnostics.recoveryProtocol, COPY_ZH.diagnostics.liveGateway]
      });
      return recoveryDiagnosticsPanelId;
    }

    if (severity === 'Critical') {
      panel.classList.add('battle-damaged');
    }

    if (!Array.isArray(message.lines)) {
      message.lines = [];
    }
    message.lines.push(text);
    const linesContainer = panel.querySelector('[data-role="diagnostics-lines"]');
    if (!linesContainer) return recoveryDiagnosticsPanelId;

    const line = document.createElement('p');
    line.className = 'font-mono text-sm leading-relaxed text-[#9bc0cf]';
    line.textContent = text;
    linesContainer.appendChild(line);
    requestFollow(true);
    return recoveryDiagnosticsPanelId;
  };
}

export function createForceOrphanedCursor() {
  return function forceOrphanedCursor() {
    window.requestAnimationFrame(() => {
      const cursorNodes = Array.from(document.querySelectorAll('[data-role="cursor"]'));
      const target = cursorNodes.find((node) => !node.classList.contains('is-hidden')) || cursorNodes.at(-1);
      if (!target) return;
      target.classList.remove('is-idle', 'is-hidden');
      target.classList.add('is-orphaned');
    });
  };
}
