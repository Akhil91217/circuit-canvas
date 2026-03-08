import { useCircuitStore } from '@/store/circuitStore';
import { useSimulationStore } from '@/store/simulationStore';
import { COMPONENT_DEFINITIONS } from '@/data/componentDefinitions';
import { Settings2 } from 'lucide-react';

const SENSOR_SLIDERS: Record<string, { key: string; label: string; min: number; max: number; unit: string; step?: number }[]> = {
  'ultrasonic-sensor': [{ key: 'ultrasonic-distance', label: 'Distance', min: 2, max: 400, unit: 'cm' }],
  'potentiometer': [{ key: 'potentiometer-value', label: 'Analog Value', min: 0, max: 1023, unit: '' }],
  'temperature-sensor': [{ key: 'temperature', label: 'Temperature', min: -40, max: 125, unit: '°C' }],
  'humidity-sensor': [
    { key: 'humidity', label: 'Humidity', min: 0, max: 100, unit: '%' },
    { key: 'humidity-temp', label: 'Temperature', min: -40, max: 80, unit: '°C' },
  ],
  'light-sensor': [{ key: 'light-lux', label: 'Light Level', min: 0, max: 10000, unit: 'lux' }],
  'accelerometer': [
    { key: 'accel-x', label: 'Accel X', min: -16, max: 16, unit: 'g', step: 0.1 },
    { key: 'accel-y', label: 'Accel Y', min: -16, max: 16, unit: 'g', step: 0.1 },
    { key: 'accel-z', label: 'Accel Z', min: -16, max: 16, unit: 'g', step: 0.1 },
  ],
  'servo-motor': [{ key: 'servo-angle', label: 'Angle', min: 0, max: 180, unit: '°' }],
};

export default function PropertiesPanel() {
  const { components, selectedIds, updateProperty } = useCircuitStore();
  const { sensorValues, setSensorValue, isRunning } = useSimulationStore();
  const selected = components.filter(c => selectedIds.includes(c.id));

  if (selected.length === 0) {
    return (
      <div className="w-56 bg-sidebar border-l border-border flex flex-col h-full">
        <div className="p-3 border-b border-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-muted-foreground">
            <Settings2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Select a component to view properties</p>
          </div>
        </div>
      </div>
    );
  }

  if (selected.length > 1) {
    return (
      <div className="w-56 bg-sidebar border-l border-border flex flex-col h-full">
        <div className="p-3 border-b border-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Properties</h2>
        </div>
        <div className="p-3">
          <p className="text-xs text-muted-foreground">{selected.length} components selected</p>
        </div>
      </div>
    );
  }

  const comp = selected[0];
  const def = COMPONENT_DEFINITIONS[comp.type];
  const sliders = SENSOR_SLIDERS[comp.type];

  return (
    <div className="w-56 bg-sidebar border-l border-border flex flex-col h-full animate-slide-in-right">
      <div className="p-3 border-b border-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Properties</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Component info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">{def?.icon}</span>
            <span className="text-sm font-medium text-foreground">{def?.name}</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">ID: {comp.id}</p>
          {def && (
            <p className="text-[10px] text-muted-foreground">Category: {def.category}</p>
          )}
        </div>

        {/* Transform */}
        <div className="space-y-1.5">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Transform</h3>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="text-[10px] text-muted-foreground">X</label>
              <div className="bg-muted rounded px-2 py-1 text-xs font-mono text-foreground">{comp.x}</div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Y</label>
              <div className="bg-muted rounded px-2 py-1 text-xs font-mono text-foreground">{comp.y}</div>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Rotation</label>
            <div className="bg-muted rounded px-2 py-1 text-xs font-mono text-foreground">{comp.rotation}°</div>
          </div>
        </div>

        {/* Bus info */}
        {def && ('bus' in (comp.properties || {})) && (
          <div className="space-y-1">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-accent">Bus Interface</h3>
            <div className="bg-accent/10 rounded px-2 py-1.5 text-[10px] font-mono text-accent">
              {String(comp.properties.bus)} — Address: {String(comp.properties.i2cAddress || 'N/A')}
            </div>
          </div>
        )}

        {/* Sensor Simulation Sliders */}
        {sliders && (
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-accent">
              Simulation {isRunning && '● Live'}
            </h3>
            {sliders.map(slider => (
              <div key={slider.key}>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-muted-foreground">{slider.label}</label>
                  <span className="text-[10px] font-mono text-accent">
                    {(sensorValues[slider.key] ?? slider.min).toFixed(slider.step && slider.step < 1 ? 1 : 0)}{slider.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step || 1}
                  value={sensorValues[slider.key] ?? slider.min}
                  onChange={e => setSensorValue(slider.key, Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-accent"
                />
              </div>
            ))}
          </div>
        )}

        {/* Pins */}
        {def && def.pins.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pins ({def.pins.length})
            </h3>
            <div className="space-y-0.5">
              {def.pins.slice(0, 10).map(pin => (
                <div key={pin.id} className="flex items-center justify-between text-[10px] px-1.5 py-0.5 rounded bg-muted/50">
                  <span className="text-foreground font-mono">{pin.name}</span>
                  <span className="text-muted-foreground">{pin.type}</span>
                </div>
              ))}
              {def.pins.length > 10 && (
                <p className="text-[10px] text-muted-foreground text-center">+{def.pins.length - 10} more pins</p>
              )}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="space-y-1.5">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Settings</h3>
          {Object.entries(comp.properties).map(([key, value]) => (
            <div key={key}>
              <label className="text-[10px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
              {typeof value === 'boolean' ? (
                <button
                  onClick={() => updateProperty(comp.id, key, !value)}
                  className={`w-full text-left rounded px-2 py-1 text-xs font-mono transition-colors ${value ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
                >
                  {value ? 'ON' : 'OFF'}
                </button>
              ) : (
                <input
                  type={typeof value === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={e => updateProperty(comp.id, key, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
                  className="w-full bg-muted rounded px-2 py-1 text-xs font-mono text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
