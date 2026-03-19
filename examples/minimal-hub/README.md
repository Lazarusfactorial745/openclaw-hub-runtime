# Minimal Hub Example

This example proves the OpenClaw Hub Runtime can power a second shell that is much simpler than the J.A.R.V.I.S. HUD.

## URL

```text
http://127.0.0.1:8787/examples/minimal-hub/index.html
```

## What it demonstrates

- selector-driven shell binding
- shared Chinese copy reuse
- runtime reuse without Jarvis-specific layout
- real OpenClaw Gateway connection
- same store / renderer / adapter / reconnect / test-harness stack

## Files

- `examples/minimal-hub/index.html`
- `examples/minimal-hub/hub.config.js`
- `examples/minimal-hub/copy.zh-CN.js`

## Why it exists

The runtime is only truly reusable if a second shell can boot without copying the entire Jarvis interface.

This example is that proof.
