"use client";

import { useState, useRef } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Download,
  Upload,
  Trash2,
  Edit3,
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

interface FileTreeProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  onFileCreate: (
    parentId: string,
    name: string,
    type: "file" | "folder"
  ) => void;
  onFileRename: (fileId: string, newName: string) => void;
  onFileDelete: (fileId: string) => void;
  onFileUpload: (files: FileList) => void;
  onFileDownload: (file: FileNode) => void;
  selectedFileId?: string;
  className?: string;
}

export function FileTree({
  files,
  onFileSelect,
  onFileCreate,
  onFileRename,
  onFileDelete,
  onFileUpload,
  onFileDownload,
  selectedFileId,
  className = "",
}: FileTreeProps) {
  const [draggedFile, setDraggedFile] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    fileId: string;
    fileType: "file" | "folder";
  } | null>(null);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: FileNode) => {
    if (file.type === "folder") {
      return file.isOpen ? FolderOpen : Folder;
    }
    return File;
  };

  const getLanguageIcon = (language?: string) => {
    // You can add more language-specific icons here
    switch (language) {
      case "javascript":
      case "typescript":
        return "🟨";
      case "python":
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
      default:
        return "📄";
    }
  };

  const handleFileClick = (file: FileNode) => {
    if (file.type === "folder") {
      // Toggle folder open/closed
      onFileSelect({ ...file, isOpen: !file.isOpen });
    } else {
      onFileSelect(file);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, file: FileNode) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      fileId: file.id,
      fileType: file.type,
    });
  };

  const handleRename = (fileId: string) => {
    setRenamingFile(fileId);
    setNewFileName("");
    setContextMenu(null);
  };

  const handleRenameSubmit = () => {
    if (renamingFile && newFileName.trim()) {
      onFileRename(renamingFile, newFileName.trim());
    }
    setRenamingFile(null);
    setNewFileName("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileUpload(e.target.files);
    }
  };

  const handleDragStart = (e: React.DragEvent, fileId: string) => {
    setDraggedFile(fileId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetFileId: string) => {
    e.preventDefault();
    if (draggedFile && draggedFile !== targetFileId) {
      // Handle file move logic here
      console.log(`Move ${draggedFile} to ${targetFileId}`);
    }
    setDraggedFile(null);
  };

  const renderFileNode = (file: FileNode, depth = 0) => {
    const Icon = getFileIcon(file);
    const isSelected = selectedFileId === file.id;
    const isRenaming = renamingFile === file.id;

    return (
      <div key={file.id}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer ${
            isSelected ? "bg-blue-100 border-r-2 border-blue-500" : ""
          }`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => handleFileClick(file)}
          onContextMenu={(e) => handleContextMenu(e, file)}
          draggable
          onDragStart={(e) => handleDragStart(e, file.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, file.id)}
        >
          {file.type === "folder" && (
            <div className="mr-1">
              {file.isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
          <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
          {isRenaming ? (
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") setRenamingFile(null);
              }}
              className="flex-1 px-1 py-0 text-sm border rounded"
              autoFocus
            />
          ) : (
            <div className="flex items-center flex-1 min-w-0">
              <span className="text-sm truncate">{file.name}</span>
              {file.language && (
                <span className="ml-2 text-xs">
                  {getLanguageIcon(file.language)}
                </span>
              )}
            </div>
          )}
        </div>
        {file.isOpen && file.children && (
          <div>
            {file.children.map((child) => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`file-tree ${className}`}>
      <div className="p-2 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Files</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onFileCreate("root", "New File", "file")}
              className="p-1 hover:bg-gray-100 rounded"
              title="New File"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onFileCreate("root", "New Folder", "folder")}
              className="p-1 hover:bg-gray-100 rounded"
              title="New Folder"
            >
              <Folder className="w-4 h-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1 hover:bg-gray-100 rounded"
              title="Upload Files"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {files.map((file) => renderFileNode(file))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {contextMenu && (
        <div
          className="fixed bg-white border rounded shadow-lg z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <div className="py-1">
            <button
              onClick={() => handleRename(contextMenu.fileId)}
              className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Rename
            </button>
            <button
              onClick={() =>
                onFileDownload(files.find((f) => f.id === contextMenu.fileId)!)
              }
              className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={() => onFileDelete(contextMenu.fileId)}
              className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      )}

      {contextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
