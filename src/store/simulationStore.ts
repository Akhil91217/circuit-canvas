import { create } from 'zustand';
import { SerialMessage } from '@/engine/ArduinoRuntime';
import { DEFAULT_CODE } from '@/engine/ArduinoRuntime';

export interface MqttMessage {
  topic: string;
  message: string;
  direction: 'in' | 'out' | 'system';
  timestamp: number;
}

export interface MqttConfig {
  brokerUrl: string;
  topic: string;
  username: string;
  password: string;
}

interface SimulationState {
  code: string;
  setCode: (code: string) => void;

  isRunning: boolean;
  isPaused: boolean;
  speed: number;
  setRunning: (running: boolean) => void;
  setPaused: (paused: boolean) => void;
  setSpeed: (speed: number) => void;

  serialOutput: SerialMessage[];
  addSerialMessage: (msg: SerialMessage) => void;
  clearSerial: () => void;
  showTimestamps: boolean;
  toggleTimestamps: () => void;
  autoScroll: boolean;
  toggleAutoScroll: () => void;

  pinStates: Record<number, number>;
  setPinState: (pin: number, value: number) => void;
  resetPinStates: () => void;

  errors: string[];
  addError: (error: string) => void;
  clearErrors: () => void;

  bottomPanelHeight: number;
  setBottomPanelHeight: (h: number) => void;
  activeBottomTab: 'code' | 'serial';
  setActiveBottomTab: (tab: 'code' | 'serial') => void;

  // IoT
  wifiConnected: boolean;
  setWifiConnected: (connected: boolean) => void;
  mqttConnected: boolean;
  setMqttConnected: (connected: boolean) => void;
  mqttConfig: MqttConfig;
  setMqttConfig: (config: MqttConfig) => void;
  mqttMessages: MqttMessage[];
  addMqttMessage: (msg: MqttMessage) => void;
  clearMqttMessages: () => void;

  // Sensor values (for simulation)
  sensorValues: Record<string, number>;
  setSensorValue: (key: string, value: number) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  code: DEFAULT_CODE,
  setCode: (code) => set({ code }),

  isRunning: false,
  isPaused: false,
  speed: 1,
  setRunning: (running) => set({ isRunning: running }),
  setPaused: (paused) => set({ isPaused: paused }),
  setSpeed: (speed) => set({ speed }),

  serialOutput: [],
  addSerialMessage: (msg) => set((s) => ({ 
    serialOutput: [...s.serialOutput.slice(-500), msg]
  })),
  clearSerial: () => set({ serialOutput: [] }),
  showTimestamps: false,
  toggleTimestamps: () => set((s) => ({ showTimestamps: !s.showTimestamps })),
  autoScroll: true,
  toggleAutoScroll: () => set((s) => ({ autoScroll: !s.autoScroll })),

  pinStates: {},
  setPinState: (pin, value) => set((s) => ({ pinStates: { ...s.pinStates, [pin]: value } })),
  resetPinStates: () => set({ pinStates: {} }),

  errors: [],
  addError: (error) => set((s) => ({ errors: [...s.errors, error] })),
  clearErrors: () => set({ errors: [] }),

  bottomPanelHeight: 280,
  setBottomPanelHeight: (h) => set({ bottomPanelHeight: h }),
  activeBottomTab: 'code',
  setActiveBottomTab: (tab) => set({ activeBottomTab: tab }),

  // IoT
  wifiConnected: false,
  setWifiConnected: (connected) => set({ wifiConnected: connected }),
  mqttConnected: false,
  setMqttConnected: (connected) => set({ mqttConnected: connected }),
  mqttConfig: {
    brokerUrl: 'wss://broker.hivemq.com:8884/mqtt',
    topic: 'circuitforge/data',
    username: '',
    password: '',
  },
  setMqttConfig: (config) => set({ mqttConfig: config }),
  mqttMessages: [],
  addMqttMessage: (msg) => set((s) => ({ mqttMessages: [...s.mqttMessages.slice(-100), msg] })),
  clearMqttMessages: () => set({ mqttMessages: [] }),

  // Sensor values
  sensorValues: {
    'ultrasonic-distance': 100,
    'potentiometer-value': 512,
    'temperature': 25,
  },
  setSensorValue: (key, value) => set((s) => ({ sensorValues: { ...s.sensorValues, [key]: value } })),
}));
