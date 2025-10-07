"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Square,
  Download,
  Upload,
  Settings,
  Terminal,
} from "lucide-react";

interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  executionTime: number;
  memoryUsed: number;
  exitCode: number;
}

interface ExecutionPanelProps {
  onExecute: (code: string, language: string) => Promise<ExecutionResult>;
  onStop: () => void;
  isExecuting: boolean;
  result?: ExecutionResult;
  className?: string;
}

export function ExecutionPanel({
  onExecute,
  onStop,
  isExecuting,
  result,
  className = "",
}: ExecutionPanelProps) {
  const [output, setOutput] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, autoScroll]);

  const handleExecute = async () => {
    setOutput("");
    // This would be called from the parent component with the current code
  };

  const handleStop = () => {
    onStop();
  };

  const handleDownloadOutput = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatExecutionTime = (time: number) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const formatMemoryUsage = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className={`execution-panel ${className}`}>
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5" />
          <h3 className="text-sm font-semibold">Output</h3>
          {result && (
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span>Time: {formatExecutionTime(result.executionTime)}</span>
              <span>Memory: {formatMemoryUsage(result.memoryUsed)}</span>
              <span>Exit Code: {result.exitCode}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isCollapsed ? "▼" : "▲"}
          </button>
          <button
            onClick={handleDownloadOutput}
            className="p-1 hover:bg-gray-200 rounded"
            title="Download Output"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
            <div className="flex items-center space-x-2">
              {isExecuting ? (
                <button
                  onClick={handleStop}
                  className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <Square className="w-4 h-4 mr-1" />
                  Stop
                </button>
              ) : (
                <button
                  onClick={handleExecute}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Run
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="mr-1"
                />
                Auto-scroll
              </label>
            </div>
          </div>

          <div
            ref={outputRef}
            className="flex-1 p-3 bg-black text-green-400 font-mono text-sm overflow-y-auto"
            style={{ minHeight: "200px" }}
          >
            {isExecuting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-2"></div>
                <span>Executing...</span>
              </div>
            ) : result ? (
              <div>
                {result.success ? (
                  <div>
                    <div className="text-green-400 mb-2">
                      ✓ Execution completed successfully
                    </div>
                    <pre className="whitespace-pre-wrap">{result.output}</pre>
                  </div>
                ) : (
                  <div>
                    <div className="text-red-400 mb-2">✗ Execution failed</div>
                    <pre className="whitespace-pre-wrap text-red-400">
                      {result.error}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">
                No output yet. Click "Run" to execute your code.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
