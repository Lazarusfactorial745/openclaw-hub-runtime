$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$paths = @(
  (Join-Path $root 'apps\jarvis-hub\index.html'),
  (Join-Path $root 'packages\runtime\openclaw-hub-runtime.js'),
  (Join-Path $root 'packages\runtime\bootstrap.js'),
  (Join-Path $root 'packages\adapters\openclaw\gateway-adapter.js'),
  (Join-Path $root 'packages\adapters\openclaw\protocol-normalizer.js'),
  (Join-Path $root 'packages\themes\jarvis\theme.css')
)

foreach ($path in $paths) {
  if (-not (Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$html = ($paths | ForEach-Object { Get-Content -Raw $_ }) -join "`n"

$requiredSnippets = @(
  'import { GatewaySocketAdapter, loadGatewayToken } from ''../adapters/openclaw/gateway-adapter.js'';',
  'from ''./protocol-normalizer.js''',
  'export class GatewaySocketAdapter',
  'pendingRequests',
  'loadOrCreateBrowserDeviceIdentity',
  "request('health'",
  "request('chat.history'",
  'hydrateHistory',
  'wake-up-flash',
  'history-hydrating'
)

foreach ($snippet in $requiredSnippets) {
  if (-not $html.Contains($snippet)) {
    throw "Missing required gateway integration snippet: $snippet"
  }
}

Write-Host 'JARVIS HUD gateway integration verification passed.'
