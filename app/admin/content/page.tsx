"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  Users,
  Eye,
  Edit,
  Trash2,
  Flag,
  AlertTriangle,
} from "lucide-react";

interface ContentModeration {
  challenges: {
    pending: Array<{
      id: string;
      title: string;
      description: string;
      difficulty: string;
      submittedBy: string;
      submittedAt: Date;
      reviewStatus: "pending" | "approved" | "rejected";
      qualityScore: number;
    }>;
    approved: Array<{
      id: string;
      title: string;
      completionRate: number;
      averageRating: number;
      lastUpdated: Date;
    }>;
  };
  assignments: {
    pending: Array<{
      id: string;
      title: string;
      description: string;
      difficulty: string;
      submittedBy: string;
      submittedAt: Date;
      reviewStatus: "pending" | "approved" | "rejected";
    }>;
    approved: Array<{
      id: string;
      title: string;
      completionRate: number;
      averageScore: number;
      lastUpdated: Date;
    }>;
  };
}

export default function ContentModerationPage() {
  const [moderation, setModeration] = useState<ContentModeration | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    try {
      const response = await fetch("/api/admin/content/moderation");
      const data = await response.json();
      setModeration(data);
    } catch (error) {
      console.error("Error loading moderation data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeAction = async (
    challengeId: string,
    action: "approve" | "reject",
    reason?: string
  ) => {
    try {
      const response = await fetch("/api/admin/content/challenge/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId,
          action,
          approvedBy: "admin", // This would come from auth
          reason,
        }),
      });

      if (response.ok) {
        await loadModerationData();
        setSelectedChallenge(null);
      }
    } catch (error) {
      console.error("Error processing challenge action:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading content moderation...</p>
        </div>
      </div>
    );
  }

  if (!moderation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load content moderation data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Content Moderation
          </h1>
          <p className="text-gray-600">
            Review and approve community-submitted challenges and assignments.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {moderation.challenges.pending.length}
                  </p>
                  <p className="text-sm text-gray-600">Pending Challenges</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {moderation.challenges.approved.length}
                  </p>
                  <p className="text-sm text-gray-600">Approved Challenges</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {moderation.assignments.pending.length}
                  </p>
                  <p className="text-sm text-gray-600">Pending Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {moderation.assignments.approved.length}
                  </p>
                  <p className="text-sm text-gray-600">Approved Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="challenges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            {/* Pending Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Review
                </CardTitle>
                <CardDescription>
                  Community-submitted challenges awaiting approval.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moderation.challenges.pending.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{challenge.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {challenge.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Quality: {challenge.qualityScore}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Submitted by: {challenge.submittedBy}</span>
                            <span>
                              {new Date(
                                challenge.submittedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setSelectedChallenge(challenge.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleChallengeAction(challenge.id, "approve")
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleChallengeAction(
                                challenge.id,
                                "reject",
                                "Quality concerns"
                              )
                            }
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Approved Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Approved Challenges
                </CardTitle>
                <CardDescription>
                  Successfully approved challenges with performance metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moderation.challenges.approved.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{challenge.title}</h4>
                            <Badge
                              variant="outline"
                              className="text-xs text-green-600"
                            >
                              Approved
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              <span>
                                {challenge.completionRate}% completion
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              <span>{challenge.averageRating}/5.0 rating</span>
                            </div>
                            <span>
                              Updated:{" "}
                              {new Date(
                                challenge.lastUpdated
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            {/* Pending Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Review
                </CardTitle>
                <CardDescription>
                  Community-submitted assignments awaiting approval.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moderation.assignments.pending.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{assignment.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {assignment.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {assignment.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Submitted by: {assignment.submittedBy}</span>
                            <span>
                              {new Date(
                                assignment.submittedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Approved Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Approved Assignments
                </CardTitle>
                <CardDescription>
                  Successfully approved assignments with performance metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moderation.assignments.approved.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{assignment.title}</h4>
                            <Badge
                              variant="outline"
                              className="text-xs text-green-600"
                            >
                              Approved
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              <span>
                                {assignment.completionRate}% completion
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              <span>
                                {assignment.averageScore}% average score
                              </span>
                            </div>
                            <span>
                              Updated:{" "}
                              {new Date(
                                assignment.lastUpdated
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
