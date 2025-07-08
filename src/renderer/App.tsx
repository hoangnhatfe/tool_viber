import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
// import { TimePicker } from './components/ui/time-picker';
import { Play, Pause, Square, MessageSquare, Clock, Hash, Timer, AlertCircle, Trash2, Copy } from 'lucide-react';

interface AutoSenderState {
  isRunning: boolean;
  isPaused: boolean;
  currentCount: number;
  totalSent: number;
  message: string;
  startTime: string;
  repeatCount: number;
  interval: number;
  useClipboard: boolean;
}

const App: React.FC = () => {
  const [state, setState] = useState<AutoSenderState>({
    isRunning: false,
    isPaused: false,
    currentCount: 0,
    totalSent: 0,
    message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    startTime: '08:59:55',
    repeatCount: 20,
    interval: 1.0,
    useClipboard: true
  });

  const [logs, setLogs] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const intervalRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);
  const clockRef = useRef<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const updateState = (updates: Partial<AutoSenderState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const startRealAutomation = async () => {
    try {
      const { ipcRenderer } = (window as any).require('electron');
      const config = {
        message: state.message,
        startTime: state.startTime,
        repeatCount: state.repeatCount,
        interval: state.interval,
        useClipboard: state.useClipboard
      };
      
      const result = await ipcRenderer.invoke('start-automation', config);
      
      if (result.success) {
        addLog('🚀 Đã khởi động automation engine...');
        return true;
      } else {
        addLog(`❌ Lỗi khởi động automation: ${result.error}`);
        return false;
      }
    } catch (error) {
      addLog(`❌ Lỗi kết nối automation: ${error}`);
      return false;
    }
  };

  const startSending = async () => {
    if (state.isRunning) return;

    addLog('🚀 Bắt đầu gửi tin nhắn tự động...');
    addLog('⚠️ Đảm bảo Viber đã mở và con trỏ chuột đang ở khung chat!');
    
    updateState({ 
      isRunning: true, 
      isPaused: false, 
      currentCount: 0 
    });

    const success = await startRealAutomation();
    
    if (!success) {
      updateState({ 
        isRunning: false, 
        isPaused: false 
      });
      return;
    }
  };

  const pauseResume = () => {
    if (!state.isRunning) return;
    
    const newPaused = !state.isPaused;
    updateState({ isPaused: newPaused });
    
    if (newPaused) {
      addLog('⏸️ Đã tạm dừng - Python automation sẽ tự pause');
    } else {
      addLog('▶️ Tiếp tục gửi - Python automation sẽ tự resume');
    }
  };

  const stopSending = async () => {
    try {
      const { ipcRenderer } = (window as any).require('electron');
      await ipcRenderer.invoke('stop-automation');
      addLog('🛑 Đã dừng automation engine');
    } catch (error) {
      addLog(`❌ Lỗi khi dừng automation: ${error}`);
    }
    
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    updateState({ 
      isRunning: false, 
      isPaused: false 
    });
    
    addLog('🛑 Đã dừng gửi tin nhắn');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(state.message);
      addLog('📋 Đã copy tin nhắn vào clipboard');
    } catch (error) {
      addLog('❌ Không thể copy vào clipboard');
    }
  };

  useEffect(() => {
    clockRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    try {
      const { ipcRenderer } = (window as any).require('electron');
      
      ipcRenderer.on('automation-update', (event: any, data: any) => {
        if (data.type === 'progress') {
          updateState({
            currentCount: data.current,
            totalSent: data.current
          });
          addLog(data.message);
        } else if (data.type === 'complete') {
          addLog(data.message);
          updateState({ isRunning: false, isPaused: false });
        }
      });

      ipcRenderer.on('automation-error', (event: any, error: string) => {
        addLog(`❌ Python Error: ${error}`);
      });

      ipcRenderer.on('automation-stopped', (event: any, data: any) => {
        addLog(`🛑 Automation stopped with code: ${data.code}`);
        updateState({ isRunning: false, isPaused: false });
      });
    } catch (error) {
      addLog(`❌ Không thể kết nối IPC: ${error}`);
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (clockRef.current) clearInterval(clockRef.current);
      
      try {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.removeAllListeners('automation-update');
        ipcRenderer.removeAllListeners('automation-error');
        ipcRenderer.removeAllListeners('automation-stopped');
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, []);

  const getStatusColor = () => {
    if (!state.isRunning) return 'text-gray-500';
    if (state.isPaused) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (!state.isRunning) return '🔴 Sẵn sàng';
    if (state.isPaused) return '🟡 Tạm dừng';
    return '🟢 Đang chạy';
  };

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden">
      {/* Compact Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🚀 Viber Auto Sender</h1>
            <p className="text-xs text-muted-foreground">Tool gửi tin nhắn tự động cho Viber</p>
          </div>
          
          {/* Real-time Clock */}
          <div className="text-right">
            <div className="text-lg font-mono font-bold text-primary">
              {currentTime.toLocaleTimeString('vi-VN')}
            </div>
            <div className="text-xs text-muted-foreground">
              {currentTime.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Compact Control Panel */}
        <div className="w-80 border-r bg-card flex flex-col">
          {/* Status */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trạng thái:</span>
              <span className={`text-sm font-semibold ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            {state.isRunning && (
              <div className="text-xs text-muted-foreground mt-1">
                Tiến độ: {state.currentCount}/{state.repeatCount} | Tổng: {state.totalSent}
              </div>
            )}
          </div>

          {/* Compact Settings */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Tin nhắn
                </label>
                <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-6 w-6 p-0">
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <textarea
                value={state.message}
                onChange={(e) => updateState({ message: e.target.value })}
                disabled={state.isRunning}
                placeholder="Nhập nội dung tin nhắn..."
                className="w-full h-16 px-2 py-1 text-sm bg-background border rounded resize-none focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>

            {/* Compact Time Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Thời gian bắt đầu
                </label>
                <input
                  type="text"
                  value={state.startTime}
                  onChange={(e) => updateState({ startTime: e.target.value })}
                  disabled={state.isRunning}
                  className="w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center">
                  <Timer className="w-3 h-3 mr-1" />
                  Khoảng cách (s)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={state.interval}
                  onChange={(e) => updateState({ interval: parseFloat(e.target.value) || 1.0 })}
                  className="w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Send Mode Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-medium">🚀 Chế độ gửi</label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sendMode"
                    checked={state.useClipboard}
                    onChange={() => updateState({ useClipboard: true })}
                    disabled={state.isRunning}
                    className="text-primary"
                  />
                  <span className="text-xs">📋 Clipboard (nhanh)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sendMode"
                    checked={!state.useClipboard}
                    onChange={() => updateState({ useClipboard: false })}
                    disabled={state.isRunning}
                    className="text-primary"
                  />
                  <span className="text-xs">⌨️ Typing (chậm nhưng ổn định)</span>
                </label>
              </div>
            </div>

            {/* Repeat Count */}
            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center">
                <Hash className="w-3 h-3 mr-1" />
                Số lần lặp lại
              </label>
              <input
                type="number"
                min="1"
                value={state.repeatCount}
                onChange={(e) => updateState({ repeatCount: parseInt(e.target.value) || 1 })}
                disabled={state.isRunning}
                className="w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>

            {/* Warning */}
            {state.interval < 0.5 && (
              <div className="flex items-center text-yellow-600 text-xs p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                Khoảng cách ngắn có thể gây spam
              </div>
            )}

            {/* Control Buttons */}
            <div className="space-y-2 pt-2">
              {!state.isRunning ? (
                <Button 
                  onClick={startSending} 
                  className="w-full" 
                  disabled={!state.message.trim()}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Bắt đầu gửi
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={pauseResume} 
                    variant={state.isPaused ? "default" : "secondary"}
                    size="sm"
                  >
                    {state.isPaused ? (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Tiếp tục
                      </>
                    ) : (
                      <>
                        <Pause className="w-3 h-3 mr-1" />
                        Tạm dừng
                      </>
                    )}
                  </Button>
                  <Button onClick={stopSending} variant="destructive" size="sm">
                    <Square className="w-3 h-3 mr-1" />
                    Dừng
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compact Log Panel */}
        <div className="flex-1 flex flex-col">
          {/* Log Header */}
          <div className="p-3 border-b bg-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">📋 Nhật ký hoạt động</h3>
              <Button onClick={clearLogs} variant="outline" size="sm" className="h-7 text-xs">
                <Trash2 className="w-3 h-3 mr-1" />
                Xóa
              </Button>
            </div>
          </div>

          {/* Compact Logs */}
          <div className="flex-1 overflow-y-auto p-3">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Chưa có hoạt động nào</p>
                  <p className="text-xs mt-1">Nhấn "Bắt đầu gửi" để bắt đầu</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div 
                    key={index} 
                    className="text-xs p-2 bg-muted rounded border-l-2 border-primary/20 font-mono"
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compact Instructions */}
          <div className="p-3 border-t bg-yellow-50 dark:bg-yellow-950/20">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-700 dark:text-yellow-300">
                <p className="font-medium">Hướng dẫn:</p>
                <p>1. Mở Viber và click vào khung chat 2. Thiết lập thông số 3. Nhấn "Bắt đầu gửi"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 