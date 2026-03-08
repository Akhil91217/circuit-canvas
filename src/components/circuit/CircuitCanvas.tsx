import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line, Circle, Group, Text } from 'react-konva';
import { useCircuitStore } from '@/store/circuitStore';
import { useSimulationStore } from '@/store/simulationStore';
import { COMPONENT_DEFINITIONS } from '@/data/componentDefinitions';
import { COMPONENT_RENDERERS, GenericRenderer } from '@/components/circuit/ComponentRenderers';
import { PinDefinition } from '@/types/circuit';
import Konva from 'konva';

const GRID_SIZE = 20;

function CanvasGrid({ width, height, zoom }: { width: number; height: number; zoom: number }) {
  const lines: React.ReactElement[] = [];
  const gridRange = Math.max(width, height) * 2 / zoom;
  const start = -gridRange;
  const end = gridRange;

  for (let i = Math.floor(start / GRID_SIZE) * GRID_SIZE; i < end; i += GRID_SIZE) {
    const isMajor = i % (GRID_SIZE * 5) === 0;
    lines.push(
      <Line key={`v${i}`} points={[i, start, i, end]} stroke={isMajor ? '#1e293b' : '#151d2e'} strokeWidth={isMajor ? 0.8 : 0.4} />,
      <Line key={`h${i}`} points={[start, i, end, i]} stroke={isMajor ? '#1e293b' : '#151d2e'} strokeWidth={isMajor ? 0.8 : 0.4} />
    );
  }
  return <>{lines}</>;
}

function ComponentPin({
  pin,
  compX,
  compY,
  compId,
  rotation,
}: {
  pin: PinDefinition;
  compX: number;
  compY: number;
  compId: string;
  rotation: number;
}) {
  const { startWire, finishWire, wireInProgress, wires } = useCircuitStore();
  const [hovered, setHovered] = useState(false);

  const isConnected = wires.some(
    w => (w.fromComponentId === compId && w.fromPinId === pin.id) ||
         (w.toComponentId === compId && w.toPinId === pin.id)
  );

  const pinColor = hovered ? '#22d3a0' : isConnected ? '#38bdf8' : '#eab308';
  const radius = hovered ? 5 : 3.5;

  return (
    <Group>
      <Circle
        x={pin.offsetX}
        y={pin.offsetY}
        radius={radius}
        fill={pinColor}
        stroke={hovered ? '#22d3a0' : 'transparent'}
        strokeWidth={hovered ? 2 : 0}
        onMouseEnter={(e) => {
          setHovered(true);
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = 'crosshair';
        }}
        onMouseLeave={(e) => {
          setHovered(false);
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = 'default';
        }}
        onMouseDown={(e) => {
          e.cancelBubble = true;
          const absX = compX + pin.offsetX;
          const absY = compY + pin.offsetY;
          if (wireInProgress) {
            finishWire(compId, pin.id);
          } else {
            startWire(compId, pin.id, absX, absY);
          }
        }}
      />
      {hovered && (
        <Text
          x={pin.offsetX + 8}
          y={pin.offsetY - 6}
          text={pin.name}
          fontSize={10}
          fill="#94a3b8"
          fontFamily="JetBrains Mono"
        />
      )}
    </Group>
  );
}

function CircuitComponentView({
  id,
  type,
  x,
  y,
  rotation,
  isSelected,
  properties,
}: {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  isSelected: boolean;
  properties: Record<string, string | number | boolean>;
}) {
  const { selectComponent, moveComponent, pushHistory } = useCircuitStore();
  const { pinStates, isRunning } = useSimulationStore();
  const def = COMPONENT_DEFINITIONS[type];
  if (!def) return null;

  const Renderer = COMPONENT_RENDERERS[type] || GenericRenderer;

  return (
    <Group
      x={x}
      y={y}
      rotation={rotation}
      draggable
      onDragEnd={(e) => {
        moveComponent(id, e.target.x(), e.target.y());
        pushHistory();
      }}
      onMouseDown={(e) => {
        const multi = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        selectComponent(id, multi);
      }}
    >
      {/* Selection glow */}
      {isSelected && (
        <Rect
          x={-3}
          y={-3}
          width={def.width + 6}
          height={def.height + 6}
          stroke="#22d3a0"
          strokeWidth={2}
          cornerRadius={6}
          dash={[6, 3]}
        />
      )}

      {/* Realistic component renderer */}
      <Renderer def={def} properties={properties} isSimulating={isRunning} pinStates={pinStates} />

      {/* Pins */}
      {def.pins.map(pin => (
        <ComponentPin
          key={pin.id}
          pin={pin}
          compX={x}
          compY={y}
          compId={id}
          rotation={rotation}
        />
      ))}
    </Group>
  );
}

function WireView({ fromX, fromY, toX, toY, color, isTemp }: {
  fromX: number; fromY: number; toX: number; toY: number; color: string; isTemp?: boolean;
}) {
  const midX = (fromX + toX) / 2;
  return (
    <Line
      points={[fromX, fromY, midX, fromY, midX, toY, toX, toY]}
      stroke={color}
      strokeWidth={isTemp ? 1.5 : 2.5}
      lineCap="round"
      lineJoin="round"
      dash={isTemp ? [4, 4] : undefined}
      opacity={isTemp ? 0.6 : 1}
      shadowColor={color}
      shadowBlur={isTemp ? 0 : 4}
      shadowOpacity={0.3}
    />
  );
}

export default function CircuitCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const {
    components, wires, selectedIds, wireInProgress,
    zoom, panX, panY, setZoom, setPan,
    clearSelection, cancelWire, updateWireProgress,
    removeComponents,
  } = useCircuitStore();

  useEffect(() => {
    const updateDims = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.08;
    const oldZoom = zoom;
    const newZoom = e.evt.deltaY < 0 ? oldZoom * scaleBy : oldZoom / scaleBy;
    setZoom(newZoom);
  }, [zoom, setZoom]);

  const handleStageMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      clearSelection();
      if (wireInProgress) cancelWire();
    }
  }, [clearSelection, cancelWire, wireInProgress]);

  const handleStageMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!wireInProgress) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getRelativePointerPosition();
    if (pos) updateWireProgress(pos.x, pos.y);
  }, [wireInProgress, updateWireProgress]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) removeComponents(selectedIds);
      }
      if (e.key === 'Escape') {
        clearSelection();
        cancelWire();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        useCircuitStore.getState().undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        useCircuitStore.getState().redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        useCircuitStore.getState().selectAll();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedIds.length > 0) useCircuitStore.getState().duplicateComponents(selectedIds);
      }
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        if (selectedIds.length === 1) useCircuitStore.getState().rotateComponent(selectedIds[0]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIds, clearSelection, cancelWire, removeComponents]);

  const getPinPosition = useCallback((componentId: string, pinId: string) => {
    const comp = components.find(c => c.id === componentId);
    if (!comp) return { x: 0, y: 0 };
    const def = COMPONENT_DEFINITIONS[comp.type];
    if (!def) return { x: 0, y: 0 };
    const pin = def.pins.find(p => p.id === pinId);
    if (!pin) return { x: 0, y: 0 };
    return { x: comp.x + pin.offsetX, y: comp.y + pin.offsetY };
  }, [components]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('component-type');
    if (!type) return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;
    useCircuitStore.getState().addComponent(type, x, y);
  }, [zoom, panX, panY]);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-canvas overflow-hidden relative"
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={zoom}
        scaleY={zoom}
        x={panX}
        y={panY}
        draggable
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setPan(e.target.x(), e.target.y());
          }
        }}
      >
        <Layer>
          <CanvasGrid width={dimensions.width} height={dimensions.height} zoom={zoom} />

          {/* Wires */}
          {wires.map(wire => {
            const from = getPinPosition(wire.fromComponentId, wire.fromPinId);
            const to = getPinPosition(wire.toComponentId, wire.toPinId);
            return (
              <WireView
                key={wire.id}
                fromX={from.x}
                fromY={from.y}
                toX={to.x}
                toY={to.y}
                color={wire.color}
              />
            );
          })}

          {/* Wire in progress */}
          {wireInProgress && (
            <WireView
              fromX={wireInProgress.fromX}
              fromY={wireInProgress.fromY}
              toX={wireInProgress.toX}
              toY={wireInProgress.toY}
              color="#22d3a0"
              isTemp
            />
          )}

          {/* Components */}
          {components.map(comp => (
            <CircuitComponentView
              key={comp.id}
              id={comp.id}
              type={comp.type}
              x={comp.x}
              y={comp.y}
              rotation={comp.rotation}
              isSelected={selectedIds.includes(comp.id)}
              properties={comp.properties}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
