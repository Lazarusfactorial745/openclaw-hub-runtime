$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$indexPath = Join-Path $root 'index.html'

if (-not (Test-Path $indexPath)) {
  throw "Missing demo file: $indexPath"
}

$html = Get-Content -Raw $indexPath

$requiredSnippets = @(
  'diagnostics-unfold',
  'diagnostics-scanline',
  'is-expanded',
  'triggerDiagnosticsRitual',
  'scanlineSweep'
)

foreach ($snippet in $requiredSnippets) {
  if (-not $html.Contains($snippet)) {
    throw "Missing required diagnostics ritual snippet: $snippet"
  }
}

Write-Host 'JARVIS HUD diagnostics ritual verification passed.'
