# J.A.R.V.I.S. HUD Chat Demo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single-file `index.html` that reimagines a backend chat UI as a high-fidelity J.A.R.V.I.S.-style sci-fi HUD interface.

**Architecture:** Create one standalone HTML document using Tailwind CDN plus a small inline `<style>` block for glow effects, custom scrollbars, and subtle animations. Keep layout app-like with a locked viewport, fixed glass sidebar, dense scrollable message stream, terminal-style diagnostics panel, and a floating bottom console.

**Tech Stack:** HTML, Tailwind CSS CDN, small inline CSS, minimal vanilla JavaScript for a blinking/typing cursor

---

### Task 1: Document the approved UI system

**Files:**
- Create: `docs/plans/2026-03-13-jarvis-hud-chat-design.md`
- Create: `docs/plans/2026-03-13-jarvis-hud-chat-plan.md`

**Step 1: Capture the approved design**

Write the locked viewport rules, color hierarchy, component definitions, and motion constraints into the design doc.

**Step 2: Save the implementation plan**

Break implementation into a small number of verifiable tasks with exact files and commands.

**Step 3: Verify the docs exist**

Run: `Get-ChildItem d:\openclaw\docs\plans`
Expected: both plan files are listed

### Task 2: Write the failing demo verification

**Files:**
- Create: `scripts\verify-jarvis-hud-demo.ps1`
- Test: `index.html`

**Step 1: Write the failing check**

Create a PowerShell verification script that fails when `index.html` is missing, or when required markers are not present:

- locked viewport classes
- fixed-width sidebar
- scrollable message area
- custom scrollbar CSS
- diagnostics terminal panel
- floating input console

**Step 2: Run it to verify it fails**

Run: `powershell -ExecutionPolicy Bypass -File d:\openclaw\scripts\verify-jarvis-hud-demo.ps1`
Expected: FAIL because `index.html` does not exist yet

### Task 3: Build the single-file HUD demo

**Files:**
- Create: `index.html`

**Step 1: Add the page shell**

Implement the locked viewport body, background layers, main flex layout, and fixed glass sidebar.

**Step 2: Add the top HUD status bar**

Implement the low-profile status bar with title, status chips, and runtime metadata.

**Step 3: Add the dense message stream**

Implement:

- one system diagnostics terminal panel
- one user message
- one AI message with subtle streaming cursor

**Step 4: Add the floating input console**

Implement the pill-shaped glass input island with mic icon, text placeholder, and glowing send button.

**Step 5: Add inline CSS + micro-JS**

Implement:

- slow breathing glow
- message entrance animation
- custom sci-fi scrollbar
- ambient scanline / radial glow
- blinking cursor / typewriter accent

### Task 4: Verify structure and browser behavior

**Files:**
- Test: `scripts\verify-jarvis-hud-demo.ps1`
- Test: `index.html`

**Step 1: Run the verification script**

Run: `powershell -ExecutionPolicy Bypass -File d:\openclaw\scripts\verify-jarvis-hud-demo.ps1`
Expected: PASS

**Step 2: Open the page in a browser context**

Use Playwright to open `index.html` locally and confirm:

- no page-level scrollbars
- message area is the only scrollable region
- floating input remains visually detached from the message stream

**Step 3: Capture a screenshot if needed**

Save a screenshot artifact only if layout confirmation benefits from a visual check.

### Task 5: Hand off the demo

**Files:**
- Final: `index.html`

**Step 1: Summarize the implementation**

Report which files were created, how the layout works, and how to open the demo.

**Step 2: Note verification evidence**

Include the verification command used and whether it passed.

**Step 3: Do not commit automatically**

Skip git commit unless explicitly requested by the user.
