$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$paths = @(
  (Join-Path $root 'README.md'),
  (Join-Path $root 'LICENSE'),
  (Join-Path $root 'CONTRIBUTING.md'),
  (Join-Path $root 'docs\getting-started.md')
)

foreach ($path in $paths) {
  if (-not (Test-Path $path)) {
    throw "Missing release-readiness file: $path"
  }
}

$readme = Get-Content -Raw (Join-Path $root 'README.md')
$contributing = Get-Content -Raw (Join-Path $root 'CONTRIBUTING.md')
$gettingStarted = Get-Content -Raw (Join-Path $root 'docs\getting-started.md')
$license = Get-Content -Raw (Join-Path $root 'LICENSE')

$requiredReadmeSnippets = @(
  'Quick Start',
  'Documentation',
  'Architecture',
  'Theming',
  'Adapter API',
  'Minimal example shell',
  'Contributing',
  'License'
)

foreach ($snippet in $requiredReadmeSnippets) {
  if (-not $readme.Contains($snippet)) {
    throw "README missing release-readiness section: $snippet"
  }
}

$mojibakeMarkers = @(
  [string][char]0x9225,
  [string][char]0xFFFD
)
foreach ($marker in $mojibakeMarkers) {
  if ($readme.Contains($marker)) {
    throw "README still contains mojibake marker: $marker"
  }
}

$requiredContributingSnippets = @(
  'How to contribute',
  'Development workflow',
  'Verification'
)

foreach ($snippet in $requiredContributingSnippets) {
  if (-not $contributing.Contains($snippet)) {
    throw "CONTRIBUTING missing section: $snippet"
  }
}

$requiredGettingStartedSnippets = @(
  'OpenClaw Gateway',
  'Jarvis Hub',
  'Minimal Hub',
  'python -m http.server 8787'
)

foreach ($snippet in $requiredGettingStartedSnippets) {
  if (-not $gettingStarted.Contains($snippet)) {
    throw "Getting started doc missing section: $snippet"
  }
}

if (-not ($license.Contains('MIT License') -or $license.Contains('Apache License'))) {
  throw 'LICENSE does not look like a recognized permissive license file'
}

Write-Host 'Release readiness verification passed.'
