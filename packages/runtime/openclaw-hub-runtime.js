import { ExtractedResumeTestHarness } from '../test-harness/resume-test.js';
import { createScrollEngine } from './scroll-engine.js';
import { createInputLockStateHook, createRecoveryDiagnosticsAppender, createForceOrphanedCursor } from './ui-hooks.js';
import { createRenderer } from './renderer.js';
import { createRuntimeStore } from './store.js';
import { createShellContext, formatNowLabel, readShellFlags } from './shell-bootstrap.js';
import { createCommandController } from './commands.js';
import { startRuntimeBootstrap } from './bootstrap.js';
import { DEFAULT_COPY_ZH } from '../shared/copy.zh-CN.js';

// Design Tokens / DOM refs
    const HUB_CONFIG = window.HUB_CONFIG || {};
    const { features: HUB_FEATURES, refs } = createShellContext(HUB_CONFIG);
    const domCache = new Map();

    const nowLabel = formatNowLabel;

    let ScrollEngine = null;
    const { state, dispatch } = createRuntimeStore({
      getCopy: () => COPY_ZH,
      nowLabel,
      getRenderer: () => Renderer,
      getScrollEngine: () => ScrollEngine
    });

    // Renderer

    // Scroll Engine

    let gatewayAdapter = null;
    let reconnectManager = null;
    let Renderer = null;
    let ResumeTestHarness = null;
    const COPY_ZH = window.COPY_ZH || DEFAULT_COPY_ZH;
    const applyInputLockState = createInputLockStateHook({ refs, state, COPY_ZH });
    const appendRecoveryDiagnosticsLine = createRecoveryDiagnosticsAppender({
      dispatch,
      state,
      domCache,
      COPY_ZH,
      requestFollow: (force) => ScrollEngine.requestFollow(force)
    });
    const forceOrphanedCursor = createForceOrphanedCursor();
    ScrollEngine = createScrollEngine({ refs, state });
    // poster=1 enables the portfolio-grade battle-damaged freeze frame for /test-resume
    const shellFlags = readShellFlags();
    const posterMode = shellFlags.posterMode;
    if (posterMode) {
      document.body.classList.add('poster-mode');
    }

    Renderer = createRenderer({ refs, state, domCache, COPY_ZH, HUB_FEATURES, dispatch });
    ResumeTestHarness = new ExtractedResumeTestHarness({
      gatewayAdapterRef: () => gatewayAdapter,
      reconnectManagerRef: () => reconnectManager,
      dispatch,
      state,
      domCache,
      refs,
      ScrollEngine,
      appendRecoveryDiagnosticsLine,
      posterMode,
      COPY_ZH
    });

    const commandController = createCommandController({
      refs,
      state,
      dispatch,
      COPY_ZH,
      getGatewayAdapter: () => gatewayAdapter,
      getResumeTestHarness: () => ResumeTestHarness
    });
    startRuntimeBootstrap({
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
      getResumeTestHarness: () => ResumeTestHarness,
      setGatewayAdapter: (value) => { gatewayAdapter = value; },
      setReconnectManager: (value) => { reconnectManager = value; },
      shellFlags
    });







