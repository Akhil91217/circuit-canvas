import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart3, Thermometer, Droplets, Gauge, MapPin, Radio,
  Activity, X, Plus, Settings2, Maximize2, Minimize2
} from 'lucide-react';
import { useSimulationStore } from '@/store/simulationStore';
import { eventBus, DashboardDataEvent } from '@/engine/EventBus';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

// ===== Widget Types =====
interface DashboardWidget {
  id: string;
  type: 'line-chart' | 'gauge' | 'value' | 'status' | 'mqtt-log';
  title: string;
  dataKey: string;
  unit?: string;
  min?: number;
  max?: number;
  color?: string;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'temp', type: 'line-chart', title: 'Temperature', dataKey: 'temperature', unit: '°C', min: -10, max: 50, color: '#f97316' },
  { id: 'humidity', type: 'line-chart', title: 'Humidity', dataKey: 'humidity', unit: '%', min: 0, max: 100, color: '#06b6d4' },
  { id: 'pressure', type: 'gauge', title: 'Pressure', dataKey: 'pressure', unit: 'hPa', min: 900, max: 1100, color: '#8b5cf6' },
  { id: 'light', type: 'gauge', title: 'Light Level', dataKey: 'light-lux', unit: 'lux', min: 0, max: 1000, color: '#eab308' },
  { id: 'distance', type: 'value', title: 'Distance', dataKey: 'ultrasonic-distance', unit: 'cm', color: '#22d3a0' },
  { id: 'mqtt', type: 'mqtt-log', title: 'MQTT Messages', dataKey: 'mqtt', color: '#3b82f6' },
];

interface DataPoint {
  time: number;
  label: string;
  value: number;
}

// ===== Line Chart Widget =====
function LineChartWidget({ widget, data }: { widget: DashboardWidget; data: DataPoint[] }) {
  const recent = data.slice(-50);
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-[10px] font-semibold text-foreground">{widget.title}</span>
        <span className="text-[9px] font-mono text-muted-foreground">
          {recent.length > 0 ? `${recent[recent.length - 1].value.toFixed(1)}${widget.unit || ''}` : '--'}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={recent} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={widget.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={widget.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 18% 14%)" />
            <XAxis dataKey="label" tick={false} axisLine={false} />
            <YAxis domain={[widget.min ?? 'auto', widget.max ?? 'auto']} tick={{ fill: '#6b7280', fontSize: 8 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'hsl(222 24% 9%)', border: '1px solid hsl(222 18% 14%)', borderRadius: 6, fontSize: 10 }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(v: number) => [`${v.toFixed(1)}${widget.unit || ''}`, widget.title]}
            />
            <Area type="monotone" dataKey="value" stroke={widget.color} fill={`url(#grad-${widget.id})`} strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ===== Gauge Widget =====
function GaugeWidget({ widget, data }: { widget: DashboardWidget; data: DataPoint[] }) {
  const value = data.length > 0 ? data[data.length - 1].value : 0;
  const min = widget.min ?? 0;
  const max = widget.max ?? 100;
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="h-full flex flex-col items-center justify-center p-3">
      <span className="text-[10px] font-semibold text-foreground mb-2">{widget.title}</span>
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(222 18% 14%)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke={widget.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${pct * 2.64} 264`}
            style={{ transition: 'stroke-dasharray 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-foreground font-mono">{value.toFixed(0)}</span>
          <span className="text-[8px] text-muted-foreground">{widget.unit}</span>
        </div>
      </div>
      <div className="flex justify-between w-full mt-1">
        <span className="text-[8px] text-muted-foreground font-mono">{min}</span>
        <span className="text-[8px] text-muted-foreground font-mono">{max}</span>
      </div>
    </div>
  );
}

// ===== Value Widget =====
function ValueWidget({ widget, data }: { widget: DashboardWidget; data: DataPoint[] }) {
  const value = data.length > 0 ? data[data.length - 1].value : 0;
  const prevValue = data.length > 1 ? data[data.length - 2].value : value;
  const trend = value > prevValue ? '↑' : value < prevValue ? '↓' : '→';
  const trendColor = value > prevValue ? 'text-success' : value < prevValue ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div className="h-full flex flex-col items-center justify-center p-3">
      <span className="text-[10px] font-semibold text-foreground mb-1">{widget.title}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold font-mono" style={{ color: widget.color }}>
          {value.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground">{widget.unit}</span>
      </div>
      <span className={`text-[10px] font-mono mt-1 ${trendColor}`}>{trend} {Math.abs(value - prevValue).toFixed(1)}</span>
    </div>
  );
}

// ===== MQTT Log Widget =====
function MqttLogWidget() {
  const { mqttMessages } = useSimulationStore();
  const recent = mqttMessages.slice(-15);

  return (
    <div className="h-full flex flex-col">
      <div className="px-2 py-1 border-b border-border/30">
        <span className="text-[10px] font-semibold text-foreground">MQTT Messages</span>
      </div>
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {recent.length === 0 ? (
          <p className="text-[9px] text-muted-foreground/50 italic text-center mt-4">No messages</p>
        ) : (
          recent.map((msg, i) => (
            <div key={i} className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
              msg.direction === 'out' ? 'text-accent' : msg.direction === 'in' ? 'text-success' : 'text-muted-foreground'
            }`}>
              <span className="text-muted-foreground/40">{new Date(msg.timestamp).toLocaleTimeString()} </span>
              <span className="text-muted-foreground">{msg.topic}: </span>
              <span>{msg.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ===== Status Indicator Widget =====
function StatusWidget({ widget, data }: { widget: DashboardWidget; data: DataPoint[] }) {
  const value = data.length > 0 ? data[data.length - 1].value : 0;
  const isActive = value > 0;

  return (
    <div className="h-full flex flex-col items-center justify-center p-3">
      <span className="text-[10px] font-semibold text-foreground mb-2">{widget.title}</span>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isActive ? 'bg-success/20' : 'bg-muted'
      }`}>
        <div className={`w-4 h-4 rounded-full ${
          isActive ? 'bg-success animate-pulse' : 'bg-muted-foreground/30'
        }`} />
      </div>
      <span className={`text-[10px] font-mono mt-1 ${isActive ? 'text-success' : 'text-muted-foreground'}`}>
        {isActive ? 'ACTIVE' : 'INACTIVE'}
      </span>
    </div>
  );
}

// ===== Main Dashboard =====
export default function IoTDashboard({ onClose }: { onClose: () => void }) {
  const { sensorValues, isRunning, mqttConnected, wifiConnected } = useSimulationStore();
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [dataHistory, setDataHistory] = useState<Record<string, DataPoint[]>>({});
  const [expanded, setExpanded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Collect sensor data periodically
  useEffect(() => {
    const collectData = () => {
      const now = Date.now();
      const label = new Date(now).toLocaleTimeString();

      setDataHistory(prev => {
        const next = { ...prev };
        for (const [key, value] of Object.entries(sensorValues)) {
          if (!next[key]) next[key] = [];
          next[key] = [...next[key].slice(-100), { time: now, label, value }];
        }
        return next;
      });
    };

    intervalRef.current = setInterval(collectData, 1000);
    collectData();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sensorValues]);

  // Listen for dashboard events from event bus
  useEffect(() => {
    const unsub = eventBus.on<DashboardDataEvent>('dashboard:data', (event) => {
      const { widgetId, label, value } = event.payload;
      setDataHistory(prev => {
        const next = { ...prev };
        if (!next[widgetId]) next[widgetId] = [];
        next[widgetId] = [...next[widgetId].slice(-100), { time: event.timestamp, label, value }];
        return next;
      });
    });
    return unsub;
  }, []);

  const renderWidget = (widget: DashboardWidget) => {
    const data = dataHistory[widget.dataKey] || [];
    switch (widget.type) {
      case 'line-chart': return <LineChartWidget widget={widget} data={data} />;
      case 'gauge': return <GaugeWidget widget={widget} data={data} />;
      case 'value': return <ValueWidget widget={widget} data={data} />;
      case 'status': return <StatusWidget widget={widget} data={data} />;
      case 'mqtt-log': return <MqttLogWidget />;
      default: return null;
    }
  };

  return (
    <div className={`${expanded ? 'fixed inset-0 z-50' : 'w-96'} bg-sidebar border-l border-border/50 flex flex-col h-full animate-slide-in-right`}>
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-border/50 bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-foreground">IoT Dashboard</span>
          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">LIVE</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Status indicators */}
          <div className="flex items-center gap-2 mr-2">
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${wifiConnected ? 'bg-success animate-pulse' : 'bg-muted-foreground/30'}`} />
              <span className="text-[8px] text-muted-foreground">WiFi</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${mqttConnected ? 'bg-success animate-pulse' : 'bg-muted-foreground/30'}`} />
              <span className="text-[8px] text-muted-foreground">MQTT</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-success animate-pulse' : 'bg-muted-foreground/30'}`} />
              <span className="text-[8px] text-muted-foreground">SIM</span>
            </div>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
            {expanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className={`grid gap-2 ${expanded ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {widgets.map(widget => (
            <div
              key={widget.id}
              className={`bg-card border border-border/30 rounded-lg overflow-hidden ${
                widget.type === 'line-chart' || widget.type === 'mqtt-log' ? 'col-span-2' : ''
              }`}
              style={{ minHeight: widget.type === 'line-chart' ? 140 : widget.type === 'mqtt-log' ? 160 : 120 }}
            >
              {renderWidget(widget)}
            </div>
          ))}
        </div>

        {/* Sensor Raw Values */}
        <div className="mt-3 border border-border/30 rounded-lg bg-card p-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Activity className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Live Sensor Values</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(sensorValues).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between px-2 py-1 rounded bg-muted/30">
                <span className="text-[9px] font-mono text-muted-foreground truncate">{key}</span>
                <span className="text-[10px] font-mono text-foreground font-semibold">{typeof value === 'number' ? value.toFixed(1) : value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
