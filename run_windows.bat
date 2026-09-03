@echo off
setlocal EnableExtensions
title EAII Performance Testing Tool

echo ================================================
echo EAII Performance Testing Tool
echo ================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js was not found in PATH.
    echo Install Node.js LTS and reopen PowerShell.
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm was not found in PATH.
    pause
    exit /b 1
)

echo Node version:
call node --version
echo.
echo npm version:
call npm --version
echo.

if not exist "package.json" (
    echo ERROR: package.json was not found.
    echo Please run this file from the project root.
    pause
    exit /b 1
)

echo Checking project dependencies...
if not exist "node_modules" (
    echo.
    echo Installing project dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed.
        pause
        exit /b 1
    )
) else (
    echo node_modules already exists - skipping npm install.
)

echo.
echo Starting application...
echo.
echo Starting EAII PTT background power guard...
start "EAII PTT Power Guard" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0windows-power-guard.ps1"
echo Display may turn off, but Windows system sleep is blocked while a test is active.
echo The benchmark continues running in the background while the display is off.
echo.
echo Browser auto-launch is DISABLED.
echo The launcher will NOT open any browser window on startup or during tests.
echo Dashboard: http://localhost:3000/
echo.
echo Press Ctrl+C to stop the application.
echo.

call npm run dev -- --host 0.0.0.0
set "EXITCODE=%ERRORLEVEL%"

echo.
echo Application stopped with exit code %EXITCODE%.
pause
exit /b %EXITCODE%
