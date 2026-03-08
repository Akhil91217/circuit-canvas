import { create } from 'zustand';
import { CircuitComponent, Wire, WireInProgress, Project } from '@/types/circuit';
import { COMPONENT_DEFINITIONS } from '@/data/componentDefinitions';

const GRID_SIZE = 20;

function snapToGrid(val: number): number {
  return Math.round(val / GRID_SIZE) * GRID_SIZE;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

interface HistoryEntry {
  components: CircuitComponent[];
  wires: Wire[];
}

interface CircuitState {
  components: CircuitComponent[];
  wires: Wire[];
  selectedIds: string[];
  wireInProgress: WireInProgress | null;
  zoom: number;
  panX: number;
  panY: number;
  projectName: string;
  history: HistoryEntry[];
  historyIndex: number;

  // Actions
  addComponent: (type: string, x: number, y: number) => void;
  removeComponents: (ids: string[]) => void;
  moveComponent: (id: string, x: number, y: number) => void;
  rotateComponent: (id: string) => void;
  duplicateComponents: (ids: string[]) => void;
  selectComponent: (id: string, multi?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  updateProperty: (id: string, key: string, value: string | number | boolean) => void;

  startWire: (fromComponentId: string, fromPinId: string, fromX: number, fromY: number) => void;
  updateWireProgress: (toX: number, toY: number) => void;
  finishWire: (toComponentId: string, toPinId: string) => void;
  cancelWire: () => void;
  removeWire: (id: string) => void;

  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;

  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  newProject: () => void;
  saveProject: () => string;
  loadProject: (json: string) => void;
}

export const useCircuitStore = create<CircuitState>((set, get) => ({
  components: [],
  wires: [],
  selectedIds: [],
  wireInProgress: null,
  zoom: 1,
  panX: 0,
  panY: 0,
  projectName: 'Untitled Project',
  history: [{ components: [], wires: [] }],
  historyIndex: 0,

  pushHistory: () => {
    const { components, wires, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      components: JSON.parse(JSON.stringify(components)),
      wires: JSON.parse(JSON.stringify(wires)),
    });
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  addComponent: (type, x, y) => {
    const def = COMPONENT_DEFINITIONS[type];
    if (!def) return;
    const comp: CircuitComponent = {
      id: generateId(),
      type,
      x: snapToGrid(x),
      y: snapToGrid(y),
      rotation: 0,
      properties: { ...def.defaultProperties },
      selected: false,
    };
    set(s => ({ components: [...s.components, comp] }));
    get().pushHistory();
  },

  removeComponents: (ids) => {
    set(s => ({
      components: s.components.filter(c => !ids.includes(c.id)),
      wires: s.wires.filter(w => !ids.includes(w.fromComponentId) && !ids.includes(w.toComponentId)),
      selectedIds: [],
    }));
    get().pushHistory();
  },

  moveComponent: (id, x, y) => {
    set(s => ({
      components: s.components.map(c =>
        c.id === id ? { ...c, x: snapToGrid(x), y: snapToGrid(y) } : c
      ),
    }));
  },

  rotateComponent: (id) => {
    set(s => ({
      components: s.components.map(c =>
        c.id === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c
      ),
    }));
    get().pushHistory();
  },

  duplicateComponents: (ids) => {
    const { components } = get();
    const dupes = components
      .filter(c => ids.includes(c.id))
      .map(c => ({
        ...c,
        id: generateId(),
        x: c.x + 40,
        y: c.y + 40,
        selected: false,
      }));
    set(s => ({ components: [...s.components, ...dupes] }));
    get().pushHistory();
  },

  selectComponent: (id, multi = false) => {
    set(s => {
      if (multi) {
        const exists = s.selectedIds.includes(id);
        return { selectedIds: exists ? s.selectedIds.filter(i => i !== id) : [...s.selectedIds, id] };
      }
      return { selectedIds: [id] };
    });
  },

  selectAll: () => set(s => ({ selectedIds: s.components.map(c => c.id) })),
  clearSelection: () => set({ selectedIds: [] }),

  updateProperty: (id, key, value) => {
    set(s => ({
      components: s.components.map(c =>
        c.id === id ? { ...c, properties: { ...c.properties, [key]: value } } : c
      ),
    }));
    get().pushHistory();
  },

  startWire: (fromComponentId, fromPinId, fromX, fromY) => {
    set({ wireInProgress: { fromComponentId, fromPinId, fromX, fromY, toX: fromX, toY: fromY } });
  },

  updateWireProgress: (toX, toY) => {
    set(s => s.wireInProgress ? { wireInProgress: { ...s.wireInProgress, toX, toY } } : {});
  },

  finishWire: (toComponentId, toPinId) => {
    const { wireInProgress, wires } = get();
    if (!wireInProgress) return;
    if (wireInProgress.fromComponentId === toComponentId) { set({ wireInProgress: null }); return; }
    // check duplicate
    const exists = wires.some(w =>
      (w.fromComponentId === wireInProgress.fromComponentId && w.fromPinId === wireInProgress.fromPinId &&
        w.toComponentId === toComponentId && w.toPinId === toPinId) ||
      (w.toComponentId === wireInProgress.fromComponentId && w.toPinId === wireInProgress.fromPinId &&
        w.fromComponentId === toComponentId && w.fromPinId === toPinId)
    );
    if (exists) { set({ wireInProgress: null }); return; }
    const wire: Wire = {
      id: generateId(),
      fromComponentId: wireInProgress.fromComponentId,
      fromPinId: wireInProgress.fromPinId,
      toComponentId,
      toPinId,
      color: '#22d3a0',
      points: [],
    };
    set(s => ({ wires: [...s.wires, wire], wireInProgress: null }));
    get().pushHistory();
  },

  cancelWire: () => set({ wireInProgress: null }),
  removeWire: (id) => {
    set(s => ({ wires: s.wires.filter(w => w.id !== id) }));
    get().pushHistory();
  },

  setZoom: (zoom) => set({ zoom: Math.max(0.2, Math.min(3, zoom)) }),
  setPan: (x, y) => set({ panX: x, panY: y }),
  resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    set({
      components: JSON.parse(JSON.stringify(prev.components)),
      wires: JSON.parse(JSON.stringify(prev.wires)),
      historyIndex: historyIndex - 1,
      selectedIds: [],
    });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    set({
      components: JSON.parse(JSON.stringify(next.components)),
      wires: JSON.parse(JSON.stringify(next.wires)),
      historyIndex: historyIndex + 1,
      selectedIds: [],
    });
  },

  newProject: () => {
    set({
      components: [],
      wires: [],
      selectedIds: [],
      wireInProgress: null,
      zoom: 1,
      panX: 0,
      panY: 0,
      projectName: 'Untitled Project',
      history: [{ components: [], wires: [] }],
      historyIndex: 0,
    });
  },

  saveProject: () => {
    const { components, wires, projectName } = get();
    const project: Project = {
      name: projectName,
      components,
      wires,
      settings: { gridSize: GRID_SIZE, snapToGrid: true },
    };
    return JSON.stringify(project, null, 2);
  },

  loadProject: (json) => {
    try {
      const project: Project = JSON.parse(json);
      set({
        components: project.components,
        wires: project.wires,
        projectName: project.name,
        selectedIds: [],
        wireInProgress: null,
        history: [{ components: [...project.components], wires: [...project.wires] }],
        historyIndex: 0,
      });
    } catch (e) {
      console.error('Failed to load project', e);
    }
  },
}));
