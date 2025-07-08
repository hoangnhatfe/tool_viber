#!/usr/bin/env python3
"""
Viber Auto Sender - Python Automation Backend
Handles keyboard automation for sending messages to Viber
"""

import sys
import json
import time
import traceback
from datetime import datetime

class ViberSender:
    def __init__(self, config):
        self.message = config['message']
        self.start_time = config['startTime']
        self.repeat_count = config['repeatCount']
        self.interval = config['interval']
        self.use_clipboard = config.get('useClipboard', True)  # Default to True
        self.is_paused = False
        self.is_stopped = False
        
        self.log_message("🔧 Khởi tạo ViberSender...")
        self.log_message(f"📝 Tin nhắn: {self.message[:50]}{'...' if len(self.message) > 50 else ''}")
        self.log_message(f"⏰ Thời gian bắt đầu: {self.start_time}")
        self.log_message(f"🔢 Số lần lặp: {self.repeat_count}")
        self.log_message(f"⏱️ Khoảng cách: {self.interval}s")
        self.log_message(f"🚀 Chế độ gửi: {'📋 Clipboard' if self.use_clipboard else '⌨️ Typing'}")
        
        # Kiểm tra và import dependencies
        try:
            import pyautogui
            pyautogui.FAILSAFE = True
            pyautogui.PAUSE = 0.1
            self.log_message("✅ PyAutoGUI imported thành công")
        except ImportError as e:
            self.log_message(f"❌ Không thể import PyAutoGUI: {e}")
            raise
            
        if self.use_clipboard:
            try:
                import pyperclip
                self.log_message("🔍 Testing clipboard...")
                
                # Test với message thực
                pyperclip.copy(self.message)
                time.sleep(0.05)  # Minimal delay
                result = pyperclip.paste()
                
                self.log_message(f"📝 Test msg: '{self.message}'")
                self.log_message(f"📋 Got back: '{result}'")
                self.log_message(f"🔢 Lengths: {len(self.message)} vs {len(result)}")
                
                if result == self.message:
                    self.log_message("✅ Clipboard test PASSED")
                    self.clipboard_available = True
                else:
                    self.log_message("❌ Clipboard test FAILED - will use typing")
                    if len(result) != len(self.message):
                        self.log_message(f"   Length mismatch: expected {len(self.message)}, got {len(result)}")
                    else:
                        # Find first difference
                        for i, (a, b) in enumerate(zip(self.message, result)):
                            if a != b:
                                self.log_message(f"   Diff at pos {i}: expected '{a}', got '{b}'")
                                break
                    self.clipboard_available = False
            except Exception as e:
                self.log_message(f"❌ Clipboard error: {e}")
                self.clipboard_available = False
        else:
            self.log_message("⌨️ Typing mode selected")
            self.clipboard_available = False
        
    def log_message(self, message):
        """Gửi log message về Electron với timestamp chi tiết"""
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]  # milliseconds
        log_data = {
            'type': 'progress',
            'message': f"[{timestamp}] {message}",
            'current': getattr(self, 'current_count', 0)
        }
        print(json.dumps(log_data))
        sys.stdout.flush()
        
    def wait_for_start_time(self):
        """Chờ đến thời gian bắt đầu với logging chi tiết"""
        try:
            target_time = datetime.strptime(self.start_time, '%H:%M:%S').time()
            self.log_message(f"🎯 Target time: {target_time}")
        except ValueError as e:
            self.log_message(f"❌ Lỗi parse thời gian '{self.start_time}': {e}")
            return False
            
        while True:
            if self.is_stopped:
                self.log_message("🛑 Bị dừng trong lúc chờ thời gian bắt đầu")
                return False
                
            current_time = datetime.now().time()
            
            if current_time >= target_time:
                self.log_message(f"✅ Đã đến thời gian bắt đầu: {current_time}")
                break
                
            remaining = datetime.combine(datetime.today(), target_time) - datetime.combine(datetime.today(), current_time)
            self.log_message(f"⏰ Chờ đến {self.start_time} (còn {remaining.seconds}s)")
            time.sleep(1)
            
        return True
        
    def send_single_message(self):
        """Gửi một tin nhắn nhanh và chính xác"""
        try:
            self.log_message("📤 Gửi tin nhắn...")
            
            # Import pyautogui
            import pyautogui
            
            # Thử clipboard trước (nếu được bật)
            if self.use_clipboard and self.clipboard_available:
                try:
                    import pyperclip
                    
                    # Copy tin nhắn
                    pyperclip.copy(self.message)
                    
                    # Verify ngay - không delay
                    clipboard_content = pyperclip.paste()
                    self.log_message(f"📋 Original: '{self.message}'")
                    self.log_message(f"📋 Clipboard: '{clipboard_content}'")
                    
                    if clipboard_content == self.message:
                        self.log_message("✅ Clipboard verified OK")
                        
                        # Paste ngay
                        if sys.platform == "darwin":
                            pyautogui.hotkey('cmd', 'v')
                        else:
                            pyautogui.hotkey('ctrl', 'v')
                        self.log_message("📝 Pasted")
                    else:
                        self.log_message("❌ Clipboard mismatch!")
                        raise Exception("Clipboard verification failed")
                    
                except Exception as e:
                    self.log_message(f"⚠️ Clipboard failed: {e}")
                    # Fallback typing với tốc độ tối đa
                    pyautogui.write(self.message, interval=0)  # Tốc độ tối đa
                    self.log_message("⌨️ Fast typing fallback")
            else:
                # Typing trực tiếp với tốc độ tối đa
                pyautogui.write(self.message, interval=0)  # Tốc độ tối đa
                self.log_message("⌨️ Fast typing")
            
            # Enter ngay lập tức
            pyautogui.press('enter')
            self.log_message("🚀 Sent!")
            
            return True
            
        except Exception as e:
            self.log_message(f"💥 Error: {str(e)}")
            return False
            
    def run(self):
        """Chạy automation nhanh"""
        try:
            self.log_message("🚀 === BẮT ĐẦU VIBER AUTO SENDER ===")
            
            # Chờ đến thời gian bắt đầu
            if not self.wait_for_start_time():
                return
                
            self.log_message(f"🎯 === BẮT ĐẦU GỬI {self.repeat_count} TIN NHẮN ===")
            self.log_message("⚠️ ĐẢM BẢO VIBER ĐÃ MỞ VÀ CON TRỎ ĐANG Ở KHUNG CHAT!")
            
            # BỎ countdown 3 giây - thực thi ngay
            self.log_message("🚀 BẮT ĐẦU NGAY LẬP TỨC!")
            
            # Bắt đầu gửi tin nhắn
            self.current_count = 0
            success_count = 0
            
            for i in range(self.repeat_count):
                if self.is_stopped:
                    self.log_message("🛑 === DỪNG ===")
                    break
                    
                # Xử lý pause
                while self.is_paused and not self.is_stopped:
                    time.sleep(0.1)
                    
                if self.is_stopped:
                    break
                
                self.current_count = i + 1
                
                # Gửi tin nhắn
                self.log_message(f"📨 === TIN NHẮN {self.current_count}/{self.repeat_count} ===")
                
                if self.send_single_message():
                    success_count += 1
                    self.log_message(f"🎉 Tin nhắn {self.current_count} THÀNH CÔNG!")
                else:
                    self.log_message(f"💀 Tin nhắn {self.current_count} THẤT BẠI!")
                
                # Gửi progress update
                progress_data = {
                    'type': 'progress',
                    'current': self.current_count,
                    'message': f"📊 {success_count}/{self.current_count} thành công"
                }
                print(json.dumps(progress_data))
                sys.stdout.flush()
                
                # Chờ interval trước tin nhắn tiếp theo
                if i < self.repeat_count - 1:
                    self.log_message(f"💤 Chờ {self.interval}s...")
                    
                    wait_time = 0
                    while wait_time < self.interval and not self.is_stopped:
                        if not self.is_paused:
                            time.sleep(min(0.05, self.interval - wait_time))  # Responsive hơn
                            wait_time += 0.05
                        else:
                            time.sleep(0.05)
            
            # Hoàn thành
            if not self.is_stopped:
                self.log_message(f"🏆 === HOÀN THÀNH! ===")
                completion_data = {
                    'type': 'complete',
                    'message': f"🎊 KẾT QUẢ: {success_count}/{self.repeat_count} tin nhắn thành công!"
                }
                print(json.dumps(completion_data))
                sys.stdout.flush()
                
        except KeyboardInterrupt:
            self.log_message("⏹️ === NGƯỜI DÙNG DỪNG ===")
        except Exception as e:
            self.log_message(f"💥 === LỖI: {type(e).__name__}: {str(e)} ===")
            for line in traceback.format_exc().split('\n'):
                if line.strip():
                    self.log_message(f"💥 {line}")
            
    def pause(self):
        """Tạm dừng automation"""
        self.is_paused = True
        self.log_message("⏸️ === AUTOMATION TẠM DỪNG ===")
        
    def resume(self):
        """Tiếp tục automation"""
        self.is_paused = False
        self.log_message("▶️ === AUTOMATION TIẾP TỤC ===")
        
    def stop(self):
        """Dừng automation"""
        self.is_stopped = True
        self.is_paused = False
        self.log_message("🛑 === AUTOMATION DỪNG ===")

def main():
    try:
        if len(sys.argv) != 2:
            error_data = {
                'type': 'error',
                'message': '❌ THIẾU THAM SỐ: python viber_sender.py <config_json>'
            }
            print(json.dumps(error_data))
            return
            
        config_json = sys.argv[1]
        print(json.dumps({
            'type': 'progress', 
            'message': f'🔧 Nhận config: {config_json[:100]}...',
            'current': 0
        }))
        
        config = json.loads(config_json)
        
        # Kiểm tra config chi tiết
        required_fields = ['message', 'startTime', 'repeatCount', 'interval']
        for field in required_fields:
            if field not in config:
                error_data = {
                    'type': 'error',
                    'message': f'❌ THIẾU TRƯỜNG {field} trong cấu hình'
                }
                print(json.dumps(error_data))
                return
        
        print(json.dumps({
            'type': 'progress',
            'message': '✅ Config hợp lệ, khởi tạo ViberSender...',
            'current': 0
        }))
        
        sender = ViberSender(config)
        sender.run()
        
    except json.JSONDecodeError as e:
        error_data = {
            'type': 'error',
            'message': f'❌ LỖI JSON: {str(e)}'
        }
        print(json.dumps(error_data))
    except Exception as e:
        error_data = {
            'type': 'error',
            'message': f'💥 LỖI KHỞI ĐỘNG: {type(e).__name__}: {str(e)}'
        }
        print(json.dumps(error_data))
        
        # In full traceback để debug
        traceback_lines = traceback.format_exc().split('\n')
        for line in traceback_lines:
            if line.strip():
                print(json.dumps({
                    'type': 'error',
                    'message': f'💥 {line}'
                }))

if __name__ == "__main__":
    main() 