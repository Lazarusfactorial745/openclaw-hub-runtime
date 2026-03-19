# J.A.R.V.I.S. HUD Realtime Gateway Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the live Gateway Phase 1 integration to support real `chat.send` plus realtime streaming via `agent` and `chat` events while preserving the existing J.A.R.V.I.S. rendering feel.

**Architecture:** Keep the current `GatewaySocketAdapter` and Phase 1 handshake/history bootstrap intact, then add a realtime projector layer inside the adapter. The projector prioritizes `agent.data.delta` for soft-throttled streaming, uses lifecycle events to finalize turns, and keeps `chat` snapshot events as fallback confirmation and dedupe support.

**Tech Stack:** HTML, Tailwind CDN, inline CSS, vanilla JavaScript, PowerShell verification, Playwright browser checks

---

### Task 1: Save the approved realtime design

**Files:**
- Create: `docs/plans/2026-03-14-jarvis-hud-realtime-design.md`
- Create: `docs/plans/2026-03-14-jarvis-hud-realtime-plan.md`

**Step 1: Record the live protocol facts**

Document the confirmed shapes of `chat.send`, `agent` realtime events, and `chat` snapshot events.

**Step 2: Record the projection strategy**

Document delta-first streaming, snapshot fallback, and lifecycle-driven completion.

**Step 3: Verify docs exist**

Run: `Get-ChildItem d:\openclaw\docs\plans`
Expected: both realtime plan files are listed

### Task 2: Write failing realtime verification

**Files:**
- Create: `scripts/verify-jarvis-hud-realtime.ps1`
- Test: `index.html`

**Step 1: Write a failing verification**

Require these markers:

- `sendChat`
- `handleAgentEvent`
- `handleChatEvent`
- `projectAssistantDelta`
- `enqueueAssistantDelta`
- use of `chat.send`

**Step 2: Run it to verify it fails**

Run: `powershell -ExecutionPolicy Bypass -File d:\openclaw\scripts\verify-jarvis-hud-realtime.ps1`
Expected: FAIL before realtime logic is added

### Task 3: Implement live send and realtime projection

**Files:**
- Modify: `index.html`

**Step 1: Add realtime state**

Track active run ids, streamed text snapshots, and seen realtime user messages.

**Step 2: Implement send**

Bind the real send button to `chat.send`.

**Step 3: Implement agent delta streaming**

Use `agent.data.delta` to drive the existing soft-throttled assistant chunk pipeline.

**Step 4: Implement lifecycle completion**

Use `agent.stream === "lifecycle"` and `phase === "end"` to trigger `assistant_done`.

**Step 5: Implement chat snapshot fallback**

If needed, derive missing deltas from `chat` snapshots and use `final` as a completion confirmation.

### Task 4: Verify realtime behavior

**Files:**
- Test: `scripts/verify-jarvis-hud-realtime.ps1`
- Test: `index.html`

**Step 1: Run PowerShell verification**

Run: `powershell -ExecutionPolicy Bypass -File d:\openclaw\scripts\verify-jarvis-hud-realtime.ps1`
Expected: PASS

**Step 2: Run browser verification**

Use Playwright to confirm:

- sending a message appends the user bubble
- assistant starts streaming from real Gateway events
- code blocks still render inside sub-terminal panels
- cursor remains attached to the streamed tail

**Step 3: Capture screenshot if useful**

Save a screenshot only if it helps review the live output.
