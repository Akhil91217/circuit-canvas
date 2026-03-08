import { useState } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { useCircuitStore } from '@/store/circuitStore';
import { Download, FolderArchive, Github, X, Copy, Check } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function ExportPanel({ onClose }: Props) {
  const { code } = useSimulationStore();
  const { components, wires, projectName } = useCircuitStore();
  const [copied, setCopied] = useState(false);

  const handleExportSketch = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}.ino`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportProject = () => {
    const projectData = {
      name: projectName,
      version: '5.0',
      components,
      wires,
      code,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}.circuitforge.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-72 bg-sidebar border-l border-border flex flex-col h-full animate-slide-in-right">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Export Project</h2>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Export Arduino Sketch */}
        <button
          onClick={handleExportSketch}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 border border-border/30 transition-colors group text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
            <FolderArchive className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">Arduino Sketch (.ino)</p>
            <p className="text-[10px] text-muted-foreground">Download the code as an .ino file</p>
          </div>
        </button>

        {/* Export Full Project */}
        <button
          onClick={handleExportProject}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 border border-border/30 transition-colors group text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <Download className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">Full Project (.json)</p>
            <p className="text-[10px] text-muted-foreground">Circuit + code + components</p>
          </div>
        </button>

        {/* Copy Code */}
        <button
          onClick={handleCopyCode}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 border border-border/30 transition-colors group text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
            {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5 text-purple-400" />}
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">{copied ? 'Copied!' : 'Copy Code'}</p>
            <p className="text-[10px] text-muted-foreground">Copy Arduino code to clipboard</p>
          </div>
        </button>

        {/* GitHub info */}
        <div className="p-3 rounded-lg bg-muted/10 border border-border/20">
          <div className="flex items-center gap-2 mb-2">
            <Github className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">GitHub Sync</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Connect your project to GitHub via Settings → GitHub to enable automatic sync, version control, and collaboration.
          </p>
        </div>

        {/* Project Stats */}
        <div className="space-y-1.5">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Project Stats</h3>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-muted/20 rounded px-2 py-1.5 text-center">
              <p className="text-sm font-bold text-foreground">{components.length}</p>
              <p className="text-[9px] text-muted-foreground">Components</p>
            </div>
            <div className="bg-muted/20 rounded px-2 py-1.5 text-center">
              <p className="text-sm font-bold text-foreground">{wires.length}</p>
              <p className="text-[9px] text-muted-foreground">Wires</p>
            </div>
            <div className="bg-muted/20 rounded px-2 py-1.5 text-center">
              <p className="text-sm font-bold text-foreground">{code.split('\n').length}</p>
              <p className="text-[9px] text-muted-foreground">Lines of Code</p>
            </div>
            <div className="bg-muted/20 rounded px-2 py-1.5 text-center">
              <p className="text-sm font-bold text-foreground">{(code.length / 1024).toFixed(1)}KB</p>
              <p className="text-[9px] text-muted-foreground">Code Size</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
