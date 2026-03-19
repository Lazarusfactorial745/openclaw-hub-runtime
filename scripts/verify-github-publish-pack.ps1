$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$paths = @(
  (Join-Path $root 'docs\github-publish-pack.md'),
  (Join-Path $root 'docs\launch-kit.md'),
  (Join-Path $root 'README.md')
)

foreach ($path in $paths) {
  if (-not (Test-Path $path)) {
    throw "Missing publish-pack file: $path"
  }
}

$publishPack = Get-Content -Raw (Join-Path $root 'docs\github-publish-pack.md')
$launchKit = Get-Content -Raw (Join-Path $root 'docs\launch-kit.md')
$readme = Get-Content -Raw (Join-Path $root 'README.md')

$requiredPublishPackSnippets = @(
  'GitHub repository name',
  'GitHub About',
  'GitHub description',
  'Topics',
  'Release title',
  'Release notes',
  'Launch post (English)',
  'Launch post (Chinese)'
)

foreach ($snippet in $requiredPublishPackSnippets) {
  if (-not $publishPack.Contains($snippet)) {
    throw "Publish pack missing required section: $snippet"
  }
}

if (-not $readme.Contains('docs/github-publish-pack.md')) {
  throw 'README missing GitHub publish pack link'
}

$badMarkers = @([string][char]0x9225, [string][char]0xFFFD)
foreach ($marker in $badMarkers) {
  if ($launchKit.Contains($marker)) {
    throw "Launch kit still contains mojibake marker: $marker"
  }
}

Write-Host 'GitHub publish pack verification passed.'
