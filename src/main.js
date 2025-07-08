const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Simple store implementation thay cho electron-store
class SimpleStore {
  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'config.json');
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
    return {};
  }

  saveData() {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  get(key, defaultValue = undefined) {
    return this.data[key] !== undefined ? this.data[key] : defaultValue;
  }

  set(key, value) {
    this.data[key] = value;
    this.saveData();
  }
}

// Khởi tạo store để lưu trữ cài đặt
const store = new SimpleStore();

let mainWindow;

function createWindow() {
  // Tạo cửa sổ chính
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    titleBarStyle: 'hiddenInset',
    show: false, // Không hiển thị ngay để tránh flash
    backgroundColor: '#1e1e1e' // Dark theme background
  });

  // Load trang chính
  mainWindow.loadFile(path.join(__dirname, '../dist/renderer/index.html'));

  // Hiển thị cửa sổ khi đã sẵn sàng
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Mở DevTools trong chế độ development
    if (process.argv.includes('--dev')) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Xử lý khi cửa sổ bị đóng
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Xử lý link external
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Tạo menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-project');
          }
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('menu-open-project');
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('menu-settings');
          }
        },
        { type: 'separator' },
        {
          role: 'quit'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'About Tool Viber',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Tool Viber',
              message: 'Tool Viber v1.0.0',
              detail: 'Ứng dụng quản lý và tương tác với Viber được xây dựng bằng Electron.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('get-store-value', (event, key, defaultValue) => {
  return store.get(key, defaultValue);
});

ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

// Python automation handlers
let automationProcess = null;

ipcMain.handle('start-automation', async (event, config) => {
  try {
    if (automationProcess) {
      automationProcess.kill();
    }

    // Sử dụng executable thay vì Python script
    let executablePath;
    if (process.platform === 'darwin') {
      executablePath = app.isPackaged 
        ? path.join(process.resourcesPath, 'resources/viber_sender_mac')
        : path.join(__dirname, '../resources/viber_sender_mac');
    } else {
      executablePath = app.isPackaged
        ? path.join(process.resourcesPath, 'resources/viber_sender.exe')
        : path.join(__dirname, '../resources/viber_sender.exe');
    }
    
    // Debug: Log đường dẫn và kiểm tra file
    console.log('Executable path:', executablePath);
    console.log('File exists:', require('fs').existsSync(executablePath));
    
    const configJson = JSON.stringify(config);
    
    // Kiểm tra file executable tồn tại
    if (require('fs').existsSync(executablePath)) {
      console.log('Using executable:', executablePath);
      
      // Kiểm tra file size (executable phải > 0 bytes)
      const stats = require('fs').statSync(executablePath);
      console.log('Executable size:', stats.size, 'bytes');
      
      if (stats.size === 0) {
        throw new Error('Executable file is empty (0 bytes). Please rebuild with proper executable.');
      }
      
      automationProcess = spawn(executablePath, [configJson], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } else {
      // Fallback: Sử dụng Python script
      console.log('Executable not found, falling back to Python script');
      const pythonScript = app.isPackaged
        ? path.join(process.resourcesPath, 'src/automation/viber_sender.py')
        : path.join(__dirname, 'automation/viber_sender.py');
      
      console.log('Python script path:', pythonScript);
      
      // Sử dụng python command phù hợp với platform
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      console.log('Python command:', pythonCmd);
      
      automationProcess = spawn(pythonCmd, [pythonScript, configJson], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
    }

    // Error handling cho spawn
    automationProcess.on('error', (error) => {
      console.error('Spawn error:', error);
      automationProcess = null;
      mainWindow.webContents.send('automation-error', `Process spawn error: ${error.message}`);
    });

    automationProcess.stdout.on('data', (data) => {
      try {
        const message = JSON.parse(data.toString().trim());
        mainWindow.webContents.send('automation-update', message);
      } catch (error) {
        console.error('Failed to parse automation output:', error);
        // Send raw output for debugging
        mainWindow.webContents.send('automation-update', {
          type: 'debug',
          message: data.toString().trim()
        });
      }
    });

    automationProcess.stderr.on('data', (data) => {
      console.error('Automation stderr:', data.toString());
      mainWindow.webContents.send('automation-error', data.toString());
    });

    automationProcess.on('close', (code) => {
      console.log('Automation process closed with code:', code);
      automationProcess = null;
      mainWindow.webContents.send('automation-stopped', { code });
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-automation', async (event) => {
  if (automationProcess) {
    automationProcess.kill();
    automationProcess = null;
    return { success: true };
  }
  return { success: false, error: 'No automation process running' };
});

ipcMain.handle('check-python-dependencies', async (event) => {
  // Không cần kiểm tra Python dependencies vì đã đóng gói executable
  return { available: true };
}); 