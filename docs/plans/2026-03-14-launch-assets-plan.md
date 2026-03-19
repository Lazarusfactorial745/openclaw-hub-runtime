# Launch Assets Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add GitHub launch assets so the repository is not only technically structured, but also packaged for a strong public first impression.

**Architecture:** Keep the existing docs stack for architecture, theming, adapter API, onboarding, and contribution. Add a focused launch layer consisting of a changelog and a GitHub launch guide covering tagline, topics, release copy, and demo ordering. Update the README to link those materials without bloating the homepage.

**Tech Stack:** Markdown, PowerShell verification scripts

---

### Task 1: Add a failing verification for launch assets

**Files:**
- Create: `scripts/verify-launch-assets.ps1`

**Step 1: Require launch files**
- Check `CHANGELOG.md`
- Check `docs/github-launch.md`

**Step 2: Require README links**
- Assert README references both files.

### Task 2: Write the changelog

**Files:**
- Create: `CHANGELOG.md`

**Step 1: Add initial release entry**
- Document current repository milestones as the first release candidate surface.

### Task 3: Write GitHub launch guidance

**Files:**
- Create: `docs/github-launch.md`

**Step 1: Add tagline and short description**
- Provide ready-to-paste GitHub profile text.

**Step 2: Add topics and launch framing**
- Suggest repository topics, demo order, screenshot order, and release note copy.

### Task 4: Update README navigation

**Files:**
- Modify: `README.md`

**Step 1: Add launch asset links**
- Link `CHANGELOG.md` and `docs/github-launch.md`.

### Task 5: Verify docs surface

**Files:**
- Preserve: current verification suite
- Add: `scripts/verify-launch-assets.ps1`

**Step 1: Run launch verification**
- Ensure launch assets and README links exist.

**Step 2: Re-run broad verification**
- Confirm repo still passes the existing runtime and release-readiness checks.
