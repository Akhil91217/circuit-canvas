import { create } from 'zustand';
import { SerialMessage, PinChange } from '@/engine/ArduinoRuntime';
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

export interface WaveformSample {
  pin: number;
  value: number;
  time: number;
  mode: 'digital' | 'analog';
}

export interface DebugBreakpoint {
  line: number;
  enabled: boolean;
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

  // Runtime mode
  runtimeMode: 'javascript' | 'avr8js';
  setRuntimeMode: (mode: 'javascript' | 'avr8js') => void;

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
  activeBottomTab: 'code' | 'serial' | 'waveform' | 'variables';
  setActiveBottomTab: (tab: 'code' | 'serial' | 'waveform' | 'variables') => void;

  // Debugger
  breakpoints: DebugBreakpoint[];
  addBreakpoint: (line: number) => void;
  removeBreakpoint: (line: number) => void;
  toggleBreakpoint: (line: number) => void;
  clearBreakpoints: () => void;
  currentExecutionLine: number;
  setCurrentExecutionLine: (line: number) => void;
  debugMode: boolean;
  setDebugMode: (mode: boolean) => void;
  isSteppingOver: boolean;
  setIsSteppingOver: (v: boolean) => void;

  // Variables
  runtimeVariables: Record<string, { value: string | number | boolean; type: string }>;
  setRuntimeVariables: (vars: Record<string, { value: string | number | boolean; type: string }>) => void;

  // Waveform
  waveformData: WaveformSample[];
  addWaveformSample: (sample: WaveformSample) => void;
  clearWaveform: () => void;
  watchedPins: number[];
  toggleWatchPin: (pin: number) => void;

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

  // Sensor values
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

  runtimeMode: 'javascript',
  setRuntimeMode: (mode) => set({ runtimeMode: mode }),

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

  bottomPanelHeight: 300,
  setBottomPanelHeight: (h) => set({ bottomPanelHeight: h }),
  activeBottomTab: 'code',
  setActiveBottomTab: (tab) => set({ activeBottomTab: tab }),

  // Debugger
  breakpoints: [],
  addBreakpoint: (line) => set((s) => ({
    breakpoints: [...s.breakpoints, { line, enabled: true }]
  })),
  removeBreakpoint: (line) => set((s) => ({
    breakpoints: s.breakpoints.filter(b => b.line !== line)
  })),
  toggleBreakpoint: (line) => set((s) => {
    const exists = s.breakpoints.find(b => b.line === line);
    if (exists) return { breakpoints: s.breakpoints.filter(b => b.line !== line) };
    return { breakpoints: [...s.breakpoints, { line, enabled: true }] };
  }),
  clearBreakpoints: () => set({ breakpoints: [] }),
  currentExecutionLine: -1,
  setCurrentExecutionLine: (line) => set({ currentExecutionLine: line }),
  debugMode: false,
  setDebugMode: (mode) => set({ debugMode: mode }),
  isSteppingOver: false,
  setIsSteppingOver: (v) => set({ isSteppingOver: v }),

  // Variables
  runtimeVariables: {},
  setRuntimeVariables: (vars) => set({ runtimeVariables: vars }),

  // Waveform
  waveformData: [],
  addWaveformSample: (sample) => set((s) => ({
    waveformData: [...s.waveformData.slice(-2000), sample]
  })),
  clearWaveform: () => set({ waveformData: [] }),
  watchedPins: [13],
  toggleWatchPin: (pin) => set((s) => ({
    watchedPins: s.watchedPins.includes(pin)
      ? s.watchedPins.filter(p => p !== pin)
      : [...s.watchedPins, pin]
  })),

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
    'humidity': 50,
    'humidity-temp': 25,
    'light-lux': 500,
    'accel-x': 0,
    'accel-y': 0,
    'accel-z': 9.8,
    'servo-angle': 90,
  },
  setSensorValue: (key, value) => set((s) => ({ sensorValues: { ...s.sensorValues, [key]: value } })),
}));
