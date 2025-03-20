import React from 'react';
import useGamepad from '../hooks/useGamepad';

const GamepadStatus = () => {
  const gamepadState = useGamepad(false); // Disable MQTT

  return (
    <div className="text-sm text-gray-600 mt-2">
      {gamepadState.isConnected ? (
        <span className="text-green-600">
          ゲームパッド接続中
        </span>
      ) : (
        <span className="text-gray-400">
          ゲームパッド未接続
        </span>
      )}
    </div>
  );
};

export default GamepadStatus;