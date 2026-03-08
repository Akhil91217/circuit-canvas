import { useState, useCallback } from 'react';
import { X, Plus, FileCode2, FileText } from 'lucide-react';
import CodeEditor from './CodeEditor';
import { useSimulationStore } from '@/store/simulationStore';

interface ProjectFile {
  name: string;
  content: string;
  language: string;
}

const DEFAULT_FILES: ProjectFile[] = [
  { name: 'main.ino', content: '', language: 'arduino' },
];

export default function MultiFileEditor() {
  const { code, setCode } = useSimulationStore();
  const [files, setFiles] = useState<ProjectFile[]>(() => [
    { name: 'main.ino', content: code, language: 'arduino' },
  ]);
  const [activeFile, setActiveFile] = useState('main.ino');
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleSwitchFile = useCallback((name: string) => {
    // Save current file content
    setFiles(prev => prev.map(f => f.name === activeFile ? { ...f, content: code } : f));
    // Load new file
    const target = files.find(f => f.name === name);
    if (target) {
      setCode(target.content);
      setActiveFile(name);
    }
  }, [activeFile, code, files, setCode]);

  const handleAddFile = useCallback(() => {
    if (!newFileName.trim()) return;
    let name = newFileName.trim();
    if (!name.includes('.')) name += '.h';
    if (files.some(f => f.name === name)) return;

    const lang = name.endsWith('.ino') || name.endsWith('.cpp') || name.endsWith('.c')
      ? 'arduino' : name.endsWith('.h') ? 'arduino' : 'plaintext';

    const header = name.endsWith('.h')
      ? `#ifndef ${name.replace('.', '_').toUpperCase()}\n#define ${name.replace('.', '_').toUpperCase()}\n\n// Your code here\n\n#endif`
      : '// Your code here\n';

    setFiles(prev => [...prev, { name, content: header, language: lang }]);
    setShowNewFile(false);
    setNewFileName('');
  }, [newFileName, files]);

  const handleCloseFile = useCallback((name: string) => {
    if (name === 'main.ino') return; // Can't close main
    if (files.length <= 1) return;
    const remaining = files.filter(f => f.name !== name);
    setFiles(remaining);
    if (activeFile === name) {
      setCode(remaining[0].content);
      setActiveFile(remaining[0].name);
    }
  }, [activeFile, files, setCode]);

  const getIcon = (name: string) => {
    if (name.endsWith('.ino') || name.endsWith('.cpp') || name.endsWith('.c')) return <FileCode2 className="w-3 h-3" />;
    return <FileText className="w-3 h-3" />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center h-7 bg-[#161b22] border-b border-border/30 overflow-x-auto shrink-0">
        {files.map(f => (
          <button
            key={f.name}
            onClick={() => handleSwitchFile(f.name)}
            className={`flex items-center gap-1 px-2.5 h-full text-[10px] font-mono border-r border-border/20 whitespace-nowrap transition-colors group ${
              activeFile === f.name
                ? 'bg-[#0d1117] text-foreground border-b-2 border-b-accent'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            {getIcon(f.name)}
            <span>{f.name}</span>
            {f.name !== 'main.ino' && (
              <X
                className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity ml-1"
                onClick={(e) => { e.stopPropagation(); handleCloseFile(f.name); }}
              />
            )}
          </button>
        ))}

        {showNewFile ? (
          <div className="flex items-center px-1.5 h-full gap-1">
            <input
              autoFocus
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddFile(); if (e.key === 'Escape') setShowNewFile(false); }}
              onBlur={() => { if (!newFileName.trim()) setShowNewFile(false); }}
              placeholder="filename.h"
              className="bg-muted/50 text-[10px] font-mono text-foreground px-1.5 py-0.5 rounded border border-accent/30 w-24 outline-none focus:border-accent"
            />
          </div>
        ) : (
          <button
            onClick={() => setShowNewFile(true)}
            className="flex items-center px-2 h-full text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            title="New file"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeEditor />
      </div>
    </div>
  );
}
