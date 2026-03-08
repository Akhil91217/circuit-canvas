/**
 * Enhanced Arduino Runtime - Phase 4
 * Supports variables, expressions, control flow, digitalRead, analogRead,
 * millis(), interrupts, PWM, ADC, and bus simulation (SPI/I2C/UART).
 */

export type PinMode = 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP';
export type PinState = 'HIGH' | 'LOW';

export interface SerialMessage {
  timestamp: number;
  text: string;
}

export interface PinChange {
  pin: number;
  value: number;
  mode: 'digital' | 'analog';
}

export interface BusMessage {
  bus: 'SPI' | 'I2C' | 'UART';
  address?: number;
  data: number[];
  direction: 'send' | 'receive';
  timestamp: number;
}

export interface RuntimeState {
  running: boolean;
  paused: boolean;
  pinModes: Record<number, PinMode>;
  pinStates: Record<number, number>;
  serialOutput: SerialMessage[];
  errors: string[];
  currentLine: number;
  millis: number;
  variables: Record<string, number | string | boolean>;
  busMessages: BusMessage[];
  interrupts: InterruptConfig[];
  pwmChannels: Record<number, PwmState>;
  adcValues: Record<number, number>;
}

export interface InterruptConfig {
  pin: number;
  mode: 'RISING' | 'FALLING' | 'CHANGE';
  handler: string;
  enabled: boolean;
}

export interface PwmState {
  frequency: number;
  dutyCycle: number; // 0-255
  enabled: boolean;
}

type RuntimeCallback = {
  onSerialOutput: (msg: SerialMessage) => void;
  onPinChange: (change: PinChange) => void;
  onError: (error: string) => void;
  onStateChange: (state: RuntimeState) => void;
  onLineChange: (line: number) => void;
  onBusMessage?: (msg: BusMessage) => void;
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

// ---------- Bus Simulation Classes ----------

export class I2CBus {
  private devices: Map<number, I2CDevice> = new Map();
  private callback?: (msg: BusMessage) => void;

  constructor(callback?: (msg: BusMessage) => void) {
    this.callback = callback;
  }

  registerDevice(address: number, device: I2CDevice) {
    this.devices.set(address, device);
  }

  beginTransmission(address: number): boolean {
    return this.devices.has(address);
  }

  write(address: number, data: number[]): boolean {
    const device = this.devices.get(address);
    if (!device) return false;
    device.receive(data);
    this.callback?.({ bus: 'I2C', address, data, direction: 'send', timestamp: Date.now() });
    return true;
  }

  read(address: number, length: number): number[] {
    const device = this.devices.get(address);
    if (!device) return [];
    const data = device.send(length);
    this.callback?.({ bus: 'I2C', address, data, direction: 'receive', timestamp: Date.now() });
    return data;
  }
}

export interface I2CDevice {
  receive(data: number[]): void;
  send(length: number): number[];
}

export class SPIBus {
  private devices: Map<number, SPIDevice> = new Map();
  private callback?: (msg: BusMessage) => void;

  constructor(callback?: (msg: BusMessage) => void) {
    this.callback = callback;
  }

  registerDevice(csPin: number, device: SPIDevice) {
    this.devices.set(csPin, device);
  }

  transfer(csPin: number, data: number[]): number[] {
    const device = this.devices.get(csPin);
    if (!device) return data.map(() => 0);
    this.callback?.({ bus: 'SPI', address: csPin, data, direction: 'send', timestamp: Date.now() });
    const result = device.transfer(data);
    this.callback?.({ bus: 'SPI', address: csPin, data: result, direction: 'receive', timestamp: Date.now() });
    return result;
  }
}

export interface SPIDevice {
  transfer(data: number[]): number[];
}

export class UARTBus {
  private buffer: number[] = [];
  private callback?: (msg: BusMessage) => void;
  baudRate: number = 9600;

  constructor(callback?: (msg: BusMessage) => void) {
    this.callback = callback;
  }

  write(data: number[]): void {
    this.callback?.({ bus: 'UART', data, direction: 'send', timestamp: Date.now() });
  }

  available(): number {
    return this.buffer.length;
  }

  read(): number {
    return this.buffer.shift() ?? -1;
  }

  pushToBuffer(data: number[]): void {
    this.buffer.push(...data);
    this.callback?.({ bus: 'UART', data, direction: 'receive', timestamp: Date.now() });
  }
}

// ---------- Main Runtime ----------

export class ArduinoRuntime {
  private state: RuntimeState;
  private callbacks: RuntimeCallback;
  private animFrameId: number | null = null;
  private setupFn: (() => Promise<void>) | null = null;
  private loopFn: (() => Promise<void>) | null = null;
  private customFunctions: Record<string, string[]> = {};
  private startTime: number = 0;
  private speed: number = 1;
  private abortController: AbortController | null = null;

  // Buses
  i2c: I2CBus;
  spi: SPIBus;
  uart: UARTBus;

  // External sensor feed
  private sensorFeed: Record<string, number> = {};

  constructor(callbacks: RuntimeCallback) {
    this.callbacks = callbacks;
    this.state = this.createInitialState();
    this.i2c = new I2CBus(callbacks.onBusMessage);
    this.spi = new SPIBus(callbacks.onBusMessage);
    this.uart = new UARTBus(callbacks.onBusMessage);
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
      variables: {},
      busMessages: [],
      interrupts: [],
      pwmChannels: {},
      adcValues: { 0: 512, 1: 512, 2: 512, 3: 512, 4: 512, 5: 512 },
    };
  }

  getState(): RuntimeState {
    return { ...this.state };
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  setSensorValue(key: string, value: number) {
    this.sensorFeed[key] = value;
  }

  setAdcValue(pin: number, value: number) {
    this.state.adcValues[pin] = Math.max(0, Math.min(1023, value));
  }

  compile(code: string): boolean {
    this.state = this.createInitialState();
    try {
      const { setupBody, loopBody, functions } = this.parseArduinoCode(code);
      this.customFunctions = functions;
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

  private parseArduinoCode(code: string): { setupBody: string; loopBody: string; functions: Record<string, string[]> } {
    const cleaned = code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');

    const setupMatch = cleaned.match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\n\}/);
    const loopMatch = cleaned.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\n\}/);

    // Parse custom functions
    const functions: Record<string, string[]> = {};
    const funcRegex = /void\s+(\w+)\s*\(\s*\)\s*\{([\s\S]*?)\n\}/g;
    let m;
    while ((m = funcRegex.exec(cleaned)) !== null) {
      if (m[1] !== 'setup' && m[1] !== 'loop') {
        functions[m[1]] = m[2].trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
      }
    }

    return {
      setupBody: setupMatch?.[1]?.trim() || '',
      loopBody: loopMatch?.[1]?.trim() || '',
      functions,
    };
  }

  private createExecutable(body: string): () => Promise<void> {
    const lines = body.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    return async () => {
      await this.executeLines(lines);
    };
  }

  private async executeLines(lines: string[]): Promise<void> {
    let i = 0;
    while (i < lines.length) {
      if (!this.state.running || this.state.paused) break;
      if (this.abortController?.signal.aborted) break;

      const line = lines[i];

      // Handle for loops
      const forMatch = line.match(/for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*(\d+)\s*;\s*\w+\s*(<|<=|>|>=)\s*(\d+)\s*;\s*\w+(\+\+|--)\s*\)\s*\{?/);
      if (forMatch) {
        const varName = forMatch[1];
        let current = parseInt(forMatch[2]);
        const op = forMatch[3];
        const limit = parseInt(forMatch[4]);
        const inc = forMatch[5] === '++' ? 1 : -1;

        // Find matching closing brace
        const blockLines = this.extractBlock(lines, i + 1);
        i += blockLines.length + 2; // skip for line + block + closing brace

        const condition = () => {
          switch (op) {
            case '<': return current < limit;
            case '<=': return current <= limit;
            case '>': return current > limit;
            case '>=': return current >= limit;
            default: return false;
          }
        };

        while (condition() && this.state.running && !this.abortController?.signal.aborted) {
          this.state.variables[varName] = current;
          await this.executeLines(blockLines);
          current += inc;
        }
        continue;
      }

      // Handle if/else
      const ifMatch = line.match(/if\s*\(\s*(.+)\s*\)\s*\{?/);
      if (ifMatch && !line.startsWith('else')) {
        const condition = this.evaluateCondition(ifMatch[1]);
        const blockLines = this.extractBlock(lines, i + 1);
        i += blockLines.length + 2;

        // Check for else
        let elseLines: string[] = [];
        if (i < lines.length && lines[i]?.match(/^\s*(\}\s*)?else\s*\{?/)) {
          elseLines = this.extractBlock(lines, i + 1);
          i += elseLines.length + 2;
        }

        if (condition) {
          await this.executeLines(blockLines);
        } else if (elseLines.length > 0) {
          await this.executeLines(elseLines);
        }
        continue;
      }

      // Handle while loops
      const whileMatch = line.match(/while\s*\(\s*(.+)\s*\)\s*\{?/);
      if (whileMatch) {
        const blockLines = this.extractBlock(lines, i + 1);
        i += blockLines.length + 2;
        let iterations = 0;
        while (this.evaluateCondition(whileMatch[1]) && this.state.running && iterations < 10000) {
          await this.executeLines(blockLines);
          iterations++;
        }
        continue;
      }

      // Skip braces
      if (line === '{' || line === '}') { i++; continue; }

      await this.executeLine(line);
      i++;
    }
  }

  private extractBlock(lines: string[], startIdx: number): string[] {
    const block: string[] = [];
    let depth = 0;
    for (let i = startIdx; i < lines.length; i++) {
      const l = lines[i];
      if (l.includes('{')) depth++;
      if (l === '}' || (l.includes('}') && depth === 0)) break;
      if (l.includes('}')) depth--;
      block.push(l);
    }
    return block;
  }

  private evaluateCondition(expr: string): boolean {
    expr = expr.trim();
    // Replace variables
    expr = this.substituteVars(expr);
    try {
      // Simple evaluation for comparison expressions
      const cmpMatch = expr.match(/^(.+?)\s*(==|!=|<=|>=|<|>|&&|\|\|)\s*(.+)$/);
      if (cmpMatch) {
        const left = this.evalNumber(cmpMatch[1].trim());
        const right = this.evalNumber(cmpMatch[3].trim());
        switch (cmpMatch[2]) {
          case '==': return left === right;
          case '!=': return left !== right;
          case '<': return left < right;
          case '>': return left > right;
          case '<=': return left <= right;
          case '>=': return left >= right;
          default: return false;
        }
      }
      // Truthy check
      const val = this.evalNumber(expr);
      return val !== 0;
    } catch {
      return false;
    }
  }

  private substituteVars(expr: string): string {
    return expr.replace(/\b([a-zA-Z_]\w*)\b/g, (match) => {
      if (match === 'HIGH') return '1';
      if (match === 'LOW') return '0';
      if (match in this.state.variables) {
        return String(this.state.variables[match]);
      }
      return match;
    });
  }

  private evalNumber(expr: string): number {
    expr = this.substituteVars(expr.trim());

    // millis()
    if (expr === 'millis()') return this.state.millis;

    // digitalRead(pin)
    const drMatch = expr.match(/digitalRead\s*\(\s*(\d+)\s*\)/);
    if (drMatch) {
      const pin = parseInt(drMatch[1]);
      return (this.state.pinStates[pin] ?? 0) > 127 ? 1 : 0;
    }

    // analogRead(pin)
    const arMatch = expr.match(/analogRead\s*\(\s*(?:A)?(\d+)\s*\)/);
    if (arMatch) {
      const pin = parseInt(arMatch[1]);
      return this.state.adcValues[pin] ?? 512;
    }

    // Try parse as number
    const num = Number(expr);
    if (!isNaN(num)) return num;

    // Simple arithmetic
    try {
      const sanitized = expr.replace(/[^0-9+\-*/().%]/g, '');
      if (sanitized.length > 0) {
        return new Function(`return (${sanitized})`)() as number;
      }
    } catch {}

    return 0;
  }

  private async executeLine(line: string): Promise<void> {
    line = line.replace(/;$/, '').trim();
    if (!line || line === '{' || line === '}') return;

    // Variable declaration: int x = val / float x = val / bool / String
    const declMatch = line.match(/^(?:int|long|float|double|byte|unsigned\s+int|unsigned\s+long)\s+(\w+)\s*=\s*(.+)$/);
    if (declMatch) {
      this.state.variables[declMatch[1]] = this.evalNumber(declMatch[2]);
      return;
    }
    const boolDeclMatch = line.match(/^bool(?:ean)?\s+(\w+)\s*=\s*(.+)$/);
    if (boolDeclMatch) {
      this.state.variables[boolDeclMatch[1]] = boolDeclMatch[2].trim() === 'true' ? 1 : 0;
      return;
    }
    const strDeclMatch = line.match(/^String\s+(\w+)\s*=\s*"(.+)"$/);
    if (strDeclMatch) {
      this.state.variables[strDeclMatch[1]] = strDeclMatch[2];
      return;
    }

    // Variable assignment: x = val
    const assignMatch = line.match(/^(\w+)\s*=\s*(.+)$/);
    if (assignMatch && assignMatch[1] in this.state.variables) {
      this.state.variables[assignMatch[1]] = this.evalNumber(assignMatch[2]);
      return;
    }

    // Increment / decrement
    const incMatch = line.match(/^(\w+)(\+\+|--)$/);
    if (incMatch && incMatch[1] in this.state.variables) {
      const v = Number(this.state.variables[incMatch[1]]) || 0;
      this.state.variables[incMatch[1]] = incMatch[2] === '++' ? v + 1 : v - 1;
      return;
    }

    // Compound assignment: x += val, x -= val
    const compoundMatch = line.match(/^(\w+)\s*(\+=|-=|\*=|\/=)\s*(.+)$/);
    if (compoundMatch && compoundMatch[1] in this.state.variables) {
      const v = Number(this.state.variables[compoundMatch[1]]) || 0;
      const rhs = this.evalNumber(compoundMatch[3]);
      switch (compoundMatch[2]) {
        case '+=': this.state.variables[compoundMatch[1]] = v + rhs; break;
        case '-=': this.state.variables[compoundMatch[1]] = v - rhs; break;
        case '*=': this.state.variables[compoundMatch[1]] = v * rhs; break;
        case '/=': this.state.variables[compoundMatch[1]] = rhs !== 0 ? v / rhs : 0; break;
      }
      return;
    }

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
    const dwMatch = line.match(/digitalWrite\s*\(\s*(\d+)\s*,\s*(HIGH|LOW|1|0|\w+)\s*\)/);
    if (dwMatch) {
      const pin = parseInt(dwMatch[1]);
      let valStr = dwMatch[2];
      let val: number;
      if (valStr === 'HIGH' || valStr === '1') val = 1;
      else if (valStr === 'LOW' || valStr === '0') val = 0;
      else val = this.evalNumber(valStr) > 0 ? 1 : 0;
      this.state.pinStates[pin] = val * 255;
      this.callbacks.onPinChange({ pin, value: val, mode: 'digital' });
      this.callbacks.onStateChange(this.getState());

      // Check interrupts
      this.checkInterrupts(pin, val);
      return;
    }

    // digitalRead(pin) standalone
    const drStandalone = line.match(/(?:int|byte)?\s*(\w+)\s*=\s*digitalRead\s*\(\s*(\d+)\s*\)/);
    if (drStandalone) {
      const pin = parseInt(drStandalone[2]);
      this.state.variables[drStandalone[1]] = (this.state.pinStates[pin] ?? 0) > 127 ? 1 : 0;
      return;
    }

    // analogWrite(pin, value)
    const awMatch = line.match(/analogWrite\s*\(\s*(\d+)\s*,\s*(.+)\s*\)/);
    if (awMatch) {
      const pin = parseInt(awMatch[1]);
      const val = Math.min(255, Math.max(0, Math.round(this.evalNumber(awMatch[2]))));
      this.state.pinStates[pin] = val;
      this.state.pwmChannels[pin] = { frequency: 490, dutyCycle: val, enabled: true };
      this.callbacks.onPinChange({ pin, value: val, mode: 'analog' });
      this.callbacks.onStateChange(this.getState());
      return;
    }

    // analogRead(pin) standalone
    const arStandalone = line.match(/(?:int|unsigned\s+int)?\s*(\w+)\s*=\s*analogRead\s*\(\s*(?:A)?(\d+)\s*\)/);
    if (arStandalone) {
      const pin = parseInt(arStandalone[2]);
      this.state.variables[arStandalone[1]] = this.state.adcValues[pin] ?? 512;
      return;
    }

    // millis() assignment
    const millisMatch = line.match(/(?:unsigned\s+long|long|int)?\s*(\w+)\s*=\s*millis\s*\(\s*\)/);
    if (millisMatch) {
      this.state.variables[millisMatch[1]] = this.state.millis;
      return;
    }

    // Serial.begin(baud)
    if (line.match(/Serial\.begin\s*\(/)) return;

    // Serial.println(...)
    const printlnMatch = line.match(/Serial\.println\s*\(\s*(.+)\s*\)/);
    if (printlnMatch) {
      const text = this.evalPrintArg(printlnMatch[1]);
      const msg: SerialMessage = { timestamp: this.state.millis, text: text + '\n' };
      this.state.serialOutput.push(msg);
      this.callbacks.onSerialOutput(msg);
      return;
    }

    // Serial.print(...)
    const printMatch = line.match(/Serial\.print\s*\(\s*(.+)\s*\)$/);
    if (printMatch) {
      const text = this.evalPrintArg(printMatch[1]);
      const msg: SerialMessage = { timestamp: this.state.millis, text };
      this.state.serialOutput.push(msg);
      this.callbacks.onSerialOutput(msg);
      return;
    }

    // delay(ms)
    const delayMatch = line.match(/delay\s*\(\s*(.+)\s*\)/);
    if (delayMatch) {
      const ms = Math.max(0, this.evalNumber(delayMatch[1]));
      const scaledMs = ms / this.speed;
      await this.sleep(scaledMs);
      this.state.millis += ms;
      this.callbacks.onStateChange(this.getState());
      return;
    }

    // delayMicroseconds
    const delayUsMatch = line.match(/delayMicroseconds\s*\(\s*(.+)\s*\)/);
    if (delayUsMatch) {
      const us = this.evalNumber(delayUsMatch[1]);
      this.state.millis += us / 1000;
      await this.sleep(Math.max(1, us / 1000 / this.speed));
      return;
    }

    // tone(pin, freq)
    const toneMatch = line.match(/tone\s*\(\s*(\d+)\s*,\s*(.+)\s*\)/);
    if (toneMatch) {
      const pin = parseInt(toneMatch[1]);
      this.state.pinStates[pin] = 128;
      this.callbacks.onPinChange({ pin, value: 128, mode: 'analog' });
      return;
    }

    // noTone(pin)
    const noToneMatch = line.match(/noTone\s*\(\s*(\d+)\s*\)/);
    if (noToneMatch) {
      const pin = parseInt(noToneMatch[1]);
      this.state.pinStates[pin] = 0;
      this.callbacks.onPinChange({ pin, value: 0, mode: 'analog' });
      return;
    }

    // attachInterrupt
    const attachMatch = line.match(/attachInterrupt\s*\(\s*(?:digitalPinToInterrupt\s*\(\s*)?(\d+)\s*\)?\s*,\s*(\w+)\s*,\s*(RISING|FALLING|CHANGE)\s*\)/);
    if (attachMatch) {
      this.state.interrupts.push({
        pin: parseInt(attachMatch[1]),
        handler: attachMatch[2],
        mode: attachMatch[3] as 'RISING' | 'FALLING' | 'CHANGE',
        enabled: true,
      });
      return;
    }

    // Wire.begin() / Wire.beginTransmission / Wire.write / Wire.endTransmission
    if (line.match(/Wire\.begin\s*\(/)) return;
    const wireBeginTx = line.match(/Wire\.beginTransmission\s*\(\s*(.+)\s*\)/);
    if (wireBeginTx) {
      this.i2c.beginTransmission(this.evalNumber(wireBeginTx[1]));
      return;
    }
    const wireWrite = line.match(/Wire\.write\s*\(\s*(.+)\s*\)/);
    if (wireWrite) {
      // Queue write
      return;
    }
    if (line.match(/Wire\.endTransmission/)) return;

    // SPI.begin / SPI.transfer
    if (line.match(/SPI\.begin\s*\(/)) return;
    const spiTransfer = line.match(/(?:\w+\s*=\s*)?SPI\.transfer\s*\(\s*(.+)\s*\)/);
    if (spiTransfer) return;

    // WiFi.begin (IoT simulation)
    if (line.match(/WiFi\.begin\s*\(/)) return;

    // Custom function calls
    const funcCallMatch = line.match(/^(\w+)\s*\(\s*\)$/);
    if (funcCallMatch && this.customFunctions[funcCallMatch[1]]) {
      await this.executeLines(this.customFunctions[funcCallMatch[1]]);
      return;
    }

    // map() function
    const mapMatch = line.match(/(?:\w+\s*=\s*)?map\s*\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
    if (mapMatch) {
      // variable = map(value, fromLow, fromHigh, toLow, toHigh)
      const varAssign = line.match(/(\w+)\s*=\s*map/);
      if (varAssign) {
        const x = this.evalNumber(mapMatch[1]);
        const inMin = this.evalNumber(mapMatch[2]);
        const inMax = this.evalNumber(mapMatch[3]);
        const outMin = this.evalNumber(mapMatch[4]);
        const outMax = this.evalNumber(mapMatch[5]);
        this.state.variables[varAssign[1]] = Math.round((x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin);
      }
      return;
    }

    // constrain()
    const constrainMatch = line.match(/(\w+)\s*=\s*constrain\s*\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
    if (constrainMatch) {
      const v = this.evalNumber(constrainMatch[2]);
      const lo = this.evalNumber(constrainMatch[3]);
      const hi = this.evalNumber(constrainMatch[4]);
      this.state.variables[constrainMatch[1]] = Math.max(lo, Math.min(hi, v));
      return;
    }
  }

  private evalPrintArg(arg: string): string {
    arg = arg.trim();
    // String literal
    const strMatch = arg.match(/^"(.*)"$/);
    if (strMatch) return strMatch[1];
    // Variable
    if (arg in this.state.variables) return String(this.state.variables[arg]);
    // Expression
    return String(this.evalNumber(arg));
  }

  private checkInterrupts(pin: number, value: number) {
    for (const isr of this.state.interrupts) {
      if (isr.pin !== pin || !isr.enabled) continue;
      const prevVal = (this.state.pinStates[pin] ?? 0) > 127 ? 1 : 0;
      if (isr.mode === 'RISING' && prevVal === 0 && value === 1) {
        // Trigger ISR
        if (this.customFunctions[isr.handler]) {
          this.executeLines(this.customFunctions[isr.handler]);
        }
      } else if (isr.mode === 'FALLING' && prevVal === 1 && value === 0) {
        if (this.customFunctions[isr.handler]) {
          this.executeLines(this.customFunctions[isr.handler]);
        }
      } else if (isr.mode === 'CHANGE') {
        if (this.customFunctions[isr.handler]) {
          this.executeLines(this.customFunctions[isr.handler]);
        }
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
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

    if (this.setupFn) {
      await this.setupFn();
    }

    while (this.state.running && !this.abortController.signal.aborted) {
      if (this.state.paused) {
        await this.sleep(100);
        continue;
      }
      if (this.loopFn) {
        await this.loopFn();
      }
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
    this.state.pinStates = {};
    this.callbacks.onStateChange(this.getState());
  }

  reset(): void {
    this.stop();
    this.state = this.createInitialState();
    this.callbacks.onStateChange(this.getState());
  }
}
