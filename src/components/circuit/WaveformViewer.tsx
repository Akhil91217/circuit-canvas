import { useRef, useEffect, useCallback } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { Activity, Plus, X } from 'lucide-react';

const PIN_COLORS = [
  '#22d3a0', '#79c0ff', '#f97316', '#a78bfa', '#fb7185',
  '#38bdf8', '#fbbf24', '#34d399', '#f472b6', '#60a5fa',
];

export default function WaveformViewer() {
  const { waveformData, watchedPins, toggleWatchPin, isRunning } = useSimulationStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    if (watchedPins.length === 0) {
      ctx.fillStyle = '#484f58';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Add pins to watch', w / 2, h / 2);
      return;
    }

    const channelHeight = Math.min(60, (h - 10) / watchedPins.length);
    const timeWindow = 10000; // 10 seconds
    const now = waveformData.length > 0 ? waveformData[waveformData.length - 1].time : 0;
    const startTime = now - timeWindow;

    // Grid lines
    ctx.strokeStyle = 'rgba(72, 79, 88, 0.3)';
    ctx.lineWidth = 0.5;
    for (let t = 0; t < 10; t++) {
      const x = (t / 10) * w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    watchedPins.forEach((pin, idx) => {
      const yBase = idx * channelHeight + 8;
      const color = PIN_COLORS[idx % PIN_COLORS.length];

      // Label
      ctx.fillStyle = color;
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Pin ${pin}`, 4, yBase + 10);

      // Channel separator
      ctx.strokeStyle = 'rgba(72, 79, 88, 0.2)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, yBase + channelHeight);
      ctx.lineTo(w, yBase + channelHeight);
      ctx.stroke();

      // Waveform
      const pinData = waveformData.filter(s => s.pin === pin && s.time >= startTime);
      if (pinData.length === 0) return;

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const signalTop = yBase + 16;
      const signalBottom = yBase + channelHeight - 4;

      pinData.forEach((sample, i) => {
        const x = ((sample.time - startTime) / timeWindow) * w;
        // Digital: HIGH = top, LOW = bottom
        const isDigital = sample.mode === 'digital' || sample.value === 0 || sample.value === 255;
        let y: number;
        if (isDigital) {
          y = sample.value > 127 ? signalTop : signalBottom;
        } else {
          y = signalBottom - (sample.value / 255) * (signalBottom - signalTop);
        }

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Step-style for digital
          if (isDigital) {
            const prevX = ((pinData[i - 1].time - startTime) / timeWindow) * w;
            const prevY = pinData[i - 1].value > 127 ? signalTop : signalBottom;
            ctx.lineTo(x, prevY);
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();

      // Current value indicator
      const lastSample = pinData[pinData.length - 1];
      if (lastSample) {
        const isHigh = lastSample.value > 127;
        ctx.fillStyle = color;
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(
          lastSample.mode === 'digital' ? (isHigh ? 'HIGH' : 'LOW') : String(lastSample.value),
          w - 4,
          yBase + 10
        );
      }
    });
  }, [waveformData, watchedPins]);

  useEffect(() => {
    const animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [draw]);

  // Redraw on interval when running
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(draw, 100);
    return () => clearInterval(interval);
  }, [isRunning, draw]);

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/30 shrink-0">
        <Activity className="w-3.5 h-3.5 text-accent" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">Signal Viewer</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          {[2, 3, 5, 9, 10, 11, 13].map(pin => (
            <button
              key={pin}
              onClick={() => toggleWatchPin(pin)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors ${
                watchedPins.includes(pin)
                  ? 'bg-accent/20 text-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              {pin}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
}
