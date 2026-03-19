# Adapter API

## Overview

The current production adapter is:

- `packages/adapters/openclaw/gateway-adapter.js`

Its supporting protocol mapping layer is:

- `packages/adapters/openclaw/protocol-normalizer.js`

Together they form the OpenClaw-facing transport boundary of the runtime.

## GatewaySocketAdapter Responsibilities

`GatewaySocketAdapter` is responsible for:

- loading a gateway token
- creating / restoring browser device identity
- performing the `connect` handshake
- routing `req` / `res` frames
- measuring `health` RTT
- loading `chat.history`
- loading `agents.list`
- projecting realtime `agent` / `chat` frames into runtime events

It should not own:

- shell layout
- CSS or theme choices
- direct selector lookup
- reconnect policy

## Public Surface

Important public methods include:

- `connect()`
- `disconnect()`
- `request(method, params, timeoutMs)`
- `loadAgentsList()`
- `sendChat(text)`
- `startAssistantStream(runId)`
- `enqueueAssistantDelta(runId, delta)`
- `handleAgentEvent(frame)`
- `handleChatEvent(frame)`

These methods are used by the runtime, reconnect layer, and test harness.

## Protocol Normalizer

The adapter delegates raw frame interpretation to:

- `packages/adapters/openclaw/protocol-normalizer.js`

This module currently provides:

- `parseGatewayFrame`
- `classifyGatewayFrame`
- `normalizeAgentsList`
- `normalizeHistoryMessages`
- `normalizeAgentRealtimeFrame`
- `normalizeChatRealtimeFrame`

That separation keeps the adapter focused on transport and coordination instead of embedding every protocol rule inline.

## Runtime Bridge

The adapter receives a `runtimeBridge` object so it can project history and wake-up effects without depending on hidden globals.

Current bridge fields include:

- `state`
- `refs`
- `domCache`
- `Renderer`
- `ScrollEngine`
- `nowLabel`

This keeps the contract explicit and makes future adapters easier to test and reason about.

## Event Callbacks

The adapter can receive optional callbacks:

- `onHelloOk`
- `onClose`
- `onError`
- `onTick`
- `onHealth`
- `onAgentFrame`
- `onChatFrame`
- `onHistoryHydrated`

These callbacks allow the reconnect manager and other orchestration layers to react without embedding that policy inside the adapter.

## Connection Flow

High-level adapter startup flow:

1. `loadGatewayToken()`
2. `connect()`
3. receive `connect.challenge`
4. `sendConnect(...)`
5. receive `hello-ok`
6. `measureHealthRtt()`
7. `chat.history`
8. `loadAgentsList()` as needed

## Realtime Flow

Realtime flow looks like this:

1. raw socket frame arrives
2. `parseGatewayFrame` decodes it
3. `classifyGatewayFrame` classifies it
4. normalizer maps `agent` / `chat` payloads into runtime-friendly objects
5. adapter updates stream buffers and dispatches runtime events

## Extending to Other Backends

A future non-OpenClaw adapter would need to provide equivalent behavior:

- connection setup
- request / response routing
- history load
- agent / assistant streaming
- user echo handling
- health / telemetry signals
- runtime bridge integration

In other words, another adapter does **not** need to match OpenClaw's raw protocol, but it **does** need to satisfy the runtime's expectations about history, streaming, telemetry, and lifecycle boundaries.

## Where to Start

If you want to study or replace the adapter, start here:

- `packages/adapters/openclaw/gateway-adapter.js`
- `packages/adapters/openclaw/protocol-normalizer.js`
- `packages/runtime/bootstrap.js`
- `packages/runtime/reconnect-manager.js`
