import { useState, useCallback } from 'react';
import { Hammer, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useSimulationStore } from '@/store/simulationStore';
import { eventBus } from '@/engine/EventBus';

interface CompileMetrics {
  flash: number;
  maxFlash: number;
  ram: number;
  maxRam: number;
  lineCount: number;
  functionCount: number;
  variableCount: number;
  externalLibraries: string[];
  board: string;
}

interface CompileResult {
  success: boolean;
  output: string;
  errors?: string[];
  hex?: string;
  metrics?: CompileMetrics;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const COMPILE_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/arduino-compile` : null;

export default function CompileButton() {
  const { code } = useSimulationStore();
  const [isCompiling, setIsCompiling] = useState(false);
  const [result, setResult] = useState<CompileResult | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const [board, setBoard] = useState<'uno' | 'esp32'>('uno');

  const handleCompile = useCallback(async () => {
    if (!code.trim() || isCompiling) return;

    setIsCompiling(true);
    setResult(null);
    eventBus.emit('compile:start', { status: 'start' });

    try {
      if (!COMPILE_URL) {
        // Local fallback: basic syntax check
        const hasSetup = /void\s+setup\s*\(\s*\)/.test(code);
        const hasLoop = /void\s+loop\s*\(\s*\)/.test(code);
        
        if (!hasSetup || !hasLoop) {
          const missing = [];
          if (!hasSetup) missing.push('setup()');
          if (!hasLoop) missing.push('loop()');
          setResult({
            success: false,
            output: `Error: Missing required function(s): ${missing.join(', ')}`,
            errors: [`Missing required function(s): ${missing.join(', ')}`],
          });
          return;
        }

        const lineCount = code.split('\n').length;
        setResult({
          success: true,
          output: `Local compilation check passed.\n${lineCount} lines of code.\nNote: Full compilation requires cloud endpoint.`,
          metrics: {
            flash: lineCount * 32 + 2048,
            maxFlash: board === 'esp32' ? 1310720 : 32256,
            ram: 256,
            maxRam: board === 'esp32' ? 327680 : 2048,
            lineCount,
            functionCount: (code.match(/\b(?:void|int|float|bool)\s+\w+\s*\(/g) || []).length,
            variableCount: 0,
            externalLibraries: [],
            board: board === 'esp32' ? 'esp32:esp32:esp32' : 'arduino:avr:uno',
          },
        });
        eventBus.emit('compile:done', { status: 'done' });
        return;
      }

      const resp = await fetch(COMPILE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ code, board }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || `HTTP ${resp.status}`);
      }

      setResult(data);

      if (data.success) {
        eventBus.emit('compile:done', { status: 'done', hexSize: data.hex?.length });
      } else {
        eventBus.emit('compile:error', { status: 'error', error: data.errors?.join('; ') });
      }
    } catch (e: any) {
      setResult({
        success: false,
        output: `Compile error: ${e.message}`,
        errors: [e.message],
      });
      eventBus.emit('compile:error', { status: 'error', error: e.message });
    } finally {
      setIsCompiling(false);
    }
  }, [code, isCompiling, board]);

  return (
    <div className="flex items-center gap-1">
      {/* Board selector */}
      <button
        onClick={() => setBoard(board === 'uno' ? 'esp32' : 'uno')}
        className="px-1.5 py-0.5 rounded text-[9px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Toggle target board"
      >
        {board === 'uno' ? 'UNO' : 'ESP32'}
      </button>

      {/* Compile button */}
      <button
        onClick={handleCompile}
        disabled={isCompiling || !code.trim()}
        className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-accent/15 text-accent hover:bg-accent/25 disabled:opacity-30 transition-colors"
      >
        {isCompiling ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Hammer className="w-3 h-3" />
        )}
        Compile
      </button>

      {/* Result indicator */}
      {result && (
        <button
          onClick={() => setShowOutput(!showOutput)}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
            result.success ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'
          }`}
        >
          {result.success ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {result.success ? 'OK' : 'ERR'}
          {showOutput ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
        </button>
      )}

      {/* Compile output popup */}
      {showOutput && result && (
        <div className="absolute bottom-full left-0 mb-1 w-96 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="px-3 py-2 border-b border-border/50 bg-muted/30 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Compile Output</span>
            {result.metrics && (
              <span className="text-[9px] font-mono text-muted-foreground">{result.metrics.board}</span>
            )}
          </div>
          <pre className="px-3 py-2 text-[10px] font-mono text-foreground max-h-48 overflow-y-auto whitespace-pre-wrap">
            {result.output}
          </pre>
          {result.metrics && (
            <div className="px-3 py-2 border-t border-border/30 bg-muted/20 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[8px] text-muted-foreground uppercase">Flash</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${(result.metrics.flash / result.metrics.maxFlash) * 100}%` }}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground">
                    {((result.metrics.flash / result.metrics.maxFlash) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[8px] text-muted-foreground uppercase">RAM</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warning rounded-full"
                      style={{ width: `${(result.metrics.ram / result.metrics.maxRam) * 100}%` }}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground">
                    {((result.metrics.ram / result.metrics.maxRam) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
