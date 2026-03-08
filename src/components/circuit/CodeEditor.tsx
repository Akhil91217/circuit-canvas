import { useRef, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useSimulationStore } from '@/store/simulationStore';

export default function CodeEditor() {
  const { code, setCode } = useSimulationStore();
  const editorRef = useRef<any>(null);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Register Arduino language (based on C++)
    monaco.languages.register({ id: 'arduino' });
    monaco.languages.setMonarchTokensProvider('arduino', {
      keywords: [
        'void', 'int', 'long', 'float', 'double', 'char', 'bool', 'byte',
        'unsigned', 'signed', 'const', 'static', 'volatile', 'extern',
        'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
        'break', 'continue', 'return', 'true', 'false',
        'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP',
        'LED_BUILTIN', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5',
      ],
      builtins: [
        'pinMode', 'digitalWrite', 'digitalRead', 'analogWrite', 'analogRead',
        'delay', 'delayMicroseconds', 'millis', 'micros',
        'map', 'constrain', 'min', 'max', 'abs', 'pow', 'sqrt',
        'Serial', 'Wire', 'SPI', 'WiFi',
        'setup', 'loop',
        'begin', 'print', 'println', 'write', 'read', 'available',
        'tone', 'noTone', 'pulseIn', 'shiftOut', 'shiftIn',
        'attachInterrupt', 'detachInterrupt',
      ],
      typeKeywords: [
        'String', 'boolean', 'byte', 'word', 'array',
      ],
      operators: [
        '=', '>', '<', '!', '~', '?', ':',
        '==', '<=', '>=', '!=', '&&', '||', '++', '--',
        '+', '-', '*', '/', '&', '|', '^', '%', '<<', '>>', '>>>'
      ],
      symbols: /[=><!~?:&|+\-*/^%]+/,
      tokenizer: {
        root: [
          [/[a-zA-Z_]\w*/, {
            cases: {
              '@keywords': 'keyword',
              '@builtins': 'type.identifier',
              '@typeKeywords': 'keyword.type',
              '@default': 'identifier',
            },
          }],
          [/[{}()[\]]/, '@brackets'],
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': '',
            },
          }],
          [/\d+(\.\d+)?/, 'number'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string'],
          [/'[^\\']'/, 'string'],
          [/\/\/.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],
          [/#\w+/, 'keyword.directive'],
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, 'string', '@pop'],
        ],
        comment: [
          [/[^/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[/*]/, 'comment'],
        ],
      },
    });

    // Arduino completions
    monaco.languages.registerCompletionItemProvider('arduino', {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions = [
          'pinMode', 'digitalWrite', 'digitalRead', 'analogWrite', 'analogRead',
          'delay', 'millis', 'Serial.begin', 'Serial.print', 'Serial.println',
          'setup', 'loop', 'HIGH', 'LOW', 'INPUT', 'OUTPUT',
        ].map(label => ({
          label,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: label.includes('.') ? label : `${label}($0)`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
        }));
        return { suggestions };
      },
    });

    // Define custom theme
    monaco.editor.defineTheme('circuitforge-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'type.identifier', foreground: '4EC9B0' },
        { token: 'keyword.type', foreground: '4EC9B0' },
        { token: 'keyword.directive', foreground: 'C586C0' },
        { token: 'comment', foreground: '6A9955' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'operator', foreground: 'D4D4D4' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#c9d1d9',
        'editor.lineHighlightBackground': '#161b22',
        'editorLineNumber.foreground': '#484f58',
        'editorLineNumber.activeForeground': '#79c0ff',
        'editor.selectionBackground': '#264f7844',
        'editor.inactiveSelectionBackground': '#264f7822',
        'editorCursor.foreground': '#79c0ff',
        'editorGutter.background': '#0d1117',
      },
    });

    monaco.editor.setTheme('circuitforge-dark');
    editor.focus();
  }, []);

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        language="arduino"
        theme="circuitforge-dark"
        value={code}
        onChange={(val) => setCode(val || '')}
        onMount={handleMount}
        options={{
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          lineNumbers: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'off',
          folding: true,
          bracketPairColorization: { enabled: true },
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 8 },
        }}
      />
    </div>
  );
}
