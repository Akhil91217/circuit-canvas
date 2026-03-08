import { Code2 } from 'lucide-react';

export default function BottomPanel() {
  return (
    <div className="h-10 bg-toolbar border-t border-border flex items-center px-4">
      <Code2 className="w-3.5 h-3.5 text-muted-foreground mr-2" />
      <span className="text-xs text-muted-foreground">
        Code Editor will be available in Phase 2.
      </span>
      <div className="flex-1" />
      <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
        <span>Shortcuts: <kbd className="px-1 py-0.5 bg-muted rounded text-foreground">Del</kbd> delete · <kbd className="px-1 py-0.5 bg-muted rounded text-foreground">R</kbd> rotate · <kbd className="px-1 py-0.5 bg-muted rounded text-foreground">Ctrl+D</kbd> duplicate</span>
      </div>
    </div>
  );
}
