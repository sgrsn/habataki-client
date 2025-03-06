import { mqttService } from './MqttConnect';

class WatchdogService {
  constructor() {
    this.interval = null;
    this.isRunning = false;
    this.lastHeartbeatTime = Date.now();
    this.lastReceivedHeartbeat = null;
    this.heartbeatInterval = 500;
    this.deviceId = this.generateDeviceId();
    this.connectionTimeout = this.heartbeatInterval * 3; // 3回分のハートビートを受信できなかった場合はタイムアウト
    this.connectionCheckInterval = null;
  }

  generateDeviceId() {
    const str = navigator.userAgent + Date.now();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `device_${Math.abs(hash).toString(16)}`;
  }

  init() {
    // ハートビートメッセージの購読を開始
    mqttService.subscribe('watchdog/heartbeat', (message) => {
      this.handleHeartbeat(message);
    });
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastHeartbeatTime = Date.now();
    this.lastReceivedHeartbeat = Date.now();

    // 初回のハートビートを即座に送信
    this.sendHeartbeat();

    // 定期的なハートビートの送信を開始
    this.interval = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatInterval);

    // 接続状態の監視を開始
    this.startConnectionMonitoring();

    console.log('Watchdog service started');
  }

  stop() {
    if (!this.isRunning) return;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }

    // ハートビートの購読を解除
    mqttService.unsubscribe('watchdog/heartbeat');

    this.isRunning = false;
    console.log('Watchdog service stopped');

    mqttService.publish('watchdog/status', {
      deviceId: this.deviceId,
      status: 'stopped',
      timestamp: Date.now()
    });
  }

  handleHeartbeat(message) {
    this.lastReceivedHeartbeat = Date.now();
    console.log('Received heartbeat:', message);
  }

  startConnectionMonitoring() {
    this.connectionCheckInterval = setInterval(() => {
      const timeSinceLastHeartbeat = Date.now() - this.lastReceivedHeartbeat;
      if (timeSinceLastHeartbeat > this.connectionTimeout) {
        console.warn('Connection timeout detected - No heartbeat received');
        this.handleConnectionTimeout();
      }
    }, this.heartbeatInterval);
  }

  handleConnectionTimeout() {
    // 接続タイムアウト時の処理をここに実装
    // 例: 再接続の試行、エラーイベントの発行など
    console.error('Connection timeout - Reconnecting...');
    mqttService.connect();
  }

  sendHeartbeat() {
    const currentTime = Date.now();
    mqttService.publish('watchdog/heartbeat', currentTime);
    this.lastHeartbeatTime = currentTime;
  }

  setHeartbeatInterval(interval) {
    if (interval < 100) {
      interval = 100;
    }
    
    this.heartbeatInterval = interval;
    this.connectionTimeout = interval * 3;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      deviceId: this.deviceId,
      heartbeatInterval: this.heartbeatInterval,
      lastHeartbeatTime: this.lastHeartbeatTime,
      lastReceivedHeartbeat: this.lastReceivedHeartbeat,
      connectionTimeout: this.connectionTimeout
    };
  }
}

export const watchdogService = new WatchdogService();