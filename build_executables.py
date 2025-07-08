#!/usr/bin/env python3
"""
Script to build standalone executables for both macOS and Windows
"""
import subprocess
import sys
import os
import shutil

def run_command(cmd, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error running command: {cmd}")
            print(f"Error output: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception running command: {cmd}")
        print(f"Exception: {e}")
        return False

def build_macos_executable():
    """Build macOS executable using PyInstaller"""
    print("Building macOS executable...")
    
    # Change to automation directory
    automation_dir = "src/automation"
    
    # Build with PyInstaller
    cmd = "pyinstaller --onefile --hidden-import=pyautogui --hidden-import=pyperclip --hidden-import=PIL viber_sender.py"
    
    if not run_command(cmd, cwd=automation_dir):
        return False
    
    # Copy to resources
    os.makedirs("resources", exist_ok=True)
    
    src_file = "src/automation/dist/viber_sender"
    dst_file = "resources/viber_sender_mac"
    
    if os.path.exists(src_file):
        shutil.copy2(src_file, dst_file)
        print(f"✅ macOS executable created: {dst_file}")
        return True
    else:
        print(f"❌ Failed to find macOS executable: {src_file}")
        return False

def create_windows_executable_spec():
    """Create a Windows-compatible spec file for PyInstaller"""
    
    spec_content = '''# -*- mode: python ; coding: utf-8 -*-

a = Analysis(
    ['viber_sender.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=['pyautogui', 'pyperclip', 'PIL'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='viber_sender',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
'''
    
    with open("src/automation/viber_sender_win.spec", "w") as f:
        f.write(spec_content)
    
    print("✅ Windows spec file created")

def install_requirements():
    """Install required packages"""
    print("Installing requirements...")
    
    requirements = ["pyinstaller", "pyautogui", "pyperclip", "pillow"]
    
    for req in requirements:
        cmd = f"pip3 install {req}"
        if not run_command(cmd):
            print(f"❌ Failed to install {req}")
            return False
    
    print("✅ Requirements installed")
    return True

def main():
    print("🚀 Building standalone executables...")
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Build macOS executable
    if not build_macos_executable():
        print("❌ Failed to build macOS executable")
        sys.exit(1)
    
    # Create Windows spec file for future use
    create_windows_executable_spec()
    
    print("\n🎉 Build completed!")
    print("\nFiles created:")
    print("- resources/viber_sender_mac (macOS executable)")
    print("- src/automation/viber_sender_win.spec (Windows spec file)")
    print("\nNote: To build Windows executable, you need to run PyInstaller on a Windows machine:")
    print("  pyinstaller src/automation/viber_sender_win.spec")

if __name__ == "__main__":
    main() 