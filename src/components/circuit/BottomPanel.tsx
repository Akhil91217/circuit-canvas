import { useRef, useCallback } from 'react';
import { Play, Pause, Square, RotateCcw, Code2, Terminal, Activity as WaveIcon, Eye, BarChart3 } from 'lucide-react';
import MultiFileEditor from './MultiFileEditor';
import SerialMonitor from './SerialMonitor';
import WaveformViewer from './WaveformViewer';
import VariableInspector from './VariableInspector';
import SimulationControls from './SimulationControls';
import DebugControls from './DebugControls';
import CompileButton from './CompileButton';
import { useSimulationStore } from '@/store/simulationStore';
import { ArduinoRuntime } from '@/engine/ArduinoRuntime';
import { eventBus } from '@/engine/EventBus';

export default function BottomPanel() {
  const {
    code, isRunning, isPaused, speed,
    setRunning, setPaused, addSerialMessage, clearSerial,
    clearErrors, addError, setPinState, resetPinStates,
    activeBottomTab, setActiveBottomTab,
    setRuntimeVariables, addWaveformSample, clearWaveform,
    setCurrentExecutionLine, debugMode, breakpoints,
  } = useSimulationStore();

  const runtimeRef = useRef<ArduinoRuntime | null>(null);

  const getRuntime = useCallback(() => {
    if (!runtimeRef.current) {
      runtimeRef.current = new ArduinoRuntime({
        onSerialOutput: (msg) => addSerialMessage(msg),
        onPinChange: (change) => {
          setPinState(change.pin, change.value);
          addWaveformSample({ pin: change.pin, value: change.value, time: Date.now(), mode: change.mode });
          eventBus.emit('pin:change', change);
        },
        onError: (error) => {
          addError(error);
          eventBus.emit('simulation:error', { error });
        },
        onStateChange: (state) => {
          setRunning(state.running);
          setPaused(state.paused);
          const vars: Record<string, { value: string | number | boolean; type: string }> = {};
          for (const [k, v] of Object.entries(state.variables)) {
            vars[k] = {
              value: v,
              type: typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'float') : 'bool',
            };
          }
          setRuntimeVariables(vars);
        },
        onLineChange: (line) => setCurrentExecutionLine(line),
        onBusMessage: (msg) => {
          addSerialMessage({ timestamp: msg.timestamp, text: `[${msg.bus}] ${msg.direction}: [${msg.data.join(', ')}]\n` });
          eventBus.emit(`bus:${msg.bus.toLowerCase()}` as any, msg);
        },
      });
    }
    return runtimeRef.current;
  }, [addSerialMessage, setPinState, addError, setRunning, setPaused, setRuntimeVariables, addWaveformSample, setCurrentExecutionLine]);

  const handleRun = useCallback(() => {
    const rt = getRuntime();
    clearSerial(); clearErrors(); resetPinStates(); clearWaveform(); setCurrentExecutionLine(-1);
    rt.setSpeed(speed);
    eventBus.emit('simulation:start', { code: code.slice(0, 50) });
    rt.run(code);
  }, [code, speed, getRuntime, clearSerial, clearErrors, resetPinStates, clearWaveform, setCurrentExecutionLine]);

  const handlePause = useCallback(() => {
    const rt = getRuntime();
    if (isPaused) { rt.resume(); eventBus.emit('simulation:start', {}); }
    else { rt.pause(); eventBus.emit('simulation:pause', {}); }
  }, [isPaused, getRuntime]);

  const handleStop = useCallback(() => {
    const rt = getRuntime();
    rt.stop();
    resetPinStates(); setCurrentExecutionLine(-1); setRuntimeVariables({});
    eventBus.emit('simulation:stop', {});
  }, [getRuntime, resetPinStates, setCurrentExecutionLine, setRuntimeVariables]);

  const handleReset = useCallback(() => {
    const rt = getRuntime();
    rt.reset();
    clearSerial(); clearErrors(); resetPinStates(); clearWaveform(); setCurrentExecutionLine(-1); setRuntimeVariables({});
  }, [getRuntime, clearSerial, clearErrors, resetPinStates, clearWaveform, setCurrentExecutionLine, setRuntimeVariables]);

  const prevSpeed = useRef(speed);
  if (prevSpeed.current !== speed && runtimeRef.current) {
    runtimeRef.current.setSpeed(speed);
    prevSpeed.current = speed;
  }

  const tabs: { id: typeof activeBottomTab; label: string; icon: React.ReactNode }[] = [
    { id: 'code', label: 'Code', icon: <Code2 className="w-3 h-3" /> },
    { id: 'serial', label: 'Serial', icon: <Terminal className="w-3 h-3" /> },
    { id: 'waveform', label: 'Signals', icon: <WaveIcon className="w-3 h-3" /> },
    { id: 'variables', label: 'Variables', icon: <Eye className="w-3 h-3" /> },
  ];

  return (
    <div className="flex flex-col border-t border-border bg-background" style={{ height: 300 }}>
      <div className="h-9 flex items-center px-3 gap-1 border-b border-border/50 bg-muted shrink-0">
        <button onClick={handleRun} disabled={isRunning && !isPaused}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-success/15 text-success hover:bg-success/25 disabled:opacity-30 transition-colors">
          <Play className="w-3 h-3" /> Run
        </button>
        <button onClick={handlePause} disabled={!isRunning}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-warning/15 text-warning hover:bg-warning/25 disabled:opacity-30 transition-colors">
          <Pause className="w-3 h-3" /> {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button onClick={handleStop} disabled={!isRunning}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-destructive/15 text-destructive hover:bg-destructive/25 disabled:opacity-30 transition-colors">
          <Square className="w-3 h-3" /> Stop
        </button>
        <button onClick={handleReset}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>

        <div className="w-px h-5 bg-border/50 mx-1" />

        {/* Compile */}
        <div className="relative">
          <CompileButton />
        </div>

        <div className="w-px h-5 bg-border/50 mx-1" />

        <DebugControls />

        <div className="w-px h-5 bg-border/50 mx-1" />

        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveBottomTab(tab.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              activeBottomTab === tab.id ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}

        <div className="flex-1" />
        <SimulationControls />
      </div>

      <div className="flex-1 overflow-hidden flex">
        {activeBottomTab === 'code' && <div className="flex-1"><MultiFileEditor /></div>}
        {activeBottomTab === 'serial' && <div className="flex-1"><SerialMonitor /></div>}
        {activeBottomTab === 'waveform' && <div className="flex-1"><WaveformViewer /></div>}
        {activeBottomTab === 'variables' && <div className="flex-1"><VariableInspector /></div>}
      </div>
    </div>
  );
}
