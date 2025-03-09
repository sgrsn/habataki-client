import React, { useEffect, useState } from 'react';
import { mqttService } from '../services/MqttConnect';

const HeartbeatStatus = () => {
  const [lastHeartbeat, setLastHeartbeat] = useState(null);

  useEffect(() => {
    const handleHeartbeat = (message) => {
      setLastHeartbeat(message);
    };

    mqttService.subscribe('robot/heartbeat', handleHeartbeat);
    
    return () => {
      mqttService.unsubscribe('robot/heartbeat', handleHeartbeat);
    };
  }, []);

  return (
    <div className="p-2 bg-gray-200 rounded">
      Last Heartbeat: {lastHeartbeat || 'No heartbeat received'}
    </div>
  );
};

export default HeartbeatStatus;