"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  Code,
  Image,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  File,
  AlertTriangle,
} from "lucide-react";

interface UploadedFile {
  file: File;
  id: string;
  status: "queued" | "uploading" | "uploaded" | "error";
  progress: number;
}

// Removed AnalysisResult interface - no longer needed

export default function AssignmentUploadPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    title: "",
    description: "",
    courseName: "",
    dueDate: "",
    difficultyEstimate: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const supportedFileTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
  ];

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      if (!supportedFileTypes.includes(file.type)) {
        alert(
          `Unsupported file type: ${file.type}. Please use PDF, DOCX, TXT, JPG, or PNG.`
        );
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(
          `File too large: ${file.name} (max 10MB). Please choose a smaller file.`
        );
        return false;
      }
      return true;
    });

    const newFiles: UploadedFile[] = validFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: "queued",
      progress: 0,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    },
    [handleFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
      // Reset the input value so the same file can be uploaded again
      e.target.value = "";
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const uploadFile = async (fileData: UploadedFile) => {
    if (!session?.user?.id) {
      console.error("No user session found");
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileData.id ? { ...file, status: "error" } : file
        )
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", fileData.file);
    formData.append("userId", session.user.id);
    formData.append("title", assignmentData.title || fileData.file.name);
    formData.append("description", assignmentData.description);
    formData.append("courseName", assignmentData.courseName);
    formData.append("dueDate", assignmentData.dueDate);
    formData.append("difficultyEstimate", assignmentData.difficultyEstimate);

    try {
      // Update status to uploading and simulate progress updates
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileData.id ? { ...file, status: "uploading" } : file
        )
      );

      const progressInterval = setInterval(() => {
        setUploadedFiles((prev) =>
          prev.map((file) => {
            if (file.id === fileData.id && file.status === "uploading") {
              const newProgress = Math.min(
                file.progress + Math.random() * 20,
                90
              );
              return { ...file, progress: newProgress };
            }
            return file;
          })
        );
      }, 200);

      const response = await fetch("/api/assignment/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Upload failed: ${response.statusText}`
        );
      }

      const result = await response.json();

      // Update file status to complete
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileData.id
            ? {
                ...file,
                status: "uploaded",
                progress: 100,
              }
            : file
        )
      );
    } catch (error) {
      console.error("Upload error:", error);
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileData.id ? { ...file, status: "error" } : file
        )
      );
    }
  };

  // Removed analyzeAssignment function - no longer needed

  const handleUploadAll = async () => {
    if (!assignmentData.title.trim()) {
      alert("Please enter an assignment title before uploading.");
      return;
    }

    setIsUploading(true);

    for (const fileData of uploadedFiles) {
      if (fileData.status === "queued") {
        await uploadFile(fileData);
      }
    }

    setIsUploading(false);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/"))
      return <Image className="w-5 h-5" aria-label="Image file" />;
    if (mimeType === "application/pdf")
      return <FileText className="w-5 h-5" aria-label="Document file" />;
    if (mimeType.includes("word"))
      return <FileText className="w-5 h-5" aria-label="Document file" />;
    if (mimeType === "text/plain")
      return <Code className="w-5 h-5" aria-label="Code file" />;
    return <File className="w-5 h-5" aria-label="File" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "queued":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "uploading":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "uploaded":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "queued":
        return "Ready to Upload";
      case "uploading":
        return "Uploading...";
      case "uploaded":
        return "Upload Complete";
      case "error":
        return "Upload Failed";
      default:
        return "";
    }
  };

  // Show loading if checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Assignment Upload</h1>
          <p className="text-muted-foreground">
            Upload your programming assignments for processing and analysis
          </p>
        </div>

        {/* Assignment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  value={assignmentData.title}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter assignment title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                  id="courseName"
                  value={assignmentData.courseName}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      courseName: e.target.value,
                    })
                  }
                  placeholder="e.g., CS 101, Data Structures"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={assignmentData.dueDate}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      dueDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="difficultyEstimate">Difficulty Estimate</Label>
                <Select
                  value={assignmentData.difficultyEstimate}
                  onValueChange={(value) =>
                    setAssignmentData({
                      ...assignmentData,
                      difficultyEstimate: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (1-3)</SelectItem>
                    <SelectItem value="intermediate">
                      Intermediate (4-6)
                    </SelectItem>
                    <SelectItem value="advanced">Advanced (7-8)</SelectItem>
                    <SelectItem value="expert">Expert (9-10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={assignmentData.description}
                onChange={(e) =>
                  setAssignmentData({
                    ...assignmentData,
                    description: e.target.value,
                  })
                }
                placeholder="Optional description of the assignment"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Assignment Files</CardTitle>
            <p className="text-sm text-muted-foreground">
              Supported formats: PDF, DOCX, TXT, Images (JPEG, PNG, GIF, BMP,
              TIFF)
            </p>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Drag and drop files here, or click to browse
              </h3>
              <p className="text-muted-foreground mb-4">
                Maximum file size: 10MB per file
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.gif,.bmp,.tiff"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedFiles.map((fileData) => (
                  <div
                    key={fileData.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getFileIcon(fileData.file.type)}
                      <div>
                        <p className="font-medium">{fileData.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(fileData.status)}
                        <span className="text-sm">
                          {getStatusText(fileData.status)}
                        </span>
                      </div>

                      {fileData.status === "uploading" && (
                        <div className="w-20">
                          <Progress value={fileData.progress} className="h-2" />
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileData.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setUploadedFiles([])}>
                  Clear All
                </Button>
                <Button
                  onClick={handleUploadAll}
                  disabled={
                    isUploading ||
                    uploadedFiles.length === 0 ||
                    !assignmentData.title.trim()
                  }
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Files
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Complete Message */}
        {uploadedFiles.some((file) => file.status === "uploaded") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Upload Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your assignment files have been successfully uploaded and
                processed. The files are now ready for further analysis and
                processing.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error Handling */}
        {uploadedFiles.some((file) => file.status === "error") && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some files failed to upload. Please check the file format and
              size, then try again.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
