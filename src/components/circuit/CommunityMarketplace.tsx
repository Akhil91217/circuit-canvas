import { useState, useEffect, useMemo } from 'react';
import { Globe, Search, X, Eye, GitFork, Play, Clock, TrendingUp, Star, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCircuitStore } from '@/store/circuitStore';
import { useSimulationStore } from '@/store/simulationStore';
import { toast } from 'sonner';

interface SharedProject {
  id: string;
  project_name: string;
  description: string | null;
  author_name: string | null;
  share_code: string;
  view_count: number | null;
  fork_count: number | null;
  created_at: string;
  code: string;
  project_data: any;
}

type SortBy = 'trending' | 'newest' | 'most-forked' | 'most-viewed';
const SORT_OPTIONS: { value: SortBy; label: string; icon: React.ReactNode }[] = [
  { value: 'trending', label: 'Trending', icon: <TrendingUp className="w-3 h-3" /> },
  { value: 'newest', label: 'Newest', icon: <Clock className="w-3 h-3" /> },
  { value: 'most-forked', label: 'Most Forked', icon: <GitFork className="w-3 h-3" /> },
  { value: 'most-viewed', label: 'Most Viewed', icon: <Eye className="w-3 h-3" /> },
];

const CATEGORIES = ['All', 'IoT', 'Robotics', 'Sensors', 'Display', 'Communication', 'Smart Home'];

export default function CommunityMarketplace({ onClose }: { onClose: () => void }) {
  const [projects, setProjects] = useState<SharedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('trending');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shared_projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setProjects((data as SharedProject[]) || []);
    } catch (e: any) {
      console.error('Failed to load community projects', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...projects];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.project_name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.author_name || '').toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'trending':
        list.sort((a, b) => ((b.view_count || 0) + (b.fork_count || 0) * 3) - ((a.view_count || 0) + (a.fork_count || 0) * 3));
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'most-forked':
        list.sort((a, b) => (b.fork_count || 0) - (a.fork_count || 0));
        break;
      case 'most-viewed':
        list.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
    }
    return list;
  }, [projects, search, sortBy, category]);

  const handleLoadProject = async (project: SharedProject) => {
    try {
      await supabase
        .from('shared_projects')
        .update({ view_count: (project.view_count || 0) + 1 })
        .eq('id', project.id);

      const projectData = project.project_data;
      const projectJson = JSON.stringify({
        name: project.project_name,
        components: projectData.components || [],
        wires: projectData.wires || [],
        settings: { gridSize: 20, snapToGrid: true },
      });
      useCircuitStore.getState().loadProject(projectJson);
      if (project.code) useSimulationStore.getState().setCode(project.code);
      toast.success(`Loaded: ${project.project_name}`);
    } catch {
      toast.error('Failed to load project');
    }
  };

  const handleForkProject = async (project: SharedProject) => {
    try {
      await supabase
        .from('shared_projects')
        .update({ fork_count: (project.fork_count || 0) + 1 })
        .eq('id', project.id);

      const projectData = project.project_data;
      const projectJson = JSON.stringify({
        name: `${project.project_name} (Fork)`,
        components: projectData.components || [],
        wires: projectData.wires || [],
        settings: { gridSize: 20, snapToGrid: true },
      });
      useCircuitStore.getState().loadProject(projectJson);
      if (project.code) useSimulationStore.getState().setCode(project.code);
      toast.success(`Forked: ${project.project_name}`);
    } catch {
      toast.error('Failed to fork project');
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="w-80 bg-sidebar border-l border-border/50 flex flex-col h-full animate-slide-in-right">
      <div className="p-3 border-b border-border/50 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Community</h2>
          <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">{projects.length} projects</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-border/30">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search community projects..."
            className="w-full bg-muted text-xs text-foreground rounded pl-7 pr-2 py-1.5 border border-border/30 focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Sort tabs */}
      <div className="px-2 py-1.5 border-b border-border/30 flex gap-1">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSortBy(opt.value)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-medium transition-colors ${
              sortBy === opt.value ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground">No projects found</p>
            <p className="text-[9px] text-muted-foreground/60 mt-1">Share your circuit to be the first!</p>
          </div>
        ) : (
          filtered.map(project => (
            <div key={project.id} className="bg-muted/20 rounded-lg p-2.5 border border-border/20 hover:border-accent/30 transition-all group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[11px] font-semibold text-foreground truncate">{project.project_name}</h3>
                  <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2">{project.description || 'No description'}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[8px] text-muted-foreground/70">by {project.author_name || 'Anonymous'}</span>
                    <span className="text-[8px] text-muted-foreground/50">{timeAgo(project.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-0.5 text-[8px] text-muted-foreground">
                      <Eye className="w-2.5 h-2.5" />{project.view_count || 0}
                    </span>
                    <span className="flex items-center gap-0.5 text-[8px] text-muted-foreground">
                      <GitFork className="w-2.5 h-2.5" />{project.fork_count || 0}
                    </span>
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleLoadProject(project)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded bg-accent/10 text-accent hover:bg-accent/20 text-[9px] font-medium transition-colors"
                >
                  <Play className="w-3 h-3" />Simulate
                </button>
                <button
                  onClick={() => handleForkProject(project)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded bg-muted hover:bg-muted/80 border border-border/30 text-[9px] font-medium text-foreground transition-colors"
                >
                  <GitFork className="w-3 h-3" />Fork
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border/30 bg-muted/20">
        <button
          onClick={loadProjects}
          className="w-full flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <TrendingUp className="w-3 h-3" /> Refresh
        </button>
      </div>
    </div>
  );
}
