$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$paths = @(
  (Join-Path $root 'docs\theming.md'),
  (Join-Path $root 'docs\adapter-api.md'),
  (Join-Path $root 'README.md')
)

foreach ($path in $paths) {
  if (-not (Test-Path $path)) {
    throw "Missing publishability doc file: $path"
  }
}

$readme = Get-Content -Raw (Join-Path $root 'README.md')
$theming = Get-Content -Raw (Join-Path $root 'docs\theming.md')
$adapterApi = Get-Content -Raw (Join-Path $root 'docs\adapter-api.md')

$requiredReadmeSnippets = @(
  'docs/architecture.md',
  'docs/theming.md',
  'docs/adapter-api.md',
  'examples/minimal-hub/index.html'
)

foreach ($snippet in $requiredReadmeSnippets) {
  if (-not $readme.Contains($snippet)) {
    throw "README missing publishability link: $snippet"
  }
}

$requiredThemingSnippets = @(
  'Hub Shell',
  'selectors',
  'HUB_CONFIG',
  'copy.zh-CN.js'
)

foreach ($snippet in $requiredThemingSnippets) {
  if (-not $theming.Contains($snippet)) {
    throw "Theming doc missing required section: $snippet"
  }
}

$requiredAdapterSnippets = @(
  'GatewaySocketAdapter',
  'protocol-normalizer',
  'runtimeBridge',
  'connect',
  'loadAgentsList'
)

foreach ($snippet in $requiredAdapterSnippets) {
  if (-not $adapterApi.Contains($snippet)) {
    throw "Adapter API doc missing required section: $snippet"
  }
}

Write-Host 'Publishability docs verification passed.'
