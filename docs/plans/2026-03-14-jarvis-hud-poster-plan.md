# J.A.R.V.I.S. HUD Battle-Damaged Poster Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a deterministic poster mode that freezes the UI at the most dramatic disconnect moment of `/test-resume`, then export a portfolio-grade screenshot.

**Architecture:** Keep the normal `/test-resume` resurrection flow for functional validation, but add a `poster` branch that pauses after the controlled disconnect and hard-lock transition. Use a body-level poster mode class to tune composition, hide auxiliary UI, and intensify the diagnostics panel.

**Tech Stack:** HTML, Tailwind CDN, inline CSS, vanilla JavaScript, PowerShell verification, headless Chrome screenshot export

---

### Task 1: Save the poster design

**Files:**
- Create: `docs/plans/2026-03-14-jarvis-hud-poster-design.md`
- Create: `docs/plans/2026-03-14-jarvis-hud-poster-plan.md`

### Task 2: Write failing poster verification

**Files:**
- Create: `scripts/verify-jarvis-hud-poster.ps1`
- Test: `index.html`

**Step 1: Require poster mode markers**

Require:

- poster URL handling
- body poster class
- `/test-resume` poster pause branch
- stronger orphaned cursor / diagnostics styling

**Step 2: Run and confirm failure**

Run: `powershell -ExecutionPolicy Bypass -File d:\openclaw\scripts\verify-jarvis-hud-poster.ps1`
Expected: FAIL before poster mode is added

### Task 3: Implement poster mode

**Files:**
- Modify: `index.html`

**Step 1: Add poster query-param handling**

Trigger special composition and timeline freeze.

**Step 2: Add visual emphasis**

Make the orphaned cursor and diagnostics panel more dramatic in poster mode.

**Step 3: Freeze at disconnect**

Stop the `/test-resume` script before recovery completes when poster mode is enabled.

### Task 4: Export final screenshot

**Files:**
- Output: `jarvis-hud-battle-damaged-poster.png`

**Step 1: Use headless Chrome with poster URL**

Capture the most dramatic frame.
