import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, Sparkles, X, Trash2, Loader2, Zap, Terminal } from 'lucide-react';
import { useCircuitStore } from '@/store/circuitStore';
import { useSimulationStore } from '@/store/simulationStore';
import { COMPONENT_DEFINITIONS } from '@/data/componentDefinitions';
import { AgentStep, executeAgentTool } from '@/engine/AgentTools';
import AgentConsole from '@/components/circuit/AgentConsole';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  agentSteps?: AgentStep[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/circuit-ai-chat`;

const QUICK_PROMPTS = [
  { icon: '💡', text: 'Build an LED blink circuit with Arduino' },
  { icon: '🌡️', text: 'Build an ESP32 temperature monitor with OLED display' },
  { icon: '📡', text: 'Create an ultrasonic distance sensor with LCD display' },
  { icon: '🎛️', text: 'Build a servo motor controller with potentiometer' },
];

function generateStepId() {
  return Math.random().toString(36).substring(2, 8);
}

export default function AgentPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentMode, setAgentMode] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setCode } = useSimulationStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const executeToolCalls = useCallback(async (toolCalls: Array<{ function: { name: string; arguments: string } }>) => {
    const steps: AgentStep[] = [];

    for (const tc of toolCalls) {
      const step: AgentStep = {
        id: generateStepId(),
        tool: tc.function.name,
        args: JSON.parse(tc.function.arguments || '{}'),
        status: 'running',
        timestamp: Date.now(),
      };
      steps.push(step);

      // Update UI with running step
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, agentSteps: [...steps] } : m);
        }
        return [...prev, { role: 'assistant', content: '', agentSteps: [...steps] }];
      });

      // Execute
      try {
        const result = executeAgentTool(step.tool, step.args);
        step.status = 'done';
        step.result = result;
      } catch (e: any) {
        step.status = 'error';
        step.result = `Error: ${e.message}`;
      }

      // Small delay between steps for visual effect
      await new Promise(r => setTimeout(r, 300));

      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, agentSteps: [...steps] } : m);
        }
        return prev;
      });
    }

    return steps;
  }, []);

  const sendAgentMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const allMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, useTools: agentMode }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || `HTTP ${resp.status}`);
      }

      if (agentMode) {
        // Non-streaming tool-call response
        const data = await resp.json();
        const choice = data.choices?.[0];
        const message = choice?.message;

        if (message?.tool_calls?.length > 0) {
          const steps = await executeToolCalls(message.tool_calls);

          // Update last assistant message with final content
          const summary = message.content || steps.map(s => s.result).filter(Boolean).join('\n');
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: summary, agentSteps: steps } : m);
            }
            return [...prev, { role: 'assistant', content: summary, agentSteps: steps }];
          });
        } else if (message?.content) {
          setMessages(prev => [...prev, { role: 'assistant', content: message.content }]);
          // Check for legacy code blocks
          const codeMatch = message.content.match(/```arduino\s*([\s\S]*?)```/);
          if (codeMatch) setCode(codeMatch[1].trim());
        }
      } else {
        // Streaming mode (legacy)
        const reader = resp.body!.getReader();
        const decoder = new TextDecoder();
        let textBuffer = '';
        let assistantSoFar = '';
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

        const codeMatch = assistantSoFar.match(/```arduino\s*([\s\S]*?)```/);
        if (codeMatch) setCode(codeMatch[1].trim());
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${e.message}` }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, agentMode, executeToolCalls, setCode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAgentMessage(input);
    }
  };

  return (
    <div className="w-80 bg-sidebar border-l border-border/50 flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-border/50 bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="w-4 h-4 text-accent" />
            <Sparkles className="w-2 h-2 text-warning absolute -top-0.5 -right-0.5" />
          </div>
          <span className="text-xs font-semibold text-foreground">AI Agent</span>
          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">v6</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAgentMode(!agentMode)}
            className={`p-1 rounded text-[9px] font-mono transition-colors ${
              agentMode ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground'
            }`}
            title={agentMode ? 'Agent mode (tools)' : 'Chat mode (streaming)'}
          >
            <Terminal className="w-3 h-3" />
          </button>
          <button onClick={() => setMessages([])} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors" title="Clear chat">
            <Trash2 className="w-3 h-3" />
          </button>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mode indicator */}
      <div className="px-3 py-1 border-b border-border/30 bg-muted/20">
        <span className="text-[9px] font-mono text-muted-foreground">
          {agentMode ? '🤖 Agent Mode — AI executes tools directly' : '💬 Chat Mode — Streaming responses'}
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="space-y-3 animate-fade-in">
            <div className="text-center py-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <p className="text-xs text-foreground font-medium">CircuitForge AI Agent</p>
              <p className="text-[10px] text-muted-foreground mt-1">I can autonomously build circuits, write code, and run simulations.</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Try these</p>
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => sendAgentMessage(qp.text)}
                  className="w-full text-left px-2.5 py-2 rounded-md bg-muted hover:bg-muted/80 border border-border/30 text-xs text-foreground transition-colors flex items-center gap-2"
                >
                  <span>{qp.icon}</span>
                  <span>{qp.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] rounded-lg px-3 py-2 text-xs ${
                msg.role === 'user'
                  ? 'bg-accent/15 text-foreground border border-accent/20'
                  : 'bg-muted text-foreground border border-border/30'
              }`}>
                {msg.role === 'assistant' && msg.content ? (
                  <div className="prose prose-invert prose-xs max-w-none [&_pre]:bg-background [&_pre]:rounded [&_pre]:p-2 [&_pre]:text-[10px] [&_code]:text-accent [&_p]:m-0 [&_p]:mb-1.5 [&_ul]:m-0 [&_ol]:m-0 [&_li]:m-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : null}
              </div>
              {msg.agentSteps && msg.agentSteps.length > 0 && (
                <div className="max-w-[95%] w-full mt-1">
                  <AgentConsole steps={msg.agentSteps} />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2 border border-border/30">
              <Loader2 className="w-3 h-3 animate-spin text-accent" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-border/50 bg-muted/30">
        <div className="flex gap-1.5">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={agentMode ? "Tell me what to build..." : "Ask about circuits, code..."}
            rows={2}
            className="flex-1 bg-muted text-xs text-foreground rounded-md px-2.5 py-2 border border-border/30 resize-none focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder:text-muted-foreground/50"
          />
          <button
            onClick={() => sendAgentMessage(input)}
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
