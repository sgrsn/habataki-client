import React, { useState } from 'react';

const JoystickPosition = ({ onPositionChange }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleChange = (axis, value) => {
    const newPosition = { ...position, [axis]: Number(value) };
    setPosition(newPosition);
    onPositionChange(newPosition);
  };

  return (
    <div className="flex flex-col gap-2 touch-auto">
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm w-12">X: {position.x}</label>
        <input
          type="range"
          min="-150"
          max="150"
          value={position.x}
          onChange={(e) => handleChange('x', e.target.value)}
          className="flex-1 h-6"
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm w-12">Y: {position.y}</label>
        <input
          type="range"
          min="-150"
          max="150"
          value={position.y}
          onChange={(e) => handleChange('y', e.target.value)}
          className="flex-1 h-6"
        />
      </div>
      <button 
        onClick={() => {
          setPosition({ x: 0, y: 0 });
          onPositionChange({ x: 0, y: 0 });
        }}
        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm"
      >
        Reset Position
      </button>
    </div>
  );
};

export default JoystickPosition;