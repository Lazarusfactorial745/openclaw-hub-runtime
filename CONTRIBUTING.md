# Contributing

## How to contribute

Thank you for helping improve OpenClaw Hub Runtime.

Useful contribution areas include:

- new hub shells
- runtime modularization improvements
- adapter refinements
- reconnect and recovery improvements
- documentation
- verification scripts

## Development workflow

1. Start the local static server:

```powershell
cd d:\openclaw
python -m http.server 8787
```

2. Make sure OpenClaw Gateway is running locally.

3. Use one of the shell entrypoints:

- `http://127.0.0.1:8787/apps/jarvis-hub/index.html`
- `http://127.0.0.1:8787/examples/minimal-hub/index.html`

4. Keep changes focused and modular.

5. Prefer extracting reusable runtime behavior instead of adding shell-specific logic to shared modules.

## Verification

Before claiming work is complete, run the verification scripts that apply to your changes.

At minimum, the current repo commonly uses:

```powershell
powershell -File scripts/verify-hub-runtime-structure.ps1
powershell -File scripts/verify-runtime-config-driven.ps1
powershell -File scripts/verify-runtime-modularization.ps1
powershell -File scripts/verify-publishability-docs.ps1
```

If you changed the UI shells or release docs, also run:

```powershell
powershell -File scripts/verify-jarvis-hud-zhcn.ps1
powershell -File scripts/verify-architecture-and-minimal-hub.ps1
powershell -File scripts/verify-root-wrapper.ps1
```

## Design principles

- keep runtime concerns separate from shell concerns
- prefer explicit module boundaries over hidden globals
- preserve diagnostics-first UX
- preserve soft-throttled streaming behavior
- keep the minimal shell working as a portability proof

## Pull request notes

Good changes usually include:

- a small and clear scope
- updated docs when behavior changes
- fresh verification evidence
- no unrelated cleanup mixed into the same patch
