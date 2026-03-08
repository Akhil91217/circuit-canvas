import React, { useState } from 'react';
import { CATEGORIES, COMPONENT_DEFINITIONS } from '@/data/componentDefinitions';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

export default function ComponentLibrary() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(CATEGORIES.map(c => c.name));
  const [search, setSearch] = useState('');

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
      return def && def.name.toLowerCase().includes(search.toLowerCase());
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
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-muted text-foreground text-xs px-7 py-1.5 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />
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
                <ChevronDown className="w-3 h-3 mr-1.5" />
              ) : (
                <ChevronRight className="w-3 h-3 mr-1.5" />
              )}
              {cat.name}
            </button>

            {expandedCategories.includes(cat.name) && (
              <div className="ml-2 space-y-0.5">
                {cat.components.map(type => {
                  const def = COMPONENT_DEFINITIONS[type];
                  if (!def) return null;
                  return (
                    <div
                      key={type}
                      draggable
                      onDragStart={e => handleDragStart(e, type)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded cursor-grab active:cursor-grabbing hover:bg-muted text-xs text-secondary-foreground transition-colors group"
                      title={`Drag to add ${def.name}`}
                    >
                      <span className="text-sm">{def.icon}</span>
                      <span className="group-hover:text-primary transition-colors">{def.name}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{def.pins.length}p</span>
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
