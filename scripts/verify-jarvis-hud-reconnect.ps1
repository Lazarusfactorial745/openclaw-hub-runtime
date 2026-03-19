$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$indexPath = Join-Path $root 'index.html'

if (-not (Test-Path $indexPath)) {
  throw "Missing demo file: $indexPath"
}

$html = Get-Content -Raw $indexPath

$requiredSnippets = @(
  'function applyInputLockState',
  'function appendRecoveryDiagnosticsLine',
  'class ReconnectManager',
  'adapterFactory',
  'reconnectManager.start()',
  'captureInterruptedStream()',
  'enterRecovering(helloOk)',
  'reconcileHistoryAndResume(messages)',
  'queueRealtimeFrame(entry)',
  'replayQueuedFrames()',
  'scheduleReconnect(reason)',
  'computeBackoffDelay(attempt)',
  "transitionTo('reconnecting'",
  'onHelloOk',
  'onClose',
  'onError',
  'onTick',
  'onHealth',
  'onAgentFrame',
  'onChatFrame'
)

foreach ($snippet in $requiredSnippets) {
  if (-not $html.Contains($snippet)) {
    throw "Missing required reconnect snippet: $snippet"
  }
}

Write-Host 'JARVIS HUD reconnect skeleton verification passed.'
