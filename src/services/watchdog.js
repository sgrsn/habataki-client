import { mqttService } from './MqttConnect';

class WatchdogService {
  constructor() {
    this.interval = null;
    this.isRunning = false;
    this.lastHeartbeatTime = Date.now();
    this.heartbeatInterval = 1000; // 1秒ごとにハートビートを送信
    this.deviceId = this.generateDeviceId(); // デバイスごとに一意のIDを生成
  }

  generateDeviceId() {
    // ブラウザのユーザーエージェントと時刻からハッシュを生成
    const str = navigator.userAgent + Date.now();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `device_${Math.abs(hash).toString(16)}`;
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastHeartbeatTime = Date.now();

    // 初回のハートビートを即座に送信
    this.sendHeartbeat();

    // 定期的なハートビートの送信を開始
    this.interval = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatInterval);

    console.log('Watchdog service started');
  }

  stop() {
    if (!this.isRunning) return;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.isRunning = false;
    console.log('Watchdog service stopped');

    // 停止メッセージを送信
    mqttService.publish('watchdog/status', {
      deviceId: this.deviceId,
      status: 'stopped',
      timestamp: Date.now()
    });
  }

  sendHeartbeat() {
    const currentTime = Date.now();
    const timeSinceLastHeartbeat = currentTime - this.lastHeartbeatTime;
    
    const heartbeatData = {
      deviceId: this.deviceId,
      status: 'alive',
      timestamp: currentTime,
      interval: timeSinceLastHeartbeat,
      userAgent: navigator.userAgent
    };

    mqttService.publish('watchdog/heartbeat', heartbeatData);
    this.lastHeartbeatTime = currentTime;
  }

  // ハートビート間隔を変更する（ミリ秒単位）
  setHeartbeatInterval(interval) {
    if (interval < 100) { // 最小間隔を100msに制限
      interval = 100;
    }
    
    this.heartbeatInterval = interval;
    
    // サービスが実行中の場合は再起動して新しい間隔を適用
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  // 現在の状態を取得
  getStatus() {
    return {
      isRunning: this.isRunning,
      deviceId: this.deviceId,
      heartbeatInterval: this.heartbeatInterval,
      lastHeartbeatTime: this.lastHeartbeatTime
    };
  }
}

// シングルトンインスタンスをエクスポート
export const watchdogService = new WatchdogService();
