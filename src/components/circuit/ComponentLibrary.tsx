import React, { useState } from 'react';
import { CATEGORIES, COMPONENT_DEFINITIONS } from '@/data/componentDefinitions';
import { ChevronDown, ChevronRight, Search, Cpu, Zap, Radio, Eye, Layers } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Microcontrollers: <Cpu className="w-3 h-3" />,
  'Basic Components': <Zap className="w-3 h-3" />,
  Sensors: <Radio className="w-3 h-3" />,
  Displays: <Eye className="w-3 h-3" />,
  Modules: <Layers className="w-3 h-3" />,
};

const BUS_TAGS: Record<string, string> = {
  'oled-display': 'I2C',
  'accelerometer': 'I2C',
  'rtc-module': 'I2C',
  'led-matrix': 'SPI',
  'sd-card': 'SPI',
};

function ComponentThumbnail({ type }: { type: string }) {
  const def = COMPONENT_DEFINITIONS[type];
  if (!def) return null;

  const scale = Math.min(28 / def.width, 28 / def.height);

  return (
    <div
      className="w-8 h-8 rounded border border-border/30 flex items-center justify-center shrink-0 overflow-hidden"
      style={{ backgroundColor: def.color + '22' }}
    >
      <div
        className="rounded-sm"
        style={{
          width: def.width * scale,
          height: def.height * scale,
          backgroundColor: def.color,
          opacity: 0.85,
        }}
      />
    </div>
  );
}

export default function ComponentLibrary() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(CATEGORIES.map(c => c.name));
  const [search, setSearch] = useState('');
  const [busFilter, setBusFilter] = useState<string | null>(null);

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('component-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filteredCategories = CATEGORIES.map(cat => ({
    ...cat,
    components: cat.components.filter(c => {
      const def = COMPONENT_DEFINITIONS[c];
      if (!def) return false;
      const matchesSearch = def.name.toLowerCase().includes(search.toLowerCase()) ||
        c.toLowerCase().includes(search.toLowerCase());
      const matchesBus = !busFilter || BUS_TAGS[c] === busFilter;
      return matchesSearch && matchesBus;
    }),
  })).filter(cat => cat.components.length > 0);

  return (
    <div className="w-56 bg-sidebar border-r border-border flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Components
        </h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-muted text-foreground text-xs px-7 py-1.5 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />
        </div>
        {/* Bus filters */}
        <div className="flex gap-1 mt-2">
          {['I2C', 'SPI'].map(bus => (
            <button
              key={bus}
              onClick={() => setBusFilter(busFilter === bus ? null : bus)}
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                busFilter === bus
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : 'text-muted-foreground border-border/30 hover:text-foreground hover:border-border'
              }`}
            >
              {bus}
            </button>
          ))}
          {busFilter && (
            <button
              onClick={() => setBusFilter(null)}
              className="text-[9px] text-muted-foreground hover:text-foreground px-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredCategories.map(cat => (
          <div key={cat.name} className="mb-1">
            <button
              onClick={() => toggleCategory(cat.name)}
              className="flex items-center w-full text-left px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded transition-colors"
            >
              {expandedCategories.includes(cat.name) ? (
                <ChevronDown className="w-3 h-3 mr-1" />
              ) : (
                <ChevronRight className="w-3 h-3 mr-1" />
              )}
              <span className="mr-1.5">{CATEGORY_ICONS[cat.name]}</span>
              {cat.name}
              <span className="ml-auto text-[9px] text-muted-foreground/60">{cat.components.length}</span>
            </button>

            {expandedCategories.includes(cat.name) && (
              <div className="ml-1 space-y-0.5">
                {cat.components.map(type => {
                  const def = COMPONENT_DEFINITIONS[type];
                  if (!def) return null;
                  const bus = BUS_TAGS[type];
                  return (
                    <div
                      key={type}
                      draggable
                      onDragStart={e => handleDragStart(e, type)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded cursor-grab active:cursor-grabbing hover:bg-muted text-xs text-secondary-foreground transition-colors group"
                      title={`Drag to add ${def.name}`}
                    >
                      <ComponentThumbnail type={type} />
                      <div className="flex-1 min-w-0">
                        <span className="group-hover:text-primary transition-colors block truncate text-[11px]">{def.name}</span>
                        <span className="text-[9px] text-muted-foreground">{def.pins.length} pins</span>
                      </div>
                      {bus && (
                        <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                          {bus}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
