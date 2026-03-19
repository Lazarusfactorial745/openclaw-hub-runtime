# J.A.R.V.I.S. HUD Diagnostics Ritual Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an unfolding entry animation and one-shot holographic scanline to diagnostics panels in the J.A.R.V.I.S. HUD prototype.

**Architecture:** Extend the existing diagnostics panel renderer with a staged “insert collapsed -> next frame expand -> scanline animate” sequence. Keep the visual effect isolated to diagnostics panels so the rest of the chat rendering pipeline remains unchanged.

**Tech Stack:** HTML, Tailwind CDN, inline CSS, vanilla JavaScript, PowerShell verification, Playwright browser checks

---

### Task 1: Save the approved ritual design

**Files:**
- Create: `docs/plans/2026-03-14-jarvis-hud-diagnostics-ritual-design.md`
- Create: `docs/plans/2026-03-14-jarvis-hud-diagnostics-ritual-plan.md`

**Step 1: Record the unfolding effect**

Document the collapsed-to-expanded row transition and timing.

**Step 2: Record the scanline behavior**

Document the scanline visual and its one-shot lifecycle.

**Step 3: Verify docs exist**

Run: `Get-ChildItem d:\openclaw\docs\plans`
Expected: both ritual plan files are listed

### Task 2: Write failing ritual verification

**Files:**
- Create: `scripts/verify-jarvis-hud-diagnostics-ritual.ps1`
- Test: `index.html`

**Step 1: Write a failing verification**

Require these markers:

- diagnostics unfold class/marker
- diagnostics scanline node/marker
- unfold animation state toggle
- scanline animation keyframes / hook

**Step 2: Run it to verify it fails**

Run: `powershell -ExecutionPolicy Bypass -File d:\openclaw\scripts\verify-jarvis-hud-diagnostics-ritual.ps1`
Expected: FAIL before the ritual code is added

### Task 3: Implement unfold + scanline

**Files:**
- Modify: `index.html`

**Step 1: Add ritual CSS**

Add diagnostics unfold and scanline styling/animation.

**Step 2: Add diagnostics DOM structure**

Insert:

- unfolding inner wrapper
- scanline element
- optional grid enhancement layer

**Step 3: Add staged renderer logic**

On diagnostics append:

- insert collapsed
- next frame expand
- trigger scanline once

### Task 4: Verify ritual behavior

**Files:**
- Test: `scripts/verify-jarvis-hud-diagnostics-ritual.ps1`
- Test: `index.html`

**Step 1: Run PowerShell verification**

Run: `powershell -ExecutionPolicy Bypass -File d:\openclaw\scripts\verify-jarvis-hud-diagnostics-ritual.ps1`
Expected: PASS

**Step 2: Run browser verification**

Use Playwright to confirm:

- `/diagnose` inserts the panel
- panel enters with unfolded state
- scanline element appears during entry

**Step 3: Capture screenshot if useful**

Save a screenshot only if it adds review value.
