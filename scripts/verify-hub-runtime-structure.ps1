$ErrorActionPreference = 'Stop'

$requiredPaths = @(
  'd:\openclaw\apps\jarvis-hub\index.html',
  'd:\openclaw\apps\jarvis-hub\copy.zh-CN.js',
  'd:\openclaw\apps\jarvis-hub\hub.config.js',
  'd:\openclaw\packages\themes\jarvis\theme.css',
  'd:\openclaw\packages\runtime\openclaw-hub-runtime.js'
)

foreach ($path in $requiredPaths) {
  if (-not (Test-Path $path)) {
    throw "Missing required structure path: $path"
  }
}

Write-Host 'OpenClaw Hub Runtime structure verification passed.'
