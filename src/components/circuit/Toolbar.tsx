import { useCircuitStore } from '@/store/circuitStore';
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize, Trash2,
  RotateCw, Copy, Save, FolderOpen, FilePlus, Download
} from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

export default function Toolbar() {
  const {
    zoom, setZoom, resetView, selectedIds,
    removeComponents, rotateComponent, duplicateComponents,
    undo, redo, newProject, saveProject, loadProject, components, wires,
  } = useCircuitStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const json = saveProject();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'circuit-project.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Project saved!');
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      loadProject(reader.result as string);
      toast.success('Project loaded!');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const ToolButton = ({ icon: Icon, label, onClick, disabled, active }: {
    icon: React.ElementType; label: string; onClick: () => void; disabled?: boolean; active?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-border mx-1" />;

  return (
    <div className="h-10 bg-toolbar border-b border-border flex items-center px-3 gap-0.5">
      <ToolButton icon={FilePlus} label="New Project" onClick={newProject} />
      <ToolButton icon={Save} label="Save Project (JSON)" onClick={handleSave} />
      <ToolButton icon={FolderOpen} label="Load Project" onClick={() => fileInputRef.current?.click()} />
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleLoad} />

      <Divider />

      <ToolButton icon={Undo2} label="Undo (Ctrl+Z)" onClick={undo} />
      <ToolButton icon={Redo2} label="Redo (Ctrl+Y)" onClick={redo} />

      <Divider />

      <ToolButton icon={ZoomOut} label="Zoom Out" onClick={() => setZoom(zoom / 1.2)} />
      <span className="text-[10px] font-mono text-muted-foreground w-10 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <ToolButton icon={ZoomIn} label="Zoom In" onClick={() => setZoom(zoom * 1.2)} />
      <ToolButton icon={Maximize} label="Reset View" onClick={resetView} />

      <Divider />

      <ToolButton icon={RotateCw} label="Rotate (R)" onClick={() => selectedIds.length === 1 && rotateComponent(selectedIds[0])} disabled={selectedIds.length !== 1} />
      <ToolButton icon={Copy} label="Duplicate (Ctrl+D)" onClick={() => duplicateComponents(selectedIds)} disabled={selectedIds.length === 0} />
      <ToolButton icon={Trash2} label="Delete (Del)" onClick={() => removeComponents(selectedIds)} disabled={selectedIds.length === 0} />

      <div className="flex-1" />

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
        <span>{components.length} components</span>
        <span>·</span>
        <span>{wires.length} wires</span>
      </div>
    </div>
  );
}
