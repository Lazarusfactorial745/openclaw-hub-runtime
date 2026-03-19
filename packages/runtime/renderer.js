function parseAssistantSegments(source) {
  const segments = [];
  const lines = String(source || '').split('\n');
  let textBuffer = [];
  let codeBuffer = [];
  let inCode = false;
  let language = 'TEXT';

  const pushText = () => {
    const value = textBuffer.join('\n');
    if (value.length > 0) {
      segments.push({ type: 'text', text: value });
    }
    textBuffer = [];
  };

  const pushCode = (open = false) => {
    const value = codeBuffer.join('\n');
    segments.push({ type: 'code', language, text: value, open });
    codeBuffer = [];
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (!inCode) {
        pushText();
        inCode = true;
        language = line.slice(3).trim().toUpperCase() || 'TEXT';
      } else {
        pushCode(false);
        inCode = false;
        language = 'TEXT';
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
    } else {
      textBuffer.push(line);
    }
  }

  if (inCode) {
    pushCode(true);
  } else {
    pushText();
  }

  return segments.filter((segment) => segment.text.length > 0 || segment.type === 'code');
}

function toDiagnosticsLevelLabel(level, copy) {
  if (level === copy.diagnostics.warning || level === copy.diagnostics.critical || level === copy.diagnostics.nominal) {
    return level;
  }

  const normalized = String(level || '').trim().toLowerCase();
  if (normalized === 'critical') return copy.diagnostics.critical;
  if (normalized === 'nominal') return copy.diagnostics.nominal;
  return copy.diagnostics.warning;
}

export function createRenderer({ refs, state, domCache, COPY_ZH, HUB_FEATURES, dispatch }) {
  return {
    appendMessage(message) {
      let element;
      if (message.kind === 'diagnostics') {
        element = this.createDiagnosticsPanel(message);
      } else if (message.role === 'assistant') {
        element = this.createAssistantShell(message);
      } else {
        element = this.createUserMessage(message);
      }

      refs.messageList.appendChild(element);
      domCache.set(message.id, element);

      if (message.role === 'assistant') {
        this.patchAssistantMessage(
          message.id,
          message.text || '',
          message.status === 'done' ? 'hidden' : 'streaming'
        );
      }

      if (message.kind === 'diagnostics') {
        this.triggerDiagnosticsRitual(element);
      }
    },

    patchAssistantMessage(messageId, nextText, cursorState) {
      const element = domCache.get(messageId);
      if (!element) return;

      const contentNode = element.querySelector('[data-role="assistant-content"]');
      const cursorNode = element.querySelector('[data-role="cursor"]');
      if (!contentNode || !cursorNode) return;

      const segments = parseAssistantSegments(nextText);
      contentNode.innerHTML = '';

      let lastAttachTarget = null;

      if (segments.length === 0) {
        const paragraph = document.createElement('p');
        paragraph.className = 'leading-7 text-[#D9F7FF] whitespace-pre-wrap';
        contentNode.appendChild(paragraph);
        lastAttachTarget = paragraph;
      }

      segments.forEach((segment) => {
        if (segment.type === 'code') {
          const panel = document.createElement('section');
          panel.className = 'code-block-panel rounded-2xl px-4 py-4';
          panel.innerHTML = `
            <div class="mb-3 flex items-center justify-between gap-3">
              <span class="font-mono text-[10px] uppercase tracking-[0.24em] text-[#5D7385]">Sub Terminal</span>
              <span data-role="code-language" class="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00f3ff]/50">${segment.language}</span>
            </div>
            <pre class="overflow-x-auto font-mono text-[13px] leading-6 text-[#d5f9ff]"><code></code></pre>
          `;
          const codeNode = panel.querySelector('code');
          codeNode.textContent = segment.text;
          contentNode.appendChild(panel);
          lastAttachTarget = codeNode;
          return;
        }

        const blocks = segment.text.split(/\n{2,}/).filter(Boolean);
        if (blocks.length === 0) {
          const paragraph = document.createElement('p');
          paragraph.className = 'leading-7 text-[#D9F7FF] whitespace-pre-wrap';
          contentNode.appendChild(paragraph);
          lastAttachTarget = paragraph;
          return;
        }

        blocks.forEach((block) => {
          const paragraph = document.createElement('p');
          paragraph.className = 'leading-7 text-[#D9F7FF] whitespace-pre-wrap';
          paragraph.textContent = block;
          contentNode.appendChild(paragraph);
          lastAttachTarget = paragraph;
        });
      });

      cursorNode.classList.remove('is-idle', 'is-hidden', 'is-orphaned');
      if (cursorState === 'idle') {
        cursorNode.classList.add('is-idle');
      }
      if (cursorState === 'orphaned') {
        cursorNode.classList.add('is-orphaned');
      }
      if (cursorState === 'hidden') {
        cursorNode.classList.add('is-hidden');
      }

      if (lastAttachTarget) {
        lastAttachTarget.appendChild(cursorNode);
      }
    },

    patchTelemetry() {
      const latency = state.telemetry.latencyMs;
      const tone = state.telemetry.linkState === 'offline'
        ? 'critical'
        : state.telemetry.linkState === 'connecting'
          ? 'warn'
          : latency > 100
            ? 'warn'
            : 'good';

      refs.latencyValue.textContent = `${latency}ms // ${tone === 'good' ? COPY_ZH.telemetry.warmPath : tone === 'warn' ? COPY_ZH.telemetry.degraded : COPY_ZH.telemetry.offline}`;
      refs.latencyValue.className = [
        'font-mono',
        'text-[11px]',
        tone === 'good' ? 'text-[#00F3FF]' : tone === 'warn' ? 'text-[#FF9D00]' : 'text-rose-400'
      ].join(' ');

      this.applyTelemetryChip(
        refs.linkChip,
        state.telemetry.linkState === 'offline'
          ? COPY_ZH.topbar.linkLost
          : state.telemetry.linkState === 'connecting'
            ? COPY_ZH.topbar.linkConnecting
            : COPY_ZH.topbar.linkActive,
        tone
      );
      this.applyTelemetryChip(
        refs.sidebarLinkChip,
        state.telemetry.linkState === 'offline'
          ? COPY_ZH.sidebar.linkOffline
          : state.telemetry.linkState === 'connecting'
            ? COPY_ZH.sidebar.linkConnecting
            : COPY_ZH.sidebar.linkActive,
        tone
      );

      const voiceTone = state.telemetry.voiceState === 'pending'
        ? 'warn'
        : state.telemetry.voiceState === 'offline'
          ? 'critical'
          : 'good';

      this.applyTelemetryChip(
        refs.voiceChip,
        state.telemetry.voiceState === 'pending' ? COPY_ZH.topbar.voicePending : state.telemetry.voiceState === 'offline' ? COPY_ZH.topbar.voiceOffline : COPY_ZH.topbar.voiceReady,
        voiceTone
      );

      refs.consoleStatus.textContent = state.telemetry.voiceState === 'pending'
        ? COPY_ZH.input.pending
        : state.telemetry.voiceState === 'offline'
          ? COPY_ZH.input.offline
          : COPY_ZH.input.armed;

      refs.micButton.classList.remove('mic-ready', 'mic-pending', 'telemetry-critical');
      if (state.telemetry.voiceState === 'pending') {
        refs.micButton.classList.add('mic-pending');
      } else if (state.telemetry.voiceState === 'offline') {
        refs.micButton.classList.add('telemetry-critical');
      } else {
        refs.micButton.classList.add('mic-ready');
      }
    },

    applyTelemetryChip(node, text, tone) {
      if (!node) return;
      node.textContent = text;
      node.classList.remove('telemetry-good', 'telemetry-warn', 'telemetry-critical');
      node.classList.add(
        tone === 'good' ? 'telemetry-good' : tone === 'warn' ? 'telemetry-warn' : 'telemetry-critical'
      );
    },

    createUserMessage(message) {
      const article = document.createElement('article');
      article.className = 'message-enter ml-auto w-full max-w-3xl rounded-[28px] border border-[#00f3ff]/20 bg-[#0a1628]/80 px-5 py-4 shadow-neon-soft';
      article.dataset.messageId = message.id;
      article.innerHTML = `
        <div class="mb-2 flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#00F3FF]">${message.header}</p>
            <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-[#5D7385]">${message.subheader}</p>
          </div>
          <time class="font-mono text-[11px] text-[#5D7385]">${message.timestamp}</time>
        </div>
        <p class="leading-7 text-[#D9F7FF]"></p>
      `;
      article.querySelector('p.leading-7').textContent = message.text;
      return article;
    },

    createAssistantShell(message) {
      const article = document.createElement('article');
      article.className = 'message-enter w-full max-w-4xl rounded-[28px] border border-[#00f3ff]/15 bg-[#07111f]/70 px-5 py-4 shadow-[0_0_22px_rgba(0,243,255,0.05)]';
      article.dataset.messageId = message.id;
      article.innerHTML = `
        <div class="mb-2 flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#a9fbff]">${message.header}</p>
            <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-[#5D7385]">${message.subheader}</p>
          </div>
          <time class="font-mono text-[11px] text-[#5D7385]">${message.timestamp}</time>
        </div>
        <div data-role="assistant-content" class="space-y-3"></div>
        <div class="hidden"><span data-role="cursor" class="typing-cursor ml-1"></span></div>
      `;
      return article;
    },

    createDiagnosticsPanel(message) {
      const panel = document.createElement('section');
      panel.className = 'diagnostics-panel chrome-glow message-enter rounded-[28px] border border-[#00f3ff]/15 bg-black/45 p-0 shadow-[0_0_24px_rgba(0,243,255,0.06)]';
      panel.dataset.messageId = message.id;

      const linesHtml = message.lines.map((line) => {
        const paragraph = document.createElement('p');
        paragraph.className = 'font-mono text-sm leading-relaxed text-[#9bc0cf]';
        paragraph.textContent = line;
        return paragraph.outerHTML;
      }).join('');

      const tokensHtml = message.tokens.map((token) => {
        const isWarnToken = token.includes('WARN') || token.includes('DISABLED') || token.includes('DEGRADED');
        return `<span class="rounded-full border ${isWarnToken ? 'border-[#ff9d00]/25 bg-[#1b1408] text-[#ffca7a]' : 'border-[#00f3ff]/20 bg-[#0d1526] text-[#7ff9ff]'} px-2.5 py-1 font-mono text-[11px]">${token}</span>`;
      }).join('');

      panel.innerHTML = `
        <div class="diagnostics-grid"></div>
        <div class="diagnostics-scanline"></div>
        <div class="diagnostics-unfold">
          <div class="diagnostics-unfold-inner">
            <div class="grid grid-cols-[6px_1fr]">
              <div class="diagnostics-rail rounded-l-[28px] bg-gradient-to-b from-[#FF9D00] via-[#00F3FF] to-transparent"></div>
              <div class="relative z-10 p-5">
                <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p class="font-mono text-[10px] uppercase tracking-[0.28em] text-[#5D7385]">${COPY_ZH.diagnostics.title}</p>
                    <h3 class="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-[#D9F7FF]">${message.title}</h3>
                  </div>
                  <span class="rounded-full border border-[#ff9d00]/35 bg-[#ff9d00]/[0.08] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#ffcf88]">${toDiagnosticsLevelLabel(message.level, COPY_ZH)}</span>
                </div>
                <div data-role="diagnostics-lines" class="space-y-2">${linesHtml}</div>
                <div class="mt-4 flex flex-wrap gap-2">${tokensHtml}</div>
              </div>
            </div>
          </div>
        </div>
      `;
      return panel;
    },

    triggerDiagnosticsRitual(panel) {
      const unfold = panel.querySelector('.diagnostics-unfold');
      const scanline = panel.querySelector('.diagnostics-scanline');
      if (!unfold || !scanline) return;

      panel.classList.add('is-ritual-active');
      requestAnimationFrame(() => {
        unfold.classList.add('is-expanded');
        scanline.classList.remove('is-active');
        void scanline.offsetWidth;
        scanline.classList.add('is-active');
      });

      window.setTimeout(() => {
        panel.classList.remove('is-ritual-active');
      }, 820);
    },

    renderSidebarAgents() {
      if (HUB_FEATURES.agentsList === false) {
        if (refs.sidebarAgentsStatus) {
          refs.sidebarAgentsStatus.textContent = '智能体列表已禁用';
        }
        if (refs.sidebarAgentsList) {
          refs.sidebarAgentsList.innerHTML = '';
        }
        return;
      }

      const listNode = refs.sidebarAgentsList;
      const statusNode = refs.sidebarAgentsStatus;
      if (!listNode || !statusNode) return;

      listNode.innerHTML = '';

      if (state.agents.status === 'loading') {
        statusNode.textContent = '正在连接智能体列表...';
        return;
      }

      if (state.agents.status === 'error') {
        statusNode.textContent = '智能体列表读取失败';
        return;
      }

      if (state.agents.items.length === 0) {
        statusNode.textContent = '未发现智能体';
        return;
      }

      statusNode.textContent = `已连接 ${state.agents.items.length} 个智能体`;

      state.agents.items.forEach((agent) => {
        const button = document.createElement('button');
        const active = agent.agentId === state.agents.selectedAgentId;
        button.type = 'button';
        button.className = [
          'relative',
          'w-full',
          'overflow-hidden',
          'rounded-2xl',
          'border',
          active ? 'border-[#00f3ff]/20 bg-[#00f3ff]/[0.08] text-[#D9F7FF]' : 'border-white/5 bg-black/20 text-[#8CA3B3]',
          'px-3',
          'py-3',
          'text-left',
          'transition',
          'hover:border-[#00f3ff]/15',
          'hover:bg-[#00f3ff]/[0.04]',
          'hover:text-[#D9F7FF]'
        ].join(' ');
        button.dataset.agentId = agent.agentId;
        if (active) {
          button.innerHTML += '<span class="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#00F3FF] shadow-[0_0_10px_#00f3ff]"></span>';
        }
        button.innerHTML += `
          <div class="flex items-center justify-between gap-3">
            <p class="text-xs font-semibold uppercase tracking-[0.18em]">${agent.label}</p>
            ${agent.isDefault ? '<span class="rounded-full border border-[#00f3ff]/20 bg-[#00f3ff]/[0.05] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7ff9ff]">默认</span>' : ''}
          </div>
          <p class="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] ${active ? 'text-[#7fdde3]' : 'text-[#5D7385]'}">${agent.runtimeState} // ${agent.modelLabel}</p>
          <p class="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5D7385]">会话数 ${agent.sessionCount}</p>
        `;
        button.addEventListener('click', () => {
          dispatch({ type: 'agent_selected', agentId: agent.agentId });
        });
        listNode.appendChild(button);
      });
    }
  };
}
