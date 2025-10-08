"use client";

import React, { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, Loader2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AvatarUploadProps {
  currentAvatar?: string;
  currentName?: string;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function AvatarUpload({
  currentAvatar,
  currentName = "User",
  onUpload,
  onDelete,
  disabled = false,
  className,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setError(null);
      setPreview(URL.createObjectURL(file));

      try {
        setIsUploading(true);
        await onUpload(file);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      },
      maxFiles: 1,
      maxSize: 5 * 1024 * 1024, // 5MB
      disabled: disabled || isUploading || isDeleting,
    });

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsDeleting(true);
      setError(null);
      await onDelete();
      setPreview(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const displayAvatar = preview || currentAvatar;
  const initials = currentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Avatar with Integrated Upload */}
      <div className="flex items-center justify-center">
        <div
          className="relative cursor-pointer"
          onClick={
            !disabled && !isUploading && !isDeleting
              ? handleFileSelect
              : undefined
          }
        >
          <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
            <AvatarImage
              src={displayAvatar}
              alt={`${currentName}'s avatar`}
              className="object-cover"
            />
            <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Upload Overlay - Always present but invisible until hover */}
          {!disabled && !isUploading && !isDeleting && (
            <div
              {...getRootProps()}
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer transition-opacity duration-200 opacity-0 hover:opacity-100",
                isDragActive && "opacity-100 bg-black/70"
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleFileSelect();
              }}
            >
              <div className="text-center text-white pointer-events-none">
                {isDragActive ? (
                  <div className="flex flex-col items-center">
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Drop to upload</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera className="w-6 h-6 mb-1 transition-transform duration-200" />
                    <span className="text-xs font-medium">Click to change</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remove Button - Only show on hover when avatar exists */}
          {currentAvatar && !disabled && !isUploading && !isDeleting && (
            <button
              onClick={handleDelete}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
              title="Remove avatar"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Loading Overlay */}
          {(isUploading || isDeleting) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        {...getInputProps()}
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
      />

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="max-w-sm mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File Rejection Errors */}
      {fileRejections.length > 0 && (
        <Alert variant="destructive" className="max-w-sm mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {fileRejections[0].errors.map((error) => (
              <div key={error.code}>
                {error.code === "file-too-large"
                  ? "File is too large. Maximum size is 5MB."
                  : error.code === "file-invalid-type"
                  ? "Invalid file type. Please use JPEG, PNG, or WebP."
                  : error.message}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
