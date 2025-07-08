Write-Host "Building Python Executable for Windows" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Step 1: Install packages
Write-Host "`nStep 1: Installing Python packages..." -ForegroundColor Yellow
pip install pyinstaller pyautogui pyperclip pillow
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install Python packages" -ForegroundColor Red
    exit 1
}

# Step 2: Clean old builds
Write-Host "`nStep 2: Cleaning old builds..." -ForegroundColor Yellow
Set-Location "src\automation"
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "build") { Remove-Item -Recurse -Force "build" }

# Step 3: Build executable
Write-Host "`nStep 3: Building executable with PyInstaller..." -ForegroundColor Yellow
pyinstaller --onefile --console --name viber_sender viber_sender.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: PyInstaller failed" -ForegroundColor Red
    exit 1
}

# Step 4: Copy to resources
Write-Host "`nStep 4: Copying to resources..." -ForegroundColor Yellow
Set-Location "..\..\"
if (!(Test-Path "resources")) { New-Item -ItemType Directory -Path "resources" }
Copy-Item "src\automation\dist\viber_sender.exe" "resources\viber_sender.exe"

Write-Host "`nSUCCESS! Python executable created" -ForegroundColor Green
Write-Host "File location: resources\viber_sender.exe" -ForegroundColor Cyan

if (Test-Path "resources\viber_sender.exe") {
    $size = [math]::Round((Get-Item "resources\viber_sender.exe").Length / 1MB, 1)
    Write-Host "File size: $size MB" -ForegroundColor White
} else {
    Write-Host "ERROR: File not found!" -ForegroundColor Red
}

Write-Host "`nYou can now run the main Electron app" -ForegroundColor Green 