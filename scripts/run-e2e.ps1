$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$diagnosticsUrl = 'http://127.0.0.1:3000/api/diagnostics'
$serverJob = $null

function Test-ServerReady {
  try {
    $diagnosticsResponse = Invoke-WebRequest -UseBasicParsing -Uri $diagnosticsUrl -TimeoutSec 2
    return $diagnosticsResponse.StatusCode -eq 200
  }
  catch {
    return $false
  }
}

try {
  if (-not (Test-ServerReady)) {
    $serverJob = Start-Job -ScriptBlock {
      param($workingDirectory)
      Set-Location -LiteralPath $workingDirectory
      & node 'node_modules/next/dist/bin/next' dev --hostname 127.0.0.1
    } -ArgumentList $projectRoot

    $ready = $false
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
      if (Test-ServerReady) {
        $ready = $true
        break
      }
      Start-Sleep -Milliseconds 500
    }
    if (-not $ready) {
      throw 'Development server did not become ready for E2E tests.'
    }
  }

  Set-Location -LiteralPath $projectRoot
  & npm.cmd exec playwright test -- --reporter=line
  $testExitCode = $LASTEXITCODE
}
finally {
  if ($serverJob) {
    Stop-Job $serverJob -ErrorAction SilentlyContinue
    Receive-Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job $serverJob -Force -ErrorAction SilentlyContinue
  }
}

exit $testExitCode
