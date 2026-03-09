/**
 * Event Bus — central event-driven architecture for the simulation engine.
 * Components emit events; only subscribed listeners react.
 */

export type SimEventType =
  | 'pin:change'
  | 'pin:mode'
  | 'sensor:update'
  | 'timer:tick'
  | 'timer:interrupt'
  | 'bus:i2c'
  | 'bus:spi'
  | 'bus:uart'
  | 'serial:output'
  | 'component:add'
  | 'component:remove'
  | 'wire:add'
  | 'wire:remove'
  | 'simulation:start'
  | 'simulation:stop'
  | 'simulation:pause'
  | 'simulation:error'
  | 'compile:start'
  | 'compile:done'
  | 'compile:error'
  | 'dashboard:data';

export interface SimEvent<T = unknown> {
  type: SimEventType;
  payload: T;
  timestamp: number;
  source?: string;
}

export interface PinChangeEvent {
  pin: number;
  value: number;
  mode: 'digital' | 'analog';
  componentId?: string;
}

export interface SensorUpdateEvent {
  sensorId: string;
  key: string;
  value: number;
}

export interface BusEvent {
  bus: 'I2C' | 'SPI' | 'UART';
  address?: number;
  data: number[];
  direction: 'send' | 'receive';
}

export interface DashboardDataEvent {
  widgetId: string;
  label: string;
  value: number;
  unit?: string;
}

export interface CompileEvent {
  status: 'start' | 'done' | 'error';
  firmware?: Uint8Array;
  hexSize?: number;
  error?: string;
}

type EventListener<T = unknown> = (event: SimEvent<T>) => void;

class EventBus {
  private listeners = new Map<SimEventType, Set<EventListener<any>>>();
  private eventLog: SimEvent[] = [];
  private maxLogSize = 1000;

  on<T = unknown>(type: SimEventType, listener: EventListener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
    return () => this.off(type, listener);
  }

  off<T = unknown>(type: SimEventType, listener: EventListener<T>): void {
    this.listeners.get(type)?.delete(listener);
  }

  emit<T = unknown>(type: SimEventType, payload: T, source?: string): void {
    const event: SimEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
      source,
    };

    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(-this.maxLogSize / 2);
    }

    const listeners = this.listeners.get(type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (e) {
          console.error(`EventBus listener error on ${type}:`, e);
        }
      }
    }
  }

  getLog(filter?: SimEventType): SimEvent[] {
    if (filter) return this.eventLog.filter(e => e.type === filter);
    return [...this.eventLog];
  }

  clearLog(): void {
    this.eventLog = [];
  }

  reset(): void {
    this.listeners.clear();
    this.eventLog = [];
  }

  getListenerCount(type?: SimEventType): number {
    if (type) return this.listeners.get(type)?.size || 0;
    let count = 0;
    for (const set of this.listeners.values()) count += set.size;
    return count;
  }
}

// Singleton
export const eventBus = new EventBus();
