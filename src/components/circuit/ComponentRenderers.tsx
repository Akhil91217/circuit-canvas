import React from 'react';
import { Group, Rect, Circle, Line, Text, Arc, RegularPolygon } from 'react-konva';
import { ComponentDefinition } from '@/types/circuit';

interface RendererProps {
  def: ComponentDefinition;
  properties: Record<string, string | number | boolean>;
  isSimulating?: boolean;
  pinStates?: Record<number, number>;
}

// ===== Arduino Uno — Realistic PCB =====
export function ArduinoUnoRenderer({ def, properties }: RendererProps) {
  return (
    <Group>
      {/* PCB base */}
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#006D6F" cornerRadius={5} stroke="#004D4F" strokeWidth={1.5} />
      {/* Inner trace pattern */}
      <Rect x={3} y={3} width={def.width - 6} height={def.height - 6} stroke="#00897B" strokeWidth={0.5} cornerRadius={4} fill="transparent" />
      {/* Mounting holes */}
      <Circle x={10} y={10} radius={4} fill="#004D4F" stroke="#003838" strokeWidth={0.5} />
      <Circle x={def.width - 10} y={10} radius={4} fill="#004D4F" stroke="#003838" strokeWidth={0.5} />
      <Circle x={10} y={def.height - 10} radius={4} fill="#004D4F" stroke="#003838" strokeWidth={0.5} />
      <Circle x={def.width - 10} y={def.height - 10} radius={4} fill="#004D4F" stroke="#003838" strokeWidth={0.5} />
      {/* USB-B connector */}
      <Rect x={48} y={-2} width={44} height={16} fill="#A0A0A0" cornerRadius={2} stroke="#808080" strokeWidth={1} />
      <Rect x={52} y={1} width={36} height={10} fill="#333" cornerRadius={1} />
      <Text x={56} y={2.5} text="USB" fontSize={7} fill="#AAA" fontFamily="monospace" />
      {/* ATmega328P chip */}
      <Rect x={35} y={68} width={70} height={24} fill="#1a1a2e" cornerRadius={1} stroke="#333" strokeWidth={0.5} />
      {Array.from({ length: 14 }, (_, i) => (
        <React.Fragment key={`chip-pin-${i}`}>
          <Rect x={38 + i * 4.5} y={66} width={2} height={3} fill="#C0C0C0" />
          <Rect x={38 + i * 4.5} y={91} width={2} height={3} fill="#C0C0C0" />
        </React.Fragment>
      ))}
      <Circle x={40} y={74} radius={2} fill="#444" />
      <Text x={48} y={74} text="ATmega328P" fontSize={6} fill="#888" fontFamily="monospace" />
      {/* Crystal oscillator */}
      <Rect x={38} y={98} width={12} height={6} fill="#C0C0C0" cornerRadius={1} stroke="#999" strokeWidth={0.5} />
      <Text x={38} y={106} text="16MHz" fontSize={4} fill="#666" fontFamily="monospace" />
      {/* Power regulator */}
      <Rect x={110} y={45} width={14} height={8} fill="#222" cornerRadius={1} stroke="#444" strokeWidth={0.5} />
      {/* Barrel jack */}
      <Circle x={128} y={10} radius={6} fill="#222" stroke="#444" strokeWidth={1} />
      <Circle x={128} y={10} radius={3} fill="#111" />
      {/* Status LEDs */}
      <Circle x={18} y={180} radius={3} fill="#22c55e" shadowColor="#22c55e" shadowBlur={6} shadowOpacity={0.8} />
      <Text x={25} y={177} text="ON" fontSize={5} fill="#22c55e" fontFamily="monospace" />
      <Circle x={18} y={168} radius={2} fill="#eab308" />
      <Text x={23} y={165.5} text="TX" fontSize={5} fill="#eab308" fontFamily="monospace" />
      <Circle x={18} y={158} radius={2} fill="#eab308" />
      <Text x={23} y={155.5} text="RX" fontSize={5} fill="#eab308" fontFamily="monospace" />
      <Circle x={18} y={148} radius={2} fill="#ef4444" />
      <Text x={23} y={145.5} text="L" fontSize={5} fill="#ef4444" fontFamily="monospace" />
      {/* Reset button */}
      <Circle x={110} y={25} radius={5} fill="#cc3333" stroke="#aa2222" strokeWidth={1} />
      <Circle x={110} y={25} radius={3} fill="#dd4444" />
      <Text x={100} y={33} text="RESET" fontSize={5} fill="#888" fontFamily="monospace" />
      {/* Pin headers */}
      <Rect x={def.width - 4} y={14} width={4} height={168} fill="#333" cornerRadius={1} />
      <Rect x={0} y={14} width={4} height={80} fill="#333" cornerRadius={1} />
      {/* Pin labels */}
      {Array.from({ length: 14 }, (_, i) => (
        <Text key={`dl${i}`} x={def.width - 18} y={17 + i * 12} text={`D${i}`} fontSize={5} fill="#80CBC4" fontFamily="monospace" />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <Text key={`al${i}`} x={6} y={17 + i * 12} text={`A${i}`} fontSize={5} fill="#80CBC4" fontFamily="monospace" />
      ))}
      {/* Board text */}
      <Text x={30} y={42} text="ARDUINO" fontSize={10} fill="#B2DFDB" fontFamily="monospace" fontStyle="bold" />
      <Text x={50} y={54} text="UNO R3" fontSize={8} fill="#80CBC4" fontFamily="monospace" />
      {/* Capacitors */}
      <Rect x={25} y={100} width={4} height={8} fill="#B8860B" cornerRadius={1} />
      <Rect x={32} y={100} width={4} height={8} fill="#B8860B" cornerRadius={1} />
      {/* ICSP header */}
      <Rect x={60} y={def.height - 20} width={16} height={12} fill="#333" cornerRadius={1} />
      {Array.from({ length: 6 }, (_, i) => (
        <Circle key={`icsp${i}`} x={64 + (i % 2) * 8} y={def.height - 16 + Math.floor(i / 2) * 4} radius={1.2} fill="#C0C0C0" />
      ))}
    </Group>
  );
}

// ===== ESP32 DevKit =====
export function ESP32Renderer({ def, properties }: RendererProps) {
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#1a1a2e" cornerRadius={4} stroke="#333" strokeWidth={1.5} />
      {/* Antenna */}
      <Rect x={30} y={2} width={60} height={30} fill="#2d2d44" cornerRadius={3} stroke="#444" strokeWidth={0.5} />
      <Line points={[40, 8, 50, 20, 60, 8, 70, 20, 80, 8]} stroke="#666" strokeWidth={0.8} />
      <Text x={45} y={22} text="ANT" fontSize={6} fill="#666" fontFamily="monospace" />
      {/* ESP32 module */}
      <Rect x={30} y={75} width={60} height={55} fill="#222" cornerRadius={2} stroke="#444" strokeWidth={1} />
      <Rect x={33} y={78} width={54} height={49} fill="#1a1a1a" cornerRadius={1} />
      <Circle x={38} y={83} radius={2} fill="#555" />
      <Text x={40} y={92} text="ESP32" fontSize={9} fill="#e53935" fontFamily="monospace" fontStyle="bold" />
      <Text x={40} y={105} text="WROOM-32" fontSize={5.5} fill="#888" fontFamily="monospace" />
      <Text x={40} y={114} text="Espressif" fontSize={4.5} fill="#666" fontFamily="monospace" />
      {/* USB-C connector */}
      <Rect x={42} y={def.height - 12} width={36} height={12} fill="#A0A0A0" cornerRadius={3} stroke="#888" strokeWidth={0.5} />
      <Rect x={48} y={def.height - 9} width={24} height={6} fill="#666" cornerRadius={2} />
      <Text x={50} y={def.height - 8} text="USB-C" fontSize={4} fill="#333" fontFamily="monospace" />
      {/* Status LED */}
      <Circle x={20} y={def.height - 20} radius={2.5} fill="#e53935" shadowColor="#e53935" shadowBlur={4} />
      <Text x={26} y={def.height - 22} text="PWR" fontSize={4} fill="#e53935" fontFamily="monospace" />
      {/* Pin headers */}
      <Rect x={0} y={36} width={5} height={160} fill="#333" cornerRadius={1} />
      <Rect x={def.width - 5} y={36} width={5} height={160} fill="#333" cornerRadius={1} />
      {/* Pin labels */}
      {Array.from({ length: 16 }, (_, i) => (
        <Text key={`lp${i}`} x={7} y={14 + i * 12} text={`G${i}`} fontSize={4.5} fill="#e57373" fontFamily="monospace" />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <Text key={`rp${i}`} x={def.width - 18} y={14 + i * 12} text={`G${i + 16}`} fontSize={4.5} fill="#e57373" fontFamily="monospace" />
      ))}
      {/* Boot & EN buttons */}
      <Rect x={14} y={def.height - 40} width={10} height={6} fill="#444" cornerRadius={1} stroke="#666" strokeWidth={0.5} />
      <Text x={12} y={def.height - 32} text="BOOT" fontSize={4} fill="#888" fontFamily="monospace" />
      <Rect x={def.width - 24} y={def.height - 40} width={10} height={6} fill="#444" cornerRadius={1} stroke="#666" strokeWidth={0.5} />
      <Text x={def.width - 24} y={def.height - 32} text="EN" fontSize={4} fill="#888" fontFamily="monospace" />
      {/* Board label */}
      <Text x={25} y={142} text="ESP32" fontSize={10} fill="#e53935" fontFamily="monospace" fontStyle="bold" />
      <Text x={22} y={154} text="DevKit v1" fontSize={7} fill="#888" fontFamily="monospace" />
    </Group>
  );
}

// ===== LED with Realistic Glow =====
export function LEDRenderer({ def, properties, pinStates }: RendererProps) {
  const color = (properties.color as string) || 'red';
  const colorMap: Record<string, string> = { red: '#ef4444', green: '#22c55e', blue: '#3b82f6', yellow: '#eab308', white: '#f8fafc' };
  const fill = colorMap[color] || colorMap.red;
  const isOn = pinStates ? Object.values(pinStates).some(v => v > 0) : false;
  const glowOpacity = isOn ? 0.95 : 0.25;
  return (
    <Group>
      {/* LED dome */}
      <Circle x={def.width / 2} y={16} radius={14} fill={fill} opacity={glowOpacity}
        shadowColor={fill} shadowBlur={isOn ? 30 : 4} shadowOpacity={isOn ? 1 : 0.15} />
      {/* Inner highlight */}
      <Circle x={def.width / 2} y={16} radius={10} fill={fill} opacity={glowOpacity * 0.8} />
      {/* Specular highlight */}
      <Circle x={def.width / 2 - 3} y={12} radius={4} fill="white" opacity={isOn ? 0.6 : 0.15} />
      <Circle x={def.width / 2 + 1} y={14} radius={2} fill="white" opacity={isOn ? 0.3 : 0.08} />
      {/* LED base / flat edge */}
      <Rect x={def.width / 2 - 10} y={28} width={20} height={5} fill={fill} opacity={0.6} cornerRadius={1} />
      {/* Legs */}
      <Line points={[def.width / 2 - 4, 33, def.width / 2 - 4, def.height]} stroke="#C0C0C0" strokeWidth={1.8} />
      <Line points={[def.width / 2 + 4, 33, def.width / 2 + 4, def.height]} stroke="#C0C0C0" strokeWidth={1.8} />
      {/* Anode marker */}
      <Line points={[def.width / 2 - 4, def.height - 4, def.width / 2 - 4, def.height]} stroke="#C0C0C0" strokeWidth={2.5} />
      <Text x={def.width / 2 - 12} y={def.height - 8} text="+" fontSize={8} fill="#888" fontFamily="monospace" />
    </Group>
  );
}

// ===== Resistor with Color Bands =====
export function ResistorRenderer({ def, properties }: RendererProps) {
  const resistance = (properties.resistance as number) || 220;
  const bands = getResistorBands(resistance);
  return (
    <Group>
      {/* Lead wires */}
      <Line points={[0, def.height / 2, 10, def.height / 2]} stroke="#C0C0C0" strokeWidth={1.8} />
      <Line points={[def.width - 10, def.height / 2, def.width, def.height / 2]} stroke="#C0C0C0" strokeWidth={1.8} />
      {/* Body */}
      <Rect x={10} y={2} width={def.width - 20} height={def.height - 4} fill="#D2B48C" cornerRadius={4} stroke="#A0855C" strokeWidth={0.8} />
      {/* Lighter center */}
      <Rect x={12} y={4} width={def.width - 24} height={def.height - 8} fill="#DABB8A" cornerRadius={3} />
      {/* Color bands */}
      {bands.map((color, i) => (
        <Rect key={i} x={15 + i * 9} y={3} width={5} height={def.height - 6} fill={color} cornerRadius={1} opacity={0.9} />
      ))}
      {/* Value label */}
      <Text x={15} y={def.height + 2} text={formatResistance(resistance)} fontSize={7} fill="#888" fontFamily="monospace" />
    </Group>
  );
}

// ===== Breadboard with Realistic Holes =====
export function BreadboardRenderer({ def }: RendererProps) {
  const holes: React.ReactElement[] = [];
  const cols = Math.floor((def.width - 24) / 10);
  const topRows = 5;
  const bottomRows = 5;
  
  // Main area holes
  for (let row = 0; row < topRows; row++) {
    for (let col = 0; col < cols; col++) {
      holes.push(
        <Circle key={`t${row}-${col}`} x={16 + col * 10} y={30 + row * 8} radius={1.8} fill="#666" stroke="#555" strokeWidth={0.3} />
      );
    }
  }
  for (let row = 0; row < bottomRows; row++) {
    for (let col = 0; col < cols; col++) {
      holes.push(
        <Circle key={`b${row}-${col}`} x={16 + col * 10} y={def.height - 30 - (bottomRows - 1 - row) * 8} radius={1.8} fill="#666" stroke="#555" strokeWidth={0.3} />
      );
    }
  }
  
  // Power rail holes
  for (let col = 0; col < cols; col++) {
    holes.push(
      <Circle key={`pr1-${col}`} x={16 + col * 10} y={10} radius={1.5} fill="#777" />,
      <Circle key={`pr2-${col}`} x={16 + col * 10} y={18} radius={1.5} fill="#777" />,
      <Circle key={`pr3-${col}`} x={16 + col * 10} y={def.height - 10} radius={1.5} fill="#777" />,
      <Circle key={`pr4-${col}`} x={16 + col * 10} y={def.height - 18} radius={1.5} fill="#777" />,
    );
  }

  return (
    <Group>
      {/* Board body */}
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#F5F5DC" cornerRadius={4} stroke="#d4c99a" strokeWidth={1.5} />
      {/* Center groove */}
      <Rect x={4} y={def.height / 2 - 3} width={def.width - 8} height={6} fill="#e0d6b8" cornerRadius={2} />
      {/* Power rail lines */}
      <Line points={[10, 6, def.width - 10, 6]} stroke="#ef4444" strokeWidth={1} />
      <Line points={[10, 14, def.width - 10, 14]} stroke="#3b82f6" strokeWidth={1} />
      <Text x={4} y={4} text="+" fontSize={6} fill="#ef4444" fontFamily="monospace" fontStyle="bold" />
      <Text x={4} y={12} text="−" fontSize={6} fill="#3b82f6" fontFamily="monospace" fontStyle="bold" />
      <Line points={[10, def.height - 6, def.width - 10, def.height - 6]} stroke="#ef4444" strokeWidth={1} />
      <Line points={[10, def.height - 14, def.width - 10, def.height - 14]} stroke="#3b82f6" strokeWidth={1} />
      <Text x={4} y={def.height - 8} text="+" fontSize={6} fill="#ef4444" fontFamily="monospace" fontStyle="bold" />
      <Text x={4} y={def.height - 16} text="−" fontSize={6} fill="#3b82f6" fontFamily="monospace" fontStyle="bold" />
      {/* Row labels */}
      {['A', 'B', 'C', 'D', 'E'].map((lbl, i) => (
        <Text key={`tl${i}`} x={6} y={28 + i * 8} text={lbl} fontSize={5} fill="#a09070" fontFamily="monospace" />
      ))}
      {['F', 'G', 'H', 'I', 'J'].map((lbl, i) => (
        <Text key={`bl${i}`} x={6} y={def.height - 68 + i * 8} text={lbl} fontSize={5} fill="#a09070" fontFamily="monospace" />
      ))}
      {/* Column numbers every 5 */}
      {Array.from({ length: Math.floor(cols / 5) }, (_, i) => (
        <Text key={`cn${i}`} x={14 + (i * 5 + 4) * 10} y={22} text={`${(i + 1) * 5}`} fontSize={5} fill="#a09070" fontFamily="monospace" />
      ))}
      {/* All holes */}
      {holes}
    </Group>
  );
}

// ===== OLED Display =====
export function OLEDRenderer({ def, properties, isSimulating }: RendererProps) {
  const text = (properties.text as string) || '';
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#0a0a0a" cornerRadius={3} stroke="#333" strokeWidth={1.5} />
      {/* Screen bezel */}
      <Rect x={4} y={3} width={def.width - 8} height={def.height - 22} fill="#000814" cornerRadius={2} stroke="#1a1a2e" strokeWidth={0.5} />
      {/* Screen glow */}
      {isSimulating && (
        <Rect x={6} y={5} width={def.width - 12} height={def.height - 26} fill="#000820" cornerRadius={1}
          shadowColor="#0044ff" shadowBlur={4} shadowOpacity={0.2} />
      )}
      {text && <Text x={8} y={8} text={text.slice(0, 20)} fontSize={8} fill="#00d4ff" fontFamily="monospace" width={def.width - 16} />}
      {!text && isSimulating && <Text x={8} y={8} text="SSD1306" fontSize={7} fill="#003366" fontFamily="monospace" />}
      {/* Pin labels */}
      <Text x={6} y={def.height - 15} text="GND VCC SCL SDA" fontSize={4.5} fill="#555" fontFamily="monospace" />
      <Text x={def.width / 2 - 12} y={def.height - 7} text="OLED 0.96\"" fontSize={5} fill="#444" fontFamily="monospace" />
    </Group>
  );
}

export function SevenSegmentRenderer({ def, properties }: RendererProps) {
  const digit = (properties.digit as number) || 0;
  const segments = getSegments(digit);
  const segColor = '#ef4444';
  const offColor = '#2a0a0a';
  const cx = def.width / 2;
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#111" cornerRadius={3} stroke="#333" strokeWidth={1} />
      <Rect x={cx - 10} y={8} width={20} height={3} fill={segments.a ? segColor : offColor} cornerRadius={1} shadowColor={segments.a ? segColor : 'transparent'} shadowBlur={segments.a ? 6 : 0} />
      <Rect x={cx + 10} y={10} width={3} height={16} fill={segments.b ? segColor : offColor} cornerRadius={1} shadowColor={segments.b ? segColor : 'transparent'} shadowBlur={segments.b ? 6 : 0} />
      <Rect x={cx + 10} y={28} width={3} height={16} fill={segments.c ? segColor : offColor} cornerRadius={1} shadowColor={segments.c ? segColor : 'transparent'} shadowBlur={segments.c ? 6 : 0} />
      <Rect x={cx - 10} y={44} width={20} height={3} fill={segments.d ? segColor : offColor} cornerRadius={1} shadowColor={segments.d ? segColor : 'transparent'} shadowBlur={segments.d ? 6 : 0} />
      <Rect x={cx - 13} y={28} width={3} height={16} fill={segments.e ? segColor : offColor} cornerRadius={1} shadowColor={segments.e ? segColor : 'transparent'} shadowBlur={segments.e ? 6 : 0} />
      <Rect x={cx - 13} y={10} width={3} height={16} fill={segments.f ? segColor : offColor} cornerRadius={1} shadowColor={segments.f ? segColor : 'transparent'} shadowBlur={segments.f ? 6 : 0} />
      <Rect x={cx - 10} y={26} width={20} height={3} fill={segments.g ? segColor : offColor} cornerRadius={1} shadowColor={segments.g ? segColor : 'transparent'} shadowBlur={segments.g ? 6 : 0} />
    </Group>
  );
}

// ===== Servo Motor with Rotating Arm =====
export function ServoRenderer({ def, properties }: RendererProps) {
  const angle = (properties.angle as number) || 90;
  return (
    <Group>
      {/* Servo body */}
      <Rect x={0} y={6} width={def.width} height={def.height - 12} fill="#2563eb" cornerRadius={3} stroke="#1d4ed8" strokeWidth={1.5} />
      {/* Body details */}
      <Rect x={2} y={8} width={def.width - 4} height={def.height - 16} fill="#1e40af" cornerRadius={2} />
      {/* Mounting ears */}
      <Rect x={-6} y={12} width={8} height={8} fill="#1e40af" cornerRadius={2} />
      <Rect x={def.width - 2} y={12} width={8} height={8} fill="#1e40af" cornerRadius={2} />
      <Circle x={-2} y={16} radius={2} fill="#1a365d" />
      <Circle x={def.width + 2} y={16} radius={2} fill="#1a365d" />
      {/* Gear hub */}
      <Circle x={def.width / 2} y={def.height / 2} radius={9} fill="#555" stroke="#777" strokeWidth={1} />
      <Circle x={def.width / 2} y={def.height / 2} radius={5} fill="#666" />
      {/* Rotating arm */}
      <Line points={[def.width / 2, def.height / 2, def.width / 2 + Math.cos((angle - 90) * Math.PI / 180) * 18, def.height / 2 + Math.sin((angle - 90) * Math.PI / 180) * 18]}
        stroke="#e0e0e0" strokeWidth={4} lineCap="round" />
      <Circle x={def.width / 2 + Math.cos((angle - 90) * Math.PI / 180) * 18} y={def.height / 2 + Math.sin((angle - 90) * Math.PI / 180) * 18}
        radius={3} fill="#ddd" stroke="#bbb" strokeWidth={0.5} />
      {/* Wire bundle */}
      <Line points={[14, def.height - 6, 14, def.height + 4]} stroke="#ef4444" strokeWidth={1.5} />
      <Line points={[18, def.height - 6, 18, def.height + 4]} stroke="#8B4513" strokeWidth={1.5} />
      <Line points={[22, def.height - 6, 22, def.height + 4]} stroke="#f97316" strokeWidth={1.5} />
      {/* Label */}
      <Text x={4} y={def.height - 6} text={`${angle}°`} fontSize={7} fill="#93c5fd" fontFamily="monospace" />
    </Group>
  );
}

// ===== Relay Module =====
export function RelayRenderer({ def, properties }: RendererProps) {
  const isOpen = (properties.state as string) !== 'closed';
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#1e3a5f" cornerRadius={3} stroke="#2563eb" strokeWidth={1} />
      {/* Coil symbol */}
      <Line points={[12, 15, 16, 10, 20, 20, 24, 10, 28, 20, 32, 10, 36, 15]} stroke="#60a5fa" strokeWidth={1.2} />
      {/* Switch */}
      <Line points={isOpen ? [15, 35, 35, 28] : [15, 35, 35, 35]} stroke={isOpen ? '#ef4444' : '#22c55e'} strokeWidth={2} lineCap="round" />
      <Circle x={15} y={35} radius={2.5} fill="#ccc" stroke="#999" strokeWidth={0.5} />
      <Circle x={35} y={35} radius={2.5} fill={isOpen ? '#555' : '#22c55e'} stroke="#999" strokeWidth={0.5} />
      {/* Status indicator */}
      <Circle x={def.width - 8} y={8} radius={3} fill={isOpen ? '#ef4444' : '#22c55e'}
        shadowColor={isOpen ? '#ef4444' : '#22c55e'} shadowBlur={6} shadowOpacity={0.6} />
      <Text x={8} y={42} text={isOpen ? 'OPEN' : 'CLOSED'} fontSize={6} fill={isOpen ? '#ef4444' : '#22c55e'} fontFamily="monospace" />
    </Group>
  );
}

export function MotorDriverRenderer({ def }: RendererProps) {
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#7f1d1d" cornerRadius={4} stroke="#991b1b" strokeWidth={1.5} />
      <Rect x={12} y={12} width={36} height={36} fill="#333" cornerRadius={2} stroke="#555" strokeWidth={0.8} />
      {Array.from({ length: 8 }, (_, i) => (
        <React.Fragment key={`dp${i}`}>
          <Rect x={14 + (i % 4) * 8} y={i < 4 ? 10 : 48} width={2} height={3} fill="#C0C0C0" />
        </React.Fragment>
      ))}
      <Text x={18} y={24} text="L298N" fontSize={7} fill="#ccc" fontFamily="monospace" fontStyle="bold" />
      {/* Heatsink */}
      <Rect x={3} y={3} width={6} height={def.height - 6} fill="#555" cornerRadius={1} />
      {Array.from({ length: 6 }, (_, i) => (
        <Line key={`hs${i}`} points={[3, 6 + i * 8, 9, 6 + i * 8]} stroke="#666" strokeWidth={0.5} />
      ))}
      <Text x={5} y={3} text="M-A" fontSize={5} fill="#fbbf24" fontFamily="monospace" />
      <Text x={40} y={3} text="M-B" fontSize={5} fill="#fbbf24" fontFamily="monospace" />
    </Group>
  );
}

// ===== Sensor Renderers =====

export function BME280Renderer({ def }: RendererProps) {
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#0d4f4f" cornerRadius={3} stroke="#0d9488" strokeWidth={1} />
      <Rect x={6} y={4} width={24} height={14} fill="#1a1a2e" cornerRadius={1} stroke="#333" strokeWidth={0.5} />
      <Circle x={18} y={11} radius={4} fill="#333" stroke="#555" strokeWidth={0.3} />
      <Circle x={18} y={11} radius={1.5} fill="#555" />
      <Text x={4} y={22} text="BME" fontSize={7} fill="#5eead4" fontFamily="monospace" fontStyle="bold" />
      <Text x={6} y={28} text="280" fontSize={6} fill="#99f6e4" fontFamily="monospace" />
    </Group>
  );
}

export function PIRRenderer({ def, properties }: RendererProps) {
  const detected = properties.motionDetected as boolean;
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#1c1917" cornerRadius={3} stroke="#78350f" strokeWidth={1} />
      {/* Fresnel lens dome */}
      <Circle x={def.width / 2} y={16} radius={16} fill="#292524" stroke={detected ? '#ef4444' : '#57534e'} strokeWidth={1.5} />
      <Circle x={def.width / 2} y={16} radius={10} fill={detected ? '#dc262680' : '#44403c'}
        shadowColor={detected ? '#ef4444' : 'transparent'} shadowBlur={detected ? 15 : 0} />
      <Circle x={def.width / 2} y={16} radius={5} fill={detected ? '#ef444450' : '#3a3632'} />
      {/* Detection waves */}
      {detected && (
        <>
          <Arc x={def.width / 2} y={16} innerRadius={18} outerRadius={19} angle={60} rotation={-30} fill="transparent" stroke="#ef444460" strokeWidth={1} />
          <Arc x={def.width / 2} y={16} innerRadius={22} outerRadius={23} angle={80} rotation={-40} fill="transparent" stroke="#ef444430" strokeWidth={1} />
        </>
      )}
      <Text x={8} y={36} text="PIR" fontSize={7} fill="#a8a29e" fontFamily="monospace" fontStyle="bold" />
    </Group>
  );
}

export function GPSRenderer({ def }: RendererProps) {
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#052e16" cornerRadius={3} stroke="#15803d" strokeWidth={1} />
      {/* Ceramic antenna */}
      <Rect x={8} y={4} width={34} height={22} fill="#D2B48C" cornerRadius={2} stroke="#A0855C" strokeWidth={0.5} />
      <Text x={14} y={10} text="GPS" fontSize={8} fill="#4ade80" fontFamily="monospace" fontStyle="bold" />
      <Text x={12} y={20} text="NEO-6M" fontSize={5} fill="#333" fontFamily="monospace" />
      {/* Status LED */}
      <Circle x={40} y={36} radius={2} fill="#22c55e" shadowColor="#22c55e" shadowBlur={4} />
      <Text x={10} y={34} text="FIX" fontSize={5} fill="#22c55e" fontFamily="monospace" />
    </Group>
  );
}

export function TFTRenderer({ def }: RendererProps) {
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#111827" cornerRadius={4} stroke="#1e40af" strokeWidth={1.5} />
      {/* Screen */}
      <Rect x={6} y={6} width={def.width - 12} height={def.height - 30} fill="#000814" cornerRadius={2} stroke="#1a1a3e" strokeWidth={0.5} />
      {/* Color test bars */}
      {['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'].map((c, i) => (
        <Rect key={i} x={8 + i * ((def.width - 16) / 8)} y={10} width={(def.width - 16) / 8 - 1} height={def.height - 42} fill={c} opacity={0.8} cornerRadius={1} />
      ))}
      <Text x={def.width / 2 - 10} y={def.height - 20} text="ILI9341" fontSize={6} fill="#60a5fa" fontFamily="monospace" />
      <Text x={def.width / 2 - 8} y={def.height - 12} text="240×320" fontSize={5} fill="#444" fontFamily="monospace" />
    </Group>
  );
}

export function LoRaRenderer({ def }: RendererProps) {
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#1e1b4b" cornerRadius={3} stroke="#3730a3" strokeWidth={1} />
      {/* Antenna connector */}
      <Circle x={def.width - 10} y={8} radius={4} fill="#333" stroke="#666" strokeWidth={0.5} />
      <Circle x={def.width - 10} y={8} radius={1.5} fill="#C0C0C0" />
      {/* Chip */}
      <Rect x={6} y={14} width={24} height={18} fill="#222" cornerRadius={1} stroke="#444" strokeWidth={0.5} />
      <Text x={8} y={18} text="SX" fontSize={6} fill="#818cf8" fontFamily="monospace" fontStyle="bold" />
      <Text x={8} y={26} text="1278" fontSize={5.5} fill="#6366f1" fontFamily="monospace" />
      <Text x={8} y={36} text="LoRa" fontSize={8} fill="#818cf8" fontFamily="monospace" fontStyle="bold" />
    </Group>
  );
}

export function BluetoothRenderer({ def }: RendererProps) {
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#172554" cornerRadius={3} stroke="#1d4ed8" strokeWidth={1} />
      {/* BT symbol */}
      <Circle x={def.width / 2} y={14} radius={8} fill="#1e3a8a" />
      <Line points={[def.width / 2 - 3, 10, def.width / 2 + 3, 14, def.width / 2 - 3, 18, def.width / 2 + 3, 14]} stroke="#60a5fa" strokeWidth={1.5} />
      <Line points={[def.width / 2, 6, def.width / 2, 22]} stroke="#60a5fa" strokeWidth={1.5} />
      <Text x={6} y={26} text="HC-05" fontSize={7} fill="#93c5fd" fontFamily="monospace" fontStyle="bold" />
      {/* Status LED */}
      <Circle x={def.width - 8} y={def.height - 8} radius={2} fill="#ef4444" shadowColor="#ef4444" shadowBlur={3} />
    </Group>
  );
}

export function RGBStripRenderer({ def, isSimulating }: RendererProps) {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#1a1a2e" cornerRadius={3} stroke="#7c3aed" strokeWidth={1} />
      {/* PCB strip */}
      <Rect x={2} y={4} width={def.width - 4} height={def.height - 8} fill="#222" cornerRadius={2} />
      {/* LED pixels */}
      {Array.from({ length: 8 }, (_, i) => (
        <React.Fragment key={i}>
          <Rect x={5 + i * 11.5} y={6} width={9} height={def.height - 12} fill="#1a1a1a" cornerRadius={1} />
          <Circle x={9.5 + i * 11.5} y={def.height / 2} radius={3.5} fill={colors[i]}
            shadowColor={isSimulating ? colors[i] : 'transparent'} shadowBlur={isSimulating ? 6 : 0} opacity={isSimulating ? 1 : 0.5} />
        </React.Fragment>
      ))}
    </Group>
  );
}

export function StepperRenderer({ def }: RendererProps) {
  return (
    <Group>
      {/* Motor housing */}
      <Circle x={def.width / 2} y={def.width / 2} radius={def.width / 2 - 2} fill="#4B5563" stroke="#059669" strokeWidth={2} />
      <Circle x={def.width / 2} y={def.width / 2} radius={def.width / 2 - 6} fill="#374151" stroke="#4B5563" strokeWidth={1} />
      {/* Center shaft */}
      <Circle x={def.width / 2} y={def.width / 2} radius={def.width / 6} fill="#1f2937" stroke="#4b5563" strokeWidth={1} />
      {/* Shaft flat */}
      <Line points={[def.width / 2, def.width / 2, def.width / 2, 6]} stroke="#D1D5DB" strokeWidth={3} lineCap="round" />
      {/* Coil indicators */}
      {[0, 90, 180, 270].map(angle => {
        const r = def.width / 2 - 8;
        const x = def.width / 2 + Math.cos(angle * Math.PI / 180) * r;
        const y = def.width / 2 + Math.sin(angle * Math.PI / 180) * r;
        return <Circle key={angle} x={x} y={y} radius={3} fill="#059669" opacity={0.6} />;
      })}
      <Text x={6} y={def.width + 2} text="STEPPER" fontSize={5} fill="#6ee7b7" fontFamily="monospace" />
    </Group>
  );
}

export function RotaryEncoderRenderer({ def }: RendererProps) {
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#1f2937" cornerRadius={4} stroke="#4b5563" strokeWidth={1} />
      {/* Body */}
      <Circle x={def.width / 2} y={def.height / 2} radius={14} fill="#374151" stroke="#6b7280" strokeWidth={1} />
      {/* Knob */}
      <Circle x={def.width / 2} y={def.height / 2} radius={8} fill="#4b5563" stroke="#9ca3af" strokeWidth={0.5} />
      {/* Knob pointer */}
      <Line points={[def.width / 2, def.height / 2, def.width / 2, def.height / 2 - 11]} stroke="#d1d5db" strokeWidth={2} lineCap="round" />
      {/* Notch marks */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = i * 30 * Math.PI / 180;
        const r1 = 12, r2 = 14;
        return <Line key={i} points={[
          def.width / 2 + Math.cos(a) * r1, def.height / 2 + Math.sin(a) * r1,
          def.width / 2 + Math.cos(a) * r2, def.height / 2 + Math.sin(a) * r2
        ]} stroke="#6b7280" strokeWidth={0.5} />;
      })}
    </Group>
  );
}

export function JoystickRenderer({ def }: RendererProps) {
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#111827" cornerRadius={4} stroke="#374151" strokeWidth={1} />
      {/* Base plate */}
      <Rect x={4} y={4} width={def.width - 8} height={def.height - 8} fill="#1f2937" cornerRadius={3} />
      {/* Movement area */}
      <Circle x={def.width / 2} y={def.height / 2} radius={16} fill="#1f2937" stroke="#4b5563" strokeWidth={1} />
      {/* Crosshair */}
      <Line points={[def.width / 2, def.height / 2 - 14, def.width / 2, def.height / 2 + 14]} stroke="#4b5563" strokeWidth={0.5} />
      <Line points={[def.width / 2 - 14, def.height / 2, def.width / 2 + 14, def.height / 2]} stroke="#4b5563" strokeWidth={0.5} />
      {/* Stick */}
      <Circle x={def.width / 2} y={def.height / 2} radius={9} fill="#374151" stroke="#6b7280" strokeWidth={1} />
      <Circle x={def.width / 2} y={def.height / 2} radius={5} fill="#4b5563" shadowColor="#6b7280" shadowBlur={4} />
    </Group>
  );
}

// ===== Buzzer with realistic form =====
export function BuzzerRenderer({ def, properties }: RendererProps) {
  const active = properties.active as boolean;
  return (
    <Group>
      <Circle x={def.width / 2} y={def.height / 2} radius={def.width / 2 - 1} fill="#1a1a1a" stroke="#333" strokeWidth={1.5} />
      <Circle x={def.width / 2} y={def.height / 2} radius={def.width / 2 - 5} fill="#222" />
      <Circle x={def.width / 2} y={def.height / 2} radius={4} fill={active ? '#eab308' : '#444'}
        shadowColor={active ? '#eab308' : 'transparent'} shadowBlur={active ? 8 : 0} />
      {/* Sound waves */}
      {active && (
        <>
          <Arc x={def.width / 2} y={def.height / 2} innerRadius={8} outerRadius={9} angle={60} rotation={-30} fill="transparent" stroke="#eab30860" strokeWidth={1} />
          <Arc x={def.width / 2} y={def.height / 2} innerRadius={12} outerRadius={13} angle={80} rotation={-40} fill="transparent" stroke="#eab30840" strokeWidth={1} />
        </>
      )}
      <Text x={def.width / 2 - 4} y={def.height + 2} text="+" fontSize={7} fill="#888" fontFamily="monospace" />
    </Group>
  );
}

// ===== Potentiometer =====
export function PotentiometerRenderer({ def, properties }: RendererProps) {
  const value = (properties.value as number) || 512;
  const angle = (value / 1023) * 270 - 135;
  return (
    <Group>
      <Circle x={def.width / 2} y={def.width / 2} radius={def.width / 2 - 2} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1.5} />
      <Circle x={def.width / 2} y={def.width / 2} radius={def.width / 2 - 6} fill="#1e293b" />
      {/* Wiper mark */}
      <Line points={[
        def.width / 2, def.width / 2,
        def.width / 2 + Math.cos(angle * Math.PI / 180) * (def.width / 2 - 8),
        def.width / 2 + Math.sin(angle * Math.PI / 180) * (def.width / 2 - 8),
      ]} stroke="#60a5fa" strokeWidth={2} lineCap="round" />
      <Circle x={def.width / 2} y={def.width / 2} radius={3} fill="#3b82f6" />
    </Group>
  );
}

// ===== Push Button =====
export function PushButtonRenderer({ def, properties }: RendererProps) {
  const pressed = (properties.state as string) === 'closed';
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#1f2937" cornerRadius={3} stroke="#4b5563" strokeWidth={1} />
      {/* Pin legs */}
      <Rect x={4} y={-2} width={3} height={4} fill="#C0C0C0" />
      <Rect x={def.width - 7} y={-2} width={3} height={4} fill="#C0C0C0" />
      <Rect x={4} y={def.height - 2} width={3} height={4} fill="#C0C0C0" />
      <Rect x={def.width - 7} y={def.height - 2} width={3} height={4} fill="#C0C0C0" />
      {/* Button cap */}
      <Circle x={def.width / 2} y={def.height / 2} radius={12} fill={pressed ? '#4338ca' : '#6366f1'}
        stroke="#818cf8" strokeWidth={1} shadowColor="#6366f1" shadowBlur={pressed ? 8 : 0} />
      <Circle x={def.width / 2} y={def.height / 2} radius={8} fill={pressed ? '#3730a3' : '#4f46e5'} />
    </Group>
  );
}

// Generic fallback
export function GenericRenderer({ def }: RendererProps) {
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill={def.color} cornerRadius={4} stroke="#555" strokeWidth={1}
        shadowColor="black" shadowBlur={6} shadowOpacity={0.3} shadowOffsetY={2} />
      <Text x={4} y={def.height / 2 - 5} text={def.name} fontSize={Math.min(10, def.width / def.name.length * 1.5)}
        fill="#e2e8f0" fontFamily="Space Grotesk" width={def.width - 8} align="center" />
    </Group>
  );
}

// ===== Utility =====
function getResistorBands(ohms: number): string[] {
  const bandColors = ['#000', '#8B4513', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#6b7280', '#f8fafc'];
  const str = Math.round(ohms).toString();
  if (str.length < 2) return [bandColors[0], bandColors[0], bandColors[0], '#C4A35A'];
  return [bandColors[parseInt(str[0])] || '#000', bandColors[parseInt(str[1])] || '#000', bandColors[Math.max(0, str.length - 2)] || '#000', '#C4A35A'];
}

function formatResistance(ohms: number): string {
  if (ohms >= 1000000) return `${(ohms / 1000000).toFixed(1)}MΩ`;
  if (ohms >= 1000) return `${(ohms / 1000).toFixed(1)}kΩ`;
  return `${ohms}Ω`;
}

function getSegments(digit: number): Record<string, boolean> {
  const map: Record<number, string> = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  const on = map[digit] || '';
  return { a: on.includes('a'), b: on.includes('b'), c: on.includes('c'), d: on.includes('d'), e: on.includes('e'), f: on.includes('f'), g: on.includes('g') };
}

// ===== Renderer Map =====
export const COMPONENT_RENDERERS: Record<string, React.FC<RendererProps>> = {
  'arduino-uno': ArduinoUnoRenderer,
  'esp32': ESP32Renderer,
  'led': LEDRenderer,
  'resistor': ResistorRenderer,
  'breadboard': BreadboardRenderer,
  'oled-display': OLEDRenderer,
  'sh1106-oled': OLEDRenderer,
  '7-segment': SevenSegmentRenderer,
  'servo-motor': ServoRenderer,
  'relay': RelayRenderer,
  'motor-driver': MotorDriverRenderer,
  'bme280': BME280Renderer,
  'bmp280': BME280Renderer,
  'pir-sensor': PIRRenderer,
  'gps-module': GPSRenderer,
  'ili9341-tft': TFTRenderer,
  'st7789-tft': TFTRenderer,
  'lora-module': LoRaRenderer,
  'bluetooth-module': BluetoothRenderer,
  'rgb-led-strip': RGBStripRenderer,
  'stepper-motor': StepperRenderer,
  'rotary-encoder': RotaryEncoderRenderer,
  'joystick': JoystickRenderer,
  'buzzer': BuzzerRenderer,
  'potentiometer': PotentiometerRenderer,
  'push-button': PushButtonRenderer,
};
