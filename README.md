# CircuitForge

A browser-based electronics design and simulation platform. Build circuits visually, write Arduino code, and simulate hardware — all in one place.

---

## Features

- **Drag & Drop Canvas** — Place and wire 50+ components including microcontrollers, sensors, displays, and communication modules
- **Dual Simulation Modes** — JavaScript interpreter for fast prototyping, or AVR8js for true AVR bytecode emulation
- **Arduino Code Editor** — Write and run `setup()`/`loop()` code with full support for `digitalWrite`, `analogRead`, PWM, SPI, I2C, UART, and more
- **Netlist Engine** — Automatic connection validation, short circuit detection, floating pin warnings, and power conflict reporting
- **AI Agent** — Built-in assistant that can place components, wire circuits, write code, and install libraries
- **IoT Support** — MQTT broker integration with a real-time IoT dashboard for live data visualization
- **Community Marketplace** — Browse and fork public shared projects, sortable by trending, newest, and most forked
- **Template Library** — Pre-built circuit templates to get started fast
- **Plugin & Library Manager** — Install community Arduino libraries and editor plugins
- **Project Sharing** — Share circuits via URL using Supabase persistent storage

---

## Component Library

| Category | Examples |
|---|---|
| Microcontrollers | Arduino Uno, ESP32 |
| Basic | LED, Resistor, Button, Buzzer, Servo, Relay, Stepper Motor |
| Sensors | Ultrasonic, DHT22, MPU6050, PIR, MQ-2 Gas, Soil Moisture |
| Displays | LCD 16x2/20x4, OLED, TFT, 7-Segment, LED Matrix |
| Input | Keypad, Rotary Encoder, Joystick, Capacitive Touch |
| Communication | LoRa, GPS, Bluetooth HC-05, NRF24L01 |
| Modules | RTC DS3231, SD Card, Motor Driver L298N, EEPROM |

---

## Tech Stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://zustand-demo.pmnd.rs/) — state management
- [Supabase](https://supabase.com/) — project sharing & storage
- [AVR8js](https://github.com/wokwi/avr8js) — AVR simulation engine

---

## Getting Started

**Requirements:** Node.js & npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Clone the repo
git clone <YOUR_GIT_URL>

# Navigate into the project
cd circuit-canvas

# Install dependencies
npm install

# Start the dev server
npm run dev
```

---

## Project Structure

```
src/
├── pages/          # Main CircuitEditor page
├── components/     # UI panels, canvas, sidebar, modals
├── engine/         # ArduinoRuntime & NetlistEngine
├── store/          # Zustand stores (circuit, simulation)
└── data/           # Component definitions, templates
```

---

## License

MIT
