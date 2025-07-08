# 🪟 Hướng dẫn Build Windows Executable

## Yêu cầu
- Windows 10/11
- Python 3.9+
- Node.js 18+
- Git

## 🚀 Cách 1: Tự động (Khuyến nghị)

### Bước 1: Clone repo
```bash
git clone <repo-url>
cd tool_viber
```

### Bước 2: Chạy script tự động
```powershell
# Mở PowerShell as Administrator
.\build_windows.ps1
```

## 🔧 Cách 2: Thủ công

### Bước 1: Clone và Setup
```bash
git clone <repo-url>
cd tool_viber
```

### Bước 2: Cài đặt Python Dependencies
```bash
pip install pyinstaller pyautogui pyperclip pillow
```

### Bước 3: Build Windows Executable
```bash
cd src/automation
pyinstaller viber_sender_win.spec
```

### Bước 4: Copy Executable
```bash
copy dist\viber_sender.exe ..\..\resources\viber_sender.exe
```

### Bước 5: Build Electron App
```bash
cd ..\..
npm install
npm run dist
```

## 🎯 Kết quả
Sau khi hoàn thành, bạn sẽ có:
- `dist/Tool Viber Setup 1.0.0.exe` - File cài đặt
- `dist/Tool Viber-1.0.0-win32-x64-portable.zip` - File portable

## ⚡ App sẽ chạy độc lập không cần cài Python!

---

**Lưu ý:** Hiện tại chỉ có thể build Windows executable trên máy Windows. Cross-compilation từ macOS/Linux chưa được hỗ trợ đầy đủ do PyInstaller limitations. 