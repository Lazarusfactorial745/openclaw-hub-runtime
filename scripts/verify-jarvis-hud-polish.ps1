$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$indexPath = Join-Path $root 'index.html'

if (-not (Test-Path $indexPath)) {
  throw "Missing demo file: $indexPath"
}

$html = Get-Content -Raw $indexPath

$requiredSnippets = @(
  'parseAssistantSegments',
  'code-block-panel',
  'data-role="code-language"',
  'scroll-hud-badge',
  'newDataStreaming',
  'showScrollBadge',
  'hideScrollBadge'
)

foreach ($snippet in $requiredSnippets) {
  if (-not $html.Contains($snippet)) {
    throw "Missing required polish snippet: $snippet"
  }
}

Write-Host 'JARVIS HUD polish verification passed.'
