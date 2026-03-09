/**
 * Event Bus — central event-driven architecture with batched updates.
 * Performance: batch mode groups events and flushes at next animation frame.
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

  // Batching
  private batchMode = false;
  private pendingEvents: SimEvent[] = [];
  private flushScheduled = false;

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

    if (this.batchMode) {
      this.pendingEvents.push(event);
      this.scheduleFlush();
      return;
    }

    this.dispatch(event);
  }

  private dispatch(event: SimEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (e) {
          console.error(`EventBus listener error on ${event.type}:`, e);
        }
      }
    }
  }

  // ===== Batching API =====
  startBatch(): void {
    this.batchMode = true;
  }

  endBatch(): void {
    this.batchMode = false;
    this.flush();
  }

  private scheduleFlush(): void {
    if (this.flushScheduled) return;
    this.flushScheduled = true;
    requestAnimationFrame(() => this.flush());
  }

  private flush(): void {
    this.flushScheduled = false;
    const events = this.pendingEvents;
    this.pendingEvents = [];

    // Deduplicate same-type events within the batch — keep latest
    const deduped = new Map<string, SimEvent>();
    for (const evt of events) {
      // For pin:change, deduplicate per pin
      if (evt.type === 'pin:change') {
        const key = `pin:${(evt.payload as any)?.pin}`;
        deduped.set(key, evt);
      } else if (evt.type === 'sensor:update') {
        const key = `sensor:${(evt.payload as any)?.sensorId}:${(evt.payload as any)?.key}`;
        deduped.set(key, evt);
      } else if (evt.type === 'dashboard:data') {
        const key = `dash:${(evt.payload as any)?.widgetId}`;
        deduped.set(key, evt);
      } else {
        deduped.set(`${evt.type}:${evt.timestamp}`, evt);
      }
    }

    for (const evt of deduped.values()) {
      this.dispatch(evt);
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
    this.pendingEvents = [];
    this.batchMode = false;
  }

  getListenerCount(type?: SimEventType): number {
    if (type) return this.listeners.get(type)?.size || 0;
    let count = 0;
    for (const set of this.listeners.values()) count += set.size;
    return count;
  }

  getStats(): { listeners: number; logSize: number; pending: number; batching: boolean } {
    return {
      listeners: this.getListenerCount(),
      logSize: this.eventLog.length,
      pending: this.pendingEvents.length,
      batching: this.batchMode,
    };
  }
}

// Singleton
export const eventBus = new EventBus();
