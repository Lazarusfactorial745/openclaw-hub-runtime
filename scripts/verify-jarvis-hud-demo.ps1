$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$indexPath = Join-Path $root 'index.html'

if (-not (Test-Path $indexPath)) {
  throw "Missing demo file: $indexPath"
}

$html = Get-Content -Raw $indexPath

$requiredSnippets = @(
  'h-screen w-screen overflow-hidden bg-[#050B14]',
  'w-72 shrink-0',
  'overflow-y-auto',
  'diagnostics-panel',
  'floating-console',
  '::-webkit-scrollbar',
  'scrollbar-width',
  'breathing-glow',
  'typing-cursor'
)

foreach ($snippet in $requiredSnippets) {
  if (-not $html.Contains($snippet)) {
    throw "Missing required snippet: $snippet"
  }
}

Write-Host 'JARVIS HUD demo verification passed.'
