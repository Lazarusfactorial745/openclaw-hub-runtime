# J.A.R.V.I.S. HUD Chat Dynamic Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the static J.A.R.V.I.S. HUD chat demo into a dynamic single-file prototype with a mock adapter, minimal state store, incremental DOM patching, and streaming UX.

**Architecture:** Keep the HTML shell and CSS mostly intact, then add a JS micro-kernel inside `index.html` with five clearly separated areas: DOM refs/tokens, Store, Renderer, Scroll Engine, and Mock Adapter + Telemetry. New messages are appended, active assistant messages are patched in place, and scrolling is driven by a bottom sentinel and `isPinnedToBottom`.

**Tech Stack:** HTML, Tailwind CDN, inline CSS, vanilla JavaScript, PowerShell verification, Playwright browser checks

---

### Task 1: Save the approved dynamic design

**Files:**
- Create: `docs/plans/2026-03-13-jarvis-hud-dynamic-design.md`
- Create: `docs/plans/2026-03-13-jarvis-hud-dynamic-plan.md`

**Step 1: Record the adapter-first strategy**

Document why the front-end mock adapter is built before any real Gateway connection.

**Step 2: Record the event model and state machine**

Document the event types, streaming phases, and append-vs-patch rendering rule.

**Step 3: Verify the docs exist**

Run: `Get-ChildItem d:\openclaw\docs\plans`
Expected: both dynamic plan files are listed

### Task 2: Write the failing dynamic verification

**Files:**
- Modify: `scripts/verify-jarvis-hud-demo.ps1`
- Create: `scripts/verify-jarvis-hud-dynamic.ps1`
- Test: `index.html`

**Step 1: Write a failing verification**

Require these markers:

- Store section
- Renderer section
- Scroll Engine section
- Mock Adapter section
- streaming cursor node
- bottom sentinel
- telemetry hooks
- `dispatch(event)` style state updates

**Step 2: Run it to verify it fails**

Run: `powershell -ExecutionPolicy Bypass -File d:\openclaw\scripts\verify-jarvis-hud-dynamic.ps1`
Expected: FAIL before the dynamic code is added

### Task 3: Implement Store + Renderer core

**Files:**
- Modify: `index.html`

**Step 1: Add the JS module sections**

Add comment-delimited sections for:

- DOM refs / tokens
- Store
- Renderer
- Scroll Engine
- Mock Adapter + Telemetry

**Step 2: Add Store**

Implement minimal app state and a `dispatch` function that handles:

- `user_message`
- `assistant_start`
- `assistant_chunk`
- `assistant_done`
- `telemetry_update`

**Step 3: Add Renderer**

Implement:

- append user message
- append assistant shell
- patch assistant text node
- patch cursor state
- patch telemetry UI

### Task 4: Implement Scroll Engine + Happy Path Adapter

**Files:**
- Modify: `index.html`

**Step 1: Add bottom sentinel and scroll intent tracking**

Track whether the user is pinned to bottom and only auto-scroll when appropriate.

**Step 2: Add smooth anti-overlap bottom alignment**

After each streamed patch, measure on the next frame and keep the latest line above the floating console.

**Step 3: Add mock happy path**

Simulate:

- user submit
- assistant shell
- randomized chunk streaming
- done transition

### Task 5: Verify dynamic behavior

**Files:**
- Test: `scripts/verify-jarvis-hud-dynamic.ps1`
- Test: `index.html`

**Step 1: Run PowerShell verification**

Run: `powershell -ExecutionPolicy Bypass -File d:\openclaw\scripts\verify-jarvis-hud-dynamic.ps1`
Expected: PASS

**Step 2: Run browser verification**

Use Playwright to confirm:

- AI text grows over time
- cursor is present during streaming
- page has no global scrollbars
- message area remains the only scrollable region

**Step 3: Capture evidence**

Take a screenshot if needed for UI confirmation.
