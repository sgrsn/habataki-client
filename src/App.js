import React, { useEffect, useState } from 'react';
import Controls from './components/Controls';
import Joystick from './components/Joystick';
import JoystickPosition from './components/JoystickPosition';
import GamepadStatus from './components/GamepadStatus';
import { mqttService } from './services/MqttConnect';
import { watchdogService } from './services/watchdog';

const App = () => {
  const [joystickOffset, setJoystickOffset] = useState({ x: 0, y: 0 });
  // ジョイスティックの位置調整用の状態
  const [joystickMargin, setJoystickMargin] = useState({
    top: 0,    // 上からのマージン
    bottom: 20 // 下からのマージン（初期値20）
  });
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
    
    watchdogService.init();
    mqttService.connect();
    // ウォッチドッグサービスの開始
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
    <div className="flex-1 flex items-center justify-center pb-20 touch-none"
         style={{
           transform: `translate(-105px, 90px)`
         }}>
      <Joystick />
    </div>
    <div className="fixed bottom-0 left-0 right-0 bg-white p-2 shadow-lg">
      <GamepadStatus />
    </div>
  </div>
  );
};

export default App;