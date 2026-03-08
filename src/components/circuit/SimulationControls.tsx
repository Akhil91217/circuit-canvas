import { Gauge, Cpu } from 'lucide-react';
import { useSimulationStore } from '@/store/simulationStore';

export default function SimulationControls() {
  const { isRunning, isPaused, speed, setSpeed, runtimeMode, setRuntimeMode } = useSimulationStore();

  return (
    <div className="flex items-center gap-2">
      {/* Runtime mode selector */}
      <div className="flex items-center gap-1 mr-1">
        <Cpu className="w-3 h-3 text-muted-foreground" />
        <button
          onClick={() => setRuntimeMode(runtimeMode === 'javascript' ? 'avr8js' : 'javascript')}
          className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors ${
            runtimeMode === 'javascript'
              ? 'bg-success/15 text-success'
              : 'bg-orange-500/15 text-orange-400'
          }`}
          title={runtimeMode === 'javascript' ? 'JavaScript Runtime (default)' : 'AVR8js CPU Emulator (requires HEX)'}
        >
          {runtimeMode === 'javascript' ? 'JS' : 'AVR'}
        </button>
      </div>

      <div className="w-px h-4 bg-border/40" />

      {/* Speed control */}
      <div className="flex items-center gap-1.5">
        <Gauge className="w-3 h-3 text-muted-foreground" />
        {[0.5, 1, 2, 5].map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
              speed === s
                ? 'bg-accent/20 text-accent'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono">
        <div className={`w-1.5 h-1.5 rounded-full ${
          isRunning ? (isPaused ? 'bg-warning animate-pulse' : 'bg-success animate-pulse') : 'bg-muted-foreground/30'
        }`} />
        <span className="text-muted-foreground">
          {isRunning ? (isPaused ? 'PAUSED' : 'RUNNING') : 'STOPPED'}
        </span>
      </div>
    </div>
  );
}
