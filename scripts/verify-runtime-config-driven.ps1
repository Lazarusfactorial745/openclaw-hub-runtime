$ErrorActionPreference = 'Stop'

$paths = @(
  'd:\openclaw\packages\runtime\openclaw-hub-runtime.js',
  'd:\openclaw\packages\runtime\shell-bootstrap.js',
  'd:\openclaw\apps\jarvis-hub\hub.config.js',
  'd:\openclaw\README.md'
)

foreach ($path in $paths) {
  if (-not (Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$runtime = Get-Content -Raw 'd:\openclaw\packages\runtime\openclaw-hub-runtime.js'
$shellBootstrap = Get-Content -Raw 'd:\openclaw\packages\runtime\shell-bootstrap.js'
$config = Get-Content -Raw 'd:\openclaw\apps\jarvis-hub\hub.config.js'
$readme = Get-Content -Raw 'd:\openclaw\README.md'

$runtimeChecks = @(
  "from './shell-bootstrap.js'",
  'createShellContext(HUB_CONFIG)',
  'HUB_FEATURES'
)

foreach ($snippet in $runtimeChecks) {
  if (-not $runtime.Contains($snippet)) {
    throw "Runtime is not config-driven enough yet: $snippet"
  }
}

$shellChecks = @(
  'selectors = hubConfig.selectors || {}',
  "document.querySelector(resolveHubSelector('wakeUpFlash'",
  'features = hubConfig.features || {}'
)

foreach ($snippet in $shellChecks) {
  if (-not $shellBootstrap.Contains($snippet)) {
    throw "Shell bootstrap is not config-driven enough yet: $snippet"
  }
}

if (-not $config.Contains('wakeUpFlash')) {
  throw 'hub.config.js is missing extended selector mappings'
}

if (-not $readme.Contains('apps/jarvis-hub/index.html')) {
  throw 'README does not point to the extracted app entry yet'
}

Write-Host 'Runtime config-driven verification passed.'
