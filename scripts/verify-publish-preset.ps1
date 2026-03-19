$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$paths = @(
  (Join-Path $root 'docs\final-publish-preset.md'),
  (Join-Path $root 'README.md')
)

foreach ($path in $paths) {
  if (-not (Test-Path $path)) {
    throw "Missing publish preset file: $path"
  }
}

$preset = Get-Content -Raw (Join-Path $root 'docs\final-publish-preset.md')
$readme = Get-Content -Raw (Join-Path $root 'README.md')

$requiredPresetSnippets = @(
  'Final repository name',
  'Final GitHub About',
  'Final GitHub description',
  'Final topics',
  'Final release title',
  'Final release notes',
  'Final launch post (English)',
  'Final launch post (Chinese)'
)

foreach ($snippet in $requiredPresetSnippets) {
  if (-not $preset.Contains($snippet)) {
    throw "Final publish preset missing section: $snippet"
  }
}

if (-not $readme.Contains('docs/final-publish-preset.md')) {
  throw 'README missing final publish preset link'
}

Write-Host 'Final publish preset verification passed.'
