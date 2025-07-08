# PowerShell script de build Windows executable
Write-Host "Building Tool Viber for Windows..." -ForegroundColor Green

# Kiem tra admin rights
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "WARNING: Khong chay voi quyen Administrator!" -ForegroundColor Red
    Write-Host "Co the gap loi code signing. Khuyen nghi:" -ForegroundColor Yellow
    Write-Host "1. Dong PowerShell nay" -ForegroundColor White
    Write-Host "2. Right-click PowerShell -> Run as Administrator" -ForegroundColor White
    Write-Host "3. Chay lai script nay" -ForegroundColor White
    
    $choice = Read-Host "`nBan co muon tiep tuc khong? (y/N)"
    if ($choice -ne "y" -and $choice -ne "Y") {
        Write-Host "Da huy. Hay chay lai voi quyen Administrator." -ForegroundColor Red
        exit 1
    }
}

# Kiem tra Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Found Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js 18+ from nodejs.org" -ForegroundColor Red
    exit 1
}

# Kiem tra Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "Found Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python not found. Please install Python 3.9+ from python.org" -ForegroundColor Red
    exit 1
}

# Sua loi electron-store
Write-Host "Fixing electron-store error..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "Removed old node_modules" -ForegroundColor Green
}
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json"
    Write-Host "Removed package-lock.json" -ForegroundColor Green
}

# Cai dat Node dependencies
Write-Host "Installing Node.js packages..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install failed" -ForegroundColor Red
    exit 1
}

# Cai dat Python requirements
Write-Host "Installing Python packages..." -ForegroundColor Yellow
pip install pyinstaller pyautogui pyperclip pillow
if ($LASTEXITCODE -ne 0) {
    Write-Host "pip install failed" -ForegroundColor Red
    exit 1
}

# Build executable
Write-Host "Building Python executable..." -ForegroundColor Yellow
Set-Location "src\automation"
pyinstaller --onefile --hidden-import=pyautogui --hidden-import=pyperclip --hidden-import=PIL viber_sender.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "PyInstaller failed" -ForegroundColor Red
    exit 1
}

# Copy executable
Write-Host "Copying executable..." -ForegroundColor Yellow
Set-Location "..\..\"
if (-not (Test-Path "resources")) {
    New-Item -ItemType Directory -Path "resources"
}
Copy-Item "src\automation\dist\viber_sender.exe" "resources\viber_sender.exe"
Write-Host "Executable copied to resources/" -ForegroundColor Green

# Build Electron app
Write-Host "Building Electron app..." -ForegroundColor Yellow
npm run build:renderer
npx electron-builder --win --x64
if ($LASTEXITCODE -ne 0) {
    Write-Host "Electron build failed" -ForegroundColor Red
    exit 1
}

Write-Host "`nBuild completed successfully!" -ForegroundColor Green
Write-Host "Files created:" -ForegroundColor Cyan

if (Test-Path "dist\Tool Viber Setup 1.0.0.exe") {
    $size1 = [math]::Round((Get-Item "dist\Tool Viber Setup 1.0.0.exe").Length / 1MB, 1)
    Write-Host "Tool Viber Setup 1.0.0.exe ($size1 MB)" -ForegroundColor White
}

if (Test-Path "dist\win-unpacked\Tool Viber.exe") {
    Write-Host "Tool Viber.exe (unpacked version)" -ForegroundColor White
}

Write-Host "`nApp chay hoan toan doc lap, khong can cai Python!" -ForegroundColor Green
Write-Host "Ban co the chia se file .exe cho bat ky ai!" -ForegroundColor Green

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 