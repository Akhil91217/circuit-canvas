import ComponentLibrary from '@/components/circuit/ComponentLibrary';
import CircuitCanvas from '@/components/circuit/CircuitCanvas';
import PropertiesPanel from '@/components/circuit/PropertiesPanel';
import Toolbar from '@/components/circuit/Toolbar';
import BottomPanel from '@/components/circuit/BottomPanel';
import { Cpu, Zap } from 'lucide-react';
import { useSimulationStore } from '@/store/simulationStore';

const CircuitEditor = () => {
  const { isRunning, isPaused } = useSimulationStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Header */}
      <div className="h-11 bg-[#0a0e16] border-b border-border/60 flex items-center px-4 gap-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Cpu className="w-5 h-5 text-accent" />
            {isRunning && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success animate-pulse" />
            )}
          </div>
          <span className="font-semibold text-sm text-foreground tracking-tight">CircuitForge</span>
        </div>
        <span className="text-[10px] font-mono text-accent/60 bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">v2.0</span>
        
        {isRunning && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <Zap className="w-3 h-3 text-success animate-pulse" />
            <span className={isPaused ? 'text-warning' : 'text-success'}>
              {isPaused ? 'PAUSED' : 'SIMULATING'}
            </span>
          </div>
        )}

        <div className="flex-1" />
        <span className="text-[10px] text-muted-foreground">Phase 2 — Simulation Engine</span>
      </div>

      {/* Toolbar */}
      <Toolbar />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <ComponentLibrary />
        <CircuitCanvas />
        <PropertiesPanel />
      </div>

      {/* Bottom Panel - Code Editor + Serial Monitor */}
      <BottomPanel />
    </div>
  );
};

export default CircuitEditor;
