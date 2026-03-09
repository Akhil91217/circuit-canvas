import { useState, useEffect } from 'react';
import ComponentLibrary from '@/components/circuit/ComponentLibrary';
import CircuitCanvas from '@/components/circuit/CircuitCanvas';
import PropertiesPanel from '@/components/circuit/PropertiesPanel';
import Toolbar from '@/components/circuit/Toolbar';
import BottomPanel from '@/components/circuit/BottomPanel';
import AgentPanel from '@/components/circuit/AgentPanel';
import IoTPanel from '@/components/circuit/IoTPanel';
import IoTDashboard from '@/components/circuit/IoTDashboard';
import NetlistPanel from '@/components/circuit/NetlistPanel';
import ExportPanel from '@/components/circuit/ExportPanel';
import SharePanel from '@/components/circuit/SharePanel';
import { Cpu, Zap, Bot, Radio, Activity, Download, BarChart3, Share2 } from 'lucide-react';
import { useSimulationStore } from '@/store/simulationStore';
import { useCircuitStore } from '@/store/circuitStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CircuitEditor = () => {
  const { isRunning, isPaused, runtimeMode } = useSimulationStore();
  const [showAgent, setShowAgent] = useState(false);
  const [showIoT, setShowIoT] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showNetlist, setShowNetlist] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Auto-load shared project from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedCode = params.get('shared');
    if (sharedCode) {
      (async () => {
        try {
          const { data, error } = await supabase
            .from('shared_projects')
            .select('*')
            .eq('share_code', sharedCode)
            .single();

          if (error || !data) return;

          await supabase
            .from('shared_projects')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', data.id);

          const projectData = data.project_data as any;
          const projectJson = JSON.stringify({
            name: data.project_name,
            components: projectData.components || [],
            wires: projectData.wires || [],
            settings: { gridSize: 20, snapToGrid: true },
          });
          useCircuitStore.getState().loadProject(projectJson);
          if (data.code) useSimulationStore.getState().setCode(data.code);
          toast.success(`Loaded shared project: ${data.project_name}`);
          
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
        } catch {
          // Silently fail
        }
      })();
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Header */}
      <div className="h-11 bg-muted/30 border-b border-border/60 flex items-center px-4 gap-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Cpu className="w-5 h-5 text-accent" />
            {isRunning && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
          <span className="font-semibold text-sm text-foreground tracking-tight">CircuitForge</span>
        </div>
        <span className="text-[10px] font-mono text-accent/60 bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">v9.0</span>

        {runtimeMode === 'avr8js' && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
            AVR8js
          </span>
        )}

        {isRunning && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className={isPaused ? 'text-warning' : 'text-emerald-400'}>
              {isPaused ? 'PAUSED' : 'SIMULATING'}
            </span>
          </div>
        )}

        <div className="flex-1" />

        {/* Panel toggles */}
        {[
          { key: 'share', show: showShare, set: setShowShare, icon: <Share2 className="w-3 h-3" />, label: 'Share' },
          { key: 'export', show: showExport, set: setShowExport, icon: <Download className="w-3 h-3" />, label: 'Export' },
          { key: 'netlist', show: showNetlist, set: setShowNetlist, icon: <Activity className="w-3 h-3" />, label: 'Netlist' },
          { key: 'iot', show: showIoT, set: setShowIoT, icon: <Radio className="w-3 h-3" />, label: 'IoT' },
          { key: 'dashboard', show: showDashboard, set: setShowDashboard, icon: <BarChart3 className="w-3 h-3" />, label: 'Dashboard' },
          { key: 'agent', show: showAgent, set: setShowAgent, icon: <Bot className="w-3 h-3" />, label: 'Agent' },
        ].map(btn => (
          <button
            key={btn.key}
            onClick={() => btn.set(!btn.show)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              btn.show ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}

        <span className="text-[10px] text-muted-foreground ml-2">Phase 9 — AI Analysis & Sharing</span>
      </div>

      {/* Toolbar */}
      <Toolbar />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <ComponentLibrary />
        <CircuitCanvas />
        <PropertiesPanel />
        {showNetlist && <NetlistPanel onClose={() => setShowNetlist(false)} />}
        {showExport && <ExportPanel onClose={() => setShowExport(false)} />}
        {showShare && <SharePanel onClose={() => setShowShare(false)} />}
        {showIoT && <IoTPanel onClose={() => setShowIoT(false)} />}
        {showDashboard && <IoTDashboard onClose={() => setShowDashboard(false)} />}
        {showAgent && <AgentPanel onClose={() => setShowAgent(false)} />}
      </div>

      {/* Bottom Panel */}
      <BottomPanel />
    </div>
  );
};

export default CircuitEditor;
