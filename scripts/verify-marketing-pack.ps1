$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$paths = @(
  (Join-Path $root 'docs\star-pack.md'),
  (Join-Path $root 'README.md')
)

foreach ($path in $paths) {
  if (-not (Test-Path $path)) {
    throw "Missing marketing-pack file: $path"
  }
}

$starPack = Get-Content -Raw (Join-Path $root 'docs\star-pack.md')
$readme = Get-Content -Raw (Join-Path $root 'README.md')

$requiredStarPackSnippets = @(
  'Star-worthy angle',
  'README hero',
  'One-line pitch',
  'Launch hooks',
  'Demo narrative'
)

foreach ($snippet in $requiredStarPackSnippets) {
  if (-not $starPack.Contains($snippet)) {
    throw "Star pack missing required section: $snippet"
  }
}

$requiredReadmeSnippets = @(
  'docs/star-pack.md',
  'Why This Could Earn a Star'
)

foreach ($snippet in $requiredReadmeSnippets) {
  if (-not $readme.Contains($snippet)) {
    throw "README missing marketing surface: $snippet"
  }
}

Write-Host 'Marketing pack verification passed.'
