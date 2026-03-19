$ErrorActionPreference = 'Stop'

$stateDir = Join-Path $env:USERPROFILE '.openclaw'
$startupDir = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Startup'
$startupScript = Join-Path $stateDir 'start-openclaw-gateway.ps1'
$manualLauncher = Join-Path $stateDir 'start-openclaw.cmd'
$desktopLauncher = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Start OpenClaw.cmd'
$startupShortcut = Join-Path $startupDir 'OpenClaw Gateway.lnk'
$configPath = Join-Path $stateDir 'openclaw.json'

if (-not (Test-Path $configPath)) {
  throw "Missing config file: $configPath"
}

$config = Get-Content -Raw $configPath | ConvertFrom-Json

if ($config.gateway.mode -ne 'local') {
  throw "Expected gateway.mode=local"
}

if ($config.gateway.bind -ne 'loopback') {
  throw "Expected gateway.bind=loopback"
}

if ($config.gateway.auth.mode -ne 'token') {
  throw "Expected gateway.auth.mode=token"
}

if ([string]::IsNullOrWhiteSpace($config.gateway.auth.token)) {
  throw "Expected gateway.auth.token to be set"
}

if (-not (Test-Path $startupScript)) {
  throw "Missing startup script: $startupScript"
}

if (-not (Test-Path $manualLauncher)) {
  throw "Missing manual launcher: $manualLauncher"
}

if (-not (Test-Path $desktopLauncher)) {
  throw "Missing desktop launcher: $desktopLauncher"
}

if (-not (Test-Path $startupShortcut)) {
  throw "Missing startup shortcut: $startupShortcut"
}

$listening = Get-NetTCPConnection -State Listen -LocalPort 18789 -ErrorAction SilentlyContinue
if (-not $listening) {
  throw 'Expected OpenClaw gateway to listen on 127.0.0.1:18789'
}

$statusOutput = & openclaw gateway status --token $config.gateway.auth.token 2>&1 | Out-String
if ($statusOutput -notmatch 'RPC probe: ok') {
  throw "Gateway status did not report 'RPC probe: ok'"
}

Write-Host 'Verification passed.'
