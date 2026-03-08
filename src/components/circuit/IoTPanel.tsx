import { useState } from 'react';
import { Wifi, WifiOff, Radio, Send, Settings2 } from 'lucide-react';
import { useSimulationStore } from '@/store/simulationStore';

export default function IoTPanel({ onClose }: { onClose: () => void }) {
  const { mqttConnected, mqttMessages, mqttConfig, setMqttConfig, setMqttConnected, addMqttMessage, wifiConnected } = useSimulationStore();
  const [publishTopic, setPublishTopic] = useState(mqttConfig.topic);
  const [publishMsg, setPublishMsg] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  const handleConnect = () => {
    setMqttConnected(!mqttConnected);
    if (!mqttConnected) {
      addMqttMessage({ topic: 'system', message: `Connected to ${mqttConfig.brokerUrl}`, direction: 'system', timestamp: Date.now() });
    }
  };

  const handlePublish = () => {
    if (!publishMsg.trim()) return;
    addMqttMessage({
      topic: publishTopic,
      message: publishMsg,
      direction: 'out',
      timestamp: Date.now(),
    });
    setPublishMsg('');
  };

  return (
    <div className="w-72 bg-[#0a0e16] border-l border-border/50 flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-border/50 bg-[#0d1117] shrink-0">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-foreground">IoT Monitor</span>
        </div>
        <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors text-xs">✕</button>
      </div>

      {/* WiFi Status */}
      <div className="px-3 py-2 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {wifiConnected ? <Wifi className="w-3.5 h-3.5 text-success" /> : <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />}
            <span className="text-[10px] font-mono text-foreground">{wifiConnected ? 'WiFi Connected' : 'WiFi Disconnected'}</span>
          </div>
          <span className={`w-1.5 h-1.5 rounded-full ${wifiConnected ? 'bg-success animate-pulse' : 'bg-muted-foreground/30'}`} />
        </div>
        {wifiConnected && (
          <p className="text-[9px] text-muted-foreground font-mono mt-1">SSID: CircuitForge_Net • IP: 192.168.1.100</p>
        )}
      </div>

      {/* MQTT Config */}
      <div className="px-3 py-2 border-b border-border/30">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">MQTT</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowConfig(!showConfig)} className="p-0.5 rounded text-muted-foreground hover:text-foreground">
              <Settings2 className="w-3 h-3" />
            </button>
            <button
              onClick={handleConnect}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                mqttConnected ? 'bg-destructive/15 text-destructive' : 'bg-success/15 text-success'
              }`}
            >
              {mqttConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>
        
        {showConfig && (
          <div className="space-y-1.5 mb-2 animate-fade-in">
            <div>
              <label className="text-[9px] text-muted-foreground">Broker URL</label>
              <input
                value={mqttConfig.brokerUrl}
                onChange={e => setMqttConfig({ ...mqttConfig, brokerUrl: e.target.value })}
                className="w-full bg-[#161b22] rounded px-2 py-1 text-[10px] font-mono text-foreground border border-border/30 focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground">Topic</label>
              <input
                value={mqttConfig.topic}
                onChange={e => setMqttConfig({ ...mqttConfig, topic: e.target.value })}
                className="w-full bg-[#161b22] rounded px-2 py-1 text-[10px] font-mono text-foreground border border-border/30 focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
            </div>
          </div>
        )}

        {/* Publish */}
        {mqttConnected && (
          <div className="flex gap-1">
            <input
              value={publishMsg}
              onChange={e => setPublishMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePublish()}
              placeholder="Message..."
              className="flex-1 bg-[#161b22] rounded px-2 py-1 text-[10px] font-mono text-foreground border border-border/30 focus:outline-none"
            />
            <button onClick={handlePublish} className="p-1 rounded bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
              <Send className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {mqttMessages.length === 0 ? (
          <p className="text-[10px] text-muted-foreground/50 italic text-center mt-4">No MQTT messages yet</p>
        ) : (
          mqttMessages.map((msg, i) => (
            <div key={i} className={`px-2 py-1 rounded text-[10px] font-mono ${
              msg.direction === 'out' ? 'bg-accent/5 border-l-2 border-accent/30' :
              msg.direction === 'in' ? 'bg-success/5 border-l-2 border-success/30' :
              'bg-muted/30 border-l-2 border-muted-foreground/20'
            }`}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-muted-foreground">{msg.topic}</span>
                <span className="text-muted-foreground/40">{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <span className="text-foreground">{msg.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
