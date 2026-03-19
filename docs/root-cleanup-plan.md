# Root Cleanup Plan

## Goal
Make the repository look intentional, safe, and publishable on first public push.

## Keep in root
- `README.md`
- `LICENSE`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- selected hero screenshots used by README
- `index.html` only if it is intentionally part of the compatibility story

## Remove from tracked root or move before public push
- `gateway.token` (must never enter git history)
- experimental screenshot variants not used in README
- temporary browser-output folders such as `.chrome-headless-*`
- any local-only logs / temp files / auth artifacts

## Asset strategy
- Keep only 1–2 flagship screenshots in root if needed for README simplicity
- Move extra public media into a dedicated `docs/assets/` or `media/` folder later
- Do not let the root read like a local scratchpad

## Recommendation
Before git init, confirm the exact file set intended for the first public commit. The first commit should already look curated.
