import { ComponentDefinition } from '@/types/circuit';

export const COMPONENT_DEFINITIONS: Record<string, ComponentDefinition> = {
  // ===== Microcontrollers =====
  'arduino-uno': {
    type: 'arduino-uno', category: 'Microcontrollers', name: 'Arduino Uno', width: 140, height: 200, color: '#0d7377', icon: '🔲',
    pins: [
      ...Array.from({ length: 14 }, (_, i) => ({ id: `d${i}`, name: `D${i}`, type: 'digital' as const, direction: 'bidirectional' as const, offsetX: 140, offsetY: 20 + i * 12 })),
      ...Array.from({ length: 6 }, (_, i) => ({ id: `a${i}`, name: `A${i}`, type: 'analog' as const, direction: 'input' as const, offsetX: 0, offsetY: 20 + i * 12 })),
      { id: '5v', name: '5V', type: 'power' as const, direction: 'output' as const, offsetX: 0, offsetY: 100 },
      { id: '3v3', name: '3.3V', type: 'power' as const, direction: 'output' as const, offsetX: 0, offsetY: 112 },
      { id: 'gnd1', name: 'GND', type: 'ground' as const, direction: 'output' as const, offsetX: 0, offsetY: 124 },
      { id: 'gnd2', name: 'GND', type: 'ground' as const, direction: 'output' as const, offsetX: 0, offsetY: 136 },
      { id: 'vin', name: 'VIN', type: 'power' as const, direction: 'input' as const, offsetX: 0, offsetY: 148 },
    ],
    defaultProperties: { boardName: 'Arduino Uno', clockSpeed: 16 },
  },
  esp32: {
    type: 'esp32', category: 'Microcontrollers', name: 'ESP32', width: 120, height: 220, color: '#e53935', icon: '📶',
    pins: [
      ...Array.from({ length: 16 }, (_, i) => ({ id: `gpio${i}`, name: `GPIO${i}`, type: 'digital' as const, direction: 'bidirectional' as const, offsetX: 0, offsetY: 16 + i * 12 })),
      ...Array.from({ length: 10 }, (_, i) => ({ id: `gpio${i + 16}`, name: `GPIO${i + 16}`, type: 'digital' as const, direction: 'bidirectional' as const, offsetX: 120, offsetY: 16 + i * 12 })),
      ...Array.from({ length: 6 }, (_, i) => ({ id: `adc${i}`, name: `ADC${i}`, type: 'analog' as const, direction: 'input' as const, offsetX: 120, offsetY: 136 + i * 12 })),
      { id: '3v3', name: '3.3V', type: 'power' as const, direction: 'output' as const, offsetX: 0, offsetY: 200 },
      { id: 'gnd1', name: 'GND', type: 'ground' as const, direction: 'output' as const, offsetX: 0, offsetY: 212 },
      { id: 'vin', name: 'VIN', type: 'power' as const, direction: 'input' as const, offsetX: 120, offsetY: 200 },
      { id: 'gnd2', name: 'GND', type: 'ground' as const, direction: 'output' as const, offsetX: 120, offsetY: 212 },
    ],
    defaultProperties: { boardName: 'ESP32 DevKit', clockSpeed: 240, wifiEnabled: true, ssid: 'CircuitForge_Net' },
  },

  // ===== Basic Components =====
  led: {
    type: 'led', category: 'Basic Components', name: 'LED', width: 40, height: 50, color: '#ef4444', icon: '💡',
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'signal', direction: 'input', offsetX: 20, offsetY: 0 },
      { id: 'cathode', name: 'Cathode (-)', type: 'signal', direction: 'output', offsetX: 20, offsetY: 50 },
    ],
    defaultProperties: { color: 'red', brightness: 100 },
  },
  resistor: {
    type: 'resistor', category: 'Basic Components', name: 'Resistor', width: 60, height: 24, color: '#d4a574', icon: '⚡',
    pins: [
      { id: 'terminal1', name: 'Terminal 1', type: 'signal', direction: 'bidirectional', offsetX: 0, offsetY: 12 },
      { id: 'terminal2', name: 'Terminal 2', type: 'signal', direction: 'bidirectional', offsetX: 60, offsetY: 12 },
    ],
    defaultProperties: { resistance: 220 },
  },
  'push-button': {
    type: 'push-button', category: 'Basic Components', name: 'Push Button', width: 40, height: 40, color: '#6366f1', icon: '🔘',
    pins: [
      { id: 'pin1', name: 'Pin 1', type: 'signal', direction: 'bidirectional', offsetX: 0, offsetY: 10 },
      { id: 'pin2', name: 'Pin 2', type: 'signal', direction: 'bidirectional', offsetX: 40, offsetY: 10 },
      { id: 'pin3', name: 'Pin 3', type: 'signal', direction: 'bidirectional', offsetX: 0, offsetY: 30 },
      { id: 'pin4', name: 'Pin 4', type: 'signal', direction: 'bidirectional', offsetX: 40, offsetY: 30 },
    ],
    defaultProperties: { state: 'open' },
  },
  breadboard: {
    type: 'breadboard', category: 'Basic Components', name: 'Breadboard', width: 200, height: 120, color: '#f5f5dc', icon: '📋',
    pins: [], defaultProperties: { rows: 30 },
  },
  buzzer: {
    type: 'buzzer', category: 'Basic Components', name: 'Buzzer', width: 36, height: 36, color: '#1e1e1e', icon: '🔊',
    pins: [
      { id: 'positive', name: '+', type: 'signal', direction: 'input', offsetX: 12, offsetY: 0 },
      { id: 'negative', name: '-', type: 'ground', direction: 'input', offsetX: 24, offsetY: 0 },
    ],
    defaultProperties: { frequency: 1000, active: false },
  },
  'servo-motor': {
    type: 'servo-motor', category: 'Basic Components', name: 'Servo Motor', width: 56, height: 40, color: '#2563eb', icon: '⚙️',
    pins: [
      { id: 'signal', name: 'Signal', type: 'digital', direction: 'input', offsetX: 14, offsetY: 40 },
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 28, offsetY: 40 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 42, offsetY: 40 },
    ],
    defaultProperties: { angle: 90, minAngle: 0, maxAngle: 180 },
  },
  relay: {
    type: 'relay', category: 'Basic Components', name: 'Relay Module', width: 50, height: 50, color: '#1d4ed8', icon: '🔌',
    pins: [
      { id: 'signal', name: 'SIG', type: 'digital', direction: 'input', offsetX: 25, offsetY: 0 },
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 10, offsetY: 0 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 40, offsetY: 0 },
      { id: 'com', name: 'COM', type: 'signal', direction: 'bidirectional', offsetX: 10, offsetY: 50 },
      { id: 'no', name: 'NO', type: 'signal', direction: 'bidirectional', offsetX: 25, offsetY: 50 },
      { id: 'nc', name: 'NC', type: 'signal', direction: 'bidirectional', offsetX: 40, offsetY: 50 },
    ],
    defaultProperties: { state: 'open', coilVoltage: 5 },
  },
  'rgb-led-strip': {
    type: 'rgb-led-strip', category: 'Basic Components', name: 'RGB LED Strip (WS2812)', width: 100, height: 30, color: '#7c3aed', icon: '🌈',
    pins: [
      { id: 'din', name: 'DIN', type: 'digital', direction: 'input', offsetX: 0, offsetY: 15 },
      { id: 'dout', name: 'DOUT', type: 'digital', direction: 'output', offsetX: 100, offsetY: 15 },
      { id: 'vcc', name: '5V', type: 'power', direction: 'input', offsetX: 30, offsetY: 30 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 70, offsetY: 30 },
    ],
    defaultProperties: { numLeds: 8, color1: '#ff0000', color2: '#00ff00', color3: '#0000ff' },
  },
  'stepper-motor': {
    type: 'stepper-motor', category: 'Basic Components', name: 'Stepper Motor', width: 50, height: 50, color: '#059669', icon: '🔄',
    pins: [
      { id: 'coil1a', name: 'A+', type: 'signal', direction: 'input', offsetX: 10, offsetY: 50 },
      { id: 'coil1b', name: 'A-', type: 'signal', direction: 'input', offsetX: 20, offsetY: 50 },
      { id: 'coil2a', name: 'B+', type: 'signal', direction: 'input', offsetX: 30, offsetY: 50 },
      { id: 'coil2b', name: 'B-', type: 'signal', direction: 'input', offsetX: 40, offsetY: 50 },
    ],
    defaultProperties: { stepsPerRev: 2048, currentStep: 0, speed: 10 },
  },

  // ===== Sensors =====
  'ultrasonic-sensor': {
    type: 'ultrasonic-sensor', category: 'Sensors', name: 'Ultrasonic Sensor', width: 60, height: 50, color: '#06b6d4', icon: '📡',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 10, offsetY: 50 },
      { id: 'trig', name: 'TRIG', type: 'digital', direction: 'input', offsetX: 22, offsetY: 50 },
      { id: 'echo', name: 'ECHO', type: 'digital', direction: 'output', offsetX: 38, offsetY: 50 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 50, offsetY: 50 },
    ],
    defaultProperties: { maxRange: 400, distance: 100 },
  },
  potentiometer: {
    type: 'potentiometer', category: 'Sensors', name: 'Potentiometer', width: 44, height: 44, color: '#3b82f6', icon: '🎛️',
    pins: [
      { id: 'pin1', name: 'Pin 1', type: 'signal', direction: 'bidirectional', offsetX: 6, offsetY: 44 },
      { id: 'wiper', name: 'Wiper', type: 'analog', direction: 'output', offsetX: 22, offsetY: 44 },
      { id: 'pin3', name: 'Pin 3', type: 'signal', direction: 'bidirectional', offsetX: 38, offsetY: 44 },
    ],
    defaultProperties: { value: 512, maxResistance: 10000 },
  },
  'temperature-sensor': {
    type: 'temperature-sensor', category: 'Sensors', name: 'Temperature Sensor', width: 30, height: 40, color: '#f59e0b', icon: '🌡️',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 6, offsetY: 40 },
      { id: 'data', name: 'DATA', type: 'analog', direction: 'output', offsetX: 15, offsetY: 40 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 24, offsetY: 40 },
    ],
    defaultProperties: { temperature: 25, minTemp: -40, maxTemp: 125 },
  },
  'humidity-sensor': {
    type: 'humidity-sensor', category: 'Sensors', name: 'Humidity Sensor (DHT22)', width: 36, height: 44, color: '#14b8a6', icon: '💧',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 6, offsetY: 44 },
      { id: 'data', name: 'DATA', type: 'digital', direction: 'bidirectional', offsetX: 18, offsetY: 44 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 30, offsetY: 44 },
    ],
    defaultProperties: { humidity: 50, temperature: 25 },
  },
  'light-sensor': {
    type: 'light-sensor', category: 'Sensors', name: 'Light Sensor (LDR)', width: 30, height: 30, color: '#eab308', icon: '☀️',
    pins: [
      { id: 'pin1', name: 'Pin 1', type: 'signal', direction: 'bidirectional', offsetX: 6, offsetY: 30 },
      { id: 'pin2', name: 'Pin 2', type: 'signal', direction: 'bidirectional', offsetX: 24, offsetY: 30 },
    ],
    defaultProperties: { lux: 500, resistance: 10000 },
  },
  accelerometer: {
    type: 'accelerometer', category: 'Sensors', name: 'Accelerometer (MPU6050)', width: 40, height: 44, color: '#8b5cf6', icon: '📐',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 6, offsetY: 44 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 16, offsetY: 44 },
      { id: 'sda', name: 'SDA', type: 'signal', direction: 'bidirectional', offsetX: 26, offsetY: 44 },
      { id: 'scl', name: 'SCL', type: 'signal', direction: 'bidirectional', offsetX: 36, offsetY: 44 },
    ],
    defaultProperties: { accelX: 0, accelY: 0, accelZ: 9.8, gyroX: 0, gyroY: 0, gyroZ: 0, i2cAddress: 104 },
  },
  'bme280': {
    type: 'bme280', category: 'Sensors', name: 'BME280 Environmental', width: 36, height: 36, color: '#0d9488', icon: '🌤️',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 6, offsetY: 36 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 14, offsetY: 36 },
      { id: 'sda', name: 'SDA', type: 'signal', direction: 'bidirectional', offsetX: 22, offsetY: 36 },
      { id: 'scl', name: 'SCL', type: 'signal', direction: 'input', offsetX: 30, offsetY: 36 },
    ],
    defaultProperties: { temperature: 25, humidity: 50, pressure: 1013.25, i2cAddress: 118, bus: 'I2C' },
  },
  'bmp280': {
    type: 'bmp280', category: 'Sensors', name: 'BMP280 Pressure', width: 36, height: 36, color: '#0891b2', icon: '🌡️',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 6, offsetY: 36 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 14, offsetY: 36 },
      { id: 'sda', name: 'SDA', type: 'signal', direction: 'bidirectional', offsetX: 22, offsetY: 36 },
      { id: 'scl', name: 'SCL', type: 'signal', direction: 'input', offsetX: 30, offsetY: 36 },
    ],
    defaultProperties: { temperature: 25, pressure: 1013.25, altitude: 0, i2cAddress: 119, bus: 'I2C' },
  },
  'pir-sensor': {
    type: 'pir-sensor', category: 'Sensors', name: 'PIR Motion Sensor', width: 44, height: 44, color: '#dc2626', icon: '🚶',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 8, offsetY: 44 },
      { id: 'signal', name: 'OUT', type: 'digital', direction: 'output', offsetX: 22, offsetY: 44 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 36, offsetY: 44 },
    ],
    defaultProperties: { motionDetected: false, sensitivity: 50, delay: 2 },
  },
  'mq2-sensor': {
    type: 'mq2-sensor', category: 'Sensors', name: 'MQ-2 Gas Sensor', width: 40, height: 44, color: '#b45309', icon: '💨',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 6, offsetY: 44 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 16, offsetY: 44 },
      { id: 'aout', name: 'AOUT', type: 'analog', direction: 'output', offsetX: 26, offsetY: 44 },
      { id: 'dout', name: 'DOUT', type: 'digital', direction: 'output', offsetX: 34, offsetY: 44 },
    ],
    defaultProperties: { gasLevel: 100, threshold: 400 },
  },
  'soil-moisture': {
    type: 'soil-moisture', category: 'Sensors', name: 'Soil Moisture Sensor', width: 30, height: 60, color: '#65a30d', icon: '🌱',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 6, offsetY: 0 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 15, offsetY: 0 },
      { id: 'aout', name: 'AOUT', type: 'analog', direction: 'output', offsetX: 24, offsetY: 0 },
    ],
    defaultProperties: { moisture: 50, minMoisture: 0, maxMoisture: 100 },
  },
  'ir-receiver': {
    type: 'ir-receiver', category: 'Sensors', name: 'IR Receiver', width: 30, height: 30, color: '#7c2d12', icon: '📱',
    pins: [
      { id: 'signal', name: 'OUT', type: 'digital', direction: 'output', offsetX: 6, offsetY: 30 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 15, offsetY: 30 },
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 24, offsetY: 30 },
    ],
    defaultProperties: { lastCode: '0xFF00FF', protocol: 'NEC' },
  },
  'hall-effect': {
    type: 'hall-effect', category: 'Sensors', name: 'Hall Effect Sensor', width: 24, height: 30, color: '#4338ca', icon: '🧲',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 4, offsetY: 30 },
      { id: 'signal', name: 'OUT', type: 'digital', direction: 'output', offsetX: 12, offsetY: 30 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 20, offsetY: 30 },
    ],
    defaultProperties: { magnetDetected: false, fieldStrength: 0 },
  },

  // ===== Displays =====
  'lcd-16x2': {
    type: 'lcd-16x2', category: 'Displays', name: 'LCD 16×2', width: 160, height: 80, color: '#22c55e', icon: '🖥️',
    pins: [
      { id: 'vss', name: 'VSS', type: 'ground', direction: 'input', offsetX: 10, offsetY: 80 },
      { id: 'vdd', name: 'VDD', type: 'power', direction: 'input', offsetX: 20, offsetY: 80 },
      { id: 'vo', name: 'V0', type: 'analog', direction: 'input', offsetX: 30, offsetY: 80 },
      { id: 'rs', name: 'RS', type: 'digital', direction: 'input', offsetX: 40, offsetY: 80 },
      { id: 'rw', name: 'RW', type: 'digital', direction: 'input', offsetX: 50, offsetY: 80 },
      { id: 'e', name: 'E', type: 'digital', direction: 'input', offsetX: 60, offsetY: 80 },
      { id: 'd4', name: 'D4', type: 'digital', direction: 'bidirectional', offsetX: 100, offsetY: 80 },
      { id: 'd5', name: 'D5', type: 'digital', direction: 'bidirectional', offsetX: 110, offsetY: 80 },
      { id: 'd6', name: 'D6', type: 'digital', direction: 'bidirectional', offsetX: 120, offsetY: 80 },
      { id: 'd7', name: 'D7', type: 'digital', direction: 'bidirectional', offsetX: 130, offsetY: 80 },
    ],
    defaultProperties: { text: 'Hello World!', backlight: true },
  },
  'oled-display': {
    type: 'oled-display', category: 'Displays', name: 'OLED 128×64 (SSD1306)', width: 80, height: 60, color: '#0f172a', icon: '📺',
    pins: [
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 12, offsetY: 60 },
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 28, offsetY: 60 },
      { id: 'scl', name: 'SCL', type: 'signal', direction: 'input', offsetX: 44, offsetY: 60 },
      { id: 'sda', name: 'SDA', type: 'signal', direction: 'bidirectional', offsetX: 60, offsetY: 60 },
    ],
    defaultProperties: { text: '', width: 128, height: 64, i2cAddress: 60, bus: 'I2C' },
  },
  'sh1106-oled': {
    type: 'sh1106-oled', category: 'Displays', name: 'OLED 128×64 (SH1106)', width: 80, height: 60, color: '#1e1b4b', icon: '📺',
    pins: [
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 12, offsetY: 60 },
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 28, offsetY: 60 },
      { id: 'scl', name: 'SCL', type: 'signal', direction: 'input', offsetX: 44, offsetY: 60 },
      { id: 'sda', name: 'SDA', type: 'signal', direction: 'bidirectional', offsetX: 60, offsetY: 60 },
    ],
    defaultProperties: { text: '', width: 128, height: 64, i2cAddress: 60, bus: 'I2C' },
  },
  'ili9341-tft': {
    type: 'ili9341-tft', category: 'Displays', name: 'ILI9341 TFT 2.4"', width: 100, height: 130, color: '#1e40af', icon: '🖼️',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 10, offsetY: 130 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 22, offsetY: 130 },
      { id: 'cs', name: 'CS', type: 'digital', direction: 'input', offsetX: 34, offsetY: 130 },
      { id: 'rst', name: 'RST', type: 'digital', direction: 'input', offsetX: 46, offsetY: 130 },
      { id: 'dc', name: 'DC', type: 'digital', direction: 'input', offsetX: 58, offsetY: 130 },
      { id: 'mosi', name: 'MOSI', type: 'signal', direction: 'input', offsetX: 70, offsetY: 130 },
      { id: 'sck', name: 'SCK', type: 'signal', direction: 'input', offsetX: 82, offsetY: 130 },
      { id: 'miso', name: 'MISO', type: 'signal', direction: 'output', offsetX: 94, offsetY: 130 },
    ],
    defaultProperties: { width: 320, height: 240, rotation: 0, bus: 'SPI' },
  },
  'st7789-tft': {
    type: 'st7789-tft', category: 'Displays', name: 'ST7789 TFT 1.3"', width: 70, height: 90, color: '#7e22ce', icon: '🖼️',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 10, offsetY: 90 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 20, offsetY: 90 },
      { id: 'cs', name: 'CS', type: 'digital', direction: 'input', offsetX: 30, offsetY: 90 },
      { id: 'dc', name: 'DC', type: 'digital', direction: 'input', offsetX: 40, offsetY: 90 },
      { id: 'mosi', name: 'MOSI', type: 'signal', direction: 'input', offsetX: 50, offsetY: 90 },
      { id: 'sck', name: 'SCK', type: 'signal', direction: 'input', offsetX: 60, offsetY: 90 },
    ],
    defaultProperties: { width: 240, height: 240, rotation: 0, bus: 'SPI' },
  },
  'lcd-20x4': {
    type: 'lcd-20x4', category: 'Displays', name: 'LCD 20×4 (I2C)', width: 180, height: 80, color: '#166534', icon: '🖥️',
    pins: [
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 40, offsetY: 80 },
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 60, offsetY: 80 },
      { id: 'sda', name: 'SDA', type: 'signal', direction: 'bidirectional', offsetX: 100, offsetY: 80 },
      { id: 'scl', name: 'SCL', type: 'signal', direction: 'input', offsetX: 120, offsetY: 80 },
    ],
    defaultProperties: { text: 'Hello World!', backlight: true, i2cAddress: 39, bus: 'I2C' },
  },
  '7-segment': {
    type: '7-segment', category: 'Displays', name: '7-Segment Display', width: 50, height: 60, color: '#dc2626', icon: '8️⃣',
    pins: [
      { id: 'a', name: 'A', type: 'digital', direction: 'input', offsetX: 5, offsetY: 60 },
      { id: 'b', name: 'B', type: 'digital', direction: 'input', offsetX: 12, offsetY: 60 },
      { id: 'c', name: 'C', type: 'digital', direction: 'input', offsetX: 19, offsetY: 60 },
      { id: 'd', name: 'D', type: 'digital', direction: 'input', offsetX: 26, offsetY: 60 },
      { id: 'e', name: 'E', type: 'digital', direction: 'input', offsetX: 33, offsetY: 60 },
      { id: 'f', name: 'F', type: 'digital', direction: 'input', offsetX: 40, offsetY: 60 },
      { id: 'g', name: 'G', type: 'digital', direction: 'input', offsetX: 47, offsetY: 60 },
      { id: 'com', name: 'COM', type: 'ground', direction: 'input', offsetX: 25, offsetY: 0 },
    ],
    defaultProperties: { digit: 0, commonType: 'cathode' },
  },
  'led-matrix': {
    type: 'led-matrix', category: 'Displays', name: 'LED Matrix 8×8', width: 70, height: 70, color: '#7c3aed', icon: '🔢',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 10, offsetY: 70 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 25, offsetY: 70 },
      { id: 'din', name: 'DIN', type: 'digital', direction: 'input', offsetX: 40, offsetY: 70 },
      { id: 'cs', name: 'CS', type: 'digital', direction: 'input', offsetX: 55, offsetY: 70 },
      { id: 'clk', name: 'CLK', type: 'digital', direction: 'input', offsetX: 65, offsetY: 70 },
    ],
    defaultProperties: { pattern: '0000000000000000', bus: 'SPI', brightness: 8 },
  },

  // ===== Input Devices =====
  keypad: {
    type: 'keypad', category: 'Input Devices', name: 'Keypad 4×4', width: 60, height: 60, color: '#374151', icon: '🔢',
    pins: [
      ...Array.from({ length: 4 }, (_, i) => ({ id: `r${i}`, name: `R${i}`, type: 'digital' as const, direction: 'bidirectional' as const, offsetX: 8 + i * 14, offsetY: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ id: `c${i}`, name: `C${i}`, type: 'digital' as const, direction: 'bidirectional' as const, offsetX: 8 + i * 14, offsetY: 60 })),
    ],
    defaultProperties: { keyPressed: '' },
  },
  'rotary-encoder': {
    type: 'rotary-encoder', category: 'Input Devices', name: 'Rotary Encoder', width: 40, height: 40, color: '#4b5563', icon: '🔁',
    pins: [
      { id: 'clk', name: 'CLK', type: 'digital', direction: 'output', offsetX: 6, offsetY: 40 },
      { id: 'dt', name: 'DT', type: 'digital', direction: 'output', offsetX: 16, offsetY: 40 },
      { id: 'sw', name: 'SW', type: 'digital', direction: 'output', offsetX: 26, offsetY: 40 },
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 34, offsetY: 40 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 40, offsetY: 20 },
    ],
    defaultProperties: { position: 0, pressed: false },
  },
  'joystick': {
    type: 'joystick', category: 'Input Devices', name: 'Joystick Module', width: 44, height: 44, color: '#1f2937', icon: '🕹️',
    pins: [
      { id: 'vrx', name: 'VRx', type: 'analog', direction: 'output', offsetX: 6, offsetY: 44 },
      { id: 'vry', name: 'VRy', type: 'analog', direction: 'output', offsetX: 16, offsetY: 44 },
      { id: 'sw', name: 'SW', type: 'digital', direction: 'output', offsetX: 26, offsetY: 44 },
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 36, offsetY: 44 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 44, offsetY: 22 },
    ],
    defaultProperties: { xValue: 512, yValue: 512, pressed: false },
  },
  'capacitive-touch': {
    type: 'capacitive-touch', category: 'Input Devices', name: 'Capacitive Touch Pad', width: 60, height: 30, color: '#0e7490', icon: '👆',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 10, offsetY: 30 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 20, offsetY: 30 },
      { id: 'sig', name: 'SIG', type: 'digital', direction: 'output', offsetX: 40, offsetY: 30 },
    ],
    defaultProperties: { touched: false, sensitivity: 50 },
  },
  'fingerprint': {
    type: 'fingerprint', category: 'Input Devices', name: 'Fingerprint Module', width: 50, height: 50, color: '#991b1b', icon: '🔏',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 8, offsetY: 50 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 18, offsetY: 50 },
      { id: 'tx', name: 'TX', type: 'signal', direction: 'output', offsetX: 32, offsetY: 50 },
      { id: 'rx', name: 'RX', type: 'signal', direction: 'input', offsetX: 42, offsetY: 50 },
    ],
    defaultProperties: { enrolled: 0, lastMatch: -1, bus: 'UART' },
  },

  // ===== Communication =====
  'lora-module': {
    type: 'lora-module', category: 'Communication', name: 'LoRa Module (SX1278)', width: 50, height: 50, color: '#1d4ed8', icon: '📻',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 6, offsetY: 50 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 16, offsetY: 50 },
      { id: 'mosi', name: 'MOSI', type: 'signal', direction: 'input', offsetX: 26, offsetY: 50 },
      { id: 'miso', name: 'MISO', type: 'signal', direction: 'output', offsetX: 36, offsetY: 50 },
      { id: 'sck', name: 'SCK', type: 'signal', direction: 'input', offsetX: 44, offsetY: 50 },
      { id: 'cs', name: 'CS', type: 'digital', direction: 'input', offsetX: 50, offsetY: 25 },
    ],
    defaultProperties: { frequency: 915, spreadingFactor: 7, bandwidth: 125, bus: 'SPI' },
  },
  'gps-module': {
    type: 'gps-module', category: 'Communication', name: 'GPS Module (NEO-6M)', width: 50, height: 50, color: '#15803d', icon: '🛰️',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 8, offsetY: 50 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 18, offsetY: 50 },
      { id: 'tx', name: 'TX', type: 'signal', direction: 'output', offsetX: 32, offsetY: 50 },
      { id: 'rx', name: 'RX', type: 'signal', direction: 'input', offsetX: 42, offsetY: 50 },
    ],
    defaultProperties: { latitude: 37.7749, longitude: -122.4194, altitude: 10, satellites: 8, bus: 'UART' },
  },
  'bluetooth-module': {
    type: 'bluetooth-module', category: 'Communication', name: 'Bluetooth (HC-05)', width: 44, height: 40, color: '#2563eb', icon: '🔵',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 6, offsetY: 40 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 16, offsetY: 40 },
      { id: 'tx', name: 'TX', type: 'signal', direction: 'output', offsetX: 28, offsetY: 40 },
      { id: 'rx', name: 'RX', type: 'signal', direction: 'input', offsetX: 38, offsetY: 40 },
    ],
    defaultProperties: { paired: false, deviceName: 'HC-05', baudRate: 9600, bus: 'UART' },
  },
  'nrf24l01': {
    type: 'nrf24l01', category: 'Communication', name: 'NRF24L01 Radio', width: 50, height: 40, color: '#065f46', icon: '📡',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 6, offsetY: 40 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 14, offsetY: 40 },
      { id: 'ce', name: 'CE', type: 'digital', direction: 'input', offsetX: 22, offsetY: 40 },
      { id: 'csn', name: 'CSN', type: 'digital', direction: 'input', offsetX: 30, offsetY: 40 },
      { id: 'mosi', name: 'MOSI', type: 'signal', direction: 'input', offsetX: 38, offsetY: 40 },
      { id: 'miso', name: 'MISO', type: 'signal', direction: 'output', offsetX: 44, offsetY: 20 },
      { id: 'sck', name: 'SCK', type: 'signal', direction: 'input', offsetX: 50, offsetY: 20 },
    ],
    defaultProperties: { channel: 76, dataRate: 1, bus: 'SPI' },
  },

  // ===== Modules =====
  'rtc-module': {
    type: 'rtc-module', category: 'Modules', name: 'RTC (DS3231)', width: 40, height: 40, color: '#0891b2', icon: '🕐',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 6, offsetY: 40 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 16, offsetY: 40 },
      { id: 'sda', name: 'SDA', type: 'signal', direction: 'bidirectional', offsetX: 26, offsetY: 40 },
      { id: 'scl', name: 'SCL', type: 'signal', direction: 'input', offsetX: 36, offsetY: 40 },
    ],
    defaultProperties: { i2cAddress: 104, bus: 'I2C' },
  },
  'sd-card': {
    type: 'sd-card', category: 'Modules', name: 'SD Card Module', width: 44, height: 44, color: '#64748b', icon: '💾',
    pins: [
      { id: 'cs', name: 'CS', type: 'digital', direction: 'input', offsetX: 6, offsetY: 44 },
      { id: 'mosi', name: 'MOSI', type: 'signal', direction: 'input', offsetX: 16, offsetY: 44 },
      { id: 'miso', name: 'MISO', type: 'signal', direction: 'output', offsetX: 26, offsetY: 44 },
      { id: 'sck', name: 'SCK', type: 'signal', direction: 'input', offsetX: 36, offsetY: 44 },
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 16, offsetY: 0 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 28, offsetY: 0 },
    ],
    defaultProperties: { bus: 'SPI', capacity: '32GB' },
  },
  'motor-driver': {
    type: 'motor-driver', category: 'Modules', name: 'Motor Driver (L298N)', width: 60, height: 60, color: '#b91c1c', icon: '🏎️',
    pins: [
      { id: 'in1', name: 'IN1', type: 'digital', direction: 'input', offsetX: 10, offsetY: 0 },
      { id: 'in2', name: 'IN2', type: 'digital', direction: 'input', offsetX: 25, offsetY: 0 },
      { id: 'in3', name: 'IN3', type: 'digital', direction: 'input', offsetX: 40, offsetY: 0 },
      { id: 'in4', name: 'IN4', type: 'digital', direction: 'input', offsetX: 55, offsetY: 0 },
      { id: 'ena', name: 'ENA', type: 'digital', direction: 'input', offsetX: 10, offsetY: 60 },
      { id: 'enb', name: 'ENB', type: 'digital', direction: 'input', offsetX: 50, offsetY: 60 },
      { id: 'vcc', name: '12V', type: 'power', direction: 'input', offsetX: 25, offsetY: 60 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 40, offsetY: 60 },
    ],
    defaultProperties: { motorASpeed: 0, motorBSpeed: 0, motorADir: 'forward' },
  },
  'uln2003': {
    type: 'uln2003', category: 'Modules', name: 'ULN2003 Driver', width: 50, height: 50, color: '#7f1d1d', icon: '🔧',
    pins: [
      { id: 'in1', name: 'IN1', type: 'digital', direction: 'input', offsetX: 6, offsetY: 0 },
      { id: 'in2', name: 'IN2', type: 'digital', direction: 'input', offsetX: 18, offsetY: 0 },
      { id: 'in3', name: 'IN3', type: 'digital', direction: 'input', offsetX: 30, offsetY: 0 },
      { id: 'in4', name: 'IN4', type: 'digital', direction: 'input', offsetX: 42, offsetY: 0 },
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 10, offsetY: 50 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 40, offsetY: 50 },
    ],
    defaultProperties: { },
  },
  'eeprom': {
    type: 'eeprom', category: 'Modules', name: 'EEPROM (AT24C256)', width: 36, height: 30, color: '#475569', icon: '💿',
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 6, offsetY: 30 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 14, offsetY: 30 },
      { id: 'sda', name: 'SDA', type: 'signal', direction: 'bidirectional', offsetX: 22, offsetY: 30 },
      { id: 'scl', name: 'SCL', type: 'signal', direction: 'input', offsetX: 30, offsetY: 30 },
    ],
    defaultProperties: { capacity: 32768, i2cAddress: 80, bus: 'I2C' },
  },
  'buzzer-module': {
    type: 'buzzer-module', category: 'Modules', name: 'Passive Buzzer Module', width: 36, height: 36, color: '#292524', icon: '🔔',
    pins: [
      { id: 'signal', name: 'SIG', type: 'digital', direction: 'input', offsetX: 12, offsetY: 36 },
      { id: 'vcc', name: 'VCC', type: 'power', direction: 'input', offsetX: 24, offsetY: 36 },
      { id: 'gnd', name: 'GND', type: 'ground', direction: 'input', offsetX: 36, offsetY: 18 },
    ],
    defaultProperties: { frequency: 440, active: false },
  },
};

export const CATEGORIES = [
  { name: 'Microcontrollers', components: ['arduino-uno', 'esp32'] },
  { name: 'Basic Components', components: ['led', 'resistor', 'push-button', 'breadboard', 'buzzer', 'servo-motor', 'relay', 'rgb-led-strip', 'stepper-motor'] },
  { name: 'Sensors', components: ['ultrasonic-sensor', 'potentiometer', 'temperature-sensor', 'humidity-sensor', 'light-sensor', 'accelerometer', 'bme280', 'bmp280', 'pir-sensor', 'mq2-sensor', 'soil-moisture', 'ir-receiver', 'hall-effect'] },
  { name: 'Displays', components: ['lcd-16x2', 'oled-display', 'sh1106-oled', 'ili9341-tft', 'st7789-tft', 'lcd-20x4', '7-segment', 'led-matrix'] },
  { name: 'Input Devices', components: ['keypad', 'rotary-encoder', 'joystick', 'capacitive-touch', 'fingerprint'] },
  { name: 'Communication', components: ['lora-module', 'gps-module', 'bluetooth-module', 'nrf24l01'] },
  { name: 'Modules', components: ['rtc-module', 'sd-card', 'motor-driver', 'uln2003', 'eeprom', 'buzzer-module'] },
];
