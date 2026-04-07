$source = "c:\Users\lenovo\Documents\AI\260325002_claudeantigavity\gs-ai-insight"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$target = "$source\backup\$timestamp"
New-Item -ItemType Directory -Force -Path $target | Out-Null
robocopy $source $target /E /XD node_modules .next .git backup public\uploads
if ($LASTEXITCODE -lt 8) { exit 0 } else { exit $LASTEXITCODE }
