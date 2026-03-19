$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$paths = @(
  (Join-Path $root 'docs\launch-kit.md'),
  (Join-Path $root 'README.md'),
  (Join-Path $root 'docs\github-launch.md')
)

foreach ($path in $paths) {
  if (-not (Test-Path $path)) {
    throw "Missing launch-kit file: $path"
  }
}

$launchKit = Get-Content -Raw (Join-Path $root 'docs\launch-kit.md')
$readme = Get-Content -Raw (Join-Path $root 'README.md')
$launchGuide = Get-Content -Raw (Join-Path $root 'docs\github-launch.md')

$requiredLaunchKitSnippets = @(
  'Repository name ideas',
  'GitHub About text',
  'Recommended topics',
  'Release checklist',
  'Launch post (English)',
  'Launch post (Chinese)'
)

foreach ($snippet in $requiredLaunchKitSnippets) {
  if (-not $launchKit.Contains($snippet)) {
    throw "Launch kit missing required section: $snippet"
  }
}

if (-not $readme.Contains('docs/launch-kit.md')) {
  throw 'README missing launch kit link'
}

$badMarkers = @([string][char]0x9225, [string][char]0xFFFD)
foreach ($marker in $badMarkers) {
  if ($launchGuide.Contains($marker)) {
    throw "GitHub launch guide still contains mojibake marker: $marker"
  }
}

Write-Host 'Launch kit verification passed.'
