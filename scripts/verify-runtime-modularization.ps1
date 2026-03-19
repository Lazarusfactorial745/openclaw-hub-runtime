$ErrorActionPreference = 'Stop'

$requiredPaths = @(
  'd:\openclaw\packages\runtime\bootstrap.js',
  'd:\openclaw\packages\shared\copy.zh-CN.js',
  'd:\openclaw\packages\runtime\commands.js',
  'd:\openclaw\packages\runtime\shell-bootstrap.js',
  'd:\openclaw\packages\runtime\store.js',
  'd:\openclaw\packages\runtime\reconnect-manager.js',
  'd:\openclaw\packages\test-harness\resume-test.js',
  'd:\openclaw\packages\runtime\renderer.js',
  'd:\openclaw\packages\adapters\openclaw\gateway-adapter.js',
  'd:\openclaw\packages\adapters\openclaw\protocol-normalizer.js'
)

foreach ($path in $requiredPaths) {
  if (-not (Test-Path $path)) {
    throw "Missing modular runtime file: $path"
  }
}

$runtime = Get-Content -Raw 'd:\openclaw\packages\runtime\openclaw-hub-runtime.js'

$requiredSnippets = @(
  "from './bootstrap.js'",
  "from '../shared/copy.zh-CN.js'",
  "from './commands.js'",
  "from './shell-bootstrap.js'",
  "from './store.js'",
  "from '../test-harness/resume-test.js'",
  "from './renderer.js'"
)

foreach ($snippet in $requiredSnippets) {
  if (-not $runtime.Contains($snippet)) {
    throw "Runtime missing modular import: $snippet"
  }
}

$adapter = Get-Content -Raw 'd:\openclaw\packages\adapters\openclaw\gateway-adapter.js'
$bootstrap = Get-Content -Raw 'd:\openclaw\packages\runtime\bootstrap.js'
$appCopy = Get-Content -Raw 'd:\openclaw\apps\jarvis-hub\copy.zh-CN.js'

$requiredBootstrapSnippets = @(
  "from '../adapters/openclaw/gateway-adapter.js'",
  "from './reconnect-manager.js'",
  "from './shell-bootstrap.js'"
)

foreach ($snippet in $requiredBootstrapSnippets) {
  if (-not $bootstrap.Contains($snippet)) {
    throw "Bootstrap module missing import: $snippet"
  }
}

$requiredAdapterSnippets = @(
  "from './protocol-normalizer.js'",
  "from '../../shared/copy.zh-CN.js'"
)

foreach ($snippet in $requiredAdapterSnippets) {
  if (-not $adapter.Contains($snippet)) {
    throw "Gateway adapter missing modular import: $snippet"
  }
}

if (-not $appCopy.Contains("from '../../packages/shared/copy.zh-CN.js'")) {
  throw "App copy module is not wired to shared Chinese copy yet"
}

$forbiddenSnippets = @(
  'let messageIdCounter = 0;',
  'function nextMessageId(',
  'const state = {',
  'function dispatch(event) {',
  'function resolveHubSelector(',
  'const refs = {',
  'refs.promptForm.addEventListener(',
  'refs.promptInput.addEventListener(',
  'refs.scrollHudBadge.addEventListener(',
  'function injectManualDiagnostics(',
  'async function submitPrompt(',
  'const COPY_ZH = window.COPY_ZH || {',
  'function updateClock(',
  'async function bootstrap(',
  'const LegacyRenderer =',
  'class LegacyGatewaySocketAdapter',
  'const LegacyResumeTestHarness =',
  'const LegacyScrollEngine =',
  'async function legacyLoadGatewayToken(',
  'class ReconnectManager {',
  'function legacyApplyInputLockState(',
  'function legacyAppendRecoveryDiagnosticsLine(',
  'function legacyForceOrphanedCursor('
)

foreach ($snippet in $forbiddenSnippets) {
  if ($runtime.Contains($snippet)) {
    throw "Runtime still contains legacy inline implementation: $snippet"
  }
}

$forbiddenAdapterSnippets = @(
  'const DEFAULT_COPY = {',
  'function normalizeAgentsList(',
  'function extractTextFromGatewayContent('
)

foreach ($snippet in $forbiddenAdapterSnippets) {
  if ($adapter.Contains($snippet)) {
    throw "Gateway adapter still contains inline protocol normalization: $snippet"
  }
}

Write-Host 'Runtime modularization verification passed.'
