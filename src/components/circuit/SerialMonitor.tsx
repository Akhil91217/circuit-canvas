import { useEffect, useRef } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { Trash2, ArrowDownToLine, Clock } from 'lucide-react';

export default function SerialMonitor() {
  const { serialOutput, clearSerial, showTimestamps, toggleTimestamps, autoScroll, toggleAutoScroll } = useSimulationStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [serialOutput, autoScroll]);

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50 bg-[#161b22]">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Serial Monitor</span>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTimestamps}
            className={`p-1 rounded transition-colors ${showTimestamps ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-foreground'}`}
            title="Toggle timestamps"
          >
            <Clock className="w-3 h-3" />
          </button>
          <button
            onClick={toggleAutoScroll}
            className={`p-1 rounded transition-colors ${autoScroll ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-foreground'}`}
            title="Auto scroll"
          >
            <ArrowDownToLine className="w-3 h-3" />
          </button>
          <button
            onClick={clearSerial}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Clear"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Output */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 font-mono text-xs">
        {serialOutput.length === 0 ? (
          <span className="text-muted-foreground/50 italic">Serial output will appear here...</span>
        ) : (
          serialOutput.map((msg, i) => (
            <div key={i} className="flex gap-2 hover:bg-[#161b22] px-1 rounded">
              {showTimestamps && (
                <span className="text-muted-foreground/40 select-none shrink-0">
                  [{(msg.timestamp / 1000).toFixed(1)}s]
                </span>
              )}
              <span className="text-[#58a6ff] whitespace-pre-wrap break-all">{msg.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
