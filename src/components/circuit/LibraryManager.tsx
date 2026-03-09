import { useState, useMemo } from 'react';
import { Package, Search, Plus, Trash2, X, Check, ExternalLink, RefreshCw } from 'lucide-react';

export interface ArduinoLibrary {
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  dependencies?: string[];
  installed?: boolean;
  headerFile: string;
}

const LIBRARY_DATABASE: ArduinoLibrary[] = [
  { name: 'Adafruit_BME280', version: '2.2.2', description: 'Arduino library for BME280 humidity, barometric pressure & temp sensor', author: 'Adafruit', category: 'Sensors', dependencies: ['Adafruit_Sensor', 'Wire'], headerFile: 'Adafruit_BME280.h' },
  { name: 'Adafruit_GFX', version: '1.11.9', description: 'Adafruit GFX graphics core library', author: 'Adafruit', category: 'Display', dependencies: [], headerFile: 'Adafruit_GFX.h' },
  { name: 'Adafruit_SSD1306', version: '2.5.7', description: 'SSD1306 OLED driver library for monochrome 128x64 and 128x32 displays', author: 'Adafruit', category: 'Display', dependencies: ['Adafruit_GFX', 'Wire'], headerFile: 'Adafruit_SSD1306.h' },
  { name: 'Adafruit_Sensor', version: '1.1.14', description: 'Common sensor library for Adafruit unified sensor drivers', author: 'Adafruit', category: 'Sensors', dependencies: [], headerFile: 'Adafruit_Sensor.h' },
  { name: 'PubSubClient', version: '2.8.0', description: 'MQTT messaging library for Arduino', author: 'Nick O\'Leary', category: 'Communication', dependencies: [], headerFile: 'PubSubClient.h' },
  { name: 'FastLED', version: '3.6.0', description: 'Library for controlling WS2812B, WS2811, NeoPixel and other LED strips', author: 'Daniel Garcia', category: 'LED', dependencies: [], headerFile: 'FastLED.h' },
  { name: 'Servo', version: '1.2.1', description: 'Control RC servo motors', author: 'Arduino', category: 'Motor', dependencies: [], headerFile: 'Servo.h' },
  { name: 'DHT', version: '1.4.6', description: 'Library for DHT11, DHT22 humidity & temperature sensors', author: 'Adafruit', category: 'Sensors', dependencies: ['Adafruit_Sensor'], headerFile: 'DHT.h' },
  { name: 'Wire', version: '2.0.0', description: 'I2C communication library (built-in)', author: 'Arduino', category: 'Communication', dependencies: [], headerFile: 'Wire.h' },
  { name: 'SPI', version: '2.0.0', description: 'SPI communication library (built-in)', author: 'Arduino', category: 'Communication', dependencies: [], headerFile: 'SPI.h' },
  { name: 'WiFi', version: '2.0.0', description: 'WiFi connectivity for ESP32/ESP8266', author: 'Espressif', category: 'Communication', dependencies: [], headerFile: 'WiFi.h' },
  { name: 'ArduinoJson', version: '7.0.3', description: 'JSON library for embedded systems', author: 'Benoit Blanchon', category: 'Data', dependencies: [], headerFile: 'ArduinoJson.h' },
  { name: 'LiquidCrystal', version: '1.0.7', description: 'Control LCD displays based on Hitachi HD44780', author: 'Arduino', category: 'Display', dependencies: [], headerFile: 'LiquidCrystal.h' },
  { name: 'LiquidCrystal_I2C', version: '1.1.2', description: 'I2C LCD display library', author: 'Frank de Brabander', category: 'Display', dependencies: ['Wire'], headerFile: 'LiquidCrystal_I2C.h' },
  { name: 'Keypad', version: '3.1.1', description: 'Library for matrix keypad', author: 'Mark Stanley', category: 'Input', dependencies: [], headerFile: 'Keypad.h' },
  { name: 'AccelStepper', version: '1.64.0', description: 'Advanced stepper motor control', author: 'Mike McCauley', category: 'Motor', dependencies: [], headerFile: 'AccelStepper.h' },
  { name: 'IRremote', version: '4.3.0', description: 'Infrared remote library for Arduino', author: 'Armin Joachimsmeyer', category: 'Communication', dependencies: [], headerFile: 'IRremote.h' },
  { name: 'OneWire', version: '2.3.8', description: 'Dallas 1-Wire protocol library', author: 'Paul Stoffregen', category: 'Communication', dependencies: [], headerFile: 'OneWire.h' },
  { name: 'DallasTemperature', version: '3.9.0', description: 'DS18B20 temperature sensor library', author: 'Miles Burton', category: 'Sensors', dependencies: ['OneWire'], headerFile: 'DallasTemperature.h' },
  { name: 'Adafruit_NeoPixel', version: '1.12.0', description: 'Arduino library for NeoPixel/WS2812 LEDs', author: 'Adafruit', category: 'LED', dependencies: [], headerFile: 'Adafruit_NeoPixel.h' },
  { name: 'TFT_eSPI', version: '2.5.34', description: 'TFT display library with hardware SPI', author: 'Bodmer', category: 'Display', dependencies: ['SPI'], headerFile: 'TFT_eSPI.h' },
  { name: 'SD', version: '1.2.4', description: 'SD card read/write library', author: 'Arduino', category: 'Storage', dependencies: ['SPI'], headerFile: 'SD.h' },
  { name: 'EEPROM', version: '2.0.0', description: 'EEPROM read/write library', author: 'Arduino', category: 'Storage', dependencies: [], headerFile: 'EEPROM.h' },
  { name: 'NTPClient', version: '3.2.1', description: 'Network Time Protocol client', author: 'Fabrice Weinberg', category: 'Communication', dependencies: ['WiFi'], headerFile: 'NTPClient.h' },
  { name: 'WebServer', version: '2.0.0', description: 'Simple web server for ESP32', author: 'Espressif', category: 'Communication', dependencies: ['WiFi'], headerFile: 'WebServer.h' },
];

const CATEGORIES = ['All', ...Array.from(new Set(LIBRARY_DATABASE.map(l => l.category)))];

// Exported state for use by agent tools
let installedLibraries: ArduinoLibrary[] = [];
export function getInstalledLibraries() { return installedLibraries; }
export function installLibrary(name: string): string {
  const lib = LIBRARY_DATABASE.find(l => l.name === name);
  if (!lib) return `❌ Library not found: ${name}`;
  if (installedLibraries.some(l => l.name === name)) return `ℹ️ ${name} already installed`;
  installedLibraries.push({ ...lib, installed: true });
  // Auto-install dependencies
  const depResults: string[] = [];
  for (const dep of lib.dependencies || []) {
    if (!installedLibraries.some(l => l.name === dep)) {
      const depLib = LIBRARY_DATABASE.find(l => l.name === dep);
      if (depLib) {
        installedLibraries.push({ ...depLib, installed: true });
        depResults.push(dep);
      }
    }
  }
  return `✅ Installed ${name} v${lib.version}${depResults.length > 0 ? ` (+deps: ${depResults.join(', ')})` : ''}`;
}
export function removeLibrary(name: string): string {
  const idx = installedLibraries.findIndex(l => l.name === name);
  if (idx === -1) return `❌ ${name} is not installed`;
  installedLibraries = installedLibraries.filter(l => l.name !== name);
  return `✅ Removed ${name}`;
}
export function searchLibraries(query: string): ArduinoLibrary[] {
  const q = query.toLowerCase();
  return LIBRARY_DATABASE.filter(l =>
    l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)
  );
}

export default function LibraryManager({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [installed, setInstalled] = useState<ArduinoLibrary[]>(installedLibraries);
  const [showInstalled, setShowInstalled] = useState(false);

  const filtered = useMemo(() => {
    let libs = showInstalled ? installed : LIBRARY_DATABASE;
    if (category !== 'All') libs = libs.filter(l => l.category === category);
    if (search) {
      const q = search.toLowerCase();
      libs = libs.filter(l => l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
    }
    return libs;
  }, [search, category, showInstalled, installed]);

  const handleInstall = (lib: ArduinoLibrary) => {
    const result = installLibrary(lib.name);
    setInstalled([...installedLibraries]);
    // Toast-like feedback in console
    console.log(result);
  };

  const handleRemove = (name: string) => {
    removeLibrary(name);
    setInstalled([...installedLibraries]);
  };

  const isInstalled = (name: string) => installed.some(l => l.name === name);

  return (
    <div className="w-72 bg-sidebar border-l border-border/50 flex flex-col h-full animate-slide-in-right">
      <div className="p-3 border-b border-border/50 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Library Manager</h2>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-border/30 space-y-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search libraries..."
            className="w-full bg-muted text-xs text-foreground rounded pl-7 pr-2 py-1.5 border border-border/30 focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowInstalled(false)}
            className={`px-2 py-0.5 rounded text-[9px] font-medium transition-colors ${!showInstalled ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Browse ({LIBRARY_DATABASE.length})
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
        {CATEGORIES.map(cat => (
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

      {/* Library list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filtered.length === 0 ? (
          <p className="text-[10px] text-muted-foreground text-center py-4">No libraries found</p>
        ) : (
          filtered.map(lib => (
            <div key={lib.name} className="bg-muted/20 rounded-lg p-2 border border-border/20 hover:border-border/40 transition-colors">
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-foreground truncate">{lib.name}</span>
                    <span className="text-[8px] font-mono text-muted-foreground bg-muted px-1 rounded">v{lib.version}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2">{lib.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] text-muted-foreground/70">{lib.author}</span>
                    <span className="text-[8px] px-1 rounded bg-muted text-muted-foreground">{lib.category}</span>
                  </div>
                  {lib.dependencies && lib.dependencies.length > 0 && (
                    <p className="text-[8px] text-muted-foreground/60 mt-0.5">
                      Deps: {lib.dependencies.join(', ')}
                    </p>
                  )}
                </div>
                {isInstalled(lib.name) ? (
                  <div className="flex items-center gap-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                    {showInstalled && (
                      <button onClick={() => handleRemove(lib.name)} className="p-0.5 rounded text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button onClick={() => handleInstall(lib)} className="p-1 rounded bg-accent/15 text-accent hover:bg-accent/25 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border/30 bg-muted/20">
        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
          <span>{installed.length} libraries installed</span>
          <span>{LIBRARY_DATABASE.length} available</span>
        </div>
      </div>
    </div>
  );
}
