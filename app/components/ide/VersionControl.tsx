"use client";

import { useState } from "react";
import { GitBranch, History, RotateCcw, Save, Clock } from "lucide-react";

interface Version {
  id: string;
  message: string;
  timestamp: Date;
  author: string;
  files: string[];
  isCheckpoint: boolean;
}

interface VersionControlProps {
  versions: Version[];
  currentVersion?: string;
  onVersionSelect: (versionId: string) => void;
  onCreateCheckpoint: (message: string) => void;
  onSaveVersion: (message: string) => void;
  onRevert: (versionId: string) => void;
  className?: string;
}

export function VersionControl({
  versions,
  currentVersion,
  onVersionSelect,
  onCreateCheckpoint,
  onSaveVersion,
  onRevert,
  className = "",
}: VersionControlProps) {
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [versionMessage, setVersionMessage] = useState("");
  const [isCheckpoint, setIsCheckpoint] = useState(false);

  const handleCreateVersion = () => {
    if (versionMessage.trim()) {
      if (isCheckpoint) {
        onCreateCheckpoint(versionMessage.trim());
      } else {
        onSaveVersion(versionMessage.trim());
      }
      setVersionMessage("");
      setShowCreateVersion(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestamp);
  };

  const getVersionIcon = (version: Version) => {
    if (version.isCheckpoint) {
      return <Save className="w-4 h-4 text-blue-500" />;
    }
    return <Clock className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className={`version-control ${className}`}>
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-5 h-5" />
            <h3 className="text-sm font-semibold">Version History</h3>
          </div>
          <button
            onClick={() => setShowCreateVersion(true)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Save Version
          </button>
        </div>
      </div>

      {showCreateVersion && (
        <div className="p-3 border-b bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Version Message
              </label>
              <input
                type="text"
                value={versionMessage}
                onChange={(e) => setVersionMessage(e.target.value)}
                placeholder="Describe your changes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateVersion();
                  if (e.key === "Escape") setShowCreateVersion(false);
                }}
                autoFocus
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isCheckpoint}
                  onChange={(e) => setIsCheckpoint(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Create checkpoint</span>
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateVersion}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowCreateVersion(false)}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No versions yet</p>
            <p className="text-xs">Save your first version to get started</p>
          </div>
        ) : (
          <div className="space-y-1">
            {versions.map((version) => (
              <div
                key={version.id}
                className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                  currentVersion === version.id
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : ""
                }`}
                onClick={() => onVersionSelect(version.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 flex-1 min-w-0">
                    {getVersionIcon(version)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium truncate">
                          {version.message}
                        </p>
                        {version.isCheckpoint && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Checkpoint
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{version.author}</span>
                        <span>{formatTimestamp(version.timestamp)}</span>
                        <span>{version.files.length} files</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRevert(version.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Revert to this version"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
