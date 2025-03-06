import mqtt from 'mqtt';
import { MQTT_CONFIG } from '../config/mqtt';

class MQTTService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect() {
    const { broker, port, username, password, clientId } = MQTT_CONFIG;
    const url = `ws://${broker}:${port}/mqtt`;
    
    this.client = mqtt.connect(url, {
      username,
      password,
      protocol: 'ws',
    });

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.connected = true;
      
      // 再接続時に既存のサブスクリプションを再購読
      this.subscriptions.forEach((callback, topic) => {
        this.client.subscribe(topic);
      });
    });

    this.client.on('error', (error) => {
      console.error('MQTT error:', error);
      this.connected = false;
    });

    this.client.on('message', (topic, message) => {
      const callback = this.subscriptions.get(topic);
      if (callback) {
        try {
          const parsedMessage = JSON.parse(message.toString());
          callback(parsedMessage);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }
    });
  }

  publish(topic, message) {
    if (this.connected && this.client) {
      this.client.publish(topic, JSON.stringify(message));
    }
  }

  subscribe(topic, callback) {
    if (this.client) {
      this.client.subscribe(topic);
      this.subscriptions.set(topic, callback);
    }
  }

  unsubscribe(topic) {
    if (this.client) {
      this.client.unsubscribe(topic);
      this.subscriptions.delete(topic);
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.connected = false;
      this.subscriptions.clear();
    }
  }
}

export const mqttService = new MQTTService();