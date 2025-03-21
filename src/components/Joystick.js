import React, { useEffect, useRef } from 'react';
import { mqttService } from '../services/MqttConnect';
import useGamepad from '../hooks/useGamepad';

const Joystick = () => {
  const joystickRef = useRef(null);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const position = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  const lastPublishRef = useRef(0);
  const gamepadState = useGamepad();

  useEffect(() => {
    let rect = null;

    const updatePosition = (clientX, clientY) => {
      const container = containerRef.current;
      const joystick = joystickRef.current;
      if (!container || !joystick) return;

      if (!rect) {
        rect = container.getBoundingClientRect();
      }

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      let x = (clientX - centerX) / (rect.width / 2);
      let y = (clientY - centerY) / (rect.height / 2);

      // Limit to circle
      const distance = Math.sqrt(x * x + y * y);
      if (distance > 1) {
        x /= distance;
        y /= distance;
      }

      position.current = { x: 0, y: 0 };

      // Use transform3d for better performance
      joystick.style.transform = `translate3d(calc(-50% + ${x * 50}px), calc(-50% + ${y * 50}px), 0)`;

      // Throttle MQTT publishing to every 100ms
      const now = Date.now();
      if (now - lastPublishRef.current > 100) {
        console.log('past: ', now - lastPublishRef.current);
        mqttService.publish('control/joystick/x', Math.round(-x*100));
        mqttService.publish('control/joystick/y', Math.round(y*100));
        lastPublishRef.current = now;
      }
    };

    const handleStart = (e) => {
      isDraggingRef.current = true;
      rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      updatePosition(clientX, clientY);
    };

    const handleMove = (e) => {
      if (!isDraggingRef.current) return;
      
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        updatePosition(clientX, clientY);
      });
    };

    const handleEnd = () => {
      isDraggingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Reset position with smooth transition
      const joystick = joystickRef.current;
      if (joystick) {
        joystick.style.transition = 'transform 0.15s ease-out';
        joystick.style.transform = 'translate3d(-50%, -50%, 0)';
        setTimeout(() => {
          joystick.style.transition = '';
        }, 50);
      }
      position.current = { x: 0, y: 0 };
      mqttService.publish('control/joystick/x', 0);
      mqttService.publish('control/joystick/y', 0);
    };

    const container = containerRef.current;
    if (container) {
      // For touch devices
      container.addEventListener('touchstart', handleStart, { passive: true });
      container.addEventListener('touchmove', handleMove, { passive: true });
      container.addEventListener('touchend', handleEnd);
      container.addEventListener('touchcancel', handleEnd);

      // For mouse interaction
      container.addEventListener('mousedown', handleStart);
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleStart);
        container.removeEventListener('touchmove', handleMove);
        container.removeEventListener('touchend', handleEnd);
        container.removeEventListener('touchcancel', handleEnd);

        container.removeEventListener('mousedown', handleStart);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-32 h-32 bg-gray-200 rounded-full mx-auto my-auto touch-none"
    >
      <div
        ref={joystickRef}
        className="absolute top-1/2 left-1/2 w-16 h-16 bg-blue-500 rounded-full cursor-grab active:cursor-grabbing"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
};

export default Joystick;