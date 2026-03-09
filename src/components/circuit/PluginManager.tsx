import { useState, useMemo } from 'react';
import { Puzzle, Search, Plus, Trash2, X, Check, Github, Code2 } from 'lucide-react';
import { COMPONENT_DEFINITIONS } from '@/data/componentDefinitions';
import { ComponentDefinition } from '@/types/circuit';

export interface PluginComponent {
  id: string;
  name: string;
  author: string;
  description: string;
  version: string;
  category: string;
  source: 'builtin' | 'local' | 'community';
  componentDef?: ComponentDefinition;
  installed: boolean;
  downloads?: number;
  busSupport?: string[];
}

const COMMUNITY_PLUGINS: PluginComponent[] = [
  { id: 'max7219-matrix', name: 'MAX7219 LED Matrix', author: 'CircuitForge', description: '8x8 LED matrix driver with cascading support', version: '1.0.0', category: 'Display', source: 'community', installed: false, downloads: 1240, busSupport: ['SPI'] },
  { id: 'hx711-loadcell', name: 'HX711 Load Cell Amp', author: 'embedded_dev', description: '24-bit ADC for weight sensing with load cells', version: '1.2.0', category: 'Sensors', source: 'community', installed: false, downloads: 890, busSupport: [] },
  { id: 'a4988-stepper', name: 'A4988 Stepper Driver', author: 'motorcraft', description: 'Microstepping stepper motor driver with current control', version: '2.0.1', category: 'Motor', source: 'community', installed: false, downloads: 2100, busSupport: [] },
  { id: 'mcp23017-expander', name: 'MCP23017 I/O Expander', author: 'io_labs', description: '16-bit I2C I/O expander for extra GPIO pins', version: '1.1.0', category: 'Communication', source: 'community', installed: false, downloads: 670, busSupport: ['I2C'] },
  { id: 'ads1115-adc', name: 'ADS1115 16-bit ADC', author: 'analog_master', description: '4-channel 16-bit ADC with programmable gain', version: '1.3.0', category: 'Sensors', source: 'community', installed: false, downloads: 1560, busSupport: ['I2C'] },
  { id: 'tb6612fng-motor', name: 'TB6612FNG Motor Driver', author: 'robotics_hub', description: 'Dual H-bridge motor driver, smaller than L298N', version: '1.0.2', category: 'Motor', source: 'community', installed: false, downloads: 980, busSupport: [] },
  { id: 'pca9685-pwm', name: 'PCA9685 16ch PWM', author: 'servo_king', description: '16-channel 12-bit PWM/servo driver via I2C', version: '1.4.0', category: 'Motor', source: 'community', installed: false, downloads: 1890, busSupport: ['I2C'] },
  { id: 'ws2812b-ring', name: 'WS2812B LED Ring', author: 'led_art', description: 'Circular NeoPixel ring with 12/16/24 LED options', version: '1.0.0', category: 'LED', source: 'community', installed: false, downloads: 3200, busSupport: [] },
  { id: 'esp32-cam', name: 'ESP32-CAM Module', author: 'vision_lab', description: 'ESP32 with OV2640 camera for image capture and streaming', version: '2.0.0', category: 'Microcontrollers', source: 'community', installed: false, downloads: 4100, busSupport: ['SPI'] },
  { id: 'ina219-power', name: 'INA219 Power Monitor', author: 'power_sense', description: 'High-side DC current/power/voltage sensor via I2C', version: '1.1.0', category: 'Sensors', source: 'community', installed: false, downloads: 1350, busSupport: ['I2C'] },
  { id: 'mpu9250-imu', name: 'MPU9250 9-DOF IMU', author: 'motion_labs', description: '9-axis motion tracking with accelerometer, gyroscope, and magnetometer', version: '1.2.0', category: 'Sensors', source: 'community', installed: false, downloads: 2400, busSupport: ['I2C', 'SPI'] },
  { id: 'esp-now-module', name: 'ESP-NOW Transceiver', author: 'wireless_dev', description: 'Peer-to-peer wireless communication for ESP32/ESP8266', version: '1.0.0', category: 'Communication', source: 'community', installed: false, downloads: 1700, busSupport: [] },
];

let installedPlugins: PluginComponent[] = [];
export function getInstalledPlugins() { return installedPlugins; }
export function installPlugin(id: string): string {
  const plugin = COMMUNITY_PLUGINS.find(p => p.id === id);
  if (!plugin) return `❌ Plugin not found: ${id}`;
  if (installedPlugins.some(p => p.id === id)) return `ℹ️ ${plugin.name} already installed`;
  installedPlugins.push({ ...plugin, installed: true });
  return `✅ Installed plugin: ${plugin.name} v${plugin.version}`;
}
export function removePlugin(id: string): string {
  const plugin = installedPlugins.find(p => p.id === id);
  if (!plugin) return `❌ Plugin not installed: ${id}`;
  installedPlugins = installedPlugins.filter(p => p.id !== id);
  return `✅ Removed plugin: ${plugin.name}`;
}
export function searchPlugins(query: string): PluginComponent[] {
  const q = query.toLowerCase();
  return COMMUNITY_PLUGINS.filter(p =>
    p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );
}

const PLUGIN_CATEGORIES = ['All', ...Array.from(new Set(COMMUNITY_PLUGINS.map(p => p.category)))];

export default function PluginManager({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [installed, setInstalled] = useState<PluginComponent[]>(installedPlugins);
  const [showInstalled, setShowInstalled] = useState(false);

  const builtinCount = Object.keys(COMPONENT_DEFINITIONS).length;

  const filtered = useMemo(() => {
    let plugins = showInstalled ? installed : COMMUNITY_PLUGINS;
    if (category !== 'All') plugins = plugins.filter(p => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      plugins = plugins.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return plugins;
  }, [search, category, showInstalled, installed]);

  const handleInstall = (plugin: PluginComponent) => {
    installPlugin(plugin.id);
    setInstalled([...installedPlugins]);
  };

  const handleRemove = (id: string) => {
    removePlugin(id);
    setInstalled([...installedPlugins]);
  };

  const isInstalled = (id: string) => installed.some(p => p.id === id);

  return (
    <div className="w-72 bg-sidebar border-l border-border/50 flex flex-col h-full animate-slide-in-right">
      <div className="p-3 border-b border-border/50 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <Puzzle className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Plugin Components</h2>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
      </div>

      {/* Stats bar */}
      <div className="px-3 py-1.5 border-b border-border/30 bg-muted/10 flex items-center gap-3 text-[9px] text-muted-foreground">
        <span><Code2 className="w-3 h-3 inline mr-0.5" />{builtinCount} built-in</span>
        <span><Puzzle className="w-3 h-3 inline mr-0.5" />{installed.length} plugins</span>
        <span><Github className="w-3 h-3 inline mr-0.5" />{COMMUNITY_PLUGINS.length} available</span>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-border/30 space-y-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search plugins..."
            className="w-full bg-muted text-xs text-foreground rounded pl-7 pr-2 py-1.5 border border-border/30 focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowInstalled(false)}
            className={`px-2 py-0.5 rounded text-[9px] font-medium transition-colors ${!showInstalled ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setShowInstalled(true)}
            className={`px-2 py-0.5 rounded text-[9px] font-medium transition-colors ${showInstalled ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Installed ({installed.length})
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="px-2 py-1.5 border-b border-border/30 flex flex-wrap gap-1">
        {PLUGIN_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-1.5 py-0.5 rounded text-[8px] font-medium transition-colors ${
              category === cat ? 'bg-accent/15 text-accent border border-accent/20' : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Plugin list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filtered.length === 0 ? (
          <p className="text-[10px] text-muted-foreground text-center py-4">No plugins found</p>
        ) : (
          filtered.map(plugin => (
            <div key={plugin.id} className="bg-muted/20 rounded-lg p-2 border border-border/20 hover:border-border/40 transition-colors">
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-foreground truncate">{plugin.name}</span>
                    <span className="text-[8px] font-mono text-muted-foreground bg-muted px-1 rounded">v{plugin.version}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2">{plugin.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] text-muted-foreground/70">{plugin.author}</span>
                    <span className="text-[8px] px-1 rounded bg-muted text-muted-foreground">{plugin.category}</span>
                    {plugin.downloads && (
                      <span className="text-[8px] text-muted-foreground/50">↓{plugin.downloads}</span>
                    )}
                  </div>
                  {plugin.busSupport && plugin.busSupport.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {plugin.busSupport.map(bus => (
                        <span key={bus} className="text-[7px] px-1 rounded bg-accent/10 text-accent border border-accent/20">{bus}</span>
                      ))}
                    </div>
                  )}
                </div>
                {isInstalled(plugin.id) ? (
                  <div className="flex items-center gap-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                    {showInstalled && (
                      <button onClick={() => handleRemove(plugin.id)} className="p-0.5 rounded text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button onClick={() => handleInstall(plugin)} className="p-1 rounded bg-accent/15 text-accent hover:bg-accent/25 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
