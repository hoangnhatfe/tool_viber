# 🚀 Tool Viber Auto Sender

**Ứng dụng tự động gửi tin nhắn Viber với giao diện hiện đại**

![Tool Viber Screenshot](https://via.placeholder.com/600x400/1e1e1e/ffffff?text=Tool+Viber+Auto+Sender)

## ✨ Tính năng

- 🤖 **Tự động gửi tin nhắn** - Automation hoàn chỉnh cho Viber
- ⏰ **Hẹn giờ linh hoạt** - Đặt thời gian bắt đầu chính xác  
- 🔄 **Lặp lại tùy chỉnh** - Số lần và khoảng cách tự định
- ⚡ **Gửi nhanh** - Clipboard paste hoặc typing siêu tốc
- 🎮 **Điều khiển realtime** - Pause/Resume/Stop bất cứ lúc nào
- 📊 **Theo dõi tiến độ** - Log chi tiết và status bar
- 🎨 **Giao diện đẹp** - Sử dụng shadcn/ui components
- 💻 **Cross-platform** - macOS và Windows

## 🎯 Platform Support

| Platform | Status | Download |
|----------|--------|----------|
| 🍎 **macOS (M1/M2/M3)** | ✅ Ready | [Tool Viber.dmg](dist/) |
| 🪟 **Windows (x64)** | ✅ Ready | [Tool Viber Setup.exe](dist/) |
| 🐧 **Linux** | 🔄 Coming | - |

## 📦 Download & Install

### macOS
```bash
# Cài đặt từ DMG
open Tool\ Viber-1.0.0-arm64.dmg

# Hoặc portable
unzip Tool\ Viber-1.0.0-arm64-mac.zip
open Tool\ Viber.app
```

### Windows
```batch
# Cài đặt
Tool Viber Setup 1.0.0.exe

# Hoặc portable
unzip Tool Viber-1.0.0-win32-x64-portable.zip
Tool Viber.exe
```

## 🔧 Build từ Source

### macOS
```bash
git clone <repo-url>
cd tool_viber
npm install
python3 build_executables.py
npm run dist
```

### Windows
```powershell
# Tự động
git clone <repo-url>
cd tool_viber
.\build_windows.ps1

# Hoặc thủ công - xem BUILD_WINDOWS.md
```

## ⚠️ Troubleshooting

### Lỗi "Cannot find module 'conf'" (Windows)
```batch
# Chạy script sửa lỗi
fix_windows.bat

# Hoặc thủ công
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Kiểm tra hệ thống (Windows)
```powershell
# Chạy script kiểm tra
.\troubleshoot_windows.ps1
```

### Các lỗi khác
- 📖 [Setup Windows](SETUP_WINDOWS.md)
- 📖 [Build Windows](BUILD_WINDOWS.md)

## 🎮 Hướng dẫn sử dụng

1. **Mở Viber** trên máy tính
2. **Vào chat** muốn gửi tin nhắn tự động
3. **Mở Tool Viber** 
4. **Nhập nội dung** tin nhắn
5. **Đặt thời gian** bắt đầu
6. **Cài đặt** số lần lặp và khoảng cách
7. **Nhấn "Bắt đầu gửi"**

## ⚙️ Cài đặt nâng cao

- **Clipboard mode**: Copy/paste nhanh (khuyến nghị)
- **Typing mode**: Gõ từng ký tự (chậm hơn)
- **Interval**: 0.1s = siêu nhanh, 1s = bình thường
- **Repeat**: 1-999+ lần lặp

## 🛡️ Bảo mật & Quyền riêng tư

- ✅ **Chạy local** - Không kết nối internet
- ✅ **Không thu thập data** - Tất cả dữ liệu lưu máy local  
- ✅ **Open source** - Code công khai, minh bạch
- ✅ **Không malware** - Scan bởi VirusTotal

## 🏗️ Kiến trúc

```
tool_viber/
├── src/
│   ├── main.js              # Electron main process
│   ├── renderer/            # React frontend
│   └── automation/          # Python automation
├── resources/               # Standalone executables  
├── dist/                    # Built applications
└── scripts/                 # Build scripts
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](../../issues)
- 💬 **Discussions**: [GitHub Discussions](../../discussions)
- 📧 **Email**: your.email@example.com

## 🙏 Credits

- **Electron** - Cross-platform desktop framework
- **React** - UI library
- **shadcn/ui** - Beautiful UI components  
- **PyInstaller** - Python to executable
- **PyAutoGUI** - Desktop automation

---

⭐ **Star this repo if you find it helpful!** ⭐ 