import React, { useState } from 'react';
import { Button } from './button';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const parseTime = (timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return { hours: hours || 0, minutes: minutes || 0, seconds: seconds || 0 };
  };

  const formatTime = (hours: number, minutes: number, seconds: number) => {
    const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const { hours, minutes, seconds } = parseTime(value);

  const updateTime = (newHours: number, newMinutes: number, newSeconds: number) => {
    const newTime = formatTime(
      Math.max(0, Math.min(23, newHours)),
      Math.max(0, Math.min(59, newMinutes)),
      Math.max(0, Math.min(59, newSeconds))
    );
    onChange(newTime);
  };

  const TimeSelector = ({ label, val, max, onUpdate }: {
    label: string;
    val: number;
    max: number;
    onUpdate: (newVal: number) => void;
  }) => (
    <div className="text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex flex-col items-center space-y-1">
        <button
          className="h-6 w-8 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
          onClick={() => onUpdate(val + 1 > max ? 0 : val + 1)}
        >
          +
        </button>
        <div className="text-lg font-mono w-8 text-center">{val < 10 ? `0${val}` : `${val}`}</div>
        <button
          className="h-6 w-8 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
          onClick={() => onUpdate(val - 1 < 0 ? max : val - 1)}
        >
          -
        </button>
      </div>
    </div>
  );

  if (disabled) {
    return (
      <input
        type="time"
        step="1"
        value={value}
        disabled={true}
        className="w-full px-2 py-1 text-sm bg-gray-100 border rounded opacity-50"
      />
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        disabled={disabled}
        className="w-full justify-start text-sm h-8"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Clock className="w-3 h-3 mr-2" />
        {value}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 w-full bg-white border rounded-lg shadow-lg p-3">
          <div className="grid grid-cols-3 gap-3">
            <TimeSelector
              label="Giờ"
              val={hours}
              max={23}
              onUpdate={(newHours) => updateTime(newHours, minutes, seconds)}
            />
            <TimeSelector
              label="Phút"
              val={minutes}
              max={59}
              onUpdate={(newMinutes) => updateTime(hours, newMinutes, seconds)}
            />
            <TimeSelector
              label="Giây"
              val={seconds}
              max={59}
              onUpdate={(newSeconds) => updateTime(hours, minutes, newSeconds)}
            />
          </div>
          <div className="flex justify-between mt-3">
            <button
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              onClick={() => {
                const now = new Date();
                updateTime(now.getHours(), now.getMinutes(), now.getSeconds());
              }}
            >
              Hiện tại
            </button>
            <button
              className="px-2 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded"
              onClick={() => setIsOpen(false)}
            >
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 