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
  BarChart3,
  Users,
  Shield,
  FileText,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Flag,
  UserCheck,
  Activity,
  Target,
  Zap,
} from "lucide-react";

interface AdminAnalytics {
  overview: {
    totalUsers: number;
    activeUsers: {
      daily: number;
      monthly: number;
      retention: {
        day1: number;
        day7: number;
        day30: number;
      };
    };
    learningMetrics: {
      pathwayCompletions: number;
      averageCompletionTime: number;
      successRate: number;
    };
    aiAssistance: {
      totalRequests: number;
      pointsSpent: number;
      satisfactionScore: number;
    };
    integrity: {
      honorCodeSignatures: number;
      transparencyReports: number;
      violations: number;
    };
  };
  contentPerformance: {
    challenges: {
      total: number;
      approved: number;
      pending: number;
      completionRate: number;
      averageRating: number;
    };
    assignments: {
      total: number;
      active: number;
      completionRate: number;
      averageScore: number;
    };
    aiEffectiveness: {
      satisfactionRatings: number[];
      responseQuality: number;
      educationalValue: number;
    };
  };
  integrityMonitoring: {
    unusualPatterns: {
      rapidPointEarning: number;
      multipleAccounts: number;
      lowQualitySubmissions: number;
    };
    compliance: {
      honorCodeRate: number;
      transparencyRate: number;
      violationRate: number;
    };
    trends: {
      pointEconomyHealth: number;
      integrityScore: number;
      learningEngagement: number;
    };
  };
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics/overview");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load admin analytics. Please try again later.
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Platform oversight, content management, and integrity monitoring.
          </p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {analytics.overview.totalUsers.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {analytics.overview.activeUsers.daily}
                  </p>
                  <p className="text-sm text-gray-600">Daily Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {analytics.overview.integrity.honorCodeSignatures}
                  </p>
                  <p className="text-sm text-gray-600">Honor Code Signatures</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {analytics.overview.learningMetrics.pathwayCompletions}
                  </p>
                  <p className="text-sm text-gray-600">Pathway Completions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="integrity">Integrity</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Daily Active Users
                      </span>
                      <span className="font-medium">
                        {analytics.overview.activeUsers.daily}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Monthly Active Users
                      </span>
                      <span className="font-medium">
                        {analytics.overview.activeUsers.monthly}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Day 1 Retention
                        </span>
                        <span className="font-medium">
                          {analytics.overview.activeUsers.retention.day1}%
                        </span>
                      </div>
                      <Progress
                        value={analytics.overview.activeUsers.retention.day1}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Day 7 Retention
                        </span>
                        <span className="font-medium">
                          {analytics.overview.activeUsers.retention.day7}%
                        </span>
                      </div>
                      <Progress
                        value={analytics.overview.activeUsers.retention.day7}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Day 30 Retention
                        </span>
                        <span className="font-medium">
                          {analytics.overview.activeUsers.retention.day30}%
                        </span>
                      </div>
                      <Progress
                        value={analytics.overview.activeUsers.retention.day30}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Learning Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Pathway Completions
                      </span>
                      <span className="font-medium">
                        {analytics.overview.learningMetrics.pathwayCompletions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Avg Completion Time
                      </span>
                      <span className="font-medium">
                        {
                          analytics.overview.learningMetrics
                            .averageCompletionTime
                        }
                        h
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Success Rate
                        </span>
                        <span className="font-medium">
                          {analytics.overview.learningMetrics.successRate}%
                        </span>
                      </div>
                      <Progress
                        value={analytics.overview.learningMetrics.successRate}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Assistance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    AI Assistance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Total Requests
                      </span>
                      <span className="font-medium">
                        {analytics.overview.aiAssistance.totalRequests.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Points Spent
                      </span>
                      <span className="font-medium">
                        {analytics.overview.aiAssistance.pointsSpent.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Satisfaction Score
                      </span>
                      <span className="font-medium">
                        {analytics.overview.aiAssistance.satisfactionScore}/5.0
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Integrity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Academic Integrity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Honor Code Signatures
                      </span>
                      <span className="font-medium">
                        {analytics.overview.integrity.honorCodeSignatures}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Transparency Reports
                      </span>
                      <span className="font-medium">
                        {analytics.overview.integrity.transparencyReports}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Violations</span>
                      <span className="font-medium text-red-600">
                        {analytics.overview.integrity.violations}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Challenges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Total Challenges
                      </span>
                      <span className="font-medium">
                        {analytics.contentPerformance.challenges.total}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Approved</span>
                      <span className="font-medium text-green-600">
                        {analytics.contentPerformance.challenges.approved}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Pending Review
                      </span>
                      <span className="font-medium text-yellow-600">
                        {analytics.contentPerformance.challenges.pending}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Completion Rate
                        </span>
                        <span className="font-medium">
                          {
                            analytics.contentPerformance.challenges
                              .completionRate
                          }
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          analytics.contentPerformance.challenges.completionRate
                        }
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Average Rating
                      </span>
                      <span className="font-medium">
                        {analytics.contentPerformance.challenges.averageRating}
                        /5.0
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Total Assignments
                      </span>
                      <span className="font-medium">
                        {analytics.contentPerformance.assignments.total}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active</span>
                      <span className="font-medium text-green-600">
                        {analytics.contentPerformance.assignments.active}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Completion Rate
                        </span>
                        <span className="font-medium">
                          {
                            analytics.contentPerformance.assignments
                              .completionRate
                          }
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          analytics.contentPerformance.assignments
                            .completionRate
                        }
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Average Score
                      </span>
                      <span className="font-medium">
                        {analytics.contentPerformance.assignments.averageScore}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Effectiveness */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    AI Effectiveness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Response Quality
                      </span>
                      <span className="font-medium">
                        {
                          analytics.contentPerformance.aiEffectiveness
                            .responseQuality
                        }
                        /5.0
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Educational Value
                      </span>
                      <span className="font-medium">
                        {
                          analytics.contentPerformance.aiEffectiveness
                            .educationalValue
                        }
                        /5.0
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Satisfaction Trend
                        </span>
                        <span className="text-xs text-gray-500">
                          Last 5 ratings
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {analytics.contentPerformance.aiEffectiveness.satisfactionRatings.map(
                          (rating, index) => (
                            <div
                              key={index}
                              className="flex-1 h-2 bg-blue-200 rounded"
                              style={{ height: `${rating * 20}px` }}
                            ></div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrity Tab */}
          <TabsContent value="integrity" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Unusual Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Unusual Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Rapid Point Earning
                      </span>
                      <span className="font-medium text-red-600">
                        {
                          analytics.integrityMonitoring.unusualPatterns
                            .rapidPointEarning
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Multiple Accounts
                      </span>
                      <span className="font-medium text-red-600">
                        {
                          analytics.integrityMonitoring.unusualPatterns
                            .multipleAccounts
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Low Quality Submissions
                      </span>
                      <span className="font-medium text-yellow-600">
                        {
                          analytics.integrityMonitoring.unusualPatterns
                            .lowQualitySubmissions
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Honor Code Rate
                        </span>
                        <span className="font-medium">
                          {
                            analytics.integrityMonitoring.compliance
                              .honorCodeRate
                          }
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          analytics.integrityMonitoring.compliance.honorCodeRate
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Transparency Rate
                        </span>
                        <span className="font-medium">
                          {
                            analytics.integrityMonitoring.compliance
                              .transparencyRate
                          }
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          analytics.integrityMonitoring.compliance
                            .transparencyRate
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Violation Rate
                        </span>
                        <span className="font-medium text-red-600">
                          {
                            analytics.integrityMonitoring.compliance
                              .violationRate
                          }
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          analytics.integrityMonitoring.compliance.violationRate
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Point Economy Health
                        </span>
                        <span className="font-medium">
                          {
                            analytics.integrityMonitoring.trends
                              .pointEconomyHealth
                          }
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          analytics.integrityMonitoring.trends
                            .pointEconomyHealth
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Integrity Score
                        </span>
                        <span className="font-medium">
                          {analytics.integrityMonitoring.trends.integrityScore}%
                        </span>
                      </div>
                      <Progress
                        value={
                          analytics.integrityMonitoring.trends.integrityScore
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Learning Engagement
                        </span>
                        <span className="font-medium">
                          {
                            analytics.integrityMonitoring.trends
                              .learningEngagement
                          }
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          analytics.integrityMonitoring.trends
                            .learningEngagement
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  User Moderation
                </CardTitle>
                <CardDescription>
                  Monitor flagged users and suspicious activity patterns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Flagged Users</h4>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Use the Users tab to view detailed user moderation
                    information.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Platform Settings
                </CardTitle>
                <CardDescription>
                  Configure platform-wide settings and policies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">General Settings</h4>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Manage platform configuration, maintenance mode, and feature
                    toggles.
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
