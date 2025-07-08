@echo off
echo 🚀 Building Tool Viber (Simple Mode)
echo.

echo Step 1: Clean old builds...
if exist dist rmdir /s /q dist
if exist node_modules\electron-builder-cache rmdir /s /q node_modules\electron-builder-cache

echo Step 2: Installing Python packages...
pip install pyinstaller pyautogui pyperclip pillow

echo Step 3: Building Python executable...
cd src\automation
pyinstaller --onefile --hidden-import=pyautogui --hidden-import=pyperclip --hidden-import=PIL viber_sender.py

echo Step 4: Copying executable...
cd ..\..
if not exist resources mkdir resources
copy src\automation\dist\viber_sender.exe resources\viber_sender.exe

echo Step 5: Building Electron app (without signing)...
npm run build:renderer
npx electron-builder --win --x64 --dir

echo.
echo ✅ Build completed! 
echo 📁 Check: dist\win-unpacked\Tool Viber.exe
echo 💡 To create installer, run as Administrator
pause 