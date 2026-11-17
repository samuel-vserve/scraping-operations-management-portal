# Vserve Scraping Operations Portal - One-Click PowerShell Launcher
Set-Location -Path $PSScriptRoot

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "     VSERVE SCRAPING OPERATIONS MANAGEMENT PORTAL" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not found in your PATH." -ForegroundColor Red
    Write-Host "Please download and install Node.js from https://nodejs.org/"
    Read-Host "Press Enter to exit..."
    exit 1
}

# Check node_modules
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "[INFO] node_modules folder not found. Running npm install..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] npm install failed." -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit 1
    }
}

Write-Host "[INFO] Launching portal in default browser..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host ""

npm run dev -- --open
