import React, { useEffect, useState } from 'react';
import { mqttService } from '../services/MqttConnect';

const TeensyStatus = () => {
  const [lastTeensyStatus, setLastTeensyStatus] = useState(null);

  useEffect(() => {
    const handleTeensyStatus = (message) => {
      setLastTeensyStatus(message);
    };

    mqttService.subscribe('teensy4.1/status', handleTeensyStatus);
    
    return () => {
      mqttService.unsubscribe('teensy4.1/status', handleTeensyStatus);
    };
  }, []);

  return (
    <div className="p-2 bg-gray-200 rounded">
      Last TeensyStatus: {lastTeensyStatus}
    </div>
  );
};

export default TeensyStatus;