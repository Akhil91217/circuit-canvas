import { useState } from 'react';
import ComponentLibrary from '@/components/circuit/ComponentLibrary';
import CircuitCanvas from '@/components/circuit/CircuitCanvas';
import PropertiesPanel from '@/components/circuit/PropertiesPanel';
import Toolbar from '@/components/circuit/Toolbar';
import BottomPanel from '@/components/circuit/BottomPanel';
import AgentPanel from '@/components/circuit/AgentPanel';
import IoTPanel from '@/components/circuit/IoTPanel';
import NetlistPanel from '@/components/circuit/NetlistPanel';
import { Cpu, Zap, Bot, Radio, Activity } from 'lucide-react';
import { useSimulationStore } from '@/store/simulationStore';

const CircuitEditor = () => {
  const { isRunning, isPaused } = useSimulationStore();
  const [showAgent, setShowAgent] = useState(false);
  const [showIoT, setShowIoT] = useState(false);
  const [showNetlist, setShowNetlist] = useState(false);

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
        <span className="text-[10px] font-mono text-accent/60 bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">v4.0</span>
        
        {isRunning && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <Zap className="w-3 h-3 text-success animate-pulse" />
            <span className={isPaused ? 'text-warning' : 'text-success'}>
              {isPaused ? 'PAUSED' : 'SIMULATING'}
            </span>
          </div>
        )}

        <div className="flex-1" />

        {/* Panel toggles */}
        <button
          onClick={() => setShowNetlist(!showNetlist)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            showNetlist ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Activity className="w-3 h-3" />
          Netlist
        </button>
        <button
          onClick={() => setShowIoT(!showIoT)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            showIoT ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Radio className="w-3 h-3" />
          IoT
        </button>
        <button
          onClick={() => setShowAgent(!showAgent)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            showAgent ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Bot className="w-3 h-3" />
          Agent
        </button>

        <span className="text-[10px] text-muted-foreground ml-2">Phase 4 — Simulation Engine</span>
      </div>

      {/* Toolbar */}
      <Toolbar />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <ComponentLibrary />
        <CircuitCanvas />
        <PropertiesPanel />
        {showNetlist && <NetlistPanel onClose={() => setShowNetlist(false)} />}
        {showIoT && <IoTPanel onClose={() => setShowIoT(false)} />}
        {showAgent && <AgentPanel onClose={() => setShowAgent(false)} />}
      </div>

      {/* Bottom Panel */}
      <BottomPanel />
    </div>
  );
};

export default CircuitEditor;
