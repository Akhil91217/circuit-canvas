export interface PinDefinition {
  id: string;
  name: string;
  type: 'digital' | 'analog' | 'power' | 'ground' | 'signal';
  direction: 'input' | 'output' | 'bidirectional';
  offsetX: number;
  offsetY: number;
}

export interface ComponentDefinition {
  type: string;
  category: string;
  name: string;
  width: number;
  height: number;
  color: string;
  pins: PinDefinition[];
  defaultProperties: Record<string, string | number | boolean>;
  icon: string;
}

export interface CircuitComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  properties: Record<string, string | number | boolean>;
  selected: boolean;
}

export interface Wire {
  id: string;
  fromComponentId: string;
  fromPinId: string;
  toComponentId: string;
  toPinId: string;
  color: string;
  points: number[];
}

export interface WireInProgress {
  fromComponentId: string;
  fromPinId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface Project {
  name: string;
  components: CircuitComponent[];
  wires: Wire[];
  settings: {
    gridSize: number;
    snapToGrid: boolean;
  };
}

export type HistoryAction = {
  type: 'add_component' | 'remove_component' | 'move_component' | 'add_wire' | 'remove_wire' | 'update_property';
  data: unknown;
  inverse: unknown;
};
