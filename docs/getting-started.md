# Getting Started

## Overview

This guide helps you run the current OpenClaw Hub Runtime locally.

You will launch:

- the OpenClaw Gateway
- a local static file server for the frontend
- one of the provided shells

## Prerequisites

- OpenClaw installed and running locally
- OpenClaw Gateway available at `127.0.0.1:18789`
- a valid local gateway token
- Python or another static file server

## OpenClaw Gateway

Start OpenClaw using your normal local workflow.

The runtime currently expects the Gateway at:

```text
ws://127.0.0.1:18789
```

## Start the frontend server

From the repository root:

```powershell
cd d:\openclaw
python -m http.server 8787
```

## Jarvis Hub

Open:

```text
http://127.0.0.1:8787/apps/jarvis-hub/index.html
```

This is the flagship cinematic shell.

## Minimal Hub

Open:

```text
http://127.0.0.1:8787/examples/minimal-hub/index.html
```

This shell proves that the runtime works independently from the Jarvis visual design.

## Built-in test modes

### Resume test

```text
http://127.0.0.1:8787/apps/jarvis-hub/index.html?testResume=1
```

### Poster mode

```text
http://127.0.0.1:8787/apps/jarvis-hub/index.html?testResume=1&poster=1
```

## Common issues

### The frontend cannot connect

Check:

- OpenClaw Gateway is running
- `gateway.token` is present
- `gateway.controlUi.allowedOrigins` includes `http://127.0.0.1:8787`

### The browser page opens but no messages appear

Check:

- Gateway health
- WebSocket connection in browser devtools
- the verification scripts under `scripts/`

## Next reading

- `docs/architecture.md`
- `docs/theming.md`
- `docs/adapter-api.md`
- `CONTRIBUTING.md`
