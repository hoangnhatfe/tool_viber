@echo off
echo ========================================
echo  Building Python Executable for Windows
echo ========================================
echo.

echo Step 1: Installing Python packages...
pip install pyinstaller pyautogui pyperclip pillow
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python packages
    pause
    exit /b 1
)

echo.
echo Step 2: Cleaning old builds...
cd src\automation
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build

echo.
echo Step 3: Building executable with PyInstaller...
pyinstaller --onefile --console --name viber_sender viber_sender.py
if %errorlevel% neq 0 (
    echo ERROR: PyInstaller failed
    pause
    exit /b 1
)

echo.
echo Step 4: Copying to resources...
cd ..\..
if not exist resources mkdir resources
copy src\automation\dist\viber_sender.exe resources\viber_sender.exe
if %errorlevel% neq 0 (
    echo ERROR: Failed to copy executable
    pause
    exit /b 1
)

echo.
echo ========================================
echo  SUCCESS! Python executable created
echo ========================================
echo File location: resources\viber_sender.exe
dir resources\viber_sender.exe
echo.
echo You can now run the main Electron app
pause 