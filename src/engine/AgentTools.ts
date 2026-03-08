import { useCircuitStore } from '@/store/circuitStore';
import { useSimulationStore } from '@/store/simulationStore';
import { COMPONENT_DEFINITIONS } from '@/data/componentDefinitions';
import { NetlistEngine } from '@/engine/NetlistEngine';

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

export const AGENT_TOOLS: AgentToolDef[] = [
  {
    name: 'addComponent',
    description: 'Add an electronic component to the canvas',
    parameters: {
      type: { type: 'string', description: 'Component type ID (e.g. arduino-uno, led, resistor)', required: true },
      x: { type: 'number', description: 'X position on canvas (default 200)' },
      y: { type: 'number', description: 'Y position on canvas (default 200)' },
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
    description: 'Set Arduino code in the editor',
    parameters: {
      code: { type: 'string', description: 'Arduino C++ source code', required: true },
    },
  },
  {
    name: 'runSimulation',
    description: 'Start the simulation',
    parameters: {},
  },
  {
    name: 'fixNetlistErrors',
    description: 'Analyze the circuit netlist and report or auto-fix connection errors',
    parameters: {},
  },
];

function findComponentByTypeOrId(typeOrId: string): string | null {
  const store = useCircuitStore.getState();
  // Direct ID match
  const direct = store.components.find(c => c.id === typeOrId);
  if (direct) return direct.id;
  // Type match (last added of that type)
  const byType = [...store.components].reverse().find(c => c.type === typeOrId);
  return byType?.id ?? null;
}

export function executeAgentTool(tool: string, args: Record<string, unknown>): string {
  const circuitStore = useCircuitStore.getState();
  const simStore = useSimulationStore.getState();

  switch (tool) {
    case 'addComponent': {
      const type = args.type as string;
      if (!COMPONENT_DEFINITIONS[type]) {
        return `❌ Unknown component type: ${type}. Available: ${Object.keys(COMPONENT_DEFINITIONS).join(', ')}`;
      }
      const x = (args.x as number) ?? 200 + Math.random() * 400;
      const y = (args.y as number) ?? 100 + Math.random() * 300;
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
      if (!fromPin) return `❌ Pin ${args.fromPin} not found on ${fromComp.type}`;
      if (!toPin) return `❌ Pin ${args.toPin} not found on ${toComp.type}`;

      const fromX = fromComp.x + fromPin.offsetX;
      const fromY = fromComp.y + fromPin.offsetY;
      circuitStore.startWire(fromId, fromPin.id, fromX, fromY);
      circuitStore.finishWire(toId, toPin.id);
      return `✅ Connected ${fromComp.type}.${fromPin.name} → ${toComp.type}.${toPin.name}`;
    }

    case 'generateArduinoCode': {
      const code = args.code as string;
      simStore.setCode(code);
      return `✅ Code loaded (${code.split('\n').length} lines)`;
    }

    case 'runSimulation': {
      simStore.setRunning(true);
      simStore.setPaused(false);
      return '✅ Simulation started';
    }

    case 'fixNetlistErrors': {
      const engine = new NetlistEngine();
      const { components, wires } = circuitStore;
      const analysis = engine.buildFromCircuit(components, wires);
      if (analysis.errors.length === 0) {
        return `✅ No netlist errors. ${analysis.nets.length} nets, ${analysis.connectedComponents} connected components.`;
      }
      return `⚠️ Found ${analysis.errors.length} issue(s):\n${analysis.errors.map(e => `• ${e.message}`).join('\n')}`;
    }

    default:
      return `❌ Unknown tool: ${tool}`;
  }
}
