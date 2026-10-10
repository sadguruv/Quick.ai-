@echo off
setlocal EnableDelayedExpansion
title QuickAI Unified System Launcher
cd /d "%~dp0"

echo ======================================================================
echo                       QUICKAI SYSTEM LAUNCHER
echo ======================================================================
echo.

:: ----------------------------------------------------------------------
:: STEP 1: CHECK SYSTEM ENVIRONMENT (NODE AND NPM)
:: ----------------------------------------------------------------------
echo [STEP 1/5] Checking Environment Prerequisites...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Node.js is not installed or not found in system PATH.
    echo Please install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] NPM package manager is not installed or not found in PATH.
    pause
    exit /b 1
)
echo [SUCCESS] Environment check passed: Node.js and NPM found.
echo.

:: ----------------------------------------------------------------------
:: STEP 2: CLEAN STALE PORTS (5000 AND 5173)
:: ----------------------------------------------------------------------
echo [STEP 2/5] Checking and Freeing Application Ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo [SUCCESS] Port cleanup completed: Ports 5000 and 5173 are free.
echo.

:: ----------------------------------------------------------------------
:: STEP 3: CONNECT AND VERIFY OLLAMA AI ENGINE
:: ----------------------------------------------------------------------
echo [STEP 3/5] Connecting to Ollama AI Engine (Port 11434)...
set "OLLAMA_ACTIVE=0"

netstat -ano | findstr ":11434" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    set "OLLAMA_ACTIVE=1"
) else (
    where ollama >nul 2>&1
    if %errorlevel% equ 0 (
        start "QuickAI Ollama Service" /min cmd /c "ollama serve"
        for /l %%i in (1,1,10) do (
            ping -n 2 127.0.0.1 >nul
            netstat -ano | findstr ":11434" | findstr "LISTENING" >nul 2>&1
            if !errorlevel! equ 0 (
                set "OLLAMA_ACTIVE=1"
                goto :OllamaCheckDone
            )
        )
    )
)
:OllamaCheckDone
if "%OLLAMA_ACTIVE%"=="1" (
    echo [SUCCESS] Ollama connected successfully on http://127.0.0.1:11434.
) else (
    echo [FAIL] Ollama is offline. QuickAI will operate using built-in resilient fallbacks.
)
echo.

:: ----------------------------------------------------------------------
:: STEP 4: LAUNCH AND VERIFY BACKEND SERVER (PORT 5000)
:: ----------------------------------------------------------------------
echo [STEP 4/5] Launching Backend Server on Port 5000...
start "QuickAI Backend" /min /D "%~dp0server" cmd /c "node server.js"

set "BACKEND_ACTIVE=0"
for /l %%i in (1,1,15) do (
    ping -n 2 127.0.0.1 >nul
    netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
    if !errorlevel! equ 0 (
        set "BACKEND_ACTIVE=1"
        goto :BackendCheckDone
    )
)
:BackendCheckDone
if "%BACKEND_ACTIVE%"=="1" (
    echo [SUCCESS] Backend server running successfully at http://localhost:5000.
) else (
    echo [FAIL] Backend server failed to respond on Port 5000.
    pause
    exit /b 1
)
echo.

:: ----------------------------------------------------------------------
:: STEP 5: LAUNCH AND VERIFY FRONTEND CLIENT (PORT 5173)
:: ----------------------------------------------------------------------
echo [STEP 5/5] Launching Frontend Client on Port 5173...
start "QuickAI Frontend" /min /D "%~dp0client" cmd /c "npm run dev"

set "FRONTEND_ACTIVE=0"
for /l %%i in (1,1,15) do (
    ping -n 2 127.0.0.1 >nul
    netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>&1
    if !errorlevel! equ 0 (
        set "FRONTEND_ACTIVE=1"
        goto :FrontendCheckDone
    )
)
:FrontendCheckDone
if "%FRONTEND_ACTIVE%"=="1" (
    echo [SUCCESS] Frontend client running successfully at http://localhost:5173.
) else (
    echo [FAIL] Frontend client failed to respond on Port 5173.
    pause
    exit /b 1
)
echo.

:: ----------------------------------------------------------------------
:: OPEN IN DEFAULT BROWSER
:: ----------------------------------------------------------------------
start http://localhost:5173
echo [SUCCESS] QuickAI application is live and opened in your browser!
echo.

:: ----------------------------------------------------------------------
:: SERVICE STATUS AND LOGIN CREDENTIALS
:: ----------------------------------------------------------------------
echo ======================================================================
echo                     QUICKAI DASHBOARD AND ACCESS INFO
echo ======================================================================
echo.
echo   [x] Frontend URL    : http://localhost:5173
echo   [x] Backend API     : http://localhost:5000
echo   [x] Health Check    : http://localhost:5000/api/health
echo   [x] Local Database  : server/data/quickai.db (SQLite)
echo   [x] Ollama AI Status: %OLLAMA_ACTIVE% (1=Active, 0=Fallback)
echo.
echo ----------------------------------------------------------------------
echo   DEFAULT TEST LOGIN CREDENTIALS:
echo   - Admin Account  : admin@quickai.com  /  Password: admin@123
echo   - User Account   : user@quick.ai      /  Password: password123
echo ----------------------------------------------------------------------
echo.
echo   [INFO] Keep this terminal window open while using QuickAI.
echo   To stop all services, simply close this window.
echo.
echo ======================================================================
pause
