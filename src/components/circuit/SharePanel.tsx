import { useState, useCallback } from 'react';
import { Share2, Link2, Copy, Check, Download, FolderOpen, X, Loader2, ExternalLink } from 'lucide-react';
import { useCircuitStore } from '@/store/circuitStore';
import { useSimulationStore } from '@/store/simulationStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
}

export default function SharePanel({ onClose }: Props) {
  const { components, wires, projectName, loadProject } = useCircuitStore();
  const { code } = useSimulationStore();
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadCode, setLoadCode] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [description, setDescription] = useState('');

  const handleShare = useCallback(async () => {
    if (components.length === 0) {
      toast.error('Add some components before sharing');
      return;
    }

    setIsSharing(true);
    try {
      const projectData = { components, wires };
      const { data, error } = await supabase
        .from('shared_projects')
        .insert({
          project_name: projectName || 'Untitled Project',
          project_data: projectData as any,
          code,
          author_name: authorName || 'Anonymous',
          description: description || `Circuit with ${components.length} components`,
        })
        .select('share_code')
        .single();

      if (error) throw error;

      const url = `${window.location.origin}/?shared=${data.share_code}`;
      setShareUrl(url);
      toast.success('Project shared successfully!');
    } catch (e: any) {
      toast.error(`Share failed: ${e.message}`);
    } finally {
      setIsSharing(false);
    }
  }, [components, wires, projectName, code, authorName, description]);

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLoadShared = useCallback(async () => {
    if (!loadCode.trim()) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('shared_projects')
        .select('*')
        .eq('share_code', loadCode.trim())
        .single();

      if (error || !data) throw new Error('Project not found');

      // Increment view count
      await supabase
        .from('shared_projects')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      const projectData = data.project_data as any;
      const projectJson = JSON.stringify({
        name: data.project_name,
        components: projectData.components || [],
        wires: projectData.wires || [],
        settings: { gridSize: 20, snapToGrid: true },
      });
      loadProject(projectJson);

      if (data.code) {
        useSimulationStore.getState().setCode(data.code);
      }

      toast.success(`Loaded: ${data.project_name}`);
      setLoadCode('');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [loadCode, loadProject]);

  const handleFork = useCallback(async () => {
    if (!loadCode.trim()) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('shared_projects')
        .select('*')
        .eq('share_code', loadCode.trim())
        .single();

      if (error || !data) throw new Error('Project not found');

      // Increment fork count
      await supabase
        .from('shared_projects')
        .update({ fork_count: (data.fork_count || 0) + 1 })
        .eq('id', data.id);

      // Load project
      const projectData = data.project_data as any;
      const projectJson = JSON.stringify({
        name: `${data.project_name} (Fork)`,
        components: projectData.components || [],
        wires: projectData.wires || [],
        settings: { gridSize: 20, snapToGrid: true },
      });
      loadProject(projectJson);

      if (data.code) {
        useSimulationStore.getState().setCode(data.code);
      }

      toast.success(`Forked: ${data.project_name}`);
      setLoadCode('');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [loadCode, loadProject]);

  return (
    <div className="w-72 bg-sidebar border-l border-border/50 flex flex-col h-full animate-slide-in-right">
      <div className="p-3 border-b border-border/50 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Share Project</h2>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Share section */}
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Share Your Circuit</h3>
          <input
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full bg-muted text-xs text-foreground rounded px-2.5 py-1.5 border border-border/30 focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder:text-muted-foreground/50"
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full bg-muted text-xs text-foreground rounded px-2.5 py-1.5 border border-border/30 resize-none focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder:text-muted-foreground/50"
          />
          <button
            onClick={handleShare}
            disabled={isSharing || components.length === 0}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent/15 text-accent hover:bg-accent/25 disabled:opacity-30 transition-colors text-xs font-medium"
          >
            {isSharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
            Generate Share Link
          </button>

          {shareUrl && (
            <div className="bg-muted/30 border border-border/30 rounded-lg p-2 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-background text-[10px] font-mono text-foreground rounded px-2 py-1 border border-border/30"
                />
                <button onClick={handleCopy} className="p-1 rounded bg-accent/15 text-accent hover:bg-accent/25 transition-colors">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-[9px] text-muted-foreground">Anyone with this link can view and fork your circuit</p>
            </div>
          )}
        </div>

        {/* Load section */}
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Load Shared Project</h3>
          <div className="flex gap-1.5">
            <input
              value={loadCode}
              onChange={e => setLoadCode(e.target.value)}
              placeholder="Share code..."
              className="flex-1 bg-muted text-xs text-foreground rounded px-2.5 py-1.5 border border-border/30 focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder:text-muted-foreground/50 font-mono"
            />
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleLoadShared}
              disabled={isLoading || !loadCode.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-muted hover:bg-muted/80 border border-border/30 text-[10px] font-medium text-foreground disabled:opacity-30 transition-colors"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FolderOpen className="w-3 h-3" />}
              Load
            </button>
            <button
              onClick={handleFork}
              disabled={isLoading || !loadCode.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-accent/10 hover:bg-accent/20 border border-accent/20 text-[10px] font-medium text-accent disabled:opacity-30 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Fork
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-1.5">
          <h3 className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Current Project</h3>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-muted/20 rounded px-2 py-1.5 text-center">
              <p className="text-sm font-bold text-foreground">{components.length}</p>
              <p className="text-[9px] text-muted-foreground">Components</p>
            </div>
            <div className="bg-muted/20 rounded px-2 py-1.5 text-center">
              <p className="text-sm font-bold text-foreground">{wires.length}</p>
              <p className="text-[9px] text-muted-foreground">Wires</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
