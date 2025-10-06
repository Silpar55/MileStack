"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  Code,
  Image,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Brain,
  Target,
  Clock,
  Zap,
  File,
  AlertTriangle,
} from "lucide-react";

interface UploadedFile {
  file: File;
  id: string;
  status: "uploading" | "uploaded" | "analyzing" | "analyzed" | "error";
  progress: number;
  analysisResult?: any;
}

interface AnalysisResult {
  concepts: string[];
  skills: string[];
  difficultyLevel: number;
  estimatedTimeHours: number;
  prerequisites: string[];
  learningGaps: string[];
  milestones: {
    title: string;
    description: string;
    points: number;
    competencyRequirements: string[];
  }[];
}

export default function AssignmentUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    title: "",
    description: "",
  });

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
        alert(`Unsupported file type: ${file.type}`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`File too large: ${file.name} (max 10MB)`);
        return false;
      }
      return true;
    });

    const newFiles: UploadedFile[] = validFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: "uploading",
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
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const uploadFile = async (fileData: UploadedFile) => {
    const formData = new FormData();
    formData.append("file", fileData.file);
    formData.append("userId", "user_123"); // TODO: Get from auth context
    formData.append("title", assignmentData.title || fileData.file.name);
    formData.append("description", assignmentData.description);

    try {
      const response = await fetch("/api/assignment/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update file status
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileData.id
            ? {
                ...file,
                status: "uploaded",
                progress: 100,
                analysisResult: result,
              }
            : file
        )
      );

      // Start analysis
      setTimeout(() => {
        analyzeAssignment(result.assignment.id, fileData.id);
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileData.id ? { ...file, status: "error" } : file
        )
      );
    }
  };

  const analyzeAssignment = async (assignmentId: string, fileId: string) => {
    setUploadedFiles((prev) =>
      prev.map((file) =>
        file.id === fileId ? { ...file, status: "analyzing" } : file
      )
    );

    try {
      const response = await fetch("/api/assignment/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();

      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? {
                ...file,
                status: "analyzed",
                analysisResult: result,
              }
            : file
        )
      );
    } catch (error) {
      console.error("Analysis error:", error);
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileId ? { ...file, status: "error" } : file
        )
      );
    }
  };

  const handleUploadAll = async () => {
    setIsUploading(true);

    for (const fileData of uploadedFiles) {
      if (fileData.status === "uploading") {
        await uploadFile(fileData);
      }
    }

    setIsUploading(false);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="w-5 h-5" />;
    if (mimeType === "application/pdf") return <FileText className="w-5 h-5" />;
    if (mimeType.includes("word")) return <FileText className="w-5 h-5" />;
    if (mimeType === "text/plain") return <Code className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "uploaded":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "analyzing":
        return <Brain className="w-4 h-4 animate-pulse text-blue-500" />;
      case "analyzed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "uploading":
        return "Uploading...";
      case "uploaded":
        return "Uploaded";
      case "analyzing":
        return "AI Analysis in Progress";
      case "analyzed":
        return "Analysis Complete";
      case "error":
        return "Error";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            Intelligent Assignment Analysis
          </h1>
          <p className="text-muted-foreground">
            Upload your programming assignments and get AI-powered learning
            pathways
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
                />
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
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
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
                  disabled={isUploading || uploadedFiles.length === 0}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload & Analyze
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {uploadedFiles.some(
          (file) => file.status === "analyzed" && file.analysisResult
        ) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uploadedFiles
                .filter(
                  (file) => file.status === "analyzed" && file.analysisResult
                )
                .map((fileData) => {
                  const analysis = fileData.analysisResult.analysis;
                  const pathway = fileData.analysisResult.pathway;

                  return (
                    <div key={fileData.id} className="space-y-6">
                      {/* Analysis Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">
                            Difficulty:
                          </span>
                          <Badge variant="outline">
                            {analysis.difficultyLevel}/10
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">
                            Est. Time:
                          </span>
                          <span className="text-sm">
                            {analysis.estimatedTimeHours}h
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium">Points:</span>
                          <span className="text-sm">{pathway.totalPoints}</span>
                        </div>
                      </div>

                      {/* Concepts and Skills */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">
                            Programming Concepts
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.concepts.map(
                              (concept: string, index: number) => (
                                <Badge key={index} variant="secondary">
                                  {concept}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">
                            Required Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.skills.map(
                              (skill: string, index: number) => (
                                <Badge key={index} variant="outline">
                                  {skill}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Learning Pathway */}
                      <div>
                        <h4 className="font-semibold mb-4">Learning Pathway</h4>
                        <div className="space-y-3">
                          {pathway.milestones.map(
                            (milestone: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-start space-x-3 p-3 border rounded-lg"
                              >
                                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium">
                                    {milestone.title}
                                  </h5>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {milestone.description}
                                  </p>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <span className="flex items-center space-x-1">
                                      <Zap className="w-3 h-3" />
                                      <span>{milestone.points} points</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Target className="w-3 h-3" />
                                      <span>
                                        {
                                          milestone.competencyRequirements
                                            .length
                                        }{" "}
                                        competencies
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/assignment/${fileData.analysisResult.assignment.id}`
                            )
                          }
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => router.push(`/pathway/${pathway.id}`)}
                        >
                          Start Learning Path
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}

        {/* Error Handling */}
        {uploadedFiles.some((file) => file.status === "error") && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some files failed to upload or analyze. Please try again or
              contact support.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
