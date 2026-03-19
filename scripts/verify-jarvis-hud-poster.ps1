$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$indexPath = Join-Path $root 'index.html'

if (-not (Test-Path $indexPath)) {
  throw "Missing demo file: $indexPath"
}

$html = Get-Content -Raw $indexPath

$requiredSnippets = @(
  'poster=1',
  'poster-mode',
  'is-orphaned',
  'ResumeTestHarness',
  'posterMode',
  'battle-damaged'
)

foreach ($snippet in $requiredSnippets) {
  if (-not $html.Contains($snippet)) {
    throw "Missing required poster snippet: $snippet"
  }
}

Write-Host 'JARVIS HUD poster verification passed.'
