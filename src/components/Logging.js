import React, { useState, useEffect } from 'react';
import { mqttService } from '../services/MqttConnect';

const Logging = () => {
  const [isLogging, setIsLogging] = useState(false);

  const handleLogging = () => {
    setIsLogging(!isLogging);
    mqttService.publish('logging/startStop', !isLogging);
  };

  const handleTouchStart = (e) => {
    e.stopPropagation();  // スライダーのタッチイベントを親要素に伝播させない
  };

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={handleLogging}
        className={`h-20 text-2xl rounded-xl text-white font-bold shadow-lg active:shadow-sm transition-all ${
          isLogging ? 'bg-red-400 active:bg-red-600' : 'bg-blue-500 active:bg-green-300'
        }`}
      >
        {isLogging ? 'Stop' : 'Start'}
      </button>      
    </div>
  );
};

export default Logging;