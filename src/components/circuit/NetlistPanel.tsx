import { useEffect, useState } from 'react';
import { useCircuitStore } from '@/store/circuitStore';
import { NetlistEngine, NetlistAnalysis } from '@/engine/NetlistEngine';
import { AlertTriangle, CheckCircle2, Activity, Zap, X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function NetlistPanel({ onClose }: Props) {
  const { components, wires } = useCircuitStore();
  const [analysis, setAnalysis] = useState<NetlistAnalysis | null>(null);

  useEffect(() => {
    const engine = new NetlistEngine();
    const result = engine.buildFromCircuit(components, wires);
    setAnalysis(result);
  }, [components, wires]);

  if (!analysis) return null;

  const hasErrors = analysis.stats.errors > 0;
  const hasWarnings = analysis.stats.warnings > 0;

  return (
    <div className="w-72 bg-sidebar border-l border-border flex flex-col h-full animate-slide-in-right">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Netlist Analysis</h2>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/30 rounded p-2 text-center">
            <p className="text-lg font-bold text-foreground">{analysis.stats.totalNets}</p>
            <p className="text-[10px] text-muted-foreground">Nets</p>
          </div>
          <div className="bg-muted/30 rounded p-2 text-center">
            <p className="text-lg font-bold text-foreground">{analysis.stats.totalConnections}</p>
            <p className="text-[10px] text-muted-foreground">Connections</p>
          </div>
          <div className="bg-muted/30 rounded p-2 text-center">
            <p className="text-lg font-bold text-foreground">{analysis.powerNets.length}</p>
            <p className="text-[10px] text-muted-foreground">Power Nets</p>
          </div>
          <div className="bg-muted/30 rounded p-2 text-center">
            <p className="text-lg font-bold text-foreground">{analysis.stats.floatingPins}</p>
            <p className="text-[10px] text-muted-foreground">Floating Pins</p>
          </div>
        </div>

        {/* Status */}
        <div className={`flex items-center gap-2 px-2.5 py-2 rounded text-xs ${
          hasErrors ? 'bg-destructive/10 text-destructive' : hasWarnings ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
        }`}>
          {hasErrors ? <AlertTriangle className="w-3.5 h-3.5" /> :
           hasWarnings ? <AlertTriangle className="w-3.5 h-3.5" /> :
           <CheckCircle2 className="w-3.5 h-3.5" />}
          <span className="font-medium">
            {hasErrors ? `${analysis.stats.errors} error(s)` :
             hasWarnings ? `${analysis.stats.warnings} warning(s)` :
             'No issues detected'}
          </span>
        </div>

        {/* Errors */}
        {analysis.errors.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Issues</h3>
            {analysis.errors.map((err, i) => (
              <div key={i} className={`p-2 rounded text-[10px] ${
                err.severity === 'error' ? 'bg-destructive/10 border border-destructive/20' : 'bg-warning/10 border border-warning/20'
              }`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  {err.severity === 'error' ? <Zap className="w-3 h-3 text-destructive" /> : <AlertTriangle className="w-3 h-3 text-warning" />}
                  <span className={`font-bold uppercase ${err.severity === 'error' ? 'text-destructive' : 'text-warning'}`}>
                    {err.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-muted-foreground">{err.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Nets */}
        <div className="space-y-1.5">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Nets ({analysis.nets.length})
          </h3>
          {analysis.nets.filter(n => n.connectedPins.length > 1).slice(0, 20).map(net => (
            <div key={net.id} className="bg-muted/20 rounded px-2 py-1.5 text-[10px]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-foreground">{net.id}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                  net.type === 'power' ? 'bg-destructive/15 text-destructive' :
                  net.type === 'ground' ? 'bg-accent/15 text-accent' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {net.type} {net.voltage !== null ? `${net.voltage}V` : ''}
                </span>
              </div>
              <div className="space-y-0.5">
                {net.connectedPins.map((pin, j) => (
                  <span key={j} className="inline-block mr-1 text-muted-foreground font-mono">
                    {pin.componentType}:{pin.pinId}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
