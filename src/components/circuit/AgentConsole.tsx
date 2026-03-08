import { AgentStep } from '@/engine/AgentTools';
import { CheckCircle, Loader2, AlertCircle, Clock, Wrench } from 'lucide-react';

interface AgentConsoleProps {
  steps: AgentStep[];
}

const statusIcon = (status: AgentStep['status']) => {
  switch (status) {
    case 'pending': return <Clock className="w-3 h-3 text-muted-foreground" />;
    case 'running': return <Loader2 className="w-3 h-3 text-accent animate-spin" />;
    case 'done': return <CheckCircle className="w-3 h-3 text-emerald-400" />;
    case 'error': return <AlertCircle className="w-3 h-3 text-destructive" />;
  }
};

export default function AgentConsole({ steps }: AgentConsoleProps) {
  if (steps.length === 0) return null;

  return (
    <div className="border border-border/40 rounded-md bg-[#0d1117] overflow-hidden mt-2">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#161b22] border-b border-border/30">
        <Wrench className="w-3 h-3 text-accent" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Agent Actions</span>
        <span className="text-[9px] font-mono text-accent/60 ml-auto">{steps.length} step{steps.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="max-h-40 overflow-y-auto">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start gap-2 px-2 py-1.5 border-b border-border/10 last:border-0">
            <div className="mt-0.5">{statusIcon(step.status)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-semibold text-foreground">{step.tool}</span>
                <span className="text-[9px] text-muted-foreground font-mono truncate">
                  ({Object.entries(step.args).map(([k, v]) => `${k}: ${typeof v === 'string' && v.length > 30 ? v.slice(0, 30) + '…' : v}`).join(', ')})
                </span>
              </div>
              {step.result && (
                <p className="text-[10px] text-muted-foreground mt-0.5 whitespace-pre-wrap">{step.result}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
