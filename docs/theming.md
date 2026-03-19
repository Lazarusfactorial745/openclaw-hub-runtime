# Theming Guide

## Overview

OpenClaw Hub Runtime separates **shell** from **runtime**.

That means a theme is not just CSS. A working hub shell is a combination of:

- HTML layout
- selector mapping
- copy loading
- optional theme CSS

The runtime then binds itself to that shell through `HUB_CONFIG`.

## Hub Shell Responsibilities

A **Hub Shell** owns:

- layout and composition
- visual tone
- typography and spacing
- optional effects and animation
- copy bootstrap

A shell should **not** reimplement:

- message state management
- gateway protocol handling
- reconnect logic
- stream buffering
- diagnostics / resume behavior

Those live in the runtime.

## Required Runtime Regions

At minimum, a shell should provide DOM nodes for:

- message scroller
- message list
- bottom sentinel
- prompt form
- prompt input
- send button
- mic button
- console status
- telemetry chips / labels

The runtime binds to these via `selectors` in `HUB_CONFIG`.

## Optional Runtime Regions

These are optional but strongly recommended:

- wake-up flash node
- scroll HUD badge
- sidebar link chip
- sidebar agent status
- sidebar agent list

The J.A.R.V.I.S. shell uses all of them.  
The minimal shell uses a simpler composition while keeping the same contract.

## Selector Mapping

The shell exposes selectors through `hub.config.js`:

```js
window.HUB_CONFIG = {
  selectors: {
    scroller: '#message-scroller',
    messageList: '#message-list',
    promptForm: '#prompt-form',
    promptInput: '#prompt-input',
    sendButton: '#send-button'
  }
};
```

The runtime resolves those selectors through:

- `packages/runtime/shell-bootstrap.js`

This is why the runtime can be reused by multiple shells without editing the runtime itself.

## Copy Loading

A shell can preload copy by setting `window.COPY_ZH`.

Current pattern:

- shared fallback: `packages/shared/copy.zh-CN.js`
- shell wrapper: `copy.zh-CN.js`

Example:

```js
import { DEFAULT_COPY_ZH } from '../../packages/shared/copy.zh-CN.js';

window.COPY_ZH = window.COPY_ZH || DEFAULT_COPY_ZH;
```

This lets multiple shells reuse the same copy defaults while keeping the option to override later.

## CSS / Visual Language

The runtime is intentionally light on shell-specific styling assumptions.

For example:

- J.A.R.V.I.S. shell theme: `packages/themes/jarvis/theme.css`
- Minimal shell: inline local CSS in `examples/minimal-hub/index.html`

Both work because the runtime depends on region contracts and data flow, not a single stylesheet.

## Theme vs Runtime Boundary

### Theme owns

- panel shapes
- glow, blur, gradients
- typography
- spacing
- custom visual affordances

### Runtime owns

- rendering semantics
- code-block-aware projection
- scroll following
- state transitions
- diagnostics injection
- reconnect and resume orchestration

This boundary is what makes the project reusable instead of becoming a pile of shell-specific hacks.

## Reference Shells

### Flagship cinematic shell

- `apps/jarvis-hub/index.html`

### Minimal portability proof

- `examples/minimal-hub/index.html`

## How to Create a New Shell

1. Copy the minimal example shell
2. Replace layout and styling
3. Keep the required selector contract
4. Provide `hub.config.js`
5. Provide a `copy.zh-CN.js` wrapper if needed
6. Load `packages/runtime/openclaw-hub-runtime.js`

If those steps work, the runtime should boot without changes.
