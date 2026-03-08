import React from 'react';
import { Group, Rect, Circle, Line, Text } from 'react-konva';
import { ComponentDefinition } from '@/types/circuit';

interface RendererProps {
  def: ComponentDefinition;
  properties: Record<string, string | number | boolean>;
  isSimulating?: boolean;
  pinStates?: Record<number, number>;
}

// Arduino Uno - Detailed PCB
export function ArduinoUnoRenderer({ def, properties }: RendererProps) {
  return (
    <Group>
      {/* PCB board */}
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#006D6F" cornerRadius={5} stroke="#004D4F" strokeWidth={1.5} />
      {/* Board edge trace */}
      <Rect x={3} y={3} width={def.width - 6} height={def.height - 6} stroke="#00897B" strokeWidth={0.5} cornerRadius={4} fill="transparent" />
      {/* USB connector */}
      <Rect x={48} y={-2} width={44} height={16} fill="#A0A0A0" cornerRadius={2} stroke="#808080" strokeWidth={1} />
      <Rect x={52} y={1} width={36} height={10} fill="#333" cornerRadius={1} />
      <Text x={56} y={2.5} text="USB" fontSize={7} fill="#AAA" fontFamily="monospace" />
      {/* MCU chip */}
      <Rect x={40} y={70} width={60} height={20} fill="#1a1a2e" cornerRadius={1} stroke="#333" strokeWidth={0.5} />
      <Circle x={45} y={80} radius={2} fill="#444" />
      <Text x={55} y={73} text="ATmega328P" fontSize={6} fill="#888" fontFamily="monospace" />
      {/* Crystal oscillator */}
      <Rect x={38} y={95} width={12} height={6} fill="#C0C0C0" cornerRadius={1} stroke="#999" strokeWidth={0.5} />
      {/* Power LED */}
      <Circle x={18} y={180} radius={3} fill="#22c55e" shadowColor="#22c55e" shadowBlur={6} shadowOpacity={0.8} />
      <Text x={25} y={177} text="ON" fontSize={5} fill="#22c55e" fontFamily="monospace" />
      {/* TX/RX LEDs */}
      <Circle x={18} y={168} radius={2} fill="#eab308" />
      <Text x={23} y={165.5} text="TX" fontSize={5} fill="#eab308" fontFamily="monospace" />
      <Circle x={18} y={158} radius={2} fill="#eab308" />
      <Text x={23} y={155.5} text="RX" fontSize={5} fill="#eab308" fontFamily="monospace" />
      {/* DC barrel jack */}
      <Rect x={2} y={180} width={14} height={14} fill="#222" cornerRadius={3} stroke="#444" strokeWidth={1} />
      <Circle x={9} y={187} radius={4} fill="#111" stroke="#555" strokeWidth={0.5} />
      {/* Reset button */}
      <Circle x={110} y={25} radius={6} fill="#cc3333" stroke="#aa2222" strokeWidth={1} />
      <Text x={100} y={34} text="RESET" fontSize={5} fill="#888" fontFamily="monospace" />
      {/* Pin header labels */}
      <Rect x={def.width - 4} y={14} width={4} height={168} fill="#333" cornerRadius={1} />
      <Rect x={0} y={14} width={4} height={80} fill="#333" cornerRadius={1} />
      {/* Board label */}
      <Text x={30} y={45} text="ARDUINO" fontSize={10} fill="#B2DFDB" fontFamily="monospace" fontStyle="bold" />
      <Text x={50} y={56} text="UNO" fontSize={9} fill="#80CBC4" fontFamily="monospace" />
    </Group>
  );
}

// ESP32 DevKit
export function ESP32Renderer({ def, properties }: RendererProps) {
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#1a1a2e" cornerRadius={4} stroke="#333" strokeWidth={1.5} />
      {/* Antenna area */}
      <Rect x={30} y={2} width={60} height={30} fill="#2d2d44" cornerRadius={3} stroke="#444" strokeWidth={0.5} />
      <Line points={[40, 8, 50, 20, 60, 8, 70, 20, 80, 8]} stroke="#666" strokeWidth={0.8} />
      <Text x={45} y={22} text="ANT" fontSize={6} fill="#666" fontFamily="monospace" />
      {/* Main chip */}
      <Rect x={35} y={80} width={50} height={50} fill="#222" cornerRadius={2} stroke="#444" strokeWidth={1} />
      <Circle x={42} y={87} radius={2} fill="#555" />
      <Text x={43} y={95} text="ESP32" fontSize={8} fill="#e53935" fontFamily="monospace" fontStyle="bold" />
      <Text x={43} y={108} text="WROOM" fontSize={6} fill="#888" fontFamily="monospace" />
      {/* USB Micro */}
      <Rect x={42} y={def.height - 12} width={36} height={12} fill="#A0A0A0" cornerRadius={2} stroke="#888" strokeWidth={0.5} />
      <Text x={48} y={def.height - 10} text="USB-C" fontSize={5} fill="#333" fontFamily="monospace" />
      {/* Power LED */}
      <Circle x={20} y={def.height - 20} radius={2.5} fill="#e53935" shadowColor="#e53935" shadowBlur={4} />
      {/* Pin headers */}
      <Rect x={0} y={36} width={5} height={160} fill="#333" cornerRadius={1} />
      <Rect x={def.width - 5} y={36} width={5} height={160} fill="#333" cornerRadius={1} />
      {/* Label */}
      <Text x={25} y={142} text="ESP32" fontSize={10} fill="#e53935" fontFamily="monospace" fontStyle="bold" />
      <Text x={22} y={154} text="DevKit v1" fontSize={7} fill="#888" fontFamily="monospace" />
    </Group>
  );
}

// LED with glow effect
export function LEDRenderer({ def, properties, pinStates }: RendererProps) {
  const color = (properties.color as string) || 'red';
  const colorMap: Record<string, string> = {
    red: '#ef4444', green: '#22c55e', blue: '#3b82f6', yellow: '#eab308', white: '#f8fafc',
  };
  const fill = colorMap[color] || colorMap.red;
  // Check if LED is "on" based on pin states
  const isOn = pinStates ? Object.values(pinStates).some(v => v > 0) : false;
  const glowOpacity = isOn ? 0.9 : 0.3;

  return (
    <Group>
      {/* Lens body */}
      <Circle x={def.width / 2} y={18} radius={12} fill={fill} opacity={glowOpacity}
        shadowColor={fill} shadowBlur={isOn ? 20 : 4} shadowOpacity={isOn ? 0.9 : 0.2} />
      {/* Inner highlight */}
      <Circle x={def.width / 2 - 2} y={15} radius={4} fill="white" opacity={isOn ? 0.5 : 0.15} />
      {/* Flat edge at bottom */}
      <Rect x={def.width / 2 - 8} y={28} width={16} height={4} fill={fill} opacity={0.7} cornerRadius={1} />
      {/* Legs */}
      <Line points={[def.width / 2 - 4, 32, def.width / 2 - 4, def.height]} stroke="#ccc" strokeWidth={1.5} />
      <Line points={[def.width / 2 + 4, 32, def.width / 2 + 4, def.height]} stroke="#ccc" strokeWidth={1.5} />
      {/* Anode marker */}
      <Text x={def.width / 2 - 10} y={def.height - 10} text="+" fontSize={8} fill="#888" fontFamily="monospace" />
    </Group>
  );
}

// Resistor with color bands
export function ResistorRenderer({ def, properties }: RendererProps) {
  const resistance = (properties.resistance as number) || 220;
  const bands = getResistorBands(resistance);

  return (
    <Group>
      {/* Lead wires */}
      <Line points={[0, def.height / 2, 10, def.height / 2]} stroke="#ccc" strokeWidth={1.5} />
      <Line points={[def.width - 10, def.height / 2, def.width, def.height / 2]} stroke="#ccc" strokeWidth={1.5} />
      {/* Body */}
      <Rect x={10} y={2} width={def.width - 20} height={def.height - 4} fill="#D2B48C" cornerRadius={3} stroke="#A0855C" strokeWidth={0.8} />
      {/* Color bands */}
      {bands.map((color, i) => (
        <Rect key={i} x={14 + i * 9} y={3} width={5} height={def.height - 6} fill={color} cornerRadius={1} />
      ))}
      {/* Value label */}
      <Text x={15} y={def.height + 2} text={formatResistance(resistance)} fontSize={7} fill="#888" fontFamily="monospace" />
    </Group>
  );
}

// Breadboard
export function BreadboardRenderer({ def }: RendererProps) {
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#F5F5DC" cornerRadius={3} stroke="#d4c99a" strokeWidth={1} />
      {/* Center divider */}
      <Rect x={0} y={def.height / 2 - 3} width={def.width} height={6} fill="#e8dcc8" />
      {/* Power rails */}
      <Line points={[6, 8, def.width - 6, 8]} stroke="#ef4444" strokeWidth={1} />
      <Line points={[6, 16, def.width - 6, 16]} stroke="#3b82f6" strokeWidth={1} />
      <Line points={[6, def.height - 8, def.width - 6, def.height - 8]} stroke="#ef4444" strokeWidth={1} />
      <Line points={[6, def.height - 16, def.width - 6, def.height - 16]} stroke="#3b82f6" strokeWidth={1} />
      {/* Holes grid (simplified) */}
      {Array.from({ length: 10 }, (_, row) => (
        Array.from({ length: 5 }, (_, col) => (
          <Circle key={`${row}-${col}`} x={12 + row * 18} y={24 + col * 8} radius={1.5} fill="#888" />
        ))
      )).flat()}
    </Group>
  );
}

// OLED Display with screen rendering
export function OLEDRenderer({ def, properties }: RendererProps) {
  const text = (properties.text as string) || '';
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#0a0a0a" cornerRadius={3} stroke="#333" strokeWidth={1.5} />
      {/* Screen area */}
      <Rect x={6} y={4} width={def.width - 12} height={def.height - 20} fill="#000814" cornerRadius={2} stroke="#1a1a2e" strokeWidth={0.5} />
      {/* Simulated display text */}
      {text && (
        <Text x={10} y={10} text={text.slice(0, 20)} fontSize={8} fill="#00d4ff" fontFamily="monospace" width={def.width - 20} />
      )}
      {/* Label */}
      <Text x={def.width / 2 - 12} y={def.height - 13} text="OLED" fontSize={7} fill="#444" fontFamily="monospace" />
    </Group>
  );
}

// 7-Segment Display
export function SevenSegmentRenderer({ def, properties }: RendererProps) {
  const digit = (properties.digit as number) || 0;
  const segments = getSegments(digit);
  const segColor = '#ef4444';
  const offColor = '#2a0a0a';
  const cx = def.width / 2;

  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#111" cornerRadius={3} stroke="#333" strokeWidth={1} />
      {/* Segment A (top) */}
      <Rect x={cx - 10} y={8} width={20} height={3} fill={segments.a ? segColor : offColor} cornerRadius={1}
        shadowColor={segments.a ? segColor : 'transparent'} shadowBlur={segments.a ? 6 : 0} />
      {/* Segment B (top-right) */}
      <Rect x={cx + 10} y={10} width={3} height={16} fill={segments.b ? segColor : offColor} cornerRadius={1}
        shadowColor={segments.b ? segColor : 'transparent'} shadowBlur={segments.b ? 6 : 0} />
      {/* Segment C (bottom-right) */}
      <Rect x={cx + 10} y={28} width={3} height={16} fill={segments.c ? segColor : offColor} cornerRadius={1}
        shadowColor={segments.c ? segColor : 'transparent'} shadowBlur={segments.c ? 6 : 0} />
      {/* Segment D (bottom) */}
      <Rect x={cx - 10} y={44} width={20} height={3} fill={segments.d ? segColor : offColor} cornerRadius={1}
        shadowColor={segments.d ? segColor : 'transparent'} shadowBlur={segments.d ? 6 : 0} />
      {/* Segment E (bottom-left) */}
      <Rect x={cx - 13} y={28} width={3} height={16} fill={segments.e ? segColor : offColor} cornerRadius={1}
        shadowColor={segments.e ? segColor : 'transparent'} shadowBlur={segments.e ? 6 : 0} />
      {/* Segment F (top-left) */}
      <Rect x={cx - 13} y={10} width={3} height={16} fill={segments.f ? segColor : offColor} cornerRadius={1}
        shadowColor={segments.f ? segColor : 'transparent'} shadowBlur={segments.f ? 6 : 0} />
      {/* Segment G (middle) */}
      <Rect x={cx - 10} y={26} width={20} height={3} fill={segments.g ? segColor : offColor} cornerRadius={1}
        shadowColor={segments.g ? segColor : 'transparent'} shadowBlur={segments.g ? 6 : 0} />
    </Group>
  );
}

// Servo Motor with rotation animation
export function ServoRenderer({ def, properties }: RendererProps) {
  const angle = (properties.angle as number) || 90;
  return (
    <Group>
      {/* Motor body */}
      <Rect x={0} y={6} width={def.width} height={def.height - 12} fill="#2563eb" cornerRadius={3} stroke="#1d4ed8" strokeWidth={1} />
      {/* Mounting ears */}
      <Rect x={-4} y={12} width={4} height={8} fill="#1e40af" cornerRadius={1} />
      <Rect x={def.width} y={12} width={4} height={8} fill="#1e40af" cornerRadius={1} />
      {/* Shaft hub */}
      <Circle x={def.width / 2} y={def.height / 2} radius={8} fill="#444" stroke="#666" strokeWidth={1} />
      {/* Horn */}
      <Line
        points={[
          def.width / 2, def.height / 2,
          def.width / 2 + Math.cos((angle - 90) * Math.PI / 180) * 16,
          def.height / 2 + Math.sin((angle - 90) * Math.PI / 180) * 16,
        ]}
        stroke="#ccc"
        strokeWidth={3}
        lineCap="round"
      />
      <Circle
        x={def.width / 2 + Math.cos((angle - 90) * Math.PI / 180) * 16}
        y={def.height / 2 + Math.sin((angle - 90) * Math.PI / 180) * 16}
        radius={3}
        fill="#ddd"
      />
      {/* Label */}
      <Text x={5} y={def.height - 8} text={`${angle}°`} fontSize={7} fill="#93c5fd" fontFamily="monospace" />
    </Group>
  );
}

// Relay with state visualization
export function RelayRenderer({ def, properties }: RendererProps) {
  const isOpen = (properties.state as string) !== 'closed';
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#1e3a5f" cornerRadius={3} stroke="#2563eb" strokeWidth={1} />
      {/* Coil symbol */}
      <Line points={[12, 15, 16, 10, 20, 20, 24, 10, 28, 20, 32, 10, 36, 15]} stroke="#60a5fa" strokeWidth={1.2} />
      {/* Switch arm */}
      <Line
        points={isOpen ? [15, 35, 35, 28] : [15, 35, 35, 35]}
        stroke={isOpen ? '#ef4444' : '#22c55e'}
        strokeWidth={2}
        lineCap="round"
      />
      <Circle x={15} y={35} radius={2} fill="#ccc" />
      <Circle x={35} y={35} radius={2} fill={isOpen ? '#555' : '#22c55e'} />
      {/* State label */}
      <Text x={8} y={42} text={isOpen ? 'OPEN' : 'CLOSED'} fontSize={6} fill={isOpen ? '#ef4444' : '#22c55e'} fontFamily="monospace" />
    </Group>
  );
}

// Motor Driver
export function MotorDriverRenderer({ def, properties }: RendererProps) {
  return (
    <Group>
      <Rect x={0} y={0} width={def.width} height={def.height} fill="#7f1d1d" cornerRadius={4} stroke="#991b1b" strokeWidth={1.5} />
      {/* Heatsink */}
      <Rect x={15} y={15} width={30} height={30} fill="#444" cornerRadius={2} stroke="#666" strokeWidth={0.8} />
      {Array.from({ length: 5 }, (_, i) => (
        <Line key={i} points={[18, 18 + i * 6, 42, 18 + i * 6]} stroke="#555" strokeWidth={0.5} />
      ))}
      {/* IC label */}
      <Text x={18} y={22} text="L298N" fontSize={7} fill="#ccc" fontFamily="monospace" />
      {/* Motor output indicators */}
      <Text x={5} y={3} text="M-A" fontSize={6} fill="#fbbf24" fontFamily="monospace" />
      <Text x={40} y={3} text="M-B" fontSize={6} fill="#fbbf24" fontFamily="monospace" />
    </Group>
  );
}

// Generic fallback renderer (colored rect with label)
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

// Utility: Resistor band colors
function getResistorBands(ohms: number): string[] {
  const bandColors = ['#000', '#8B4513', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#6b7280', '#f8fafc'];
  const str = Math.round(ohms).toString();
  if (str.length < 2) return [bandColors[0], bandColors[0], bandColors[0], '#C4A35A'];
  return [
    bandColors[parseInt(str[0])] || '#000',
    bandColors[parseInt(str[1])] || '#000',
    bandColors[Math.max(0, str.length - 2)] || '#000',
    '#C4A35A', // tolerance gold
  ];
}

function formatResistance(ohms: number): string {
  if (ohms >= 1000000) return `${(ohms / 1000000).toFixed(1)}MΩ`;
  if (ohms >= 1000) return `${(ohms / 1000).toFixed(1)}kΩ`;
  return `${ohms}Ω`;
}

function getSegments(digit: number): Record<string, boolean> {
  const map: Record<number, string> = {
    0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg',
    5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg',
  };
  const on = map[digit] || '';
  return { a: on.includes('a'), b: on.includes('b'), c: on.includes('c'), d: on.includes('d'), e: on.includes('e'), f: on.includes('f'), g: on.includes('g') };
}

// Renderer map
export const COMPONENT_RENDERERS: Record<string, React.FC<RendererProps>> = {
  'arduino-uno': ArduinoUnoRenderer,
  'esp32': ESP32Renderer,
  'led': LEDRenderer,
  'resistor': ResistorRenderer,
  'breadboard': BreadboardRenderer,
  'oled-display': OLEDRenderer,
  '7-segment': SevenSegmentRenderer,
  'servo-motor': ServoRenderer,
  'relay': RelayRenderer,
  'motor-driver': MotorDriverRenderer,
};
