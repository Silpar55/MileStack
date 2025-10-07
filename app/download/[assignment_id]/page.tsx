"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Download,
  Eye,
  FileText,
  Code,
  BookOpen,
} from "lucide-react";

interface DownloadQualification {
  isEligible: boolean;
  requirements: {
    pathwayCompletion: boolean;
    comprehensionScore: boolean;
    aiAssistanceEarned: boolean;
    integrityAcknowledgment: boolean;
  };
  missingRequirements: string[];
  pathwayProgress: number;
  comprehensionScore: number;
  totalPointsSpent: number;
  integrityAcknowledgment: boolean;
}

interface DownloadPreview {
  format: string;
  fileCount: number;
  fileNames: string[];
  documentation: any;
  metadata: any;
}

export default function DownloadPage() {
  const params = useParams();
  const assignmentId = params.assignment_id as string;

  const [qualification, setQualification] =
    useState<DownloadQualification | null>(null);
  const [preview, setPreview] = useState<DownloadPreview | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<
    "clean" | "portfolio" | "template"
  >("clean");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    checkQualification();
  }, [assignmentId]);

  const checkQualification = async () => {
    try {
      const response = await fetch(`/api/download/${assignmentId}/qualify`);
      const data = await response.json();
      setQualification(data);
    } catch (error) {
      console.error("Error checking qualification:", error);
    } finally {
      setLoading(false);
    }
  };

  const previewDownload = async (
    format: "clean" | "portfolio" | "template"
  ) => {
    try {
      const response = await fetch(
        `/api/download/${assignmentId}/preview?format=${format}`
      );
      const data = await response.json();
      setPreview(data);
      setSelectedFormat(format);
    } catch (error) {
      console.error("Error previewing download:", error);
    }
  };

  const generateDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/download/${assignmentId}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ format: selectedFormat }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate download");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${assignmentId}-${selectedFormat}-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating download:", error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking download eligibility...</p>
        </div>
      </div>
    );
  }

  if (!qualification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to check download eligibility. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Download Assignment
          </h1>
          <p className="text-gray-600">
            Export your completed assignment with full academic integrity
            documentation.
          </p>
        </div>

        {/* Qualification Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {qualification.isEligible ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Download Eligibility
            </CardTitle>
            <CardDescription>
              {qualification.isEligible
                ? "You are eligible to download your assignment."
                : "You need to complete additional requirements to download."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  {qualification.requirements.pathwayCompletion ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">Learning Pathway</p>
                    <p className="text-sm text-gray-600">
                      {qualification.pathwayProgress}% complete
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {qualification.requirements.comprehensionScore ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">Comprehension Score</p>
                    <p className="text-sm text-gray-600">
                      {qualification.comprehensionScore}% (minimum 80%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {qualification.requirements.aiAssistanceEarned ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">AI Assistance Earned</p>
                    <p className="text-sm text-gray-600">
                      {qualification.totalPointsSpent} points spent
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {qualification.requirements.integrityAcknowledgment ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">Integrity Acknowledgment</p>
                    <p className="text-sm text-gray-600">
                      Academic integrity commitment signed
                    </p>
                  </div>
                </div>
              </div>

              {!qualification.isEligible && (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Missing Requirements:</strong>
                    <ul className="mt-2 list-disc list-inside">
                      {qualification.missingRequirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Download Options */}
        {qualification.isEligible && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Download Format Options</CardTitle>
                <CardDescription>
                  Choose the format that best suits your needs and academic
                  requirements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card
                    className={`cursor-pointer transition-colors ${
                      selectedFormat === "clean"
                        ? "ring-2 ring-blue-600 bg-blue-50"
                        : ""
                    }`}
                    onClick={() => previewDownload("clean")}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">Clean Project</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Complete implementation ready for submission. Suitable
                        for institutions allowing AI-assisted learning.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Complete working code</li>
                        <li>• Documentation and README</li>
                        <li>• Setup instructions</li>
                        <li>• Academic integrity documentation</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-colors ${
                      selectedFormat === "portfolio"
                        ? "ring-2 ring-green-600 bg-green-50"
                        : ""
                    }`}
                    onClick={() => previewDownload("portfolio")}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-lg">
                          Portfolio Version
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Includes learning journey documentation and AI
                        assistance transparency. Perfect for career portfolios.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Learning journey documentation</li>
                        <li>• AI assistance summary</li>
                        <li>• Skills demonstration</li>
                        <li>• Professional presentation</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-colors ${
                      selectedFormat === "template"
                        ? "ring-2 ring-orange-600 bg-orange-50"
                        : ""
                    }`}
                    onClick={() => previewDownload("template")}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-orange-600" />
                        <CardTitle className="text-lg">
                          Learning Template
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Project structure preserved, implementation details
                        removed. Suitable for strictest academic integrity
                        requirements.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Project structure maintained</li>
                        <li>• Implementation details removed</li>
                        <li>• Learning objectives included</li>
                        <li>• Requires independent completion</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {preview && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Download Preview
                  </CardTitle>
                  <CardDescription>
                    Preview of files that will be included in your download
                    package.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{preview.format}</Badge>
                      <span className="text-sm text-gray-600">
                        {preview.fileCount} files
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Files included:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {preview.fileNames.map((fileName, index) => (
                          <div
                            key={index}
                            className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded"
                          >
                            {fileName}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        onClick={generateDownload}
                        disabled={downloading}
                        className="w-full"
                      >
                        {downloading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating Download...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download {preview.format} Package
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
