@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul || goto :missing_node
where npm.cmd >nul 2>nul || goto :missing_npm
node scripts\check-node-version.mjs || goto :failed

if not exist "node_modules\next\package.json" (
  echo Dependencies are missing. Running npm ci...
  call npm.cmd ci || goto :failed
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 1 }" || goto :port_busy

echo Starting LocalAITuber at http://127.0.0.1:3000
start "LocalAITuber readiness" /B powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\open-browser.ps1" -Url "http://127.0.0.1:3000"
call npm.cmd run dev
set "APP_EXIT=%ERRORLEVEL%"
if not "%APP_EXIT%"=="0" goto :failed_with_code
exit /b 0

:port_busy
echo ERROR: Port 3000 is already in use. Stop the other service and retry.
goto :failed
:missing_node
echo ERROR: Node.js 24.x was not found. Run SETUP.bat after installing Node.js.
goto :failed
:missing_npm
echo ERROR: npm 11.x was not found.
:failed
set "APP_EXIT=1"
:failed_with_code
echo LocalAITuber stopped with exit code %APP_EXIT%.
pause
exit /b %APP_EXIT%
