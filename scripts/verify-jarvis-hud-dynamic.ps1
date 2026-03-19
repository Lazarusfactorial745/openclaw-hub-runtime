$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$indexPath = Join-Path $root 'index.html'

if (-not (Test-Path $indexPath)) {
  throw "Missing demo file: $indexPath"
}

$html = Get-Content -Raw $indexPath

$requiredSnippets = @(
  '// Store',
  '// Renderer',
  '// Scroll Engine',
  'GatewaySocketAdapter + GatewayRequestRouter',
  'bottom-sentinel',
  'dispatch(event)',
  'isPinnedToBottom',
  'assistant_start',
  'assistant_chunk',
  'assistant_done'
)

foreach ($snippet in $requiredSnippets) {
  if (-not $html.Contains($snippet)) {
    throw "Missing required dynamic snippet: $snippet"
  }
}

Write-Host 'JARVIS HUD dynamic verification passed.'
