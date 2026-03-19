$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$indexPath = Join-Path $root 'index.html'

if (-not (Test-Path $indexPath)) {
  throw "Missing root index: $indexPath"
}

$html = Get-Content -Raw $indexPath

$requiredSnippets = @(
  'apps/jarvis-hub/index.html',
  'Original OpenClaw',
  'J.A.R.V.I.S. HUD',
  'compatibility-entry'
)

foreach ($snippet in $requiredSnippets) {
  if (-not $html.Contains($snippet)) {
    throw "Missing required root-wrapper snippet: $snippet"
  }
}

Write-Host 'Root wrapper verification passed.'
