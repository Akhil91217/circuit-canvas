import ComponentLibrary from '@/components/circuit/ComponentLibrary';
import CircuitCanvas from '@/components/circuit/CircuitCanvas';
import PropertiesPanel from '@/components/circuit/PropertiesPanel';
import Toolbar from '@/components/circuit/Toolbar';
import BottomPanel from '@/components/circuit/BottomPanel';
import { Cpu } from 'lucide-react';

const CircuitEditor = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Header */}
      <div className="h-11 bg-card border-b border-border flex items-center px-4 gap-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm text-foreground tracking-tight">CircuitForge</span>
        </div>
        <span className="text-[10px] font-mono text-primary/60 bg-primary/10 px-1.5 py-0.5 rounded">v1.0</span>
        <div className="flex-1" />
        <span className="text-[10px] text-muted-foreground">Phase 1 — Visual Editor</span>
      </div>

      {/* Toolbar */}
      <Toolbar />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        <ComponentLibrary />
        <CircuitCanvas />
        <PropertiesPanel />
      </div>

      {/* Bottom */}
      <BottomPanel />
    </div>
  );
};

export default CircuitEditor;
