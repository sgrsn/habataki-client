import React, { useEffect } from 'react';
import Controls from './components/Controls';
import Joystick from './components/Joystick';
import { mqttService } from './services/MqttConnect';
import { watchdogService } from './services/watchdog';

const App = () => {
  useEffect(() => {
    // スクロール防止（スライダーの操作は許可）
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // スクロール防止のイベントリスナー（スライダー以外）
    const preventDefaultForScrolling = (e) => {
      if (e.target.type !== 'range') {  // スライダー以外の要素でのみスクロールを防止
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', preventDefaultForScrolling, { passive: false });
    
    mqttService.connect();
    watchdogService.start();
    
    return () => {
      mqttService.disconnect();
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.removeEventListener('touchmove', preventDefaultForScrolling);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col">
      <div className="flex-none p-4">
        <Controls />
      </div>
      <div className="flex-1 flex items-center justify-center pb-20 touch-none">
        <Joystick />
      </div>
    </div>
  );
};

export default App;