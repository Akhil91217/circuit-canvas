/**
 * Mock Arduino Runtime - JavaScript-based interpreter for Arduino-like code.
 * Parses and executes common Arduino functions, updating component states.
 */

export type PinMode = 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP';
export type PinState = 'HIGH' | 'LOW';

export interface SerialMessage {
  timestamp: number;
  text: string;
}

export interface PinChange {
  pin: number;
  value: number; // 0-255 for analog, 0/1 for digital
  mode: 'digital' | 'analog';
}

export interface RuntimeState {
  running: boolean;
  paused: boolean;
  pinModes: Record<number, PinMode>;
  pinStates: Record<number, number>; // 0-255
  serialOutput: SerialMessage[];
  errors: string[];
  currentLine: number;
  millis: number;
}

type RuntimeCallback = {
  onSerialOutput: (msg: SerialMessage) => void;
  onPinChange: (change: PinChange) => void;
  onError: (error: string) => void;
  onStateChange: (state: RuntimeState) => void;
  onLineChange: (line: number) => void;
};

const DEFAULT_CODE = `// Arduino Sketch - CircuitForge
// Write your Arduino code here

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
  Serial.println("CircuitForge Simulation Started!");
}

void loop() {
  digitalWrite(13, HIGH);
  Serial.println("LED ON");
  delay(1000);
  
  digitalWrite(13, LOW);
  Serial.println("LED OFF");
  delay(1000);
}
`;

export { DEFAULT_CODE };

export class ArduinoRuntime {
  private state: RuntimeState;
  private callbacks: RuntimeCallback;
  private animFrameId: number | null = null;
  private setupFn: (() => Promise<void>) | null = null;
  private loopFn: (() => Promise<void>) | null = null;
  private startTime: number = 0;
  private speed: number = 1;
  private abortController: AbortController | null = null;

  constructor(callbacks: RuntimeCallback) {
    this.callbacks = callbacks;
    this.state = this.createInitialState();
  }

  private createInitialState(): RuntimeState {
    return {
      running: false,
      paused: false,
      pinModes: {},
      pinStates: {},
      serialOutput: [],
      errors: [],
      currentLine: 0,
      millis: 0,
    };
  }

  getState(): RuntimeState {
    return { ...this.state };
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  compile(code: string): boolean {
    this.state = this.createInitialState();
    try {
      const { setupBody, loopBody } = this.parseArduinoCode(code);
      this.setupFn = this.createExecutable(setupBody);
      this.loopFn = this.createExecutable(loopBody);
      return true;
    } catch (e: any) {
      const error = `Compilation Error: ${e.message}`;
      this.state.errors.push(error);
      this.callbacks.onError(error);
      return false;
    }
  }

  private parseArduinoCode(code: string): { setupBody: string; loopBody: string } {
    // Remove comments
    const cleaned = code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');

    const setupMatch = cleaned.match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\n\}/);
    const loopMatch = cleaned.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\n\}/);

    return {
      setupBody: setupMatch?.[1]?.trim() || '',
      loopBody: loopMatch?.[1]?.trim() || '',
    };
  }

  private createExecutable(body: string): () => Promise<void> {
    const lines = body.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    return async () => {
      for (const line of lines) {
        if (!this.state.running || this.state.paused) break;
        if (this.abortController?.signal.aborted) break;
        await this.executeLine(line);
      }
    };
  }

  private async executeLine(line: string): Promise<void> {
    // Remove trailing semicolons
    line = line.replace(/;$/, '').trim();
    if (!line) return;

    // pinMode(pin, mode)
    const pinModeMatch = line.match(/pinMode\s*\(\s*(\d+)\s*,\s*(INPUT|OUTPUT|INPUT_PULLUP)\s*\)/);
    if (pinModeMatch) {
      const pin = parseInt(pinModeMatch[1]);
      const mode = pinModeMatch[2] as PinMode;
      this.state.pinModes[pin] = mode;
      if (mode === 'OUTPUT') this.state.pinStates[pin] = 0;
      if (mode === 'INPUT_PULLUP') this.state.pinStates[pin] = 1;
      this.callbacks.onStateChange(this.getState());
      return;
    }

    // digitalWrite(pin, value)
    const dwMatch = line.match(/digitalWrite\s*\(\s*(\d+)\s*,\s*(HIGH|LOW|1|0)\s*\)/);
    if (dwMatch) {
      const pin = parseInt(dwMatch[1]);
      const val = (dwMatch[2] === 'HIGH' || dwMatch[2] === '1') ? 1 : 0;
      this.state.pinStates[pin] = val * 255;
      this.callbacks.onPinChange({ pin, value: val, mode: 'digital' });
      this.callbacks.onStateChange(this.getState());
      return;
    }

    // analogWrite(pin, value)
    const awMatch = line.match(/analogWrite\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (awMatch) {
      const pin = parseInt(awMatch[1]);
      const val = Math.min(255, Math.max(0, parseInt(awMatch[2])));
      this.state.pinStates[pin] = val;
      this.callbacks.onPinChange({ pin, value: val, mode: 'analog' });
      this.callbacks.onStateChange(this.getState());
      return;
    }

    // Serial.begin(baud)
    const serialBeginMatch = line.match(/Serial\.begin\s*\(\s*(\d+)\s*\)/);
    if (serialBeginMatch) {
      return; // Just acknowledge, no-op in simulation
    }

    // Serial.println(...)
    const printlnMatch = line.match(/Serial\.println\s*\(\s*"(.*)"\s*\)/);
    if (printlnMatch) {
      const msg: SerialMessage = { timestamp: this.state.millis, text: printlnMatch[1] + '\n' };
      this.state.serialOutput.push(msg);
      this.callbacks.onSerialOutput(msg);
      return;
    }

    // Serial.print(...)
    const printMatch = line.match(/Serial\.print\s*\(\s*"(.*)"\s*\)/);
    if (printMatch) {
      const msg: SerialMessage = { timestamp: this.state.millis, text: printMatch[1] };
      this.state.serialOutput.push(msg);
      this.callbacks.onSerialOutput(msg);
      return;
    }

    // delay(ms)
    const delayMatch = line.match(/delay\s*\(\s*(\d+)\s*\)/);
    if (delayMatch) {
      const ms = parseInt(delayMatch[1]);
      const scaledMs = ms / this.speed;
      await this.sleep(scaledMs);
      this.state.millis += ms;
      this.callbacks.onStateChange(this.getState());
      return;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      // If aborted, clear timeout immediately
      this.abortController?.signal.addEventListener('abort', () => {
        clearTimeout(id);
        resolve();
      });
    });
  }

  async run(code: string): Promise<void> {
    this.stop();
    
    if (!this.compile(code)) return;
    
    this.state.running = true;
    this.state.paused = false;
    this.startTime = performance.now();
    this.abortController = new AbortController();
    this.callbacks.onStateChange(this.getState());

    // Run setup
    if (this.setupFn) {
      await this.setupFn();
    }

    // Run loop continuously
    while (this.state.running && !this.abortController.signal.aborted) {
      if (this.state.paused) {
        await this.sleep(100);
        continue;
      }
      if (this.loopFn) {
        await this.loopFn();
      }
      // Small yield to prevent blocking
      await this.sleep(1);
    }
  }

  pause(): void {
    this.state.paused = true;
    this.callbacks.onStateChange(this.getState());
  }

  resume(): void {
    this.state.paused = false;
    this.callbacks.onStateChange(this.getState());
  }

  stop(): void {
    this.state.running = false;
    this.state.paused = false;
    this.abortController?.abort();
    this.abortController = null;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    // Reset pin states
    this.state.pinStates = {};
    this.callbacks.onStateChange(this.getState());
  }

  reset(): void {
    this.stop();
    this.state = this.createInitialState();
    this.callbacks.onStateChange(this.getState());
  }
}
