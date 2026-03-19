$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$paths = @(
  (Join-Path $root 'docs\architecture.md'),
  (Join-Path $root 'examples\minimal-hub\index.html'),
  (Join-Path $root 'examples\minimal-hub\hub.config.js'),
  (Join-Path $root 'examples\minimal-hub\copy.zh-CN.js'),
  (Join-Path $root 'examples\minimal-hub\README.md')
)

foreach ($path in $paths) {
  if (-not (Test-Path $path)) {
    throw "Missing architecture/example file: $path"
  }
}

$architecture = Get-Content -Raw (Join-Path $root 'docs\architecture.md')
$exampleHtml = Get-Content -Raw (Join-Path $root 'examples\minimal-hub\index.html')
$exampleConfig = Get-Content -Raw (Join-Path $root 'examples\minimal-hub\hub.config.js')
$exampleCopy = Get-Content -Raw (Join-Path $root 'examples\minimal-hub\copy.zh-CN.js')

$architectureSnippets = @(
  'Hub Shell',
  'Runtime',
  'Adapter',
  'Reconnect Manager',
  'Test Harness'
)

foreach ($snippet in $architectureSnippets) {
  if (-not $architecture.Contains($snippet)) {
    throw "Architecture doc missing required section: $snippet"
  }
}

$exampleSnippets = @(
  '../../packages/runtime/openclaw-hub-runtime.js',
  './hub.config.js',
  './copy.zh-CN.js',
  'message-scroller',
  'prompt-input'
)

foreach ($snippet in $exampleSnippets) {
  if (-not $exampleHtml.Contains($snippet)) {
    throw "Minimal hub example missing required snippet: $snippet"
  }
}

if (-not $exampleConfig.Contains('window.HUB_CONFIG')) {
  throw 'Minimal hub config does not define HUB_CONFIG'
}

if (-not $exampleCopy.Contains("from '../../packages/shared/copy.zh-CN.js'")) {
  throw 'Minimal hub copy does not reuse shared Chinese copy'
}

Write-Host 'Architecture and minimal hub verification passed.'
