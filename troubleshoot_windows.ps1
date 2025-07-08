# Script troubleshooting cho Windows
Write-Host "🔍 Tool Viber Windows Troubleshooting" -ForegroundColor Cyan

Write-Host "`n=== KIỂM TRA HỆ THỐNG ===" -ForegroundColor Yellow

# Kiểm tra Windows version
$osVersion = [System.Environment]::OSVersion.VersionString
Write-Host "Windows Version: $osVersion" -ForegroundColor White

# Kiểm tra Node.js
Write-Host "`n📦 Node.js:" -ForegroundColor Green
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor White
    Write-Host "  ✅ npm: v$npmVersion" -ForegroundColor White
} catch {
    Write-Host "  ❌ Node.js not found" -ForegroundColor Red
    Write-Host "  💡 Download from: https://nodejs.org" -ForegroundColor Yellow
}

# Kiểm tra Python
Write-Host "`n🐍 Python:" -ForegroundColor Green
try {
    $pythonVersion = python --version
    $pipVersion = pip --version
    Write-Host "  ✅ Python: $pythonVersion" -ForegroundColor White
    Write-Host "  ✅ pip: $pipVersion" -ForegroundColor White
} catch {
    Write-Host "  ❌ Python not found" -ForegroundColor Red
    Write-Host "  💡 Download from: https://python.org" -ForegroundColor Yellow
}

# Kiểm tra Git
Write-Host "`n📋 Git:" -ForegroundColor Green
try {
    $gitVersion = git --version
    Write-Host "  ✅ $gitVersion" -ForegroundColor White
} catch {
    Write-Host "  ❌ Git not found" -ForegroundColor Red
    Write-Host "  💡 Download from: https://git-scm.com" -ForegroundColor Yellow
}

# Kiểm tra PyInstaller
Write-Host "`n🔧 PyInstaller:" -ForegroundColor Green
try {
    $pyinstallerVersion = pyinstaller --version
    Write-Host "  ✅ PyInstaller: $pyinstallerVersion" -ForegroundColor White
} catch {
    Write-Host "  ❌ PyInstaller not found" -ForegroundColor Red
    Write-Host "  💡 Install: pip install pyinstaller" -ForegroundColor Yellow
}

# Kiểm tra thư mục dự án
Write-Host "`n=== KIỂM TRA DỰ ÁN ===" -ForegroundColor Yellow

$currentDir = Get-Location
Write-Host "Current Directory: $currentDir" -ForegroundColor White

# Kiểm tra file quan trọng
$importantFiles = @(
    "package.json",
    "src/main.js", 
    "src/automation/viber_sender.py",
    "src/automation/viber_sender_win.spec"
)

foreach ($file in $importantFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (missing)" -ForegroundColor Red
    }
}

# Kiểm tra node_modules
if (Test-Path "node_modules") {
    $nodeModulesSize = [math]::Round((Get-ChildItem "node_modules" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 1)
    Write-Host "  ✅ node_modules ($nodeModulesSize MB)" -ForegroundColor Green
} else {
    Write-Host "  ❌ node_modules (missing - run 'npm install')" -ForegroundColor Red
}

# Kiểm tra resources
if (Test-Path "resources") {
    Write-Host "  ✅ resources folder" -ForegroundColor Green
    if (Test-Path "resources/viber_sender.exe") {
        $exeSize = [math]::Round((Get-Item "resources/viber_sender.exe").Length / 1MB, 1)
        Write-Host "    ✅ viber_sender.exe ($exeSize MB)" -ForegroundColor Green
    } else {
        Write-Host "    ❌ viber_sender.exe (missing)" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ resources folder (missing)" -ForegroundColor Red
}

Write-Host "`n=== GIẢI PHÁP ===" -ForegroundColor Yellow

Write-Host "🔧 Nếu gặp lỗi 'Cannot find module conf':" -ForegroundColor Cyan
Write-Host "   1. Chạy: fix_windows.bat" -ForegroundColor White
Write-Host "   2. Hoặc: rmdir /s /q node_modules && del package-lock.json && npm install" -ForegroundColor White

Write-Host "`n🚀 Để build app:" -ForegroundColor Cyan
Write-Host "   1. Chạy: build_windows.ps1" -ForegroundColor White
Write-Host "   2. Hoặc follow hướng dẫn trong SETUP_WINDOWS.md" -ForegroundColor White

Write-Host "`n⚡ Cần hỗ trợ thêm?" -ForegroundColor Cyan
Write-Host "   - Check SETUP_WINDOWS.md" -ForegroundColor White
Write-Host "   - Check BUILD_WINDOWS.md" -ForegroundColor White

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 