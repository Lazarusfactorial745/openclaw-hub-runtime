# Docs + Minimal Hub Example Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add architecture documentation and a minimal reusable hub example that proves the runtime is no longer tied to the J.A.R.V.I.S. shell.

**Architecture:** Keep the current Jarvis app as the flagship shell while adding one lightweight example shell under `examples/minimal-hub/`. Document the module boundaries in `docs/architecture.md` so contributors can understand how shell, runtime, adapter, reconnect, commands, and test harness fit together.

**Tech Stack:** Static HTML, vanilla JavaScript modules, PowerShell verification scripts, existing OpenClaw Hub Runtime modules

---

### Task 1: Add a failing verification for docs + example

**Files:**
- Create: `scripts/verify-architecture-and-minimal-hub.ps1`

**Step 1: Require docs and example files**
- Check `docs/architecture.md`
- Check `examples/minimal-hub/index.html`
- Check `examples/minimal-hub/hub.config.js`
- Check `examples/minimal-hub/copy.zh-CN.js`

**Step 2: Require runtime wiring markers**
- Assert the minimal example loads shared copy, config, and runtime entry.
- Assert the architecture doc mentions shell/runtime/adapter/test-harness boundaries.

### Task 2: Write the architecture document

**Files:**
- Create: `docs/architecture.md`
- Modify: `README.md`

**Step 1: Document runtime layers**
- Explain shell bootstrap, store, renderer, commands, bootstrap, adapter, protocol normalizer, reconnect manager, test harness.

**Step 2: Document runtime data flow**
- Show how DOM shell -> runtime -> gateway -> normalized events -> store -> renderer works.

**Step 3: Link from README**
- Point readers to the architecture doc and the minimal example.

### Task 3: Create the minimal hub example

**Files:**
- Create: `examples/minimal-hub/index.html`
- Create: `examples/minimal-hub/hub.config.js`
- Create: `examples/minimal-hub/copy.zh-CN.js`
- Create: `examples/minimal-hub/README.md`

**Step 1: Build a tiny shell**
- Use minimal DOM regions required by the runtime.
- Keep layout simple and neutral rather than cinematic.

**Step 2: Bind runtime via config**
- Map selectors through `hub.config.js`.
- Reuse shared Chinese copy fallback through the local example copy module.

**Step 3: Document how to launch**
- Explain local URL and what the example proves.

### Task 4: Verify the new surface

**Files:**
- Preserve: existing `scripts/verify-*.ps1`
- Add: `scripts/verify-architecture-and-minimal-hub.ps1`

**Step 1: Run full verification**
- Run the new script plus current modularization/config/runtime checks.

**Step 2: Smoke check the example URL**
- Verify `http://127.0.0.1:8787/examples/minimal-hub/index.html` returns `200`.
