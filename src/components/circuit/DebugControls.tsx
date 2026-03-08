import { useSimulationStore } from '@/store/simulationStore';
import { Bug, StepForward, StepBack, ArrowDownToLine, SkipForward } from 'lucide-react';

export default function DebugControls() {
  const {
    debugMode, setDebugMode, isRunning, isPaused,
    breakpoints, currentExecutionLine,
    setIsSteppingOver, setPaused,
  } = useSimulationStore();

  const handleStepOver = () => {
    setIsSteppingOver(true);
    setPaused(false);
  };

  const handleContinue = () => {
    setPaused(false);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setDebugMode(!debugMode)}
        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
          debugMode ? 'bg-orange-500/15 text-orange-400' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
        title="Toggle debugger"
      >
        <Bug className="w-3 h-3" />
        Debug
      </button>

      {debugMode && isRunning && (
        <>
          <div className="w-px h-4 bg-border/50 mx-1" />
          <button
            onClick={handleContinue}
            disabled={!isPaused}
            className="flex items-center gap-1 px-1.5 py-1 rounded text-[10px] font-medium text-success hover:bg-success/10 disabled:opacity-30 transition-colors"
            title="Continue (F5)"
          >
            <SkipForward className="w-3 h-3" />
          </button>
          <button
            onClick={handleStepOver}
            disabled={!isPaused}
            className="flex items-center gap-1 px-1.5 py-1 rounded text-[10px] font-medium text-accent hover:bg-accent/10 disabled:opacity-30 transition-colors"
            title="Step Over (F10)"
          >
            <StepForward className="w-3 h-3" />
          </button>

          {currentExecutionLine > 0 && (
            <span className="text-[9px] font-mono text-warning ml-1">
              Line {currentExecutionLine}
            </span>
          )}

          <span className="text-[9px] font-mono text-muted-foreground ml-1">
            {breakpoints.length} BP
          </span>
        </>
      )}
    </div>
  );
}
