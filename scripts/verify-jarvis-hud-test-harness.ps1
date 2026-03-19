$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$paths = @(
  (Join-Path $root 'packages\runtime\openclaw-hub-runtime.js'),
  (Join-Path $root 'packages\test-harness\resume-test.js'),
  (Join-Path $root 'apps\jarvis-hub\copy.zh-CN.js'),
  (Join-Path $root 'packages\shared\copy.zh-CN.js')
)

foreach ($path in $paths) {
  if (-not (Test-Path $path)) {
    throw "Missing required file: $path"
  }
}

$html = ($paths | ForEach-Object { Get-Content -Raw $_ }) -join "`n"

$requiredSnippets = @(
  '/test-resume',
  'ExtractedResumeTestHarness',
  'runTestResume(',
  'triggeringControlledDrop',
  'syncingHistory',
  'recoveredViaResync'
)

foreach ($snippet in $requiredSnippets) {
  if (-not $html.Contains($snippet)) {
    throw "Missing required test-harness snippet: $snippet"
  }
}

Write-Host 'JARVIS HUD test harness verification passed.'
