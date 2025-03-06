import { useState, useEffect } from 'react';
import { mqttService } from '../services/MqttConnect';

const useGamepad = () => {
  const [gamepadState, setGamepadState] = useState({
    leftStick: { x: 0, y: 0 },
    rightStick: { x: 0, y: 0 },
    buttons: {},
    isConnected: false,
    lastButtonA: false,
    lastButtonB: false
  });

  useEffect(() => {
    let animationFrameId;
    let lastPublishTime = 0;

    const handleGamepadInput = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0]; // MFIコントローラーは通常index 0に接続される

      if (gamepad) {
        const now = Date.now();
        const buttonA = gamepad.buttons[0]?.pressed || false;
        const buttonB = gamepad.buttons[1]?.pressed || false;

        const newState = {
          leftStick: {
            x: Math.round(gamepad.axes[0] * 100),
            y: Math.round(-gamepad.axes[1] * 100) // Y軸は反転
          },
          rightStick: {
            x: Math.round(gamepad.axes[2] * 100),
            y: Math.round(-gamepad.axes[3] * 100)
          },
          buttons: gamepad.buttons.map(btn => btn.pressed),
          isConnected: true,
          lastButtonA: buttonA,
          lastButtonB: buttonB
        };

        setGamepadState(prevState => {
          // ボタンの状態が変化した時のみMQTTメッセージを送信
          if (buttonA && !prevState.lastButtonA) {
            mqttService.publish('control/startStop', true);
          }
          if (buttonB && !prevState.lastButtonB) {
            mqttService.publish('control/startStop', false);
          }
          return newState;
        });

        // 100ms毎にジョイスティックの値をMQTTメッセージとして送信
        if (now - lastPublishTime > 100) {
          mqttService.publish('control/joystick/x', newState.leftStick.x);
          mqttService.publish('control/joystick/y', newState.leftStick.y);
          lastPublishTime = now;
        }
      }

      animationFrameId = requestAnimationFrame(handleGamepadInput);
    };

    const handleGamepadConnected = (e) => {
      console.log('Gamepad connected:', e.gamepad);
      handleGamepadInput();
    };

    const handleGamepadDisconnected = (e) => {
      console.log('Gamepad disconnected:', e.gamepad);
      setGamepadState(prev => ({ ...prev, isConnected: false }));
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return gamepadState;
};

export default useGamepad;