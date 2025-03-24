import React, { useEffect, useState } from 'react';
import { mqttService } from '../services/MqttConnect';

const GnssStatus = () => {
  const [lastGnssStatus, setLastGnssStatus] = useState(null);

  useEffect(() => {
    const handleGnssStatus = (message) => {
      setLastGnssStatus(message);
    };

    mqttService.subscribe('gnss/status', handleGnssStatus);
    
    return () => {
      mqttService.unsubscribe('gnss/status', handleGnssStatus);
    };
  }, []);

  return (
    <div className="p-2 bg-gray-200 rounded">
      Last GnssStatus: {lastGnssStatus}
    </div>
  );
};

export default GnssStatus;