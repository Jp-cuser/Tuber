param(
  [string]$Url = 'http://127.0.0.1:3000',
  [int]$TimeoutSeconds = 120
)

$ErrorActionPreference = 'Stop'
$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
while ((Get-Date) -lt $deadline) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "$Url/api/diagnostics" -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
      Start-Process $Url
      exit 0
    }
  } catch {
    Start-Sleep -Milliseconds 500
  }
}
Write-Error "LocalAITuber did not become ready within $TimeoutSeconds seconds."
exit 1
