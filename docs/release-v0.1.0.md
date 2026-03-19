# OpenClaw Hub Runtime v0.1.0 — First Public Reference Runtime

OpenClaw Hub Runtime v0.1.0 is the first public reference release of a modular frontend runtime for building AI command interfaces on top of the real OpenClaw Gateway.

This release should be read as a strong working reference point, not as the final form of the platform.

## Why this release exists

Most AI frontend demos stop at a themed chat page.

This project is trying to go one step further:

- separate shell identity from runtime behavior
- connect to a real OpenClaw backend instead of a mock-only UI
- treat reconnect, diagnostics, and recovery as first-class UX
- prove that one runtime can already support multiple shells

## Highlights

- flagship **J.A.R.V.I.S.-style shell**
- reusable **runtime core**
- real **OpenClaw Gateway adapter** and protocol normalizer
- soft-throttled **streaming UX**
- reconnect, diagnostics, and recovery foundations
- deterministic **resume showcase**
- minimal second shell proving portability
- architecture, theming, adapter, onboarding, launch, and contribution docs

## What to look at first

1. `README.md`
2. `apps/jarvis-hub/index.html`
3. `examples/minimal-hub/index.html`
4. `docs/architecture.md`
5. `docs/launch-content-pack.md`

## Recommended screenshot order

1. Jarvis normal runtime
2. Battle-damaged reconnect poster
3. Minimal Hub

## Honest scope

Today, this repository is best understood as:

> a public reference runtime for OpenClaw-native AI command interfaces

It is already a working implementation, but it is also the start of a broader reusable runtime direction.

## Next likely areas of evolution

- stronger runtime APIs and shell contracts
- more shell themes / surfaces
- deeper reconnect and recovery behavior
- better packaging and adoption ergonomics
