"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  CheckCircle,
  Clock,
  FileText,
  Lock,
  Eye,
  AlertTriangle,
} from "lucide-react";

interface HonorCodeSignature {
  id: string;
  userId: string;
  assignmentId?: string;
  signature: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  version: string;
  institution?: string;
  isActive: boolean;
  createdAt: Date;
}

export default function HonorCodePage() {
  const router = useRouter();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [institution, setInstitution] = useState("");
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signature, setSignature] = useState<HonorCodeSignature | null>(null);

  const honorCodeContent = `I understand and commit to the following principles:

✓ I will use AI assistance only after demonstrating my understanding of core concepts
✓ I will earn AI guidance through genuine learning engagement, not shortcuts
✓ I will use this platform's assistance to enhance my learning, not replace it
✓ I will ensure my use of AI tools aligns with my institution's academic policies
✓ I will disclose AI assistance when required by my instructors or institution
✓ I understand that this platform supports my learning journey while maintaining academic integrity

Digital Signature: [Student Name]
Date: [Timestamp]
Assignment: [Assignment Title]
Institution: [Optional]`;

  const handleSignHonorCode = async () => {
    if (!agreedToTerms) {
      alert("Please agree to the honor code terms before signing.");
      return;
    }

    setSigning(true);
    try {
      const response = await fetch("/api/integrity/honor/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          institution: institution || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSignature(result.signature);
        setSigned(true);
      } else {
        throw new Error("Failed to sign honor code");
      }
    } catch (error) {
      console.error("Error signing honor code:", error);
      alert("Failed to sign honor code. Please try again.");
    } finally {
      setSigning(false);
    }
  };

  const handleContinue = () => {
    if (signed) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Academic Honor Code
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Before proceeding with your assignment, please read and agree to our
            academic honor code. This ensures transparency and maintains the
            highest standards of academic integrity.
          </p>
        </div>

        {!signed ? (
          <div className="space-y-6">
            {/* Honor Code Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Academic Honor Code
                </CardTitle>
                <CardDescription>
                  Please read the following principles carefully before signing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {honorCodeContent}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Key Principles */}
            <Card>
              <CardHeader>
                <CardTitle>Key Principles</CardTitle>
                <CardDescription>
                  Understanding these principles is essential for maintaining
                  academic integrity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-medium">
                        Demonstrated Understanding
                      </h4>
                      <p className="text-sm text-gray-600">
                        AI assistance is earned through genuine learning and
                        concept mastery.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium">Full Transparency</h4>
                      <p className="text-sm text-gray-600">
                        All AI assistance usage is tracked and can be shared
                        with instructors.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-medium">Academic Integrity</h4>
                      <p className="text-sm text-gray-600">
                        Maintain the highest standards of academic honesty and
                        ethical learning.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-medium">Institution Compliance</h4>
                      <p className="text-sm text-gray-600">
                        Ensure all usage aligns with your institution's academic
                        policies.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Institution Information */}
            <Card>
              <CardHeader>
                <CardTitle>Institution Information (Optional)</CardTitle>
                <CardDescription>
                  Provide your institution name to help us tailor the experience
                  to your academic policies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="institution"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Institution Name
                    </label>
                    <input
                      type="text"
                      id="institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g., Stanford University, MIT, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    This information helps us ensure compliance with your
                    institution's specific academic policies.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Agreement and Signature */}
            <Card>
              <CardHeader>
                <CardTitle>Digital Signature Agreement</CardTitle>
                <CardDescription>
                  By signing below, you agree to abide by the academic honor
                  code principles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agree"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) =>
                        setAgreedToTerms(checked as boolean)
                      }
                    />
                    <label htmlFor="agree" className="text-sm text-gray-700">
                      I have read and understood the academic honor code
                      principles above. I agree to abide by these principles and
                      understand that my AI assistance usage will be tracked and
                      can be shared with my instructors when required.
                    </label>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> Your digital signature will be
                      cryptographically secured and timestamped. This creates a
                      permanent record of your commitment to academic integrity.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleSignHonorCode}
                      disabled={!agreedToTerms || signing}
                      className="flex-1"
                    >
                      {signing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signing...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Sign Honor Code
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Success State */
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Honor Code Signed Successfully
                </CardTitle>
                <CardDescription className="text-green-700">
                  Your digital signature has been recorded and your commitment
                  to academic integrity is now documented.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-800">
                        Signature Details
                      </h4>
                      <p className="text-sm text-green-700">
                        Signature ID: {signature?.id}
                      </p>
                      <p className="text-sm text-green-700">
                        Signed:{" "}
                        {new Date(signature?.timestamp || "").toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-800">
                        Institution
                      </h4>
                      <p className="text-sm text-green-700">
                        {signature?.institution || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600">
                      <Lock className="h-3 w-3 mr-1" />
                      Cryptographically Secured
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      <Clock className="h-3 w-3 mr-1" />
                      Timestamped
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
                <CardDescription>
                  Your academic integrity commitment is now recorded. Here's
                  what you can do next.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-medium">Access AI Assistance</h4>
                      <p className="text-sm text-gray-600">
                        You can now use AI assistance features, knowing your
                        usage will be transparently tracked.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium">
                        View Your Integrity Dashboard
                      </h4>
                      <p className="text-sm text-gray-600">
                        Monitor your learning journey and AI assistance usage
                        with complete transparency.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-medium">
                        Generate Transparency Reports
                      </h4>
                      <p className="text-sm text-gray-600">
                        Create detailed reports of your learning process to
                        share with instructors.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={handleContinue} className="flex-1">
                Continue to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/academic-integrity")}
              >
                View Integrity Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
