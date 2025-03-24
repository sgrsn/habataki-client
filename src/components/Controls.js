import React, { useState, useEffect } from 'react';
import { mqttService } from '../services/MqttConnect';
import useGamepad from '../hooks/useGamepad';

const Controls = () => {
  const gamepadState = useGamepad();
  const [isRunning, setIsRunning] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);

  useEffect(() => {
    if (gamepadState.lastButtonA && !gamepadState.lastButtonB) {
      setIsRunning(true);
    } else if (!gamepadState.lastButtonA && gamepadState.lastButtonB) {
      setIsRunning(false);
    }
  }, [gamepadState.lastButtonA, gamepadState.lastButtonB]);

useEffect(() => {
  if (gamepadState.sliderValue !== undefined) {
    setSliderValue(gamepadState.sliderValue);
  }
}, [gamepadState.sliderValue]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
    mqttService.publish('control/startStop', !isRunning);
  };

  const handleSliderChange = (event) => {
    event.stopPropagation();  // イベントの伝播を止める
    const value = parseFloat(event.target.value);
    setSliderValue(value);
    mqttService.publish('control/slider', value);
  };

  const handleTouchStart = (e) => {
    e.stopPropagation();  // スライダーのタッチイベントを親要素に伝播させない
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleStartStop}
        className={`h-40 text-2xl rounded-xl text-white font-bold shadow-lg active:shadow-sm transition-all ${
          isRunning ? 'bg-red-500 active:bg-red-600' : 'bg-green-500 active:bg-green-600'
        }`}
      >
        {isRunning ? 'Stop' : 'Start'}
      </button>
      
      <div className="flex flex-col gap-1 touch-auto">
        <label className="text-lg font-medium">Speed: {sliderValue}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleSliderChange}
          onTouchStart={handleTouchStart}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full h-10 rounded-lg appearance-none bg-gray-300 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-8 
            [&::-webkit-slider-thumb]:h-8 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:bg-blue-500 
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white"
        />
      </div>
    </div>
  );
};

export default Controls;