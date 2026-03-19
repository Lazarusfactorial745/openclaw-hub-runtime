# First Public Commit Plan

## Goal
Make the first public commit look deliberate, credible, and easy to understand.

## Keep at repo root
- `README.md`
- `LICENSE`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `.gitignore`
- `index.html` (keep as compatibility wrapper because it supports the product story)
- `jarvis-hud-zh-normal.png` (primary README hero screenshot)
- `jarvis-hud-battle-damaged-poster-v5.png` (secondary README proof screenshot)

## Move out of root before first public commit
These are useful assets, but they should not clutter the root:

- `jarvis-hud-battle-damaged-poster.png`
- `jarvis-hud-battle-damaged-poster-full.png`
- `jarvis-hud-battle-damaged-poster-v2.png`
- `jarvis-hud-battle-damaged-poster-v3.png`
- `jarvis-hud-battle-damaged-poster-v4.png`
- `jarvis-hud-test-resume.png`
- `jarvis-hud-test-resume-clean.png`
- `jarvis-hud-test-resume-clean2.png`
- `jarvis-hud-test-resume-final.png`
- `jarvis-hud-test-resume-moneyshot.png`
- `jarvis-hud-test-resume-moneyshot-2.png`
- `jarvis-hud-test-resume-tall.png`
- `jarvis-hud-zh-poster.png`

Recommended destination:
- `docs/assets/archive/`

## Never commit
- `gateway.token`
- any future `*.token`, `.env`, or local machine credentials
- `.chrome-headless-*` directories
- local temp/log output

## Commit quality bar
The root should read like a product repo, not like a local artboard or scratch directory.
