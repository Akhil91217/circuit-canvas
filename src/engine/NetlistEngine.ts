/**
 * Circuit Netlist Engine - Phase 4
 * Graph-based connection tracking, short-circuit detection,
 * and pin validation.
 */

import { CircuitComponent, Wire } from '@/types/circuit';
import { COMPONENT_DEFINITIONS } from '@/data/componentDefinitions';

export interface NetNode {
  id: string;
  type: 'power' | 'ground' | 'signal' | 'digital' | 'analog';
  voltage: number | null;
  connectedPins: NetPin[];
}

export interface NetPin {
  componentId: string;
  pinId: string;
  componentType: string;
  pinType: 'digital' | 'analog' | 'power' | 'ground' | 'signal';
  pinDirection: 'input' | 'output' | 'bidirectional';
}

export interface NetlistError {
  type: 'short_circuit' | 'invalid_connection' | 'floating_pin' | 'power_conflict' | 'missing_ground';
  message: string;
  componentIds: string[];
  pinIds: string[];
  severity: 'error' | 'warning';
}

export interface NetlistAnalysis {
  nets: NetNode[];
  errors: NetlistError[];
  powerNets: string[];
  groundNets: string[];
  stats: {
    totalNets: number;
    totalConnections: number;
    floatingPins: number;
    errors: number;
    warnings: number;
  };
}

export class NetlistEngine {
  private adjacency: Map<string, Set<string>> = new Map();
  private pinMap: Map<string, NetPin> = new Map();

  buildFromCircuit(components: CircuitComponent[], wires: Wire[]): NetlistAnalysis {
    this.adjacency.clear();
    this.pinMap.clear();

    // Register all pins as nodes
    for (const comp of components) {
      const def = COMPONENT_DEFINITIONS[comp.type];
      if (!def) continue;
      for (const pin of def.pins) {
        const nodeId = `${comp.id}:${pin.id}`;
        this.adjacency.set(nodeId, new Set());
        this.pinMap.set(nodeId, {
          componentId: comp.id,
          pinId: pin.id,
          componentType: comp.type,
          pinType: pin.type,
          pinDirection: pin.direction,
        });
      }
    }

    // Add wire connections (edges)
    for (const wire of wires) {
      const fromId = `${wire.fromComponentId}:${wire.fromPinId}`;
      const toId = `${wire.toComponentId}:${wire.toPinId}`;
      this.adjacency.get(fromId)?.add(toId);
      this.adjacency.get(toId)?.add(fromId);
    }

    // Find connected nets via BFS
    const visited = new Set<string>();
    const nets: NetNode[] = [];
    let netIndex = 0;

    for (const [nodeId] of this.adjacency) {
      if (visited.has(nodeId)) continue;
      const connectedPins: NetPin[] = [];
      const queue = [nodeId];
      visited.add(nodeId);

      while (queue.length > 0) {
        const current = queue.shift()!;
        const pin = this.pinMap.get(current);
        if (pin) connectedPins.push(pin);

        const neighbors = this.adjacency.get(current);
        if (neighbors) {
          for (const n of neighbors) {
            if (!visited.has(n)) {
              visited.add(n);
              queue.push(n);
            }
          }
        }
      }

      // Determine net type
      const hasPower = connectedPins.some(p => p.pinType === 'power');
      const hasGround = connectedPins.some(p => p.pinType === 'ground');
      let type: NetNode['type'] = 'signal';
      if (hasPower) type = 'power';
      if (hasGround) type = 'ground';

      nets.push({
        id: `net_${netIndex++}`,
        type,
        voltage: hasPower ? 5 : hasGround ? 0 : null,
        connectedPins,
      });
    }

    // Analyze errors
    const errors = this.analyzeErrors(nets, components);
    const powerNets = nets.filter(n => n.type === 'power').map(n => n.id);
    const groundNets = nets.filter(n => n.type === 'ground').map(n => n.id);

    return {
      nets,
      errors,
      powerNets,
      groundNets,
      stats: {
        totalNets: nets.length,
        totalConnections: wires.length,
        floatingPins: nets.filter(n => n.connectedPins.length === 1).length,
        errors: errors.filter(e => e.severity === 'error').length,
        warnings: errors.filter(e => e.severity === 'warning').length,
      },
    };
  }

  private analyzeErrors(nets: NetNode[], components: CircuitComponent[]): NetlistError[] {
    const errors: NetlistError[] = [];

    for (const net of nets) {
      // Short circuit: power and ground on same net
      const hasPower = net.connectedPins.some(p => p.pinType === 'power' && p.pinDirection === 'output');
      const hasGround = net.connectedPins.some(p => p.pinType === 'ground');
      if (hasPower && hasGround) {
        errors.push({
          type: 'short_circuit',
          message: `Short circuit detected: power and ground connected on ${net.id}`,
          componentIds: net.connectedPins.map(p => p.componentId),
          pinIds: net.connectedPins.map(p => p.pinId),
          severity: 'error',
        });
      }

      // Multiple output drivers on same net
      const outputs = net.connectedPins.filter(p => p.pinDirection === 'output' && p.pinType !== 'ground');
      if (outputs.length > 1) {
        errors.push({
          type: 'power_conflict',
          message: `Multiple output drivers on ${net.id}: ${outputs.map(p => `${p.componentType}:${p.pinId}`).join(', ')}`,
          componentIds: outputs.map(p => p.componentId),
          pinIds: outputs.map(p => p.pinId),
          severity: 'warning',
        });
      }

      // Invalid analog-to-digital connections
      const hasAnalog = net.connectedPins.some(p => p.pinType === 'analog');
      const hasDigitalOutput = net.connectedPins.some(p => p.pinType === 'digital' && p.pinDirection === 'output');
      if (hasAnalog && hasDigitalOutput) {
        errors.push({
          type: 'invalid_connection',
          message: `Mixed analog/digital signals on ${net.id}`,
          componentIds: net.connectedPins.map(p => p.componentId),
          pinIds: net.connectedPins.map(p => p.pinId),
          severity: 'warning',
        });
      }
    }

    // Check for components without ground connection
    const componentHasGround = new Set<string>();
    for (const net of nets) {
      if (net.type === 'ground') {
        for (const pin of net.connectedPins) {
          componentHasGround.add(pin.componentId);
        }
      }
    }

    for (const comp of components) {
      const def = COMPONENT_DEFINITIONS[comp.type];
      if (!def) continue;
      const needsGround = def.pins.some(p => p.type === 'ground');
      if (needsGround && !componentHasGround.has(comp.id)) {
        errors.push({
          type: 'missing_ground',
          message: `${def.name} (${comp.id}) is missing a ground connection`,
          componentIds: [comp.id],
          pinIds: [],
          severity: 'warning',
        });
      }
    }

    return errors;
  }

  // Get all pins connected to a specific pin
  getConnectedPins(componentId: string, pinId: string): NetPin[] {
    const nodeId = `${componentId}:${pinId}`;
    const visited = new Set<string>();
    const result: NetPin[] = [];
    const queue = [nodeId];
    visited.add(nodeId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const pin = this.pinMap.get(current);
      if (pin && current !== nodeId) result.push(pin);

      const neighbors = this.adjacency.get(current);
      if (neighbors) {
        for (const n of neighbors) {
          if (!visited.has(n)) {
            visited.add(n);
            queue.push(n);
          }
        }
      }
    }

    return result;
  }
}
