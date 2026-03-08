import { useRef, useCallback } from 'react';
import { Play, Pause, Square, RotateCcw, Code2, Terminal } from 'lucide-react';
import MultiFileEditor from './MultiFileEditor';
import SerialMonitor from './SerialMonitor';
import SimulationControls from './SimulationControls';
import { useSimulationStore } from '@/store/simulationStore';
import { ArduinoRuntime } from '@/engine/ArduinoRuntime';

export default function BottomPanel() {
  const {
    code, isRunning, isPaused, speed,
    setRunning, setPaused, addSerialMessage, clearSerial,
    clearErrors, addError, setPinState, resetPinStates,
    activeBottomTab, setActiveBottomTab, setSpeed,
  } = useSimulationStore();

  const runtimeRef = useRef<ArduinoRuntime | null>(null);

  const getRuntime = useCallback(() => {
    if (!runtimeRef.current) {
      runtimeRef.current = new ArduinoRuntime({
        onSerialOutput: (msg) => addSerialMessage(msg),
        onPinChange: (change) => setPinState(change.pin, change.value),
        onError: (error) => addError(error),
        onStateChange: (state) => {
          setRunning(state.running);
          setPaused(state.paused);
        },
        onLineChange: () => {},
        onBusMessage: (msg) => {
          // Log bus messages to serial for visibility
          addSerialMessage({
            timestamp: msg.timestamp,
            text: `[${msg.bus}] ${msg.direction}: [${msg.data.join(', ')}]\n`,
          });
        },
      });
    }
    return runtimeRef.current;
  }, [addSerialMessage, setPinState, addError, setRunning, setPaused]);

  const handleRun = useCallback(() => {
    const rt = getRuntime();
    clearSerial();
    clearErrors();
    resetPinStates();
    rt.setSpeed(speed);
    rt.run(code);
  }, [code, speed, getRuntime, clearSerial, clearErrors, resetPinStates]);

  const handlePause = useCallback(() => {
    const rt = getRuntime();
    if (isPaused) rt.resume(); else rt.pause();
  }, [isPaused, getRuntime]);

  const handleStop = useCallback(() => {
    const rt = getRuntime();
    rt.stop();
    resetPinStates();
  }, [getRuntime, resetPinStates]);

  const handleReset = useCallback(() => {
    const rt = getRuntime();
    rt.reset();
    clearSerial();
    clearErrors();
    resetPinStates();
  }, [getRuntime, clearSerial, clearErrors, resetPinStates]);

  const prevSpeed = useRef(speed);
  if (prevSpeed.current !== speed && runtimeRef.current) {
    runtimeRef.current.setSpeed(speed);
    prevSpeed.current = speed;
  }

  return (
    <div className="flex flex-col border-t border-border bg-[#0d1117]" style={{ height: 280 }}>
      <div className="h-9 flex items-center px-3 gap-1 border-b border-border/50 bg-[#161b22] shrink-0">
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

        <div className="w-px h-5 bg-border/50 mx-2" />

        <button onClick={() => setActiveBottomTab('code')}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
            activeBottomTab === 'code' ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground'
          }`}>
          <Code2 className="w-3 h-3" /> Code
        </button>
        <button onClick={() => setActiveBottomTab('serial')}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
            activeBottomTab === 'serial' ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground'
          }`}>
          <Terminal className="w-3 h-3" /> Serial
        </button>

        <div className="flex-1" />
        <SimulationControls />
      </div>

      <div className="flex-1 overflow-hidden flex">
        {activeBottomTab === 'code' ? (
          <div className="flex-1"><MultiFileEditor /></div>
        ) : (
          <div className="flex-1"><SerialMonitor /></div>
        )}
      </div>
    </div>
  );
}
