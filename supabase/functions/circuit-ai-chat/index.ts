import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALL_COMPONENTS = "arduino-uno, esp32, led, resistor, push-button, breadboard, buzzer, servo-motor, relay, rgb-led-strip, stepper-motor, ultrasonic-sensor, potentiometer, temperature-sensor, humidity-sensor, light-sensor, accelerometer, bme280, bmp280, pir-sensor, mq2-sensor, soil-moisture, ir-receiver, hall-effect, lcd-16x2, oled-display, sh1106-oled, ili9341-tft, st7789-tft, lcd-20x4, 7-segment, led-matrix, keypad, rotary-encoder, joystick, capacitive-touch, fingerprint, lora-module, gps-module, bluetooth-module, nrf24l01, rtc-module, sd-card, motor-driver, uln2003, eeprom, buzzer-module";

const AGENT_TOOLS_SCHEMA = [
  {
    type: "function",
    function: {
      name: "addComponent",
      description: "Add an electronic component to the circuit canvas",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", description: `Component type ID: ${ALL_COMPONENTS}` },
          x: { type: "number", description: "X position on canvas" },
          y: { type: "number", description: "Y position on canvas" },
        },
        required: ["type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "removeComponent",
      description: "Remove a component from the canvas by ID",
      parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    },
  },
  {
    type: "function",
    function: {
      name: "connectPins",
      description: "Create a wire between two component pins",
      parameters: {
        type: "object",
        properties: {
          fromComponent: { type: "string", description: "Source component type or instance ID" },
          fromPin: { type: "string", description: "Source pin ID" },
          toComponent: { type: "string", description: "Target component type or instance ID" },
          toPin: { type: "string", description: "Target pin ID" },
        },
        required: ["fromComponent", "fromPin", "toComponent", "toPin"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generateArduinoCode",
      description: "Set Arduino code in the editor",
      parameters: { type: "object", properties: { code: { type: "string" } }, required: ["code"] },
    },
  },
  {
    type: "function",
    function: {
      name: "generateMultiFileProject",
      description: "Generate a multi-file Arduino project with multiple source/header files",
      parameters: {
        type: "object",
        properties: {
          files: { type: "string", description: 'JSON array of {name, content} objects' },
        },
        required: ["files"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "runSimulation",
      description: "Start the circuit simulation",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "stopSimulation",
      description: "Stop the running simulation",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "analyzeCircuit",
      description: "Get detailed analysis of current circuit: components, connections, issues",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "fixNetlistErrors",
      description: "Analyze circuit connections and report/fix netlist errors",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "loadTemplate",
      description: "Load a project template: weather-station, smart-home-sensor, robot-car, iot-dashboard, security-alarm",
      parameters: { type: "object", properties: { templateId: { type: "string" } }, required: ["templateId"] },
    },
  },
  {
    type: "function",
    function: {
      name: "getCircuitState",
      description: "Get current components and connections on the canvas",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "clearCircuit",
      description: "Remove all components and wires from the canvas",
      parameters: { type: "object", properties: {} },
    },
  },
];

const SYSTEM_PROMPT = `You are CircuitForge AI Agent v7 — an autonomous embedded systems engineering assistant inside a visual circuit simulator.

You have access to tools that directly control the simulator. When a user asks you to build a circuit, design a project, or fix issues, you MUST use tools to perform the actions. Do NOT just describe — actually DO it.

WORKFLOW for building circuits:
1. Plan the architecture (what components, how they connect)
2. Add components using addComponent (auto-spaced or specify x,y)
3. Connect power/ground first, then signal pins using connectPins
4. Generate code using generateArduinoCode or generateMultiFileProject
5. Run simulation using runSimulation
6. If errors: analyzeCircuit → fixNetlistErrors → fix → retry

MULTI-STEP PLANNING for complex projects:
- Phase 1: Add all components
- Phase 2: Wire power and ground
- Phase 3: Wire signal connections (I2C, SPI, UART, GPIO)
- Phase 4: Generate comprehensive code
- Phase 5: Test and debug

PIN REFERENCE:
- Arduino Uno: d0-d13, a0-a5, 5v, 3v3, gnd1, gnd2, vin
- ESP32: gpio0-gpio25, adc0-adc5, 3v3, gnd1, gnd2, vin
- I2C devices (BME280, OLED, RTC, EEPROM): vcc, gnd, sda, scl
  → Arduino: SDA=A4, SCL=A5 | ESP32: SDA=GPIO21, SCL=GPIO22
- SPI devices (TFT, LoRa, SD, NRF24L01): vcc, gnd, mosi, miso, sck, cs
- UART devices (GPS, Bluetooth, Fingerprint): vcc, gnd, tx, rx
- Sensors: PIR(vcc,signal,gnd), MQ2(vcc,gnd,aout,dout), Soil(vcc,gnd,aout)
- Motor: L298N(in1-4,ena,enb,vcc,gnd), ULN2003(in1-4,vcc,gnd)
- Basic: LED(anode,cathode), Resistor(terminal1,terminal2), Buzzer(positive,negative)

TEMPLATES: weather-station, smart-home-sensor, robot-car, iot-dashboard, security-alarm

Available components: ${ALL_COMPONENTS}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, useTools } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!LOVABLE_API_KEY && !GEMINI_API_KEY) {
      throw new Error("No AI API key configured. Set LOVABLE_API_KEY or GEMINI_API_KEY.");
    }

    const useLovableGateway = !!LOVABLE_API_KEY;
    
    let response: Response;

    if (useLovableGateway) {
      const body: Record<string, unknown> = {
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: !useTools,
      };
      if (useTools) {
        body.tools = AGENT_TOOLS_SCHEMA;
        body.tool_choice = "auto";
      }
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } else {
      const geminiMessages = [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Understood. I am CircuitForge AI Agent v7 ready to autonomously build circuits." }] },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      ];

      const geminiBody: Record<string, unknown> = {
        contents: geminiMessages,
        generationConfig: { temperature: 0.7 },
      };

      if (useTools) {
        geminiBody.tools = [{
          functionDeclarations: AGENT_TOOLS_SCHEMA.map(t => ({
            name: t.function.name,
            description: t.function.description,
            parameters: t.function.parameters,
          })),
        }];
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      const geminiResp = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      });

      if (!geminiResp.ok) {
        const errText = await geminiResp.text();
        console.error("Gemini API error:", geminiResp.status, errText);
        return new Response(JSON.stringify({ error: "Gemini API error" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const geminiData = await geminiResp.json();
      const candidate = geminiData.candidates?.[0];
      const parts = candidate?.content?.parts || [];

      const openaiChoices = [];
      const toolCalls = parts.filter((p: any) => p.functionCall);
      const textParts = parts.filter((p: any) => p.text);

      if (toolCalls.length > 0) {
        openaiChoices.push({
          message: {
            role: "assistant",
            content: textParts.map((p: any) => p.text).join("") || null,
            tool_calls: toolCalls.map((p: any, i: number) => ({
              id: `call_${i}`,
              type: "function",
              function: { name: p.functionCall.name, arguments: JSON.stringify(p.functionCall.args || {}) },
            })),
          },
          finish_reason: "tool_calls",
        });
      } else {
        openaiChoices.push({
          message: { role: "assistant", content: textParts.map((p: any) => p.text).join("") },
          finish_reason: "stop",
        });
      }

      return new Response(JSON.stringify({ choices: openaiChoices }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (useTools) {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("circuit-ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
