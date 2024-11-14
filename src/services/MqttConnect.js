import mqtt from 'mqtt';
import { MQTT_CONFIG } from '../config/mqtt';

class MQTTService {
  constructor() {
    this.client = null;
    this.connected = false;
  }

  connect() {
    const { broker, port, username, password, clientId } = MQTT_CONFIG;
    const url = `ws://${broker}:${port}/mqtt`;
    
    this.client = mqtt.connect(url, {
      username,
      password,
      protocol: 'ws', // WebSocket プロトコルを使用
    });

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.connected = true;
    });

    this.client.on('error', (error) => {
      console.error('MQTT error:', error);
      this.connected = false;
    });
  }

  publish(topic, message) {
    if (this.connected && this.client) {
      this.client.publish(topic, JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.connected = false;
    }
  }
}

export const mqttService = new MQTTService();