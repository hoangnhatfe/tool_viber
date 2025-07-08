# 🪟 Setup Tool Viber trên Windows

## ⚠️ Lỗi "Cannot find module 'conf'" 

Nếu bạn gặp lỗi này, làm theo các bước sau:

### 🔧 Cách 1: Tự động (Khuyến nghị)
```batch
# Chạy script sửa lỗi
fix_windows.bat
```

### 🔧 Cách 2: Thủ công

#### Bước 1: Xóa dependencies cũ
```batch
rmdir /s /q node_modules
del package-lock.json
```

#### Bước 2: Cài lại dependencies
```batch
npm install
```

#### Bước 3: Build Windows executable
```batch
cd src/automation
pip install pyinstaller pyautogui pyperclip pillow
pyinstaller viber_sender_win.spec
copy dist\viber_sender.exe ..\..\resources\viber_sender.exe
```

#### Bước 4: Build Electron app
```batch
cd ..\..
npm run dist
```

## 🎯 Kết quả

Sau khi hoàn thành:
- `dist/Tool Viber Setup 1.0.0.exe` - File cài đặt
- `dist/Tool Viber-1.0.0-win32-x64-portable.zip` - File portable

## ⚡ Tính năng

✅ **Không cần cài Python** trên máy user  
✅ **Chạy ngay** sau khi cài  
✅ **Automation hoàn chỉnh** cho Viber  

## 🚨 Troubleshooting

### Lỗi "python not found"
```batch
# Cài Python từ python.org
# Hoặc sử dụng Microsoft Store
```

### Lỗi "npm not found"  
```batch
# Cài Node.js từ nodejs.org
```

### Lỗi "pyinstaller not found"
```batch
pip install pyinstaller
```

## 📞 Hỗ trợ

Nếu vẫn gặp lỗi, check:
1. Python 3.9+ đã cài chưa
2. Node.js 18+ đã cài chưa  
3. Git đã cài chưa
4. Chạy Command Prompt as Administrator 