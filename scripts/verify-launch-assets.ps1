$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$paths = @(
  (Join-Path $root 'CHANGELOG.md'),
  (Join-Path $root 'docs\github-launch.md'),
  (Join-Path $root 'README.md')
)

foreach ($path in $paths) {
  if (-not (Test-Path $path)) {
    throw "Missing launch asset file: $path"
  }
}

$changelog = Get-Content -Raw (Join-Path $root 'CHANGELOG.md')
$launchDoc = Get-Content -Raw (Join-Path $root 'docs\github-launch.md')
$readme = Get-Content -Raw (Join-Path $root 'README.md')

$requiredChangelogSnippets = @(
  '# Changelog',
  'Initial public release candidate',
  'Added'
)

foreach ($snippet in $requiredChangelogSnippets) {
  if (-not $changelog.Contains($snippet)) {
    throw "Changelog missing required section: $snippet"
  }
}

$requiredLaunchDocSnippets = @(
  'Tagline',
  'GitHub description',
  'Topics',
  'Demo order',
  'Release copy'
)

foreach ($snippet in $requiredLaunchDocSnippets) {
  if (-not $launchDoc.Contains($snippet)) {
    throw "GitHub launch doc missing required section: $snippet"
  }
}

$requiredReadmeSnippets = @(
  'CHANGELOG.md',
  'docs/github-launch.md'
)

foreach ($snippet in $requiredReadmeSnippets) {
  if (-not $readme.Contains($snippet)) {
    throw "README missing launch asset link: $snippet"
  }
}

Write-Host 'Launch assets verification passed.'
