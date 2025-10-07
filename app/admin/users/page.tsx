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
  Users,
  Flag,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  UserCheck,
  UserX,
  Activity,
  Shield,
  TrendingUp,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface UserModeration {
  flaggedUsers: Array<{
    id: string;
    name: string;
    email: string;
    institution?: string;
    flagReason: string;
    flagDate: Date;
    riskScore: number;
    recentActivity: Array<{
      type: string;
      timestamp: Date;
      description: string;
    }>;
  }>;
  suspiciousActivity: Array<{
    id: string;
    userId: string;
    activityType: string;
    riskScore: number;
    detectedAt: Date;
    description: string;
    status: "investigating" | "resolved" | "false_positive";
  }>;
}

export default function UserModerationPage() {
  const [moderation, setModeration] = useState<UserModeration | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    try {
      const response = await fetch("/api/admin/users/flagged");
      const data = await response.json();
      setModeration(data);
    } catch (error) {
      console.error("Error loading user moderation data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (
    userId: string,
    action: "flag" | "unflag",
    reason?: string
  ) => {
    try {
      const response = await fetch("/api/admin/users/flagged", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          action,
          reason,
          adminId: "admin", // This would come from auth
        }),
      });

      if (response.ok) {
        await loadModerationData();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Error processing user action:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading user moderation...</p>
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
            Unable to load user moderation data. Please try again later.
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
            User Moderation
          </h1>
          <p className="text-gray-600">
            Monitor flagged users and suspicious activity patterns.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Flag className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {moderation.flaggedUsers.length}
                  </p>
                  <p className="text-sm text-gray-600">Flagged Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {moderation.suspiciousActivity.length}
                  </p>
                  <p className="text-sm text-gray-600">Suspicious Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {
                      moderation.flaggedUsers.filter(
                        (user) => user.riskScore >= 80
                      ).length
                    }
                  </p>
                  <p className="text-sm text-gray-600">High Risk Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {
                      moderation.suspiciousActivity.filter(
                        (activity) => activity.status === "resolved"
                      ).length
                    }
                  </p>
                  <p className="text-sm text-gray-600">Resolved Cases</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="flagged" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="flagged">Flagged Users</TabsTrigger>
            <TabsTrigger value="activity">Suspicious Activity</TabsTrigger>
          </TabsList>

          {/* Flagged Users Tab */}
          <TabsContent value="flagged" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Flagged Users
                </CardTitle>
                <CardDescription>
                  Users flagged for unusual activity or policy violations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moderation.flaggedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{user.name}</h4>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                user.riskScore >= 80
                                  ? "text-red-600"
                                  : user.riskScore >= 60
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              Risk: {user.riskScore}%
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs text-red-600"
                            >
                              Flagged
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {user.email}{" "}
                            {user.institution && `• ${user.institution}`}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Reason:</strong> {user.flagReason}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              Flagged:{" "}
                              {new Date(user.flagDate).toLocaleDateString()}
                            </span>
                            <span>
                              Activities: {user.recentActivity.length}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setSelectedUser(user.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(user.id, "unflag")}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Unflag
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUserAction(
                                user.id,
                                "flag",
                                "Additional review required"
                              )
                            }
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            Re-flag
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suspicious Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Suspicious Activity
                </CardTitle>
                <CardDescription>
                  Automated detection of unusual patterns and potential
                  violations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moderation.suspiciousActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">
                              {activity.activityType}
                            </h4>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                activity.riskScore >= 80
                                  ? "text-red-600"
                                  : activity.riskScore >= 60
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              Risk: {activity.riskScore}%
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                activity.status === "resolved"
                                  ? "text-green-600"
                                  : activity.status === "investigating"
                                  ? "text-yellow-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {activity.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>User: {activity.userId}</span>
                            <span>
                              Detected:{" "}
                              {new Date(
                                activity.detectedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Investigate
                          </Button>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="h-4 w-4 mr-2" />
                            False Positive
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
