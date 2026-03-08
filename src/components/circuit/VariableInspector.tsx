import { useSimulationStore } from '@/store/simulationStore';
import { Variable, Eye } from 'lucide-react';

export default function VariableInspector() {
  const { runtimeVariables, isRunning, isPaused, pinStates } = useSimulationStore();

  const vars = Object.entries(runtimeVariables);
  const pins = Object.entries(pinStates).map(([pin, val]) => ({
    name: `Pin ${pin}`,
    value: val,
    type: val === 0 || val === 255 ? 'digital' : 'analog',
  }));

  return (
    <div className="h-full overflow-y-auto bg-[#0d1117] p-3 space-y-3">
      {/* Status */}
      <div className="flex items-center gap-2 mb-2">
        <Eye className="w-4 h-4 text-accent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground">Variable Inspector</span>
        {isRunning && (
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isPaused ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'}`}>
            {isPaused ? 'PAUSED' : 'LIVE'}
          </span>
        )}
      </div>

      {/* Runtime Variables */}
      {vars.length > 0 ? (
        <div className="space-y-1">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Variables</h3>
          <div className="bg-[#161b22] rounded border border-border/30 overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left px-2 py-1 text-muted-foreground font-medium">Name</th>
                  <th className="text-left px-2 py-1 text-muted-foreground font-medium">Value</th>
                  <th className="text-left px-2 py-1 text-muted-foreground font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {vars.map(([name, info]) => (
                  <tr key={name} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                    <td className="px-2 py-1 font-mono text-accent">{name}</td>
                    <td className="px-2 py-1 font-mono text-foreground">{String(info.value)}</td>
                    <td className="px-2 py-1">
                      <span className={`px-1 py-0.5 rounded text-[9px] font-medium ${
                        info.type === 'int' ? 'bg-blue-500/15 text-blue-400' :
                        info.type === 'float' ? 'bg-purple-500/15 text-purple-400' :
                        info.type === 'String' ? 'bg-orange-500/15 text-orange-400' :
                        info.type === 'bool' ? 'bg-green-500/15 text-green-400' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {info.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <Variable className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">
            {isRunning ? 'No variables declared yet' : 'Start simulation to inspect variables'}
          </p>
        </div>
      )}

      {/* Pin States */}
      {pins.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Pin States</h3>
          <div className="grid grid-cols-3 gap-1">
            {pins.map(p => (
              <div key={p.name} className="bg-[#161b22] rounded px-2 py-1.5 border border-border/20">
                <div className="text-[10px] text-muted-foreground font-mono">{p.name}</div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    p.value > 127 ? 'bg-success' : p.value > 0 ? 'bg-warning' : 'bg-muted-foreground/30'
                  }`} />
                  <span className="text-xs font-mono text-foreground">{p.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
