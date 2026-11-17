@echo off
setlocal enabledelayedexpansion
title Vserve Scraping Operations Portal

:: Ensure script runs from the project directory
cd /d "%~dp0"

echo ============================================================
echo      VSERVE SCRAPING OPERATIONS MANAGEMENT PORTAL
echo ============================================================
echo.

:: Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please download and install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists; install dependencies if missing
if not exist "node_modules\" (
    echo [INFO] node_modules not detected. Installing project dependencies...
    echo This may take a moment on first launch...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Dependency installation failed. Please check your network connection.
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed successfully.
    echo.
)

echo [INFO] Launching Vite Dev Server...
echo [INFO] The portal will automatically open in your default browser.
echo.
echo Press Ctrl+C in this terminal window anytime to stop the server.
echo ============================================================
echo.

:: Run dev server and automatically launch default browser on the active port
call npm run dev -- --open

if %errorlevel% neq 0 (
    echo.
    echo [NOTICE] Server stopped.
    pause
)
