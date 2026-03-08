import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, Sparkles, X, Trash2, Loader2, Zap, Code2 } from 'lucide-react';
import { useCircuitStore } from '@/store/circuitStore';
import { useSimulationStore } from '@/store/simulationStore';
import { COMPONENT_DEFINITIONS } from '@/data/componentDefinitions';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/circuit-ai-chat`;

const QUICK_PROMPTS = [
  { icon: '💡', text: 'Blink an LED with Arduino' },
  { icon: '🌡️', text: 'Read temperature sensor on ESP32' },
  { icon: '📡', text: 'Ultrasonic distance sensor circuit' },
  { icon: '🖥️', text: 'Display text on LCD 16x2' },
];

export default function AgentPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { addComponent } = useCircuitStore();
  const { setCode } = useSimulationStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const parseAndApplyCircuit = useCallback((text: string) => {
    // Extract circuit-json blocks
    const circuitMatch = text.match(/```circuit-json\s*([\s\S]*?)```/);
    if (circuitMatch) {
      try {
        const circuit = JSON.parse(circuitMatch[1]);
        if (circuit.components) {
          circuit.components.forEach((comp: any) => {
            if (COMPONENT_DEFINITIONS[comp.type]) {
              addComponent(comp.type, comp.x || 200, comp.y || 200);
            }
          });
        }
      } catch (e) {
        console.error('Failed to parse circuit JSON:', e);
      }
    }

    // Extract arduino code blocks
    const codeMatch = text.match(/```arduino\s*([\s\S]*?)```/);
    if (codeMatch) {
      setCode(codeMatch[1].trim());
    }
  }, [addComponent, setCode]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || `HTTP ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch { /* ignore */ }
        }
      }

      // Apply any circuit/code from the response
      parseAndApplyCircuit(assistantSoFar);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${e.message}` }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, parseAndApplyCircuit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="w-80 bg-[#0a0e16] border-l border-border/50 flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-border/50 bg-[#0d1117] shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="w-4 h-4 text-accent" />
            <Sparkles className="w-2 h-2 text-warning absolute -top-0.5 -right-0.5" />
          </div>
          <span className="text-xs font-semibold text-foreground">Agent Mode</span>
          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">AI</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMessages([])} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors" title="Clear chat">
            <Trash2 className="w-3 h-3" />
          </button>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="space-y-3 animate-fade-in">
            <div className="text-center py-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <p className="text-xs text-foreground font-medium">CircuitForge AI</p>
              <p className="text-[10px] text-muted-foreground mt-1">I can generate circuits, write Arduino code, and debug your projects.</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Quick Start</p>
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(qp.text)}
                  className="w-full text-left px-2.5 py-2 rounded-md bg-[#161b22] hover:bg-[#1c2333] border border-border/30 text-xs text-foreground transition-colors flex items-center gap-2"
                >
                  <span>{qp.icon}</span>
                  <span>{qp.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-lg px-3 py-2 text-xs ${
                msg.role === 'user'
                  ? 'bg-accent/15 text-foreground border border-accent/20'
                  : 'bg-[#161b22] text-foreground border border-border/30'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-xs max-w-none [&_pre]:bg-[#0d1117] [&_pre]:rounded [&_pre]:p-2 [&_pre]:text-[10px] [&_code]:text-accent [&_p]:m-0 [&_p]:mb-1.5 [&_ul]:m-0 [&_ol]:m-0 [&_li]:m-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-[#161b22] rounded-lg px-3 py-2 border border-border/30">
              <Loader2 className="w-3 h-3 animate-spin text-accent" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-border/50 bg-[#0d1117]">
        <div className="flex gap-1.5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about circuits, code..."
            rows={2}
            className="flex-1 bg-[#161b22] text-xs text-foreground rounded-md px-2.5 py-2 border border-border/30 resize-none focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder:text-muted-foreground/50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="self-end p-2 rounded-md bg-accent/15 text-accent hover:bg-accent/25 disabled:opacity-30 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
