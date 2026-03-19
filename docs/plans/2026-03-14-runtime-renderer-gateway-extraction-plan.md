# Runtime Renderer + Gateway Adapter Extraction Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract the remaining large renderer and gateway transport blocks out of `packages/runtime/openclaw-hub-runtime.js` without changing the working J.A.R.V.I.S. HUD behavior.

**Architecture:** Keep `openclaw-hub-runtime.js` as an assembly layer. Move message rendering and sidebar rendering into `packages/runtime/renderer.js`, and move OpenClaw WebSocket transport plus protocol helpers into `packages/adapters/openclaw/gateway-adapter.js`. Preserve the current dispatch/store, reconnect manager, and test harness APIs.

**Tech Stack:** Vanilla JavaScript, browser WebSocket/Crypto APIs, PowerShell verification scripts

---

### Task 1: Tighten the modularization check

**Files:**
- Modify: `scripts/verify-runtime-modularization.ps1`

**Step 1: Require new module paths**
- Assert `packages/runtime/renderer.js` exists.
- Assert `packages/adapters/openclaw/gateway-adapter.js` exists.

**Step 2: Require new runtime imports**
- Assert `openclaw-hub-runtime.js` imports `./renderer.js`.
- Assert `openclaw-hub-runtime.js` imports `../adapters/openclaw/gateway-adapter.js`.

**Step 3: Run script and verify it fails first**
- Run: `powershell -File scripts/verify-runtime-modularization.ps1`
- Expected: failure complaining about missing renderer/adapter module.

### Task 2: Extract renderer module

**Files:**
- Create: `packages/runtime/renderer.js`
- Modify: `packages/runtime/openclaw-hub-runtime.js`

**Step 1: Move render helpers**
- Move fenced-code parsing and diagnostics label normalization into the renderer module.
- Export `createRenderer(...)`.

**Step 2: Move sidebar rendering**
- Export `renderSidebarAgents(...)` so the runtime reducer can continue using it.

**Step 3: Rebind runtime assembly**
- Replace inline `Renderer` object with `createRenderer(...)`.
- Replace inline `renderSidebarAgents()` function calls with imported renderer helper.

### Task 3: Extract gateway adapter module

**Files:**
- Create: `packages/adapters/openclaw/gateway-adapter.js`
- Modify: `packages/runtime/openclaw-hub-runtime.js`

**Step 1: Move transport helpers**
- Move token loading, device identity, signing payload, and protocol extraction helpers.

**Step 2: Move `GatewaySocketAdapter`**
- Export the class with the same constructor shape and behavior.
- Preserve current public methods: `connect`, `disconnect`, `request`, `loadAgentsList`, `startAssistantStream`, `sendUserPrompt`, etc.

**Step 3: Rebind runtime assembly**
- Replace inline class usage with imported adapter symbols.
- Keep runtime bootstrap logic unchanged apart from assembly wiring.

### Task 4: Verify no regression in structure

**Files:**
- Preserve: `scripts/verify-hub-runtime-structure.ps1`
- Preserve: `scripts/verify-root-wrapper.ps1`
- Preserve: `scripts/verify-runtime-config-driven.ps1`
- Preserve: `scripts/verify-runtime-modularization.ps1`

**Step 1: Run the verification suite**
- Run the four scripts above.
- Confirm all exit successfully.

**Step 2: Report exact evidence**
- Report which commands passed and keep wording tied to fresh output.
