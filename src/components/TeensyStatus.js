import React, { useEffect, useState } from 'react';
import { mqttService } from '../services/MqttConnect';

// エラーコードの定義
const ErrorCode = {
  NO_ERROR: 0,
  SUCCESS: 1,
  FAILED: 2,
  TIMEOUT: 3
};

// エラーコードの表示名
const ErrorCodeLabels = {
  0: 'NO_ERROR',
  1: 'SUCCESS',
  2: 'FAILED',
  3: 'TIMEOUT'
};

// ステータスによって表示するスタイルを変更
const getStatusStyle = (status) => {
  switch (status) {
    case ErrorCode.NO_ERROR:
      return 'bg-gray-200 text-gray-700';
    case ErrorCode.SUCCESS:
      return 'bg-green-200 text-green-700';
    case ErrorCode.FAILED:
      return 'bg-red-200 text-red-700';
    case ErrorCode.TIMEOUT:
      return 'bg-yellow-200 text-yellow-700';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

const TeensyStatus = () => {
  const [edgeStatus, setEdgeStatus] = useState({
    vectornav: 0,
    sdcard: 0,
    gnss_fix: 0
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleTeensyStatus = (message) => {
      // 受信したメッセージを数値に変換
      const statusValue = parseInt(message, 10);
      
      if (!isNaN(statusValue)) {
        // ビットフィールドからステータスを抽出
        const vectornavStatus = statusValue & 0x03;
        const sdcardStatus = (statusValue >> 2) & 0x03;
        const gnssFixStatus = (statusValue >> 4) & 0x03;
        
        setEdgeStatus({
          vectornav: vectornavStatus,
          sdcard: sdcardStatus,
          gnss_fix: gnssFixStatus
        });
      }
    };

    mqttService.subscribe('teensy4.1/status', handleTeensyStatus);
    
    return () => {
      mqttService.unsubscribe('teensy4.1/status', handleTeensyStatus);
    };
  }, []);

  // エラーが発生している場合はtrue
  const hasError = edgeStatus.vectornav === ErrorCode.FAILED || 
                   edgeStatus.vectornav === ErrorCode.TIMEOUT || 
                   edgeStatus.sdcard === ErrorCode.FAILED || 
                   edgeStatus.sdcard === ErrorCode.TIMEOUT || 
                   edgeStatus.gnss_fix === ErrorCode.FAILED || 
                   edgeStatus.gnss_fix === ErrorCode.TIMEOUT;

  return (
    <div className="border rounded-md shadow-sm">
      {/* ヘッダー部分（常に表示・クリックで展開/折りたたみ） */}
      <div 
        className={`flex items-center justify-between p-2 cursor-pointer ${hasError ? 'bg-red-100' : 'bg-gray-100'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <span className="font-medium mr-2">Edge Status</span>
          {hasError && <span className="text-red-600 text-sm">⚠️ Error</span>}
        </div>
        <span>{isExpanded ? '▲' : '▼'}</span>
      </div>

      {/* 詳細部分（展開時のみ表示） */}
      {isExpanded && (
        <div className="p-2 border-t">
          <div className="grid grid-cols-2 gap-1 text-sm">
            <span className="font-medium">VectorNav:</span>
            <span className={`px-1 rounded ${getStatusStyle(edgeStatus.vectornav)}`}>
              {ErrorCodeLabels[edgeStatus.vectornav]}
            </span>
            
            <span className="font-medium">SD Card:</span>
            <span className={`px-1 rounded ${getStatusStyle(edgeStatus.sdcard)}`}>
              {ErrorCodeLabels[edgeStatus.sdcard]}
            </span>
            
            <span className="font-medium">GNSS Fix:</span>
            <span className={`px-1 rounded ${getStatusStyle(edgeStatus.gnss_fix)}`}>
              {ErrorCodeLabels[edgeStatus.gnss_fix]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeensyStatus;