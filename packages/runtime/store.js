export function createRuntimeStore({ getCopy, nowLabel, getRenderer, getScrollEngine }) {
  let messageIdCounter = 0;

  function nextMessageId() {
    messageIdCounter += 1;
    return `msg-${messageIdCounter}`;
  }

  const state = {
    messages: [],
    telemetry: {
      latencyMs: 41,
      voiceState: 'ready',
      linkState: 'linked'
    },
    streaming: {
      activeMessageId: null,
      phase: 'idle',
      isPinnedToBottom: true
    },
    ui: {
      inputValue: '',
      diagnosticsMode: false
    },
    agents: {
      items: [],
      selectedAgentId: 'main',
      status: 'loading'
    }
  };

  function dispatch(event) {
    const COPY_ZH = getCopy();
    const Renderer = getRenderer();
    const ScrollEngine = getScrollEngine();

    switch (event.type) {
      case 'user_message': {
        const message = {
          id: nextMessageId(),
          role: 'user',
          kind: 'message',
          header: COPY_ZH.message.operator,
          subheader: COPY_ZH.message.localUserVoicePending,
          text: event.text,
          timestamp: nowLabel(),
          status: 'done'
        };
        state.messages.push(message);
        state.streaming.phase = 'user_submitted';
        state.streaming.isPinnedToBottom = true;
        Renderer?.appendMessage(message);
        ScrollEngine?.requestFollow(true);
        return message.id;
      }

      case 'assistant_start': {
        const message = {
          id: nextMessageId(),
          role: 'assistant',
          kind: 'message',
          header: 'J.A.R.V.I.S. Core',
          subheader: COPY_ZH.message.responseStreamHud,
          text: '',
          timestamp: nowLabel(),
          status: 'pending'
        };
        state.messages.push(message);
        state.streaming.activeMessageId = message.id;
        state.streaming.phase = 'assistant_pending';
        Renderer?.appendMessage(message);
        ScrollEngine?.requestFollow(true);
        ScrollEngine?.updateScrollBadge();
        return message.id;
      }

      case 'assistant_chunk': {
        const message = state.messages.find((item) => item.id === state.streaming.activeMessageId);
        if (!message) return null;
        message.text += event.text;
        message.status = 'streaming';
        state.streaming.phase = 'assistant_streaming';
        Renderer?.patchAssistantMessage(message.id, message.text, 'streaming');
        ScrollEngine?.requestFollow();
        ScrollEngine?.updateScrollBadge();
        return message.id;
      }

      case 'assistant_done': {
        const message = state.messages.find((item) => item.id === state.streaming.activeMessageId);
        if (!message) return null;
        message.status = 'done';
        state.streaming.phase = 'assistant_settling';
        Renderer?.patchAssistantMessage(message.id, message.text, 'idle');
        window.setTimeout(() => {
          state.streaming.phase = 'assistant_done';
          state.streaming.activeMessageId = null;
          dispatch({
            type: 'telemetry_update',
            patch: { voiceState: 'ready' }
          });
          ScrollEngine?.updateScrollBadge();
        }, 240);
        ScrollEngine?.requestFollow(true);
        ScrollEngine?.updateScrollBadge();
        return message.id;
      }

      case 'system_diagnostics': {
        const message = {
          id: nextMessageId(),
          role: 'system',
          kind: 'diagnostics',
          title: event.title,
          level: event.level || 'Warning',
          lines: event.lines,
          tokens: event.tokens || [],
          timestamp: nowLabel()
        };
        state.messages.push(message);
        Renderer?.appendMessage(message);
        ScrollEngine?.requestFollow(true);
        return message.id;
      }

      case 'telemetry_update': {
        state.telemetry = {
          ...state.telemetry,
          ...event.patch
        };
        Renderer?.patchTelemetry();
        return null;
      }

      case 'agents_loaded': {
        state.agents.items = event.items;
        state.agents.status = 'ready';
        Renderer?.renderSidebarAgents();
        return null;
      }

      case 'agents_error': {
        state.agents.status = 'error';
        Renderer?.renderSidebarAgents();
        return null;
      }

      case 'agent_selected': {
        state.agents.selectedAgentId = event.agentId;
        Renderer?.renderSidebarAgents();
        return null;
      }

      default:
        return null;
    }
  }

  return {
    state,
    dispatch
  };
}
