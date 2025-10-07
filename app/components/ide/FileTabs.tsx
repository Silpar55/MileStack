"use client";

import { useState } from "react";
import { X, Plus, File } from "lucide-react";

interface Tab {
  id: string;
  name: string;
  fileId: string;
  isDirty: boolean;
  isActive: boolean;
}

interface FileTabsProps {
  tabs: Tab[];
  activeTabId?: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  className?: string;
}

export function FileTabs({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onNewTab,
  className = "",
}: FileTabsProps) {
  const [draggedTab, setDraggedTab] = useState<string | null>(null);

  const handleTabClick = (tabId: string) => {
    onTabSelect(tabId);
  };

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabClose(tabId);
  };

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTab(tabId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    if (draggedTab && draggedTab !== targetTabId) {
      // Handle tab reordering logic here
      console.log(`Move tab ${draggedTab} to position of ${targetTabId}`);
    }
    setDraggedTab(null);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "js":
      case "jsx":
        return "🟨";
      case "ts":
      case "tsx":
        return "🔷";
      case "py":
        return "🐍";
      case "java":
        return "☕";
      case "cpp":
      case "c":
        return "⚙️";
      case "html":
        return "🌐";
      case "css":
        return "🎨";
      case "json":
        return "📋";
      case "md":
        return "📝";
      default:
        return "📄";
    }
  };

  return (
    <div className={`file-tabs ${className}`}>
      <div className="flex items-center bg-gray-50 border-b">
        <div className="flex items-center flex-1 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center px-3 py-2 border-r border-gray-200 cursor-pointer group min-w-0 ${
                tab.isActive
                  ? "bg-white border-b-2 border-blue-500"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleTabClick(tab.id)}
              draggable
              onDragStart={(e) => handleDragStart(e, tab.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, tab.id)}
            >
              <span className="mr-2 text-sm">{getFileIcon(tab.name)}</span>
              <span className="text-sm truncate max-w-32">{tab.name}</span>
              {tab.isDirty && (
                <span className="ml-1 w-2 h-2 bg-orange-500 rounded-full" />
              )}
              <button
                onClick={(e) => handleTabClose(e, tab.id)}
                className="ml-2 p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={onNewTab}
          className="p-2 hover:bg-gray-100 border-l border-gray-200"
          title="New Tab"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
