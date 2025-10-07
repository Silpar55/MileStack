"use client";

import { useState, useEffect, useCallback } from "react";
import * as monaco from "monaco-editor";
import { CodeEditor } from "./CodeEditor";
import { FileTree } from "./FileTree";
import { FileTabs } from "./FileTabs";
import { ExecutionPanel } from "./ExecutionPanel";
import { VersionControl } from "./VersionControl";
import { CollaborationPanel } from "./CollaborationPanel";
import {
  Play,
  Square,
  Save,
  Download,
  Upload,
  Settings,
  Users,
  GitBranch,
  Terminal,
  File,
  Folder,
} from "lucide-react";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
  language?: string;
  isOpen?: boolean;
  isSelected?: boolean;
}

interface Tab {
  id: string;
  name: string;
  fileId: string;
  isDirty: boolean;
  isActive: boolean;
}

interface Version {
  id: string;
  message: string;
  timestamp: Date;
  author: string;
  files: string[];
  isCheckpoint: boolean;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
  isOnline: boolean;
  cursor?: {
    line: number;
    column: number;
  };
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  executionTime: number;
  memoryUsed: number;
  exitCode: number;
}

interface IDEProps {
  assignmentId: string;
  initialFiles?: FileNode[];
  onSave: (files: FileNode[]) => void;
  onExecute: (code: string, language: string) => Promise<ExecutionResult>;
  collaborators?: Collaborator[];
  currentUser?: Collaborator;
  className?: string;
}

export function IDE({
  assignmentId,
  initialFiles = [],
  onSave,
  onExecute,
  collaborators = [],
  currentUser,
  className = "",
}: IDEProps) {
  const [files, setFiles] = useState<FileNode[]>(initialFiles);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | undefined>();
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<
    ExecutionResult | undefined
  >();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<
    "files" | "version" | "collaboration"
  >("files");

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (tabs.some((tab) => tab.isDirty)) {
        handleAutoSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [tabs]);

  const handleFileSelect = (file: FileNode) => {
    if (file.type === "file") {
      setSelectedFile(file);

      // Add to tabs if not already open
      const existingTab = tabs.find((tab) => tab.fileId === file.id);
      if (!existingTab) {
        const newTab: Tab = {
          id: `tab_${Date.now()}`,
          name: file.name,
          fileId: file.id,
          isDirty: false,
          isActive: true,
        };
        setTabs((prev) =>
          prev.map((t) => ({ ...t, isActive: false })).concat(newTab)
        );
        setActiveTabId(newTab.id);
      } else {
        setActiveTabId(existingTab.id);
      }
    }
  };

  const handleTabSelect = (tabId: string) => {
    setActiveTabId(tabId);
    setTabs((prev) =>
      prev.map((tab) => ({ ...tab, isActive: tab.id === tabId }))
    );
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {
      const file = files.find((f) => f.id === tab.fileId);
      if (file) setSelectedFile(file);
    }
  };

  const handleTabClose = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.isDirty) {
      // Show confirmation dialog
      if (
        !confirm(
          "You have unsaved changes. Are you sure you want to close this tab?"
        )
      ) {
        return;
      }
    }

    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId);
      if (tabId === activeTabId && newTabs.length > 0) {
        setActiveTabId(newTabs[0].id);
      }
      return newTabs;
    });
  };

  const handleFileCreate = (
    parentId: string,
    name: string,
    type: "file" | "folder"
  ) => {
    const newFile: FileNode = {
      id: `file_${Date.now()}`,
      name,
      type,
      children: type === "folder" ? [] : undefined,
      content: type === "file" ? "" : undefined,
      language: type === "file" ? "javascript" : undefined,
    };

    if (parentId === "root") {
      setFiles((prev) => [...prev, newFile]);
    } else {
      // Add to parent folder
      setFiles((prev) =>
        updateFileInTree(prev, parentId, (file) => ({
          ...file,
          children: [...(file.children || []), newFile],
        }))
      );
    }
  };

  const handleFileRename = (fileId: string, newName: string) => {
    setFiles((prev) =>
      updateFileInTree(prev, fileId, (file) => ({ ...file, name: newName }))
    );
    setTabs((prev) =>
      prev.map((tab) =>
        tab.fileId === fileId ? { ...tab, name: newName } : tab
      )
    );
  };

  const handleFileDelete = (fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      setFiles((prev) => removeFileFromTree(prev, fileId));
      setTabs((prev) => prev.filter((tab) => tab.fileId !== fileId));
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
      }
    }
  };

  const handleFileUpload = (fileList: FileList) => {
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newFile: FileNode = {
          id: `file_${Date.now()}`,
          name: file.name,
          type: "file",
          content,
          language: getLanguageFromExtension(file.name.split(".").pop() || ""),
        };
        setFiles((prev) => [...prev, newFile]);
      };
      reader.readAsText(file);
    });
  };

  const handleFileDownload = (file: FileNode) => {
    if (file.content) {
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCodeChange = (value: string) => {
    if (selectedFile) {
      setFiles((prev) =>
        updateFileInTree(prev, selectedFile.id, (file) => ({
          ...file,
          content: value,
        }))
      );
      setTabs((prev) =>
        prev.map((tab) =>
          tab.fileId === selectedFile.id ? { ...tab, isDirty: true } : tab
        )
      );
    }
  };

  const handleExecute = async (code: string, language: string) => {
    setIsExecuting(true);
    try {
      const result = await onExecute(code, language);
      setExecutionResult(result);
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : "Execution failed",
        executionTime: 0,
        memoryUsed: 0,
        exitCode: 1,
      };
      setExecutionResult(errorResult);
      return errorResult;
    } finally {
      setIsExecuting(false);
    }
  };

  const handleAutoSave = () => {
    onSave(files);
    setTabs((prev) => prev.map((tab) => ({ ...tab, isDirty: false })));
  };

  const handleSaveVersion = (message: string) => {
    const newVersion: Version = {
      id: `version_${Date.now()}`,
      message,
      timestamp: new Date(),
      author: currentUser?.name || "Unknown",
      files: files.map((f) => f.id),
      isCheckpoint: false,
    };
    setVersions((prev) => [newVersion, ...prev]);
    handleAutoSave();
  };

  const handleCreateCheckpoint = (message: string) => {
    const newVersion: Version = {
      id: `version_${Date.now()}`,
      message,
      timestamp: new Date(),
      author: currentUser?.name || "Unknown",
      files: files.map((f) => f.id),
      isCheckpoint: true,
    };
    setVersions((prev) => [newVersion, ...prev]);
    handleAutoSave();
  };

  const getLanguageFromExtension = (extension: string): string => {
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
    };
    return languageMap[extension.toLowerCase()] || "text";
  };

  const updateFileInTree = (
    files: FileNode[],
    fileId: string,
    updater: (file: FileNode) => FileNode
  ): FileNode[] => {
    return files.map((file) => {
      if (file.id === fileId) {
        return updater(file);
      }
      if (file.children) {
        return {
          ...file,
          children: updateFileInTree(file.children, fileId, updater),
        };
      }
      return file;
    });
  };

  const removeFileFromTree = (
    files: FileNode[],
    fileId: string
  ): FileNode[] => {
    return files.filter((file) => {
      if (file.id === fileId) return false;
      if (file.children) {
        file.children = removeFileFromTree(file.children, fileId);
      }
      return true;
    });
  };

  return (
    <div className={`ide ${className}`}>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div
          className={`${
            sidebarCollapsed ? "w-12" : "w-80"
          } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}
        >
          {!sidebarCollapsed && (
            <>
              {/* Panel Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActivePanel("files")}
                  className={`flex-1 px-3 py-2 text-sm font-medium ${
                    activePanel === "files"
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <File className="w-4 h-4 inline mr-1" />
                  Files
                </button>
                <button
                  onClick={() => setActivePanel("version")}
                  className={`flex-1 px-3 py-2 text-sm font-medium ${
                    activePanel === "version"
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <GitBranch className="w-4 h-4 inline mr-1" />
                  Version
                </button>
                <button
                  onClick={() => setActivePanel("collaboration")}
                  className={`flex-1 px-3 py-2 text-sm font-medium ${
                    activePanel === "collaboration"
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-1" />
                  Team
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-hidden">
                {activePanel === "files" && (
                  <FileTree
                    files={files}
                    onFileSelect={handleFileSelect}
                    onFileCreate={handleFileCreate}
                    onFileRename={handleFileRename}
                    onFileDelete={handleFileDelete}
                    onFileUpload={handleFileUpload}
                    onFileDownload={handleFileDownload}
                    selectedFileId={selectedFile?.id}
                  />
                )}
                {activePanel === "version" && (
                  <VersionControl
                    versions={versions}
                    onSaveVersion={handleSaveVersion}
                    onCreateCheckpoint={handleCreateCheckpoint}
                    onVersionSelect={(versionId) => {
                      // Handle version selection
                      console.log("Select version:", versionId);
                    }}
                    onRevert={(versionId) => {
                      // Handle revert
                      console.log("Revert to version:", versionId);
                    }}
                  />
                )}
                {activePanel === "collaboration" && (
                  <CollaborationPanel
                    collaborators={collaborators}
                    currentUser={currentUser!}
                    onInviteUser={(email, role) => {
                      console.log("Invite user:", email, role);
                    }}
                    onRemoveUser={(userId) => {
                      console.log("Remove user:", userId);
                    }}
                    onUpdateRole={(userId, role) => {
                      console.log("Update role:", userId, role);
                    }}
                    onStartCall={() => {
                      console.log("Start call");
                    }}
                    onEndCall={() => {
                      console.log("End call");
                    }}
                    isCallActive={false}
                  />
                )}
              </div>
            </>
          )}

          {/* Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 border-t border-gray-200"
          >
            {sidebarCollapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (selectedFile && selectedFile.content) {
                    handleExecute(
                      selectedFile.content,
                      selectedFile.language || "javascript"
                    );
                  }
                }}
                disabled={!selectedFile || isExecuting}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExecuting ? (
                  <Square className="w-4 h-4 mr-1" />
                ) : (
                  <Play className="w-4 h-4 mr-1" />
                )}
                {isExecuting ? "Stop" : "Run"}
              </button>
              <button
                onClick={handleAutoSave}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {tabs.filter((t) => t.isDirty).length} unsaved changes
              </span>
            </div>
          </div>

          {/* File Tabs */}
          {tabs.length > 0 && (
            <FileTabs
              tabs={tabs}
              activeTabId={activeTabId}
              onTabSelect={handleTabSelect}
              onTabClose={handleTabClose}
              onNewTab={() => {
                // Handle new tab
                console.log("New tab");
              }}
            />
          )}

          {/* Editor and Output */}
          <div className="flex-1 flex">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col">
              {selectedFile ? (
                <CodeEditor
                  language={selectedFile.language || "javascript"}
                  value={selectedFile.content || ""}
                  onChange={handleCodeChange}
                  theme="vs-dark"
                  readOnly={currentUser?.role === "viewer"}
                  collaborators={collaborators.map((c) => ({
                    id: c.id,
                    name: c.name,
                    color:
                      c.role === "owner"
                        ? "#fbbf24"
                        : c.role === "editor"
                        ? "#3b82f6"
                        : "#6b7280",
                    cursor: c.cursor
                      ? new monaco.Position(c.cursor.line, c.cursor.column)
                      : new monaco.Position(1, 1),
                    selection: c.selection
                      ? new monaco.Selection(
                          c.selection.startLine,
                          c.selection.startColumn,
                          c.selection.endLine,
                          c.selection.endColumn
                        )
                      : undefined,
                  }))}
                  className="flex-1"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <File className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No file selected
                    </h3>
                    <p className="text-gray-500">
                      Select a file from the sidebar to start coding
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Output Panel */}
            <div className="w-96 border-l border-gray-200 bg-white">
              <ExecutionPanel
                onExecute={handleExecute}
                onStop={() => setIsExecuting(false)}
                isExecuting={isExecuting}
                result={executionResult}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
