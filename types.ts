export enum ConnectionType {
  ESP_NOW = 'ESP-NOW (Recommended)',
  WIFI_MQTT = 'WiFi + MQTT',
  BLUETOOTH = 'Bluetooth Serial',
  WIFI_HTTP = 'WiFi Direct (HTTP)'
}

export enum DeviceState {
  FREE = 'LIBRE',
  BUSY = 'OCUPADO'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface FirmwareConfig {
  connectionType: ConnectionType;
  deviceModel: string;
  wifiSsid?: string;
  wifiPass?: string;
  mqttBroker?: string;
  mqttPort?: string;
  mqttTopic?: string;
}