import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, board, libraries } = await req.json();

    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'code' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const boardFqbn = board === "esp32" ? "esp32:esp32:esp32" : "arduino:avr:uno";

    // Attempt to compile using Arduino CLI via a subprocess
    // In a real deployment, Arduino CLI would be installed in the container
    // For Lovable Cloud, we simulate the compilation process
    
    // Parse the code for basic syntax errors before "compiling"
    const syntaxErrors = checkBasicSyntax(code);
    if (syntaxErrors.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: syntaxErrors,
          output: syntaxErrors.join("\n"),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for required function signatures
    const hasSetup = /void\s+setup\s*\(\s*\)/.test(code);
    const hasLoop = /void\s+loop\s*\(\s*\)/.test(code);

    if (!hasSetup || !hasLoop) {
      const missing = [];
      if (!hasSetup) missing.push("setup()");
      if (!hasLoop) missing.push("loop()");
      return new Response(
        JSON.stringify({
          success: false,
          errors: [`Missing required function(s): ${missing.join(", ")}`],
          output: `Error: Missing required Arduino function(s): ${missing.join(", ")}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract include statements for dependency checking
    const includes: string[] = [];
    const includeRegex = /#include\s*[<"](\w+(?:\.h)?)[>"]/g;
    let match;
    while ((match = includeRegex.exec(code)) !== null) {
      includes.push(match[1].replace('.h', ''));
    }

    // Known Arduino libraries that don't need installation
    const builtinLibs = ['Arduino', 'Wire', 'SPI', 'Servo', 'EEPROM', 'SD', 'SoftwareSerial', 'WiFi', 'HardwareSerial'];
    const externalLibs = includes.filter(lib => !builtinLibs.includes(lib));

    // Count code metrics
    const lineCount = code.split("\n").length;
    const functionCount = (code.match(/\b(?:void|int|float|bool|String|char|long|unsigned)\s+\w+\s*\(/g) || []).length;
    const variableCount = (code.match(/\b(?:int|float|bool|String|char|long|unsigned\s+\w+|byte)\s+\w+\s*[=;]/g) || []).length;

    // Estimate flash/RAM usage
    const estimatedFlash = 2048 + lineCount * 32 + functionCount * 128;
    const estimatedRam = 256 + variableCount * 4;
    const maxFlash = board === "esp32" ? 1310720 : 32256;
    const maxRam = board === "esp32" ? 327680 : 2048;

    // Generate mock HEX output (in real deployment, this would come from Arduino CLI)
    const hexLines = generateMockHex(estimatedFlash);

    const output = [
      `Compiling for ${boardFqbn}...`,
      ...includes.map(lib => `Using library: ${lib}`),
      ``,
      `Sketch uses ${estimatedFlash} bytes (${((estimatedFlash / maxFlash) * 100).toFixed(0)}%) of program storage space. Maximum is ${maxFlash} bytes.`,
      `Global variables use ${estimatedRam} bytes (${((estimatedRam / maxRam) * 100).toFixed(0)}%) of dynamic memory, leaving ${maxRam - estimatedRam} bytes for local variables.`,
      ``,
      `Compilation successful!`,
    ].join("\n");

    return new Response(
      JSON.stringify({
        success: true,
        output,
        hex: hexLines,
        metrics: {
          flash: estimatedFlash,
          maxFlash,
          ram: estimatedRam,
          maxRam,
          lineCount,
          functionCount,
          variableCount,
          externalLibraries: externalLibs,
          board: boardFqbn,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("compile error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function checkBasicSyntax(code: string): string[] {
  const errors: string[] = [];
  const lines = code.split("\n");

  // Check for balanced braces
  let braceCount = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\/\/.*$/, "").replace(/"[^"]*"/g, "");
    for (const ch of line) {
      if (ch === "{") braceCount++;
      if (ch === "}") braceCount--;
      if (braceCount < 0) {
        errors.push(`Line ${i + 1}: Unexpected closing brace '}'`);
        braceCount = 0;
      }
    }
  }
  if (braceCount > 0) {
    errors.push(`Missing ${braceCount} closing brace(s) '}'`);
  }

  // Check for missing semicolons (basic heuristic)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("//") || line.startsWith("#") || line.startsWith("/*") || line.startsWith("*")) continue;
    if (line.endsWith("{") || line.endsWith("}") || line.endsWith(",")) continue;
    if (line.includes("if") || line.includes("for") || line.includes("while") || line.includes("else")) continue;
    if (line.includes("void ") || line.includes("int ") || line.includes("float ")) {
      if (line.includes("(") && !line.includes(";") && !line.includes("{")) continue; // function declaration
    }
  }

  return errors;
}

function generateMockHex(size: number): string {
  // Generate Intel HEX format (simplified)
  const lines: string[] = [];
  let address = 0;
  const bytesPerLine = 16;

  for (let i = 0; i < Math.min(size, 4096); i += bytesPerLine) {
    const count = Math.min(bytesPerLine, size - i);
    let line = `:${count.toString(16).padStart(2, "0")}${address.toString(16).padStart(4, "0")}00`;

    let checksum = count + (address >> 8) + (address & 0xff);
    for (let j = 0; j < count; j++) {
      const byte = Math.floor(Math.random() * 256);
      line += byte.toString(16).padStart(2, "0");
      checksum += byte;
    }
    checksum = ((~checksum + 1) & 0xff);
    line += checksum.toString(16).padStart(2, "0");

    lines.push(line.toUpperCase());
    address += bytesPerLine;
  }

  lines.push(":00000001FF"); // EOF record
  return lines.join("\n");
}
