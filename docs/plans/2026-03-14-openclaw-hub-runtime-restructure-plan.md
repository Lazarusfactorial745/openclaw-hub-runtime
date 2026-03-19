# OpenClaw Hub Runtime Repository Restructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the current single-file HUD prototype into a reusable OpenClaw Hub Runtime architecture with a shell/runtime/config split.

**Architecture:** Keep the existing J.A.R.V.I.S. HUD as the first reference shell, but progressively extract connection logic, reconnect/recovery logic, test harnesses, and theme/copy concerns into reusable modules. The end state is a repo that can support multiple hub shells on the same OpenClaw runtime core.

**Tech Stack:** HTML, Tailwind CDN, vanilla JavaScript, PowerShell scripts, optional future bundling/tooling

---

### Task 1: Establish the target structure

**Files:**
- Create: `docs/plans/2026-03-14-openclaw-hub-runtime-restructure-plan.md`
- Modify: `README.md`

**Step 1: Define the top-level package layout**

Target directories:

- `apps/jarvis-hub/`
- `packages/runtime/`
- `packages/adapters/openclaw/`
- `packages/themes/jarvis/`
- `packages/test-harness/`
- `docs/`
- `examples/`
- `scripts/`

**Step 2: Document the architectural intent in `README.md`**

Make it explicit that the repo is evolving from a strong single-file prototype into a reusable hub runtime.

### Task 2: Extract the shell from the runtime

**Files:**
- Create: `apps/jarvis-hub/index.html`
- Create: `apps/jarvis-hub/copy.zh-CN.js`
- Create: `packages/themes/jarvis/theme.css`
- Modify: `index.html`

**Step 1: Move shell-specific copy into `copy.zh-CN.js`**

Extract HUD labels, diagnostics text, and command aliases.

**Step 2: Move theme-specific styling into `theme.css`**

Extract the J.A.R.V.I.S. visual language, poster mode styling, and layout look-and-feel.

**Step 3: Keep `apps/jarvis-hub/index.html` as the first reference shell**

Use it as the canonical shell example that binds runtime + theme + copy.

### Task 3: Extract the runtime core

**Files:**
- Create: `packages/runtime/core/store.js`
- Create: `packages/runtime/core/renderer.js`
- Create: `packages/runtime/core/scroll-engine.js`
- Create: `packages/runtime/core/ui-hooks.js`
- Modify: `index.html`

**Step 1: Extract state + dispatch**

Move message state, telemetry state, agent sidebar state, and dispatch reducers into a reusable core module.

**Step 2: Extract render logic**

Move append/patch rendering, code block projection, and sidebar agent rendering into renderer utilities.

**Step 3: Extract scroll behavior**

Move pinned-bottom logic, sentinel alignment, and HUD scroll badge logic into the scroll engine.

### Task 4: Extract the OpenClaw adapter layer

**Files:**
- Create: `packages/adapters/openclaw/gateway-adapter.js`
- Create: `packages/adapters/openclaw/reconnect-manager.js`
- Create: `packages/adapters/openclaw/protocol-normalizer.js`
- Modify: `index.html`

**Step 1: Move Gateway transport code**

Extract:

- token loading
- device identity generation
- connect handshake
- request routing
- `chat.history`
- `chat.send`

**Step 2: Move reconnect and recovery**

Extract:

- reconnect backoff
- interrupted stream capture
- history reconcile
- queued realtime replay

**Step 3: Normalize raw protocol frames**

Introduce a normalizer that converts raw OpenClaw frames into runtime-friendly events.

### Task 5: Extract the test harness layer

**Files:**
- Create: `packages/test-harness/resume-test.js`
- Create: `packages/test-harness/diagnostics-test.js`
- Modify: `index.html`

**Step 1: Move `/测试续写` and `/诊断` into dedicated harness modules**

Keep showcase/testing logic separate from production runtime.

**Step 2: Preserve deterministic demo URLs**

Ensure:

- `?testResume=1`
- `?testResume=1&poster=1`

still work after extraction.

### Task 6: Introduce shell-to-runtime mapping

**Files:**
- Create: `apps/jarvis-hub/hub.config.js`
- Create: `examples/minimal-hub/hub.config.js`

**Step 1: Define selector mapping**

Add a config object that maps runtime regions to DOM selectors:

- message list
- input
- send button
- diagnostics
- agents list
- telemetry values

**Step 2: Make runtime shell-agnostic**

The runtime should bind via the config object instead of hard-coded selectors.

### Task 7: Keep backward compatibility during migration

**Files:**
- Modify: `index.html`

**Step 1: Preserve current single-file entry temporarily**

Keep `index.html` working while extraction happens incrementally.

**Step 2: Use `index.html` as compatibility wrapper**

It can eventually become either:

- a thin wrapper around `apps/jarvis-hub/`, or
- a demo entry page linking to multiple shells.

### Task 8: Publishability work

**Files:**
- Modify: `README.md`
- Create: `docs/architecture.md`
- Create: `docs/theming.md`
- Create: `docs/adapter-api.md`
- Create: `docs/recovery-protocol.md`

**Step 1: Document architecture clearly**

Make it easy for contributors to understand:

- shell vs runtime
- runtime vs adapter
- adapter vs harness

**Step 2: Add “build your own hub” guidance**

This is essential for turning the repo from a demo into a reusable framework.

### Task 9: Validation strategy

**Files:**
- Modify: `scripts/verify-all.ps1` (future)
- Preserve: `scripts/verify-*.ps1`

**Step 1: Keep the current verification suite**

Do not lose the investment in:

- dynamic rendering tests
- diagnostics ritual tests
- realtime tests
- reconnect tests
- poster tests

**Step 2: Add package-level validation later**

Once extraction is complete, introduce package-aware checks without removing the current working scripts.
