"use client";

import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { editor } from "monaco-editor";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  theme?: string;
  readOnly?: boolean;
  onCursorPositionChange?: (position: monaco.Position) => void;
  onSelectionChange?: (selection: monaco.Selection) => void;
  collaborators?: Array<{
    id: string;
    name: string;
    color: string;
    cursor: monaco.Position;
    selection?: monaco.Selection;
  }>;
  className?: string;
}

export function CodeEditor({
  language,
  value,
  onChange,
  theme = "vs-dark",
  readOnly = false,
  onCursorPositionChange,
  onSelectionChange,
  collaborators = [],
  className = "",
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    // Initialize Monaco Editor
    const editor = monaco.editor.create(editorRef.current, {
      value,
      language,
      theme,
      readOnly,
      automaticLayout: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      lineNumbers: "on",
      folding: true,
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showStructs: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showEnumMembers: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
        showTypeParameters: true,
        showIssues: true,
        showUsers: true,
        showWords: true,
      },
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true,
      },
      parameterHints: {
        enabled: true,
      },
      hover: {
        enabled: true,
      },
      contextmenu: true,
      mouseWheelZoom: true,
      smoothScrolling: true,
      cursorBlinking: "blink",
      cursorSmoothCaretAnimation: "on",
    });

    monacoEditorRef.current = editor;
    setIsEditorReady(true);

    // Set up event listeners
    editor.onDidChangeModelContent(() => {
      const newValue = editor.getValue();
      onChange(newValue);
    });

    editor.onDidChangeCursorPosition((e) => {
      onCursorPositionChange?.(e.position);
    });

    editor.onDidChangeCursorSelection((e) => {
      onSelectionChange?.(e.selection);
    });

    // Cleanup
    return () => {
      editor.dispose();
    };
  }, []);

  // Update editor value when prop changes
  useEffect(() => {
    if (
      monacoEditorRef.current &&
      monacoEditorRef.current.getValue() !== value
    ) {
      monacoEditorRef.current.setValue(value);
    }
  }, [value]);

  // Update language when prop changes
  useEffect(() => {
    if (monacoEditorRef.current) {
      monaco.editor.setModelLanguage(
        monacoEditorRef.current.getModel()!,
        language
      );
    }
  }, [language]);

  // Update theme when prop changes
  useEffect(() => {
    if (monacoEditorRef.current) {
      monaco.editor.setTheme(theme);
    }
  }, [theme]);

  // Update read-only state
  useEffect(() => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.updateOptions({ readOnly });
    }
  }, [readOnly]);

  // Render collaborator cursors
  useEffect(() => {
    if (!monacoEditorRef.current || !isEditorReady) return;

    // Clear existing decorations
    const decorations = monacoEditorRef.current.deltaDecorations([], []);

    // Add collaborator cursors and selections
    const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];

    collaborators.forEach((collaborator) => {
      // Cursor decoration
      newDecorations.push({
        range: {
          startLineNumber: collaborator.cursor.lineNumber,
          startColumn: collaborator.cursor.column,
          endLineNumber: collaborator.cursor.lineNumber,
          endColumn: collaborator.cursor.column,
        },
        options: {
          className: "collaborator-cursor",
          after: {
            content: ` ${collaborator.name}`,
            inlineClassName: "collaborator-name",
          },
          stickiness:
            monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      });

      // Selection decoration
      if (collaborator.selection) {
        newDecorations.push({
          range: {
            startLineNumber: collaborator.selection.startLineNumber,
            startColumn: collaborator.selection.startColumn,
            endLineNumber: collaborator.selection.endLineNumber,
            endColumn: collaborator.selection.endColumn,
          },
          options: {
            className: "collaborator-selection",
            hoverMessage: { value: `Selection by ${collaborator.name}` },
          },
        });
      }
    });

    monacoEditorRef.current.deltaDecorations(decorations, newDecorations);
  }, [collaborators, isEditorReady]);

  return (
    <div className={`code-editor ${className}`}>
      <div ref={editorRef} className="h-full w-full" />
      <style jsx global>{`
        .collaborator-cursor {
          border-left: 2px solid var(--collaborator-color);
          background-color: var(--collaborator-color);
          opacity: 0.3;
        }
        .collaborator-name {
          background-color: var(--collaborator-color);
          color: white;
          padding: 2px 4px;
          border-radius: 2px;
          font-size: 12px;
          font-weight: bold;
        }
        .collaborator-selection {
          background-color: var(--collaborator-color);
          opacity: 0.2;
        }
      `}</style>
    </div>
  );
}
