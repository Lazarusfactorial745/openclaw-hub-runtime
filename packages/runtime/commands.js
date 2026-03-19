function injectManualDiagnostics({ dispatch, COPY_ZH, triggerText }) {
  dispatch({ type: 'telemetry_update', patch: { voiceState: 'pending' } });
  dispatch({ type: 'user_message', text: triggerText });
  window.setTimeout(() => {
    dispatch({
      type: 'system_diagnostics',
      title: COPY_ZH.diagnostics.manualDiagnoseTitle,
      level: COPY_ZH.diagnostics.warning,
      lines: [
        COPY_ZH.diagnostics.manualDiagnoseWarn,
        COPY_ZH.diagnostics.manualDiagnosePath,
        COPY_ZH.diagnostics.manualDiagnoseNote,
        COPY_ZH.diagnostics.manualDiagnoseHint
      ],
      tokens: ['<qqfile>', '<qqvoice>', 'TTS_DISABLED', 'FALLBACK_ROUTE']
    });
    dispatch({ type: 'telemetry_update', patch: { voiceState: 'ready' } });
  }, 220);
}

export function createCommandController({
  refs,
  state,
  dispatch,
  COPY_ZH,
  getGatewayAdapter,
  getResumeTestHarness
}) {
  return {
    async submitPrompt(text) {
      const normalized = text.trim();
      if (!normalized) return;

      refs.promptInput.value = '';
      state.ui.inputValue = '';

      if (normalized.toLowerCase() === COPY_ZH.commands.diagnoseEn || normalized === COPY_ZH.commands.diagnoseZh) {
        injectManualDiagnostics({ dispatch, COPY_ZH, triggerText: normalized });
        return;
      }

      if (normalized.toLowerCase() === COPY_ZH.commands.testResumeEn || normalized === COPY_ZH.commands.testResumeZh) {
        await getResumeTestHarness()?.runTestResume();
        return;
      }

      const gatewayAdapter = getGatewayAdapter();
      if (!gatewayAdapter) {
        dispatch({
          type: 'system_diagnostics',
          title: COPY_ZH.diagnostics.gatewayAdapterMissing,
          level: COPY_ZH.diagnostics.critical,
          lines: ['实时网关适配器尚未就绪，因此当前无法执行发送。'],
          tokens: [COPY_ZH.diagnostics.criticalSocketDisconnected, '适配器缺失']
        });
        return;
      }

      await gatewayAdapter.sendChat(normalized);
    }
  };
}
