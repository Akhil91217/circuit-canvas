import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, Sparkles, X, Trash2, Loader2, Zap, Terminal, LayoutTemplate } from 'lucide-react';
import { useCircuitStore } from '@/store/circuitStore';
import { useSimulationStore } from '@/store/simulationStore';
import { COMPONENT_DEFINITIONS } from '@/data/componentDefinitions';
import { AgentStep, executeAgentTool, getMemoryContext } from '@/engine/AgentTools';
import { PROJECT_TEMPLATES } from '@/data/projectTemplates';
import AgentConsole from '@/components/circuit/AgentConsole';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  agentSteps?: AgentStep[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const CHAT_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/circuit-ai-chat` : null;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ALL_COMPONENT_TYPES = Object.keys(COMPONENT_DEFINITIONS).join(', ');

const SYSTEM_PROMPT = `You are CircuitForge AI Agent v10 — an autonomous embedded systems engineering assistant with full platform ecosystem access.
You have access to tools that directly control the simulator, manage libraries, install plugins, and search templates.

WORKFLOW for building circuits:
1. Plan the circuit architecture (components needed, connections)
2. Install required libraries using installLibrary
3. Add components using addComponent (they auto-space, or specify x,y)
4. Connect pins using connectPins
5. Generate Arduino/ESP32 code using generateArduinoCode
6. Start simulation using runSimulation
7. If errors occur, use analyzeCircuit and fixNetlistErrors

PLATFORM ECOSYSTEM:
- Libraries: Install Arduino libraries (Adafruit_BME280, FastLED, PubSubClient, etc.)
- Plugins: Install community hardware plugins for extra components
- Templates: Search and load pre-built project templates
- Analysis: Run AI circuit analysis for wiring issues and power warnings
- Dashboard: Create IoT dashboard widgets from detected sensors

IMPORTANT RULES:
- Always install required libraries BEFORE generating code that uses them
- Use correct pin IDs from component definitions
- For Arduino Uno: d0-d13, a0-a5, 5v, 3v3, gnd1, gnd2, vin
- For ESP32: gpio0-gpio25, adc0-adc5, 3v3, gnd1, gnd2, vin
- Always connect power (VCC) and ground (GND) for each module

Available component types: ${ALL_COMPONENT_TYPES}

Pin reference for common components:
- BME280/BMP280: vcc, gnd, sda, scl
- PIR: vcc, signal, gnd
- OLED: gnd, vcc, scl, sda
- GPS/Bluetooth: vcc, gnd, tx, rx
- Motor Driver: in1-in4, ena, enb, vcc, gnd
- LoRa/NRF24L01: vcc, gnd, mosi, miso, sck, cs
- Buzzer: positive, negative
- LED: anode, cathode
- Resistor: terminal1, terminal2`;

const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      { name: "addComponent", description: "Add an electronic component to the circuit canvas", parameters: { type: "object", properties: { type: { type: "string", description: `Component type ID: ${ALL_COMPONENT_TYPES}` }, x: { type: "number" }, y: { type: "number" } }, required: ["type"] } },
      { name: "removeComponent", description: "Remove a component by ID", parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } },
      { name: "connectPins", description: "Wire two pins together", parameters: { type: "object", properties: { fromComponent: { type: "string" }, fromPin: { type: "string" }, toComponent: { type: "string" }, toPin: { type: "string" } }, required: ["fromComponent", "fromPin", "toComponent", "toPin"] } },
      { name: "generateArduinoCode", description: "Set Arduino code in the editor", parameters: { type: "object", properties: { code: { type: "string" } }, required: ["code"] } },
      { name: "generateMultiFileProject", description: "Generate multi-file Arduino project", parameters: { type: "object", properties: { files: { type: "string", description: "JSON array of {name, content} objects" } }, required: ["files"] } },
      { name: "runSimulation", description: "Start simulation", parameters: { type: "object", properties: {} } },
      { name: "stopSimulation", description: "Stop simulation", parameters: { type: "object", properties: {} } },
      { name: "analyzeCircuit", description: "Analyze current circuit state", parameters: { type: "object", properties: {} } },
      { name: "fixNetlistErrors", description: "Find and report netlist errors", parameters: { type: "object", properties: {} } },
      { name: "loadTemplate", description: "Load a project template", parameters: { type: "object", properties: { templateId: { type: "string", description: "Template: weather-station, smart-home-sensor, robot-car, iot-dashboard, security-alarm" } }, required: ["templateId"] } },
      { name: "getCircuitState", description: "Get current components and connections", parameters: { type: "object", properties: {} } },
      { name: "clearCircuit", description: "Clear the entire circuit", parameters: { type: "object", properties: {} } },
      { name: "compileCode", description: "Compile code and check for errors", parameters: { type: "object", properties: { board: { type: "string", description: "uno or esp32" } } } },
      { name: "aiCircuitAnalysis", description: "Run AI analysis on circuit", parameters: { type: "object", properties: {} } },
      { name: "createDashboard", description: "Generate dashboard widgets from sensors", parameters: { type: "object", properties: {} } },
      { name: "installLibrary", description: "Install an Arduino library", parameters: { type: "object", properties: { name: { type: "string", description: "Library name (e.g. Adafruit_BME280, FastLED, PubSubClient)" } }, required: ["name"] } },
      { name: "removeLibrary", description: "Remove an installed library", parameters: { type: "object", properties: { name: { type: "string" } }, required: ["name"] } },
      { name: "searchLibraries", description: "Search available Arduino libraries", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
      { name: "listInstalledLibraries", description: "List installed libraries", parameters: { type: "object", properties: {} } },
      { name: "installPlugin", description: "Install a community plugin component", parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } },
      { name: "searchPlugins", description: "Search community plugins", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
      { name: "searchTemplates", description: "Search project templates", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
    ],
  },
];

async function callGeminiDirect(messages: Array<{role: string; content: string}>, useTools: boolean) {
  if (!GEMINI_API_KEY) throw new Error("No API key configured. Add VITE_GEMINI_API_KEY to your .env file for local development.");
  
  const memoryContext = getMemoryContext();
  const geminiMessages = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT + memoryContext }] },
    { role: "model", parts: [{ text: "Understood. I am CircuitForge AI Agent v10, ready to build circuits, manage libraries, install plugins, analyze circuits, and access the full platform ecosystem." }] },
    ...messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  ];

  const body: Record<string, unknown> = {
    contents: geminiMessages,
    generationConfig: { temperature: 0.7 },
  };
  if (useTools) body.tools = GEMINI_TOOLS;

  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Gemini API error: ${resp.status} ${errText.slice(0, 200)}`);
  }

  const data = await resp.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const toolCalls = parts.filter((p: any) => p.functionCall);
  const textParts = parts.filter((p: any) => p.text);

  if (toolCalls.length > 0) {
    return {
      choices: [{
        message: {
          role: "assistant",
          content: textParts.map((p: any) => p.text).join("") || null,
          tool_calls: toolCalls.map((p: any, i: number) => ({
            id: `call_${i}`,
            type: "function",
            function: { name: p.functionCall.name, arguments: JSON.stringify(p.functionCall.args || {}) },
          })),
        },
      }],
    };
  }
  return {
    choices: [{ message: { role: "assistant", content: textParts.map((p: any) => p.text).join("") } }],
  };
}

const QUICK_PROMPTS = [
  { icon: '💡', text: 'Build an LED blink circuit with Arduino' },
  { icon: '🌤️', text: 'Build an ESP32 weather station with BME280 and OLED display' },
  { icon: '🤖', text: 'Build a robot car with ultrasonic obstacle avoidance' },
  { icon: '🔍', text: 'Analyze my circuit for issues and suggestions' },
  { icon: '📡', text: 'Build an IoT sensor node with ESP32, BME280, and MQTT' },
  { icon: '🌿', text: 'Create a smart greenhouse system' },
];

function generateStepId() {
  return Math.random().toString(36).substring(2, 8);
}

export default function AgentPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentMode, setAgentMode] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
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

      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, agentSteps: [...steps] } : m);
        }
        return [...prev, { role: 'assistant', content: '', agentSteps: [...steps] }];
      });

      try {
        const result = executeAgentTool(step.tool, step.args);
        step.status = 'done';
        step.result = result;
      } catch (e: any) {
        step.status = 'error';
        step.result = `Error: ${e.message}`;
      }

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

    // Include memory context in the user message for better agent awareness
    const memoryCtx = getMemoryContext();
    const allMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
    if (memoryCtx && agentMode) {
      allMessages[allMessages.length - 1].content += memoryCtx;
    }

    try {
      let data: any;

      if (CHAT_URL) {
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
          data = await resp.json();
        } else {
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
          return;
        }
      } else {
        data = await callGeminiDirect(allMessages, agentMode);
      }

      const choice = data.choices?.[0];
      const message = choice?.message;

      if (message?.tool_calls?.length > 0) {
        const steps = await executeToolCalls(message.tool_calls);
        
        // Check for errors and auto-retry
        const hasErrors = steps.some(s => s.status === 'error' || s.result?.includes('❌'));
        let summary = message.content || steps.map(s => s.result).filter(Boolean).join('\n');
        
        if (hasErrors) {
          summary += '\n\n🔄 Some actions had errors. Use "analyze and fix" to debug.';
        }
        
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: summary, agentSteps: steps } : m);
          }
          return [...prev, { role: 'assistant', content: summary, agentSteps: steps }];
        });
      } else if (message?.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: message.content }]);
        const codeMatch = message.content.match(/```arduino\s*([\s\S]*?)```/);
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

  const handleLoadTemplate = (templateId: string) => {
    setShowTemplates(false);
    const result = executeAgentTool('loadTemplate', { templateId });
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: result,
      agentSteps: [{
        id: generateStepId(),
        tool: 'loadTemplate',
        args: { templateId },
        status: 'done',
        result,
        timestamp: Date.now(),
      }],
    }]);
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
          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">v10</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`p-1 rounded text-[9px] font-mono transition-colors ${
              showTemplates ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Project Templates"
          >
            <LayoutTemplate className="w-3 h-3" />
          </button>
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
          {agentMode ? '🤖 Agent Mode — Autonomous circuit builder' : '💬 Chat Mode — Streaming responses'}
        </span>
      </div>

      {/* Templates panel */}
      {showTemplates && (
        <div className="border-b border-border/30 bg-muted/20 p-2 space-y-1 max-h-48 overflow-y-auto">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold px-1">Quick Start Templates</p>
          {PROJECT_TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => handleLoadTemplate(t.id)}
              className="w-full text-left px-2 py-1.5 rounded bg-background hover:bg-muted border border-border/30 text-xs text-foreground transition-colors"
            >
              <span className="mr-1.5">{t.icon}</span>
              <span className="font-medium">{t.name}</span>
              <p className="text-[9px] text-muted-foreground mt-0.5 ml-5">{t.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="space-y-3 animate-fade-in">
            <div className="text-center py-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <p className="text-xs text-foreground font-medium">CircuitForge AI Agent v9</p>
              <p className="text-[10px] text-muted-foreground mt-1">Autonomous circuit builder with AI analysis, 40+ components, sharing, and multi-file projects.</p>
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
