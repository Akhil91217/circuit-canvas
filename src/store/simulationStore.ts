import { create } from 'zustand';
import { SerialMessage, PinChange } from '@/engine/ArduinoRuntime';
import { DEFAULT_CODE } from '@/engine/ArduinoRuntime';

interface SimulationState {
  // Code
  code: string;
  setCode: (code: string) => void;

  // Simulation status
  isRunning: boolean;
  isPaused: boolean;
  speed: number;
  setRunning: (running: boolean) => void;
  setPaused: (paused: boolean) => void;
  setSpeed: (speed: number) => void;

  // Serial output
  serialOutput: SerialMessage[];
  addSerialMessage: (msg: SerialMessage) => void;
  clearSerial: () => void;
  showTimestamps: boolean;
  toggleTimestamps: () => void;
  autoScroll: boolean;
  toggleAutoScroll: () => void;

  // Pin states (from simulation)
  pinStates: Record<number, number>;
  setPinState: (pin: number, value: number) => void;
  resetPinStates: () => void;

  // Errors
  errors: string[];
  addError: (error: string) => void;
  clearErrors: () => void;

  // Bottom panel
  bottomPanelHeight: number;
  setBottomPanelHeight: (h: number) => void;
  activeBottomTab: 'code' | 'serial';
  setActiveBottomTab: (tab: 'code' | 'serial') => void;
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
    serialOutput: [...s.serialOutput.slice(-500), msg] // keep last 500 messages
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
}));
