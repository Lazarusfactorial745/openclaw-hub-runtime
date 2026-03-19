# J.A.R.V.I.S. HUD Reconnect Skeleton Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the first non-invasive `ReconnectManager` skeleton and refactor the live Gateway adapter into an event-reporting transport layer.

**Architecture:** Keep the existing live Phase 2 chat experience intact while introducing a separate reconnect orchestration layer. The first cut adds UI helper hooks, lifecycle callbacks on `GatewaySocketAdapter`, a minimal `ReconnectManager` class, and a factory-driven bootstrap composition.

**Tech Stack:** HTML, Tailwind CDN, inline CSS, vanilla JavaScript, PowerShell verification, Playwright browser checks

---

### Task 1: Save the reconnect design

**Files:**
- Create: `docs/plans/2026-03-14-jarvis-hud-reconnect-design.md`
- Create: `docs/plans/2026-03-14-jarvis-hud-reconnect-plan.md`

**Step 1: Record the separation of concerns**

Document transport-layer adapter vs orchestration-layer reconnect manager.

**Step 2: Record the initial implementation scope**

Document that only the skeleton (Steps 1-4) is implemented in this round.

### Task 2: Write a failing verification

**Files:**
- Create: `scripts/verify-jarvis-hud-reconnect.ps1`
- Test: `index.html`

**Step 1: Write the failing check**

Require these markers:

- `applyInputLockState`
- `appendRecoveryDiagnosticsLine`
- `class ReconnectManager`
- `adapterFactory`
- `reconnectManager.start()`
- adapter lifecycle hooks (`onHelloOk`, `onClose`, etc.)

**Step 2: Run it and confirm failure**

Run: `powershell -ExecutionPolicy Bypass -File d:\openclaw\scripts\verify-jarvis-hud-reconnect.ps1`
Expected: FAIL before the reconnect skeleton is added

### Task 3: Implement the skeleton

**Files:**
- Modify: `index.html`

**Step 1: Add UI helper hooks**

Implement `applyInputLockState` and `appendRecoveryDiagnosticsLine`.

**Step 2: Add adapter callbacks**

Allow the Gateway adapter to emit lifecycle events without owning reconnect policy.

**Step 3: Add `ReconnectManager`**

Implement:

- `start`
- `stop`
- `connectFresh`
- `bindAdapter`
- `transitionTo`

### Task 4: Rewire bootstrap

**Files:**
- Modify: `index.html`

**Step 1: Add `adapterFactory`**

Create a fresh adapter for each connect attempt.

**Step 2: Start via manager**

Replace direct adapter startup with `reconnectManager.start()`.

### Task 5: Verify the skeleton

**Files:**
- Test: `scripts/verify-jarvis-hud-reconnect.ps1`
- Test: `index.html`

**Step 1: Run PowerShell verification**

Run: `powershell -ExecutionPolicy Bypass -File d:\openclaw\scripts\verify-jarvis-hud-reconnect.ps1`
Expected: PASS

**Step 2: Run browser smoke test**

Use Playwright to confirm the page still boots, connects, and renders normally.
