import { useState, useMemo } from 'react';
import { LayoutTemplate, Search, X, Play, ChevronRight, Cpu, Radio, Shield, ThermometerSun, Bot, Gauge } from 'lucide-react';
import { PROJECT_TEMPLATES, ProjectTemplate } from '@/data/projectTemplates';
import { useCircuitStore } from '@/store/circuitStore';
import { useSimulationStore } from '@/store/simulationStore';
import { COMPONENT_DEFINITIONS } from '@/data/componentDefinitions';
import { executeAgentTool } from '@/engine/AgentTools';
import { toast } from 'sonner';

interface TemplateCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'all', name: 'All Templates', icon: <LayoutTemplate className="w-4 h-4" />, description: 'Browse all available templates' },
  { id: 'smart-home', name: 'Smart Home', icon: <Shield className="w-4 h-4" />, description: 'Home automation and security' },
  { id: 'robotics', name: 'Robotics', icon: <Bot className="w-4 h-4" />, description: 'Robot cars, arms, and drones' },
  { id: 'weather', name: 'Weather Station', icon: <ThermometerSun className="w-4 h-4" />, description: 'Environmental monitoring' },
  { id: 'iot', name: 'IoT Devices', icon: <Radio className="w-4 h-4" />, description: 'Connected sensor nodes' },
  { id: 'industrial', name: 'Industrial', icon: <Gauge className="w-4 h-4" />, description: 'Industrial automation' },
];

// Extended template metadata
const TEMPLATE_META: Record<string, { category: string; difficulty: 'Beginner' | 'Intermediate' | 'Advanced'; tags: string[] }> = {
  'weather-station': { category: 'weather', difficulty: 'Intermediate', tags: ['ESP32', 'BME280', 'OLED', 'MQTT'] },
  'smart-home-sensor': { category: 'smart-home', difficulty: 'Beginner', tags: ['Arduino', 'PIR', 'DHT22', 'Alarm'] },
  'robot-car': { category: 'robotics', difficulty: 'Intermediate', tags: ['Arduino', 'L298N', 'Ultrasonic', 'Servo'] },
  'iot-dashboard': { category: 'iot', difficulty: 'Intermediate', tags: ['ESP32', 'BME280', 'OLED', 'WiFi'] },
  'security-alarm': { category: 'smart-home', difficulty: 'Advanced', tags: ['Arduino', 'PIR', 'Keypad', 'LCD'] },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  'Beginner': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'Intermediate': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  'Advanced': 'text-rose-400 bg-rose-400/10 border-rose-400/20',
};

export default function TemplateMarketplace({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let templates = PROJECT_TEMPLATES;
    if (selectedCategory !== 'all') {
      templates = templates.filter(t => TEMPLATE_META[t.id]?.category === selectedCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        TEMPLATE_META[t.id]?.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    return templates;
  }, [search, selectedCategory]);

  const handleLoadTemplate = (template: ProjectTemplate) => {
    const result = executeAgentTool('loadTemplate', { templateId: template.id });
    toast.success(`Loaded: ${template.name}`);
  };

  return (
    <div className="w-80 bg-sidebar border-l border-border/50 flex flex-col h-full animate-slide-in-right">
      <div className="p-3 border-b border-border/50 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Templates</h2>
          <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">{PROJECT_TEMPLATES.length}</span>
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
            placeholder="Search templates..."
            className="w-full bg-muted text-xs text-foreground rounded pl-7 pr-2 py-1.5 border border-border/30 focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-2 py-1.5 border-b border-border/30 flex flex-wrap gap-1">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-medium transition-colors ${
              selectedCategory === cat.id ? 'bg-accent/15 text-accent border border-accent/20' : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Templates */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <LayoutTemplate className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground">No templates found</p>
          </div>
        ) : (
          filtered.map(template => {
            const meta = TEMPLATE_META[template.id];
            const isExpanded = expandedTemplate === template.id;
            return (
              <div key={template.id} className="bg-muted/20 rounded-lg border border-border/20 hover:border-accent/30 transition-all overflow-hidden">
                <div
                  className="p-2.5 cursor-pointer"
                  onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-[11px] font-semibold text-foreground">{template.name}</h3>
                        <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{template.description}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {meta && (
                          <span className={`text-[7px] px-1 py-0.5 rounded border font-medium ${DIFFICULTY_COLORS[meta.difficulty]}`}>
                            {meta.difficulty}
                          </span>
                        )}
                        <span className="text-[8px] text-muted-foreground/60">
                          {template.components.length} components · {template.connections.length} wires
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border/20 px-2.5 pb-2.5 pt-2 space-y-2">
                    {/* Tags */}
                    {meta?.tags && (
                      <div className="flex flex-wrap gap-1">
                        {meta.tags.map(tag => (
                          <span key={tag} className="text-[7px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/30">{tag}</span>
                        ))}
                      </div>
                    )}
                    {/* Components list */}
                    <div>
                      <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Components</p>
                      <div className="flex flex-wrap gap-1">
                        {template.components.map((comp, i) => (
                          <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                            {COMPONENT_DEFINITIONS[comp.type]?.name || comp.type}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Load button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLoadTemplate(template); }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent hover:bg-accent/25 transition-colors text-[10px] font-medium"
                    >
                      <Play className="w-3 h-3" />
                      Load Template
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
