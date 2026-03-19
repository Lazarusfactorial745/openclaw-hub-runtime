$ErrorActionPreference = 'Stop'

$root = 'd:\openclaw'
$indexPath = Join-Path $root 'index.html'

if (-not (Test-Path $indexPath)) {
  throw "Missing demo file: $indexPath"
}

$html = Get-Content -Raw $indexPath

$requiredSnippets = @(
  'sendChat(text)',
  'handleAgentEvent(frame)',
  'handleChatEvent(frame)',
  'projectAssistantDelta(',
  'enqueueAssistantDelta(',
  "method: 'chat.send'"
)

foreach ($snippet in $requiredSnippets) {
  if (-not $html.Contains($snippet)) {
    throw "Missing required realtime snippet: $snippet"
  }
}

Write-Host 'JARVIS HUD realtime verification passed.'
