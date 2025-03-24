import React, { useEffect, useState } from 'react';
import Controls from './components/Controls';
import Logging from './components/Logging';
import GamepadStatus from './components/GamepadStatus';
import HeartbeatStatus from './components/HeartbeatStatus';
import { mqttService } from './services/MqttConnect';
import { watchdogService } from './services/watchdog';
import GnssStatus from './components/GnssStatus';
import TeensyStatus from './components/TeensyStatus';

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
    <div className="flex-grow p-4">
      <Logging />
    </div>
    <div className="fixed bottom-0 left-0 right-0 bg-white p-2 shadow-lg space-y-2">
      <GamepadStatus />
      <HeartbeatStatus />
      <GnssStatus />
      <TeensyStatus />
    </div>
  </div>
  );
};

export default App;