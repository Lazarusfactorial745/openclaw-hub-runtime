# J.A.R.V.I.S. HUD Dynamic Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add fenced code block streaming support and a HUD-style scroll-to-bottom indicator to the dynamic J.A.R.V.I.S. chat prototype.

**Architecture:** Extend the current single-file micro-kernel without breaking the existing Store / Renderer / Scroll Engine split. Introduce a lightweight fenced-code parser for assistant text projection, render code blocks as sub-terminal panels, and let Scroll Engine expose badge visibility based on streaming state plus pinned-bottom intent.

**Tech Stack:** HTML, Tailwind CDN, inline CSS, vanilla JavaScript, PowerShell verification, Playwright browser checks

---

### Task 1: Save approved polish design

**Files:**
- Create: `docs/plans/2026-03-13-jarvis-hud-polish-design.md`
- Create: `docs/plans/2026-03-13-jarvis-hud-polish-plan.md`

**Step 1: Record the fenced-code-only scope**

Document that only fenced code blocks are supported in this phase.

**Step 2: Record the HUD badge behavior**

Document appearance conditions, placement, and scroll interaction.

**Step 3: Verify docs exist**

Run: `Get-ChildItem d:\openclaw\docs\plans`
Expected: both polish plan files are listed

### Task 2: Write failing polish verification

**Files:**
- Create: `scripts/verify-jarvis-hud-polish.ps1`
- Test: `index.html`

**Step 1: Write a failing verification**

Require these markers:

- code block parser helper
- code block panel class/marker
- language tag marker
- HUD scroll badge marker
- scroll badge visibility logic tied to streaming + pinned-bottom state

**Step 2: Run it to verify it fails**

Run: `powershell -ExecutionPolicy Bypass -File d:\openclaw\scripts\verify-jarvis-hud-polish.ps1`
Expected: FAIL before the polish code is added

### Task 3: Implement fenced code block rendering

**Files:**
- Modify: `index.html`

**Step 1: Add parser helper**

Create a small parser that transforms assistant text into plain text blocks plus fenced code blocks.

**Step 2: Add code block DOM projection**

Render code blocks as sub-terminal panels with:

- dark body
- neon left rail
- language label
- monospaced preserved whitespace

**Step 3: Keep patch-only updates**

Ensure assistant messages still update in place without rerendering the whole message list.

### Task 4: Implement HUD scroll badge

**Files:**
- Modify: `index.html`

**Step 1: Add badge DOM**

Insert a centered HUD badge above the floating input.

**Step 2: Add Scroll Engine visibility logic**

Show the badge only when:

- streaming is active
- user is not pinned to bottom

**Step 3: Add click-to-return behavior**

Smooth-scroll to bottom and re-arm pinned-bottom mode.

### Task 5: Verify polish behavior

**Files:**
- Test: `scripts/verify-jarvis-hud-polish.ps1`
- Test: `index.html`

**Step 1: Run PowerShell verification**

Run: `powershell -ExecutionPolicy Bypass -File d:\openclaw\scripts\verify-jarvis-hud-polish.ps1`
Expected: PASS

**Step 2: Run browser verification**

Use Playwright to confirm:

- fenced code streams inside a sub-panel
- badge appears when scrolled off bottom during streaming
- clicking the badge returns to bottom

**Step 3: Capture a screenshot if needed**

Save a screenshot only if useful for UX review.
