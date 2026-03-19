$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$paths = @(
  (Join-Path $root 'apps\jarvis-hub\index.html'),
  (Join-Path $root 'apps\jarvis-hub\copy.zh-CN.js'),
  (Join-Path $root 'packages\shared\copy.zh-CN.js'),
  (Join-Path $root 'packages\runtime\openclaw-hub-runtime.js')
)

foreach ($path in $paths) {
  if (-not (Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$html = ($paths | ForEach-Object { Get-Content -Raw $_ }) -join "`n"

$requiredSnippets = @(
  'DEFAULT_COPY_ZH',
  "window.COPY_ZH = window.COPY_ZH || DEFAULT_COPY_ZH",
  'neuralInterface',
  'chatPrimaryChannel',
  'linkActive',
  'linkLost',
  'testResumeZh',
  'diagnoseZh'
)

foreach ($snippet in $requiredSnippets) {
  if (-not $html.Contains($snippet)) {
    throw "Missing required Chinese localization snippet: $snippet"
  }
}

Write-Host 'JARVIS HUD Chinese localization verification passed.'
