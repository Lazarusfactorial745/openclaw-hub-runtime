export function createScrollEngine({ refs, state }) {
  return {
    alignScheduled: false,

    init() {
      refs.scroller.addEventListener('scroll', () => {
        this.refreshPinnedStateFromDom();
        this.updateScrollBadge();
      }, { passive: true });

      window.addEventListener('resize', () => this.requestFollow(true));
    },

    refreshPinnedStateFromDom() {
      const distance = refs.scroller.scrollHeight - (refs.scroller.scrollTop + refs.scroller.clientHeight);
      state.streaming.isPinnedToBottom = distance <= 88;
      return state.streaming.isPinnedToBottom;
    },

    requestFollow(force = false) {
      if (!force && !state.streaming.isPinnedToBottom) return;
      if (this.alignScheduled) return;

      this.alignScheduled = true;
      requestAnimationFrame(() => {
        this.alignScheduled = false;
        this.alignSentinelAboveConsole(force);
        this.updateScrollBadge();
      });
    },

    alignSentinelAboveConsole(force = false) {
      if (!force && !state.streaming.isPinnedToBottom) return;

      const sentinelRect = refs.bottomSentinel.getBoundingClientRect();
      const consoleRect = refs.floatingConsole.getBoundingClientRect();
      const scrollerRect = refs.scroller.getBoundingClientRect();
      const safeBottom = Math.min(scrollerRect.bottom - 10, consoleRect.top - 16);
      const delta = sentinelRect.bottom - safeBottom;

      if (delta > 1) {
        refs.scroller.scrollTop += delta;
      }
    },

    showScrollBadge() {
      refs.scrollHudBadge.classList.remove('is-hidden');
      refs.scrollHudBadge.classList.add('is-visible');
    },

    hideScrollBadge() {
      refs.scrollHudBadge.classList.remove('is-visible');
      refs.scrollHudBadge.classList.add('is-hidden');
    },

    updateScrollBadge() {
      const isPinned = this.refreshPinnedStateFromDom();
      const hasActiveStreamingCursor = Array.from(document.querySelectorAll('[data-role="cursor"]'))
        .some((node) => !node.classList.contains('is-idle') && !node.classList.contains('is-hidden'));
      const shouldShow = !isPinned && hasActiveStreamingCursor;
      if (shouldShow) {
        this.showScrollBadge();
      } else {
        this.hideScrollBadge();
      }
    },

    jumpToBottom() {
      state.streaming.isPinnedToBottom = true;
      requestAnimationFrame(() => {
        const sentinelRect = refs.bottomSentinel.getBoundingClientRect();
        const consoleRect = refs.floatingConsole.getBoundingClientRect();
        const scrollerRect = refs.scroller.getBoundingClientRect();
        const safeBottom = Math.min(scrollerRect.bottom - 10, consoleRect.top - 16);
        const delta = sentinelRect.bottom - safeBottom;
        refs.scroller.scrollTo({
          top: refs.scroller.scrollTop + Math.max(delta, 0),
          behavior: 'smooth'
        });
        this.hideScrollBadge();
      });
    }
  };
}
