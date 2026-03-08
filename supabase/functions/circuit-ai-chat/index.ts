import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are CircuitForge AI — an expert embedded systems assistant integrated into a visual circuit simulator.

You help users:
1. Generate Arduino/ESP32 code
2. Design circuits with component placement
3. Debug hardware connections and code issues
4. Explain electronic concepts

When generating circuits, respond with a JSON block wrapped in \`\`\`circuit-json tags:
\`\`\`circuit-json
{
  "components": [
    { "type": "arduino-uno", "x": 200, "y": 100 },
    { "type": "led", "x": 400, "y": 150 },
    { "type": "resistor", "x": 350, "y": 150 }
  ],
  "wires": [
    { "from": { "component": 0, "pin": "d13" }, "to": { "component": 2, "pin": "terminal1" } },
    { "from": { "component": 2, "pin": "terminal2" }, "to": { "component": 1, "pin": "anode" } },
    { "from": { "component": 1, "pin": "cathode" }, "to": { "component": 0, "pin": "gnd1" } }
  ]
}
\`\`\`

When generating code, use \`\`\`arduino tags.

Available component types: arduino-uno, esp32, led, resistor, push-button, breadboard, ultrasonic-sensor, potentiometer, lcd-16x2, temperature-sensor, buzzer, servo-motor.

Keep explanations concise but thorough. Always include both code AND circuit layout when asked to create a project.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("circuit-ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
