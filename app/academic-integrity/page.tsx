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
  Shield,
  FileText,
  Share2,
  Download,
  Settings,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Eye,
  Lock,
  Unlock,
} from "lucide-react";

interface IntegrityDashboard {
  user: {
    id: string;
    name: string;
    email: string;
    institution?: string;
  };
  summary: {
    total_assignments: number;
    total_ai_assistance_requests: number;
    total_points_earned: number;
    total_points_spent: number;
    honor_code_signatures: number;
    transparency_reports_generated: number;
  };
  recent_activity: Array<{
    timestamp: string;
    type: string;
    description: string;
    assignment_id?: string;
  }>;
  integrity_score: {
    overall: number;
    transparency: number;
    compliance: number;
    learning_engagement: number;
  };
}

interface PrivacySettings {
  userId: string;
  shareWithInstructors: boolean;
  allowAnonymousAnalytics: boolean;
  dataRetentionPeriod: number;
  exportDataOnRequest: boolean;
  deleteDataOnRequest: boolean;
  lmsIntegration: boolean;
  customInstitutionPolicies: boolean;
}

export default function AcademicIntegrityPage() {
  const [dashboard, setDashboard] = useState<IntegrityDashboard | null>(null);
  const [privacySettings, setPrivacySettings] =
    useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrityData();
  }, []);

  const loadIntegrityData = async () => {
    try {
      const [dashboardRes, privacyRes] = await Promise.all([
        fetch("/api/integrity/dashboard"),
        fetch("/api/integrity/privacy"),
      ]);

      const [dashboardData, privacyData] = await Promise.all([
        dashboardRes.json(),
        privacyRes.json(),
      ]);

      setDashboard(dashboardData);
      setPrivacySettings(privacyData);
    } catch (error) {
      console.error("Error loading integrity data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySettings = async (updates: Partial<PrivacySettings>) => {
    try {
      const response = await fetch("/api/integrity/privacy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setPrivacySettings(updatedSettings);
      }
    } catch (error) {
      console.error("Error updating privacy settings:", error);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch("/api/integrity/export", {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        // Handle data export
        console.log("Data export:", result);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            Loading academic integrity data...
          </p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Unable to load academic integrity data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Academic Integrity Dashboard
          </h1>
          <p className="text-gray-600">
            Track your learning journey with complete transparency and
            integrity.
          </p>
        </div>

        {/* Integrity Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {dashboard.integrity_score.overall}%
                  </p>
                  <p className="text-sm text-gray-600">Overall Integrity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Eye className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {dashboard.integrity_score.transparency}%
                  </p>
                  <p className="text-sm text-gray-600">Transparency</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {dashboard.integrity_score.compliance}%
                  </p>
                  <p className="text-sm text-gray-600">Compliance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {dashboard.integrity_score.learning_engagement}%
                  </p>
                  <p className="text-sm text-gray-600">Learning Engagement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Learning Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Assignments</span>
                  <span className="font-medium">
                    {dashboard.summary.total_assignments}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">AI Assistance</span>
                  <span className="font-medium">
                    {dashboard.summary.total_ai_assistance_requests}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Points Earned</span>
                  <span className="font-medium">
                    {dashboard.summary.total_points_earned}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Points Spent</span>
                  <span className="font-medium">
                    {dashboard.summary.total_points_spent}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Integrity Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Honor Code Signatures
                  </span>
                  <span className="font-medium">
                    {dashboard.summary.honor_code_signatures}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Transparency Reports
                  </span>
                  <span className="font-medium">
                    {dashboard.summary.transparency_reports_generated}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Policy Violations
                  </span>
                  <span className="font-medium text-green-600">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Compliance Level
                  </span>
                  <Badge variant="outline" className="text-green-600">
                    Excellent
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Institution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Institution</span>
                  <span className="font-medium">
                    {dashboard.user.institution || "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Student ID</span>
                  <span className="font-medium">{dashboard.user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email</span>
                  <span className="font-medium text-sm">
                    {dashboard.user.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Privacy Level</span>
                  <Badge variant="outline" className="text-blue-600">
                    Protected
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="reports">Transparency Reports</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Settings</TabsTrigger>
            <TabsTrigger value="export">Data Export</TabsTrigger>
          </TabsList>

          {/* Recent Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent academic integrity activities and learning
                  progress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.recent_activity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {activity.description}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {activity.type.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                        {activity.assignment_id && (
                          <p className="text-xs text-gray-500 mt-1">
                            Assignment: {activity.assignment_id}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transparency Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transparency Reports</CardTitle>
                <CardDescription>
                  Generate and share detailed reports of your learning journey
                  and AI assistance usage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Assignment Reports</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Generate detailed transparency reports for specific
                      assignments.
                    </p>
                    <Button variant="outline" className="mr-2">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share with Instructor
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">
                      Learning Journey Summary
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Comprehensive overview of your learning progression and
                      skill development.
                    </p>
                    <Button variant="outline" className="mr-2">
                      <Download className="h-4 w-4 mr-2" />
                      Download Summary
                    </Button>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Online
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Data Control</CardTitle>
                <CardDescription>
                  Manage your data sharing preferences and privacy settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {privacySettings && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Share with Instructors</h4>
                        <p className="text-sm text-gray-600">
                          Allow instructors to view your transparency reports
                        </p>
                      </div>
                      <Button
                        variant={
                          privacySettings.shareWithInstructors
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          updatePrivacySettings({
                            shareWithInstructors:
                              !privacySettings.shareWithInstructors,
                          })
                        }
                      >
                        {privacySettings.shareWithInstructors ? (
                          <Unlock className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Anonymous Analytics</h4>
                        <p className="text-sm text-gray-600">
                          Contribute to platform improvement through anonymous
                          data
                        </p>
                      </div>
                      <Button
                        variant={
                          privacySettings.allowAnonymousAnalytics
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          updatePrivacySettings({
                            allowAnonymousAnalytics:
                              !privacySettings.allowAnonymousAnalytics,
                          })
                        }
                      >
                        {privacySettings.allowAnonymousAnalytics ? (
                          <Unlock className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">LMS Integration</h4>
                        <p className="text-sm text-gray-600">
                          Connect with your institution's learning management
                          system
                        </p>
                      </div>
                      <Button
                        variant={
                          privacySettings.lmsIntegration ? "default" : "outline"
                        }
                        onClick={() =>
                          updatePrivacySettings({
                            lmsIntegration: !privacySettings.lmsIntegration,
                          })
                        }
                      >
                        {privacySettings.lmsIntegration ? (
                          <Unlock className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Data Retention</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Your data will be retained for{" "}
                        {privacySettings.dataRetentionPeriod} days.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={exportData}>
                          <Download className="h-4 w-4 mr-2" />
                          Export My Data
                        </Button>
                        <Button variant="outline" className="text-red-600">
                          <Settings className="h-4 w-4 mr-2" />
                          Request Data Deletion
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Export & Management</CardTitle>
                <CardDescription>
                  Export your data or request data deletion in compliance with
                  GDPR.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Export All Data</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Download a complete copy of your academic integrity data.
                    </p>
                    <Button onClick={exportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Transparency Reports</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Download all your transparency reports in PDF format.
                    </p>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Download Reports
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Learning Analytics</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Export your learning progression and skill development
                      data.
                    </p>
                    <Button variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Download Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
