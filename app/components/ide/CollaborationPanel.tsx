"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  UserPlus,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Settings,
  Crown,
} from "lucide-react";

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

interface CollaborationPanelProps {
  collaborators: Collaborator[];
  currentUser: Collaborator;
  onInviteUser: (email: string, role: "editor" | "viewer") => void;
  onRemoveUser: (userId: string) => void;
  onUpdateRole: (userId: string, role: "editor" | "viewer") => void;
  onStartCall: () => void;
  onEndCall: () => void;
  isCallActive: boolean;
  className?: string;
}

export function CollaborationPanel({
  collaborators,
  currentUser,
  onInviteUser,
  onRemoveUser,
  onUpdateRole,
  onStartCall,
  onEndCall,
  isCallActive,
  className = "",
}: CollaborationPanelProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
  const [showSettings, setShowSettings] = useState(false);

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      onInviteUser(inviteEmail.trim(), inviteRole);
      setInviteEmail("");
      setShowInviteModal(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "editor":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "viewer":
        return <Users className="w-4 h-4 text-gray-500" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "text-yellow-600";
      case "editor":
        return "text-blue-600";
      case "viewer":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className={`collaboration-panel ${className}`}>
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <h3 className="text-sm font-semibold">Collaborators</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {collaborators.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInviteModal(true)}
              className="p-1 hover:bg-gray-200 rounded"
              title="Invite User"
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 hover:bg-gray-200 rounded"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="p-3 border-b bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleInvite();
                  if (e.key === "Escape") setShowInviteModal(false);
                }}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) =>
                  setInviteRole(e.target.value as "editor" | "viewer")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleInvite}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Send Invite
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="p-3 border-b hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      {collaborator.avatar ? (
                        <Image
                          src={collaborator.avatar}
                          alt={collaborator.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {collaborator.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        collaborator.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">
                        {collaborator.name}
                      </p>
                      {collaborator.id === currentUser.id && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {getRoleIcon(collaborator.role)}
                      <span
                        className={`text-xs ${getRoleColor(collaborator.role)}`}
                      >
                        {collaborator.role}
                      </span>
                      {collaborator.cursor && (
                        <span className="text-xs text-gray-500">
                          Line {collaborator.cursor.line}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {currentUser.role === "owner" &&
                  collaborator.id !== currentUser.id && (
                    <div className="flex items-center space-x-1">
                      <select
                        value={collaborator.role}
                        onChange={(e) =>
                          onUpdateRole(
                            collaborator.id,
                            e.target.value as "editor" | "viewer"
                          )
                        }
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        onClick={() => onRemoveUser(collaborator.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                        title="Remove User"
                      >
                        ×
                      </button>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={isCallActive ? onEndCall : onStartCall}
              className={`flex items-center px-3 py-2 rounded text-sm ${
                isCallActive
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isCallActive ? (
                <>
                  <VideoOff className="w-4 h-4 mr-1" />
                  End Call
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-1" />
                  Start Call
                </>
              )}
            </button>
          </div>
          <div className="text-xs text-gray-500">
            {collaborators.filter((c) => c.isOnline).length} online
          </div>
        </div>
      </div>
    </div>
  );
}
