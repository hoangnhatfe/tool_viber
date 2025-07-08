@echo off
echo 🔧 Fixing Windows electron-store error...

echo Removing old node_modules...
rmdir /s /q node_modules 2>nul

echo Removing package-lock.json...
del package-lock.json 2>nul

echo Installing fresh dependencies...
npm install

echo Building app...
npm run dist

echo ✅ Done! Check dist folder for new builds.
pause 