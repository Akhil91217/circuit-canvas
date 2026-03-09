import { useCircuitStore } from '@/store/circuitStore';
import { useSimulationStore } from '@/store/simulationStore';
import { COMPONENT_DEFINITIONS } from '@/data/componentDefinitions';
import { PROJECT_TEMPLATES } from '@/data/projectTemplates';
import { NetlistEngine } from '@/engine/NetlistEngine';
import { installLibrary, removeLibrary, searchLibraries, getInstalledLibraries } from '@/components/circuit/LibraryManager';
import { installPlugin, removePlugin, searchPlugins, getInstalledPlugins } from '@/components/circuit/PluginManager';

export interface AgentStep {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  status: 'pending' | 'running' | 'done' | 'error';
  result?: string;
  timestamp: number;
}

export interface AgentToolDef {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
}

// ===== Agent Memory =====
export interface AgentMemory {
  placedComponents: Array<{ id: string; type: string; name: string }>;
  connections: Array<{ from: string; fromPin: string; to: string; toPin: string }>;
  libraries: string[];
  codeFiles: Array<{ name: string; summary: string }>;
  lastErrors: string[];
}

let agentMemory: AgentMemory = {
  placedComponents: [],
  connections: [],
  libraries: [],
  codeFiles: [],
  lastErrors: [],
};

export function getAgentMemory(): AgentMemory {
  const { components, wires } = useCircuitStore.getState();
  agentMemory.placedComponents = components.map(c => ({
    id: c.id,
    type: c.type,
    name: COMPONENT_DEFINITIONS[c.type]?.name || c.type,
  }));
  agentMemory.connections = wires.map(w => ({
    from: w.fromComponentId,
    fromPin: w.fromPinId,
    to: w.toComponentId,
    toPin: w.toPinId,
  }));
  return { ...agentMemory };
}

export function getMemoryContext(): string {
  const mem = getAgentMemory();
  const parts: string[] = [];
  if (mem.placedComponents.length > 0) {
    parts.push(`Components on canvas: ${mem.placedComponents.map(c => `${c.name} (${c.id})`).join(', ')}`);
  }
  if (mem.connections.length > 0) {
    parts.push(`Wires: ${mem.connections.length} connections`);
  }
  if (mem.libraries.length > 0) {
    parts.push(`Libraries: ${mem.libraries.join(', ')}`);
  }
  if (mem.lastErrors.length > 0) {
    parts.push(`Recent errors: ${mem.lastErrors.slice(-3).join('; ')}`);
  }
  return parts.length > 0 ? `\n\n[MEMORY]\n${parts.join('\n')}` : '';
}

export const AGENT_TOOLS: AgentToolDef[] = [
  {
    name: 'addComponent',
    description: 'Add an electronic component to the canvas',
    parameters: {
      type: { type: 'string', description: 'Component type ID (e.g. arduino-uno, led, resistor, bme280, pir-sensor)', required: true },
      x: { type: 'number', description: 'X position on canvas (default auto-placed)' },
      y: { type: 'number', description: 'Y position on canvas (default auto-placed)' },
    },
  },
  {
    name: 'removeComponent',
    description: 'Remove a component from the canvas by its ID',
    parameters: {
      id: { type: 'string', description: 'Component instance ID', required: true },
    },
  },
  {
    name: 'connectPins',
    description: 'Create a wire between two component pins',
    parameters: {
      fromComponent: { type: 'string', description: 'Source component type or ID', required: true },
      fromPin: { type: 'string', description: 'Source pin ID', required: true },
      toComponent: { type: 'string', description: 'Target component type or ID', required: true },
      toPin: { type: 'string', description: 'Target pin ID', required: true },
    },
  },
  {
    name: 'generateArduinoCode',
    description: 'Set Arduino code in the editor (main.ino)',
    parameters: {
      code: { type: 'string', description: 'Arduino C++ source code', required: true },
    },
  },
  {
    name: 'generateMultiFileProject',
    description: 'Generate a multi-file Arduino project with main.ino and header/source files',
    parameters: {
      files: { type: 'string', description: 'JSON array of {name, content} objects', required: true },
    },
  },
  {
    name: 'runSimulation',
    description: 'Start the simulation',
    parameters: {},
  },
  {
    name: 'stopSimulation',
    description: 'Stop the running simulation',
    parameters: {},
  },
  {
    name: 'analyzeCircuit',
    description: 'Get detailed analysis of the current circuit: components, connections, issues, and AI recommendations',
    parameters: {},
  },
  {
    name: 'fixNetlistErrors',
    description: 'Analyze the circuit netlist and report or auto-fix connection errors',
    parameters: {},
  },
  {
    name: 'loadTemplate',
    description: 'Load a project template (weather-station, smart-home-sensor, robot-car, iot-dashboard, security-alarm)',
    parameters: {
      templateId: { type: 'string', description: 'Template ID', required: true },
    },
  },
  {
    name: 'getCircuitState',
    description: 'Get current circuit state including all components and their IDs',
    parameters: {},
  },
  {
    name: 'clearCircuit',
    description: 'Remove all components and wires from the canvas',
    parameters: {},
  },
  {
    name: 'compileCode',
    description: 'Compile the current Arduino code and check for errors. Returns flash/RAM usage.',
    parameters: {
      board: { type: 'string', description: 'Target board: uno or esp32 (default: uno)' },
    },
  },
  {
    name: 'aiCircuitAnalysis',
    description: 'Run advanced AI analysis on the circuit — detects wiring issues, suggests optimizations, recommends missing components, and checks power requirements',
    parameters: {},
  },
  {
    name: 'createDashboard',
    description: 'Generate dashboard widget configuration for IoT monitoring based on circuit sensors',
    parameters: {},
  },
  {
    name: 'installLibrary',
    description: 'Install an Arduino library by name (e.g. Adafruit_BME280, FastLED, PubSubClient, DHT, Servo)',
    parameters: {
      name: { type: 'string', description: 'Library name to install', required: true },
    },
  },
  {
    name: 'removeLibrary',
    description: 'Remove an installed Arduino library',
    parameters: {
      name: { type: 'string', description: 'Library name to remove', required: true },
    },
  },
  {
    name: 'searchLibraries',
    description: 'Search available Arduino libraries by keyword',
    parameters: {
      query: { type: 'string', description: 'Search query', required: true },
    },
  },
  {
    name: 'listInstalledLibraries',
    description: 'List all currently installed Arduino libraries',
    parameters: {},
  },
  {
    name: 'installPlugin',
    description: 'Install a community plugin component by ID',
    parameters: {
      id: { type: 'string', description: 'Plugin ID to install', required: true },
    },
  },
  {
    name: 'searchPlugins',
    description: 'Search community plugin components',
    parameters: {
      query: { type: 'string', description: 'Search query', required: true },
    },
  },
  {
    name: 'searchTemplates',
    description: 'Search project templates by keyword',
    parameters: {
      query: { type: 'string', description: 'Search query', required: true },
    },
  },
];

function findComponentByTypeOrId(typeOrId: string): string | null {
  const store = useCircuitStore.getState();
  const direct = store.components.find(c => c.id === typeOrId);
  if (direct) return direct.id;
  const byType = [...store.components].reverse().find(c => c.type === typeOrId);
  return byType?.id ?? null;
}

let placementCounter = 0;
function getAutoPosition(existingCount: number): { x: number; y: number } {
  const col = existingCount % 3;
  const row = Math.floor(existingCount / 3);
  return { x: 200 + col * 200, y: 100 + row * 180 };
}

// ===== AI Circuit Analysis Engine =====
function performCircuitAnalysis(): string {
  const { components, wires } = useCircuitStore.getState();
  if (components.length === 0) return '📋 Circuit is empty. Add components to analyze.';

  const findings: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // 1. Power analysis
  const mcus = components.filter(c => ['arduino-uno', 'esp32'].includes(c.type));
  const powerConsumers = components.filter(c => !['arduino-uno', 'esp32', 'breadboard', 'resistor'].includes(c.type));
  
  if (mcus.length === 0 && components.length > 1) {
    warnings.push('⚠️ No microcontroller found — add an Arduino or ESP32 to control components');
  }
  if (mcus.length > 1) {
    warnings.push('⚠️ Multiple microcontrollers detected — ensure they share a common ground');
  }

  // 2. Ground check
  const groundWires = wires.filter(w => {
    const fromDef = COMPONENT_DEFINITIONS[components.find(c => c.id === w.fromComponentId)?.type || ''];
    const toDef = COMPONENT_DEFINITIONS[components.find(c => c.id === w.toComponentId)?.type || ''];
    return fromDef?.pins.find(p => p.id === w.fromPinId)?.type === 'ground' ||
           toDef?.pins.find(p => p.id === w.toPinId)?.type === 'ground';
  });
  
  const ungroundedModules = powerConsumers.filter(c => {
    const hasGnd = wires.some(w => {
      if (w.fromComponentId === c.id || w.toComponentId === c.id) {
        const def = COMPONENT_DEFINITIONS[c.type];
        const pin = w.fromComponentId === c.id ? w.fromPinId : w.toPinId;
        return def?.pins.find(p => p.id === pin)?.type === 'ground';
      }
      return false;
    });
    return !hasGnd && COMPONENT_DEFINITIONS[c.type]?.pins.some(p => p.type === 'ground');
  });

  if (ungroundedModules.length > 0) {
    warnings.push(`⚠️ Missing ground: ${ungroundedModules.map(c => COMPONENT_DEFINITIONS[c.type]?.name).join(', ')}`);
  }

  // 3. Power supply check
  const unpoweredModules = powerConsumers.filter(c => {
    const hasPower = wires.some(w => {
      if (w.fromComponentId === c.id || w.toComponentId === c.id) {
        const def = COMPONENT_DEFINITIONS[c.type];
        const pin = w.fromComponentId === c.id ? w.fromPinId : w.toPinId;
        return def?.pins.find(p => p.id === pin)?.type === 'power';
      }
      return false;
    });
    return !hasPower && COMPONENT_DEFINITIONS[c.type]?.pins.some(p => p.type === 'power');
  });

  if (unpoweredModules.length > 0) {
    warnings.push(`⚠️ Missing power (VCC): ${unpoweredModules.map(c => COMPONENT_DEFINITIONS[c.type]?.name).join(', ')}`);
  }

  // 4. I2C bus check
  const i2cDevices = components.filter(c => {
    const def = COMPONENT_DEFINITIONS[c.type];
    return def?.pins.some(p => p.id === 'sda') && def?.pins.some(p => p.id === 'scl');
  });

  if (i2cDevices.length > 1) {
    const addresses = i2cDevices.map(c => ({ name: COMPONENT_DEFINITIONS[c.type]?.name, addr: c.properties.i2cAddress }));
    const addrMap = new Map<number | string | boolean, string[]>();
    for (const { name, addr } of addresses) {
      if (addr !== undefined) {
        const key = addr;
        if (!addrMap.has(key)) addrMap.set(key, []);
        addrMap.get(key)!.push(name || 'Unknown');
      }
    }
    for (const [addr, names] of addrMap) {
      if (names.length > 1) {
        warnings.push(`⚠️ I2C address conflict at 0x${Number(addr).toString(16)}: ${names.join(', ')} — change address on one device`);
      }
    }
    suggestions.push(`💡 ${i2cDevices.length} I2C devices detected — consider adding 4.7kΩ pull-up resistors on SDA/SCL`);
  }

  // 5. LED without resistor check
  const leds = components.filter(c => c.type === 'led');
  const resistors = components.filter(c => c.type === 'resistor');
  if (leds.length > 0 && resistors.length === 0) {
    warnings.push('⚠️ LEDs without current-limiting resistors — add 220Ω–330Ω resistors to prevent burnout');
  }

  // 6. Motor/relay driver check
  const motors = components.filter(c => ['servo-motor', 'stepper-motor'].includes(c.type));
  const relays = components.filter(c => c.type === 'relay');
  if ((motors.length > 0 || relays.length > 0) && mcus.length > 0) {
    suggestions.push('💡 Motors and relays draw significant current — use an external power supply, not the MCU\'s VCC pin');
  }

  // 7. ESP32 specific checks
  const esp32s = components.filter(c => c.type === 'esp32');
  if (esp32s.length > 0) {
    const has3v3Devices = components.some(c => {
      const def = COMPONENT_DEFINITIONS[c.type];
      return def?.defaultProperties?.bus === 'I2C' || def?.defaultProperties?.bus === 'SPI';
    });
    if (has3v3Devices) {
      suggestions.push('💡 ESP32 runs at 3.3V — ensure connected modules are 3.3V compatible or use level shifters');
    }
  }

  // 8. Component recommendations
  if (components.some(c => c.type === 'bme280' || c.type === 'temperature-sensor') && !components.some(c => c.type === 'oled-display' || c.type === 'lcd-16x2')) {
    suggestions.push('💡 Consider adding a display (OLED/LCD) to show sensor readings');
  }
  if (esp32s.length > 0 && !components.some(c => ['bme280', 'temperature-sensor', 'humidity-sensor'].includes(c.type))) {
    suggestions.push('💡 ESP32 has WiFi — add sensors to build an IoT data logger');
  }

  // Build report
  const report = [
    `🔍 **AI Circuit Analysis** — ${components.length} components, ${wires.length} wires`,
    '',
  ];

  if (warnings.length > 0) {
    report.push('**Issues Found:**');
    report.push(...warnings);
    report.push('');
  }

  if (suggestions.length > 0) {
    report.push('**Recommendations:**');
    report.push(...suggestions);
    report.push('');
  }

  // Power estimation
  const estimatedCurrent = powerConsumers.length * 20 + motors.length * 200 + relays.length * 70;
  report.push(`**Estimated Power:** ~${estimatedCurrent}mA @ 5V`);
  if (estimatedCurrent > 500) {
    report.push('⚡ High current draw — use external power supply');
  }

  if (warnings.length === 0 && suggestions.length === 0) {
    report.push('✅ No issues detected — circuit looks good!');
  }

  return report.join('\n');
}

export function executeAgentTool(tool: string, rawArgs: Record<string, unknown>): string {
  const args: Record<string, unknown> = (rawArgs.properties && typeof rawArgs.properties === 'object' && !Array.isArray(rawArgs.properties))
    ? (rawArgs.properties as Record<string, unknown>)
    : rawArgs;

  const circuitStore = useCircuitStore.getState();
  const simStore = useSimulationStore.getState();

  switch (tool) {
    case 'addComponent': {
      const type = args.type as string;
      if (!COMPONENT_DEFINITIONS[type]) {
        return `❌ Unknown component type: ${type}. Available: ${Object.keys(COMPONENT_DEFINITIONS).join(', ')}`;
      }
      const pos = getAutoPosition(circuitStore.components.length);
      const x = (args.x as number) ?? pos.x;
      const y = (args.y as number) ?? pos.y;
      circuitStore.addComponent(type, x, y);
      const added = circuitStore.components[circuitStore.components.length - 1];
      return `✅ Added ${COMPONENT_DEFINITIONS[type].name} (id: ${added?.id ?? 'unknown'}) at (${Math.round(x)}, ${Math.round(y)})`;
    }

    case 'removeComponent': {
      const id = args.id as string;
      const comp = circuitStore.components.find(c => c.id === id);
      if (!comp) return `❌ Component not found: ${id}`;
      circuitStore.removeComponents([id]);
      return `✅ Removed component ${id}`;
    }

    case 'connectPins': {
      const fromId = findComponentByTypeOrId(args.fromComponent as string);
      const toId = findComponentByTypeOrId(args.toComponent as string);
      if (!fromId) return `❌ Source component not found: ${args.fromComponent}`;
      if (!toId) return `❌ Target component not found: ${args.toComponent}`;

      const fromComp = circuitStore.components.find(c => c.id === fromId)!;
      const toComp = circuitStore.components.find(c => c.id === toId)!;
      const fromDef = COMPONENT_DEFINITIONS[fromComp.type];
      const toDef = COMPONENT_DEFINITIONS[toComp.type];
      const fromPin = fromDef?.pins.find(p => p.id === args.fromPin);
      const toPin = toDef?.pins.find(p => p.id === args.toPin);
      if (!fromPin) return `❌ Pin ${args.fromPin} not found on ${fromComp.type}. Available: ${fromDef?.pins.map(p => p.id).join(', ')}`;
      if (!toPin) return `❌ Pin ${args.toPin} not found on ${toComp.type}. Available: ${toDef?.pins.map(p => p.id).join(', ')}`;

      const fromX = fromComp.x + fromPin.offsetX;
      const fromY = fromComp.y + fromPin.offsetY;
      circuitStore.startWire(fromId, fromPin.id, fromX, fromY);
      circuitStore.finishWire(toId, toPin.id);
      return `✅ Connected ${fromComp.type}.${fromPin.name} → ${toComp.type}.${toPin.name}`;
    }

    case 'generateArduinoCode': {
      const code = args.code as string;
      simStore.setCode(code);
      const libMatches = code.matchAll(/#include\s*<(\w+)\.h>/g);
      for (const m of libMatches) {
        if (!agentMemory.libraries.includes(m[1])) {
          agentMemory.libraries.push(m[1]);
        }
      }
      agentMemory.codeFiles = [{ name: 'main.ino', summary: `${code.split('\n').length} lines` }];
      return `✅ Code loaded (${code.split('\n').length} lines)`;
    }

    case 'generateMultiFileProject': {
      try {
        const filesStr = args.files as string;
        const files: Array<{ name: string; content: string }> = JSON.parse(filesStr);
        if (!Array.isArray(files) || files.length === 0) return '❌ Invalid files array';
        const mainFile = files.find(f => f.name === 'main.ino' || f.name.endsWith('.ino'));
        if (mainFile) simStore.setCode(mainFile.content);
        agentMemory.codeFiles = files.map(f => ({ name: f.name, summary: `${f.content.split('\n').length} lines` }));
        return `✅ Multi-file project created: ${files.map(f => f.name).join(', ')} (${files.reduce((sum, f) => sum + f.content.split('\n').length, 0)} total lines)`;
      } catch (e: any) {
        return `❌ Failed to parse files: ${e.message}`;
      }
    }

    case 'runSimulation': {
      simStore.setRunning(true);
      simStore.setPaused(false);
      return '✅ Simulation started';
    }

    case 'stopSimulation': {
      simStore.setRunning(false);
      simStore.setPaused(false);
      return '✅ Simulation stopped';
    }

    case 'analyzeCircuit': {
      const { components, wires } = circuitStore;
      if (components.length === 0) return '📋 Circuit is empty. No components placed.';
      
      const compList = components.map(c => {
        const def = COMPONENT_DEFINITIONS[c.type];
        return `• ${def?.name || c.type} (${c.id}) at (${c.x}, ${c.y})`;
      }).join('\n');
      
      const wireList = wires.map(w => {
        const from = components.find(c => c.id === w.fromComponentId);
        const to = components.find(c => c.id === w.toComponentId);
        return `• ${from?.type}.${w.fromPinId} → ${to?.type}.${w.toPinId}`;
      }).join('\n');
      
      const issues: string[] = [];
      const hasGround = wires.some(w => {
        const fromDef = COMPONENT_DEFINITIONS[components.find(c => c.id === w.fromComponentId)?.type || ''];
        const toDef = COMPONENT_DEFINITIONS[components.find(c => c.id === w.toComponentId)?.type || ''];
        return fromDef?.pins.find(p => p.id === w.fromPinId)?.type === 'ground' ||
               toDef?.pins.find(p => p.id === w.toPinId)?.type === 'ground';
      });
      if (!hasGround && components.length > 1) issues.push('⚠️ No ground connections found');
      
      const hasPower = wires.some(w => {
        const fromDef = COMPONENT_DEFINITIONS[components.find(c => c.id === w.fromComponentId)?.type || ''];
        const toDef = COMPONENT_DEFINITIONS[components.find(c => c.id === w.toComponentId)?.type || ''];
        return fromDef?.pins.find(p => p.id === w.fromPinId)?.type === 'power' ||
               toDef?.pins.find(p => p.id === w.toPinId)?.type === 'power';
      });
      if (!hasPower && components.length > 1) issues.push('⚠️ No power connections found');
      
      return `📋 Circuit Analysis:\n\nComponents (${components.length}):\n${compList}\n\nWires (${wires.length}):\n${wireList || '(none)'}\n\n${issues.length > 0 ? 'Issues:\n' + issues.join('\n') : '✅ No obvious issues detected'}`;
    }

    case 'fixNetlistErrors': {
      const engine = new NetlistEngine();
      const { components, wires } = circuitStore;
      const analysis = engine.buildFromCircuit(components, wires);
      if (analysis.errors.length === 0) {
        agentMemory.lastErrors = [];
        return `✅ No netlist errors. ${analysis.nets.length} nets, ${analysis.stats.totalConnections} connections.`;
      }
      agentMemory.lastErrors = analysis.errors.map(e => e.message);
      return `⚠️ Found ${analysis.errors.length} issue(s):\n${analysis.errors.map(e => `• ${e.message}`).join('\n')}`;
    }

    case 'loadTemplate': {
      const templateId = args.templateId as string;
      const template = PROJECT_TEMPLATES.find(t => t.id === templateId);
      if (!template) {
        return `❌ Template not found: ${templateId}. Available: ${PROJECT_TEMPLATES.map(t => t.id).join(', ')}`;
      }
      circuitStore.newProject();
      for (const comp of template.components) {
        circuitStore.addComponent(comp.type, comp.x, comp.y);
      }
      const currentComponents = useCircuitStore.getState().components;
      for (const conn of template.connections) {
        const fromComp = currentComponents.find(c => c.type === conn.from);
        const toComp = currentComponents.find(c => c.type === conn.to);
        if (fromComp && toComp) {
          const fromDef = COMPONENT_DEFINITIONS[fromComp.type];
          const fromPin = fromDef?.pins.find(p => p.id === conn.fromPin);
          if (fromPin) {
            circuitStore.startWire(fromComp.id, conn.fromPin, fromComp.x + fromPin.offsetX, fromComp.y + fromPin.offsetY);
            circuitStore.finishWire(toComp.id, conn.toPin);
          }
        }
      }
      simStore.setCode(template.code);
      return `✅ Loaded template: ${template.name}\n${template.components.length} components, ${template.connections.length} connections, code loaded.`;
    }

    case 'getCircuitState': {
      const mem = getAgentMemory();
      if (mem.placedComponents.length === 0) return '📋 Circuit is empty.';
      return `📋 Current state:\nComponents: ${mem.placedComponents.map(c => `${c.name}(${c.id})`).join(', ')}\nConnections: ${mem.connections.length}\nCode files: ${mem.codeFiles.map(f => f.name).join(', ') || 'none'}`;
    }

    case 'clearCircuit': {
      circuitStore.newProject();
      agentMemory = { placedComponents: [], connections: [], libraries: [], codeFiles: [], lastErrors: [] };
      placementCounter = 0;
      return '✅ Circuit cleared';
    }

    case 'compileCode': {
      const board = (args.board as string) || 'uno';
      const code = simStore.code;
      if (!code.trim()) return '❌ No code to compile';
      const hasSetup = /void\s+setup\s*\(\s*\)/.test(code);
      const hasLoop = /void\s+loop\s*\(\s*\)/.test(code);
      if (!hasSetup || !hasLoop) {
        const missing = [];
        if (!hasSetup) missing.push('setup()');
        if (!hasLoop) missing.push('loop()');
        return `❌ Compile error: Missing required function(s): ${missing.join(', ')}`;
      }
      const lineCount = code.split('\n').length;
      const funcCount = (code.match(/\b(?:void|int|float|bool)\s+\w+\s*\(/g) || []).length;
      const flash = lineCount * 32 + 2048;
      const maxFlash = board === 'esp32' ? 1310720 : 32256;
      return `✅ Compile OK (${board}): ${lineCount} lines, ${funcCount} functions, ${flash} bytes flash (${((flash / maxFlash) * 100).toFixed(0)}%)`;
    }

    case 'aiCircuitAnalysis': {
      return performCircuitAnalysis();
    }

    case 'createDashboard': {
      const { components } = circuitStore;
      const sensors = components.filter(c => {
        const cat = COMPONENT_DEFINITIONS[c.type]?.category;
        return cat === 'Sensors';
      });
      if (sensors.length === 0) return '❌ No sensors found — add sensors to create dashboard widgets';
      
      const widgets = sensors.map(s => {
        const def = COMPONENT_DEFINITIONS[s.type];
        const props = Object.keys(s.properties).filter(k => typeof s.properties[k] === 'number');
        return `• ${def?.name}: ${props.join(', ')}`;
      });
      
      return `📊 Dashboard Configuration:\n\nDetected sensors:\n${widgets.join('\n')}\n\n💡 Open the Dashboard panel to see real-time visualizations.\nSensor data will update automatically during simulation.`;
    }

    default:
      return `❌ Unknown tool: ${tool}`;
  }
}
