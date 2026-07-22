@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

echo [LocalAITuber] Checking Node.js and npm...
where node >nul 2>nul || goto :missing_node
where npm.cmd >nul 2>nul || goto :missing_npm
node scripts\check-node-version.mjs || goto :failed
call npm.cmd --version || goto :failed

if not exist ".env.local" (
  copy /Y ".env.example" ".env.local" >nul || goto :failed
  echo Created .env.local. Review it before exposing the service.
) else (
  echo Existing .env.local was preserved.
)

echo [LocalAITuber] Installing locked dependencies...
call npm.cmd ci || goto :failed
echo.
echo Setup completed successfully.
echo To install the optional E2E browser, run: npx playwright install chromium
pause
exit /b 0

:missing_node
echo ERROR: Node.js 24.x was not found. Install it from https://nodejs.org/
goto :failed
:missing_npm
echo ERROR: npm 11.x was not found.
:failed
echo Setup failed. Review the error output above.
pause
exit /b 1
