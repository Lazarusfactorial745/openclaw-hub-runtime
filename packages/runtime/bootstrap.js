import { GatewaySocketAdapter, loadGatewayToken } from '../adapters/openclaw/gateway-adapter.js';
import { ExtractedReconnectManager } from './reconnect-manager.js';
import { bindShellInteractions } from './shell-bootstrap.js';

export async function startRuntimeBootstrap({
  refs,
  state,
  dispatch,
  COPY_ZH,
  domCache,
  Renderer,
  ScrollEngine,
  nowLabel,
  commandController,
  applyInputLockState,
  getResumeTestHarness,
  setGatewayAdapter,
  setReconnectManager,
  shellFlags
}) {
  const updateClock = () => {
    refs.clockLabel.textContent = nowLabel();
  };

  updateClock();
  window.setInterval(updateClock, 1000);

  ScrollEngine.init();
  Renderer.patchTelemetry();
  bindShellInteractions({
    refs,
    state,
    submitPrompt: (text) => commandController.submitPrompt(text),
    ScrollEngine
  });

  try {
    const gatewayToken = await loadGatewayToken();
    const adapterFactory = () => new GatewaySocketAdapter({
      token: gatewayToken,
      sessionKey: 'agent:main:main',
      dispatch,
      copy: COPY_ZH,
      runtimeBridge: {
        state,
        refs,
        domCache,
        Renderer,
        ScrollEngine,
        nowLabel
      }
    });

    const reconnectManager = new ExtractedReconnectManager({
      adapterFactory,
      dispatch,
      sessionKey: 'agent:main:main',
      onInputLockChange: applyInputLockState,
      onWakeFlash: () => refs.wakeUpFlash.classList.add('is-active')
    });
    setReconnectManager(reconnectManager);

    await reconnectManager.start();

    const gatewayAdapter = reconnectManager.activeAdapter;
    setGatewayAdapter(gatewayAdapter);

    try {
      const agents = await gatewayAdapter.loadAgentsList();
      dispatch({ type: 'agents_loaded', items: agents });
    } catch {
      dispatch({ type: 'agents_error' });
    }

    if (shellFlags.autoResumeTest) {
      window.setTimeout(() => {
        getResumeTestHarness()?.runTestResume();
      }, 600);
    }
  } catch (error) {
    dispatch({
      type: 'telemetry_update',
      patch: { linkState: 'offline', voiceState: 'offline' }
    });
    dispatch({
      type: 'system_diagnostics',
      title: COPY_ZH.diagnostics.gatewayBootstrapFailed,
      level: COPY_ZH.diagnostics.critical,
      lines: [
        String(error?.message || error),
        'Ensure gateway.controlUi.allowedOrigins includes http://127.0.0.1:8787 and ./gateway.token is readable.'
      ],
      tokens: ['BOOTSTRAP_FAILED', 'SOCKET_DISCONNECTED']
    });
  }
}
