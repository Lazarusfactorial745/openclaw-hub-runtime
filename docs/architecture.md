# OpenClaw Hub Runtime Architecture

## Overview

OpenClaw Hub Runtime is structured as a layered frontend system rather than a single themed page.

The current J.A.R.V.I.S. HUD is the flagship shell, but the runtime underneath is now split so other shells can reuse the same transport, reconnect, diagnostics, and streaming behavior.

## Layers

### Hub Shell

The **Hub Shell** defines the visible product surface:

- DOM layout
- selector mapping
- styling and motion
- copy and localization

Examples:

- `apps/jarvis-hub/`
- `examples/minimal-hub/`

### Runtime

The **Runtime** consumes a shell and drives the interface:

- shell bootstrap / selector binding
- state store and dispatch reducer
- renderer
- command routing
- startup bootstrap orchestration

Primary modules:

- `packages/runtime/shell-bootstrap.js`
- `packages/runtime/store.js`
- `packages/runtime/renderer.js`
- `packages/runtime/commands.js`
- `packages/runtime/bootstrap.js`

### Adapter

The **Adapter** owns OpenClaw protocol transport:

- token loading
- device identity and connect handshake
- request/response routing
- history loading
- realtime event intake

Primary modules:

- `packages/adapters/openclaw/gateway-adapter.js`
- `packages/adapters/openclaw/protocol-normalizer.js`

### Reconnect Manager

The **Reconnect Manager** owns resilience and recovery:

- disconnect state transitions
- reconnect backoff
- interrupted stream capture
- reconcile / replay flow

Primary module:

- `packages/runtime/reconnect-manager.js`

### Test Harness

The **Test Harness** provides deterministic showcase and debugging flows:

- internal `/test-resume`
- controlled disconnect / resume script
- poster-ready battle-damaged showcase

Primary module:

- `packages/test-harness/resume-test.js`

## Data Flow

The runtime now follows a consistent pipeline:

1. **Shell** provides DOM regions and selector mappings through `HUB_CONFIG`
2. **Bootstrap** wires shell, store, renderer, commands, adapter, reconnect, and test harness
3. **Gateway Adapter** connects to OpenClaw and receives raw frames
4. **Protocol Normalizer** maps raw frames into runtime-friendly shapes
5. **Store / Dispatch** updates message, telemetry, and agent state
6. **Renderer** projects state into the active shell
7. **Reconnect Manager** intervenes when transport continuity is lost

In shorthand:

`Shell -> Bootstrap -> Adapter -> Protocol Normalizer -> Store -> Renderer`

with **Reconnect Manager** and **Test Harness** acting as control planes around that flow.

## Shell Contract

A shell must provide:

- an HTML surface with the runtime regions present
- a `hub.config.js` selector map
- a copy module or `window.COPY_ZH`

At minimum, a shell should expose:

- message scroller
- message list
- input form
- prompt input
- send button
- telemetry nodes

Optional but recommended:

- diagnostics panel region
- sidebar agent list
- wake-up flash node
- scroll HUD badge

## Current Runtime Composition

Today the Jarvis runtime entrypoint is intentionally thin:

- `packages/runtime/openclaw-hub-runtime.js`

It now mostly:

- creates shell context
- creates the store
- instantiates renderer and test harness
- instantiates the command controller
- calls the bootstrap module

Everything else lives in dedicated modules.

## Why This Matters

This structure makes the project reusable in a way a single themed page never could.

It becomes possible to:

- build a new shell without rewriting transport logic
- reuse diagnostics and reconnect UX across themes
- prove runtime portability with small examples
- document the system as a framework instead of a one-off demo

## Reference Surfaces

### Flagship shell

- `apps/jarvis-hub/index.html`

### Minimal shell

- `examples/minimal-hub/index.html`

The minimal shell exists specifically to prove that the runtime can power a second frontend with a different visual language and a much smaller DOM shell.
