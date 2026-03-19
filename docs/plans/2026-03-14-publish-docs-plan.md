# Publish Docs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add release-grade documentation for theming and adapter APIs, and tighten the README so the repository reads like a reusable framework instead of a private prototype dump.

**Architecture:** Keep the existing architecture document as the system overview, then add focused docs for shell theming and adapter boundaries. Update the README to surface the new docs and the minimal example as first-class entry points for contributors and GitHub visitors.

**Tech Stack:** Markdown, PowerShell verification scripts, existing OpenClaw Hub Runtime modules

---

### Task 1: Add a failing verification for publish docs

**Files:**
- Create: `scripts/verify-publishability-docs.ps1`

**Step 1: Require docs files**
- Check `docs/theming.md`
- Check `docs/adapter-api.md`

**Step 2: Require README links**
- Assert README references architecture, theming, adapter API, and minimal example docs.

### Task 2: Write theming documentation

**Files:**
- Create: `docs/theming.md`

**Step 1: Define shell contract**
- Explain required selectors, optional selectors, copy loading, and config mapping.

**Step 2: Explain theme responsibilities**
- Separate shell layout, CSS styling, and runtime behavior.

### Task 3: Write adapter API documentation

**Files:**
- Create: `docs/adapter-api.md`

**Step 1: Document adapter responsibilities**
- Cover gateway connection, protocol normalization, runtime bridge, and event callbacks.

**Step 2: Document extension points**
- Explain what a future non-OpenClaw adapter would need to implement.

### Task 4: Tighten README for publishability

**Files:**
- Modify: `README.md`

**Step 1: Add documentation section**
- Link architecture, theming, adapter API, and minimal example.

**Step 2: Add example framing**
- Make it obvious that Jarvis is the flagship shell and `examples/minimal-hub/` is the portability proof.

### Task 5: Verify docs surface

**Files:**
- Preserve: current `scripts/verify-*.ps1`
- Add: `scripts/verify-publishability-docs.ps1`

**Step 1: Run the new docs verification**
- Confirm the new docs and README links exist.

**Step 2: Re-run broader verification**
- Confirm the repo still passes the current runtime verification suite.
