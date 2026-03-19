$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$paths = @(
  (Join-Path $root 'apps\jarvis-hub\index.html'),
  (Join-Path $root 'packages\runtime\openclaw-hub-runtime.js'),
  (Join-Path $root 'packages\runtime\store.js'),
  (Join-Path $root 'packages\runtime\renderer.js'),
  (Join-Path $root 'packages\adapters\openclaw\gateway-adapter.js')
)

foreach ($path in $paths) {
  if (-not (Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$html = ($paths | ForEach-Object { Get-Content -Raw $_ }) -join "`n"

$requiredSnippets = @(
  'sidebar-agents-list',
  'state.agents',
  'normalizeAgentsList',
  'loadAgentsList()',
  'renderSidebarAgents',
  'agent_selected',
  'agents_loaded'
)

foreach ($snippet in $requiredSnippets) {
  if (-not $html.Contains($snippet)) {
    throw "Missing required sidebar agents snippet: $snippet"
  }
}

Write-Host 'JARVIS HUD sidebar agents verification passed.'
