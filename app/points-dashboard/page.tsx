"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Coins,
  Trophy,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Users,
  Award,
  Star,
  Zap,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
} from "lucide-react";

interface PointsBalance {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  dailyEarned: number;
  dailyLimit: number;
  canEarnMore: boolean;
  lastEarnedDate: string | null;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  category: string;
  reason: string;
  qualityScore?: number;
  verified: boolean;
  createdAt: string;
}

interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  points: number;
  progress: Record<string, any>;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progressPercentage: number;
}

interface Analytics {
  totalUsers: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  totalPointsInCirculation: number;
  fraudDetections: number;
  highRiskDetections: number;
}

export default function PointsDashboardPage() {
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      // Fetch points balance
      const balanceResponse = await fetch("/api/points/balance", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const balanceData = await balanceResponse.json();

      // Fetch transaction history
      const historyResponse = await fetch("/api/points/history?limit=20", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const historyData = await historyResponse.json();

      // Fetch achievements
      const achievementsResponse = await fetch("/api/achievements", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const achievementsData = await achievementsResponse.json();

      // Fetch analytics
      const analyticsResponse = await fetch("/api/analytics/points", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const analyticsData = await analyticsResponse.json();

      if (balanceData.success) setBalance(balanceData.data);
      if (historyData.success) setTransactions(historyData.data);
      if (achievementsData.success) setAchievements(achievementsData.data);
      if (analyticsData.success) setAnalytics(analyticsData.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "concept-explanation":
        return <Target className="w-4 h-4 text-blue-600" />;
      case "mini-challenge":
        return <Zap className="w-4 h-4 text-yellow-600" />;
      case "code-review":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "peer-help":
        return <Users className="w-4 h-4 text-purple-600" />;
      case "achievement":
        return <Trophy className="w-4 h-4 text-orange-600" />;
      case "conceptual-hints":
        return <Activity className="w-4 h-4 text-red-600" />;
      case "pseudocode-guidance":
        return <BarChart3 className="w-4 h-4 text-indigo-600" />;
      case "code-review-session":
        return <PieChart className="w-4 h-4 text-pink-600" />;
      case "ai-copilot":
        return <Zap className="w-4 h-4 text-cyan-600" />;
      default:
        return <Coins className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "concept-explanation":
        return "bg-blue-100 text-blue-800";
      case "mini-challenge":
        return "bg-yellow-100 text-yellow-800";
      case "code-review":
        return "bg-green-100 text-green-800";
      case "peer-help":
        return "bg-purple-100 text-purple-800";
      case "achievement":
        return "bg-orange-100 text-orange-800";
      case "conceptual-hints":
        return "bg-red-100 text-red-800";
      case "pseudocode-guidance":
        return "bg-indigo-100 text-indigo-800";
      case "code-review-session":
        return "bg-pink-100 text-pink-800";
      case "ai-copilot":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAchievementCategoryIcon = (category: string) => {
    switch (category) {
      case "streak":
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      case "mastery":
        return <Star className="w-5 h-5 text-blue-600" />;
      case "collaboration":
        return <Users className="w-5 h-5 text-green-600" />;
      case "integrity":
        return <Shield className="w-5 h-5 text-purple-600" />;
      case "points":
        return <DollarSign className="w-5 h-5 text-yellow-600" />;
      default:
        return <Award className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Points & Achievements Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your learning progress, points earned, and achievements
            unlocked
          </p>
        </div>

        {/* Points Balance Overview */}
        {balance && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Coins className="w-8 h-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">
                      {balance.currentBalance}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Current Balance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{balance.totalEarned}</p>
                    <p className="text-sm text-muted-foreground">
                      Total Earned
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{balance.dailyEarned}</p>
                    <p className="text-sm text-muted-foreground">
                      Today's Earnings
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">
                      {balance.dailyLimit - balance.dailyEarned}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Remaining Today
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  {balance && (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Points Earned Today</span>
                        <span>
                          {balance.dailyEarned}/{balance.dailyLimit}
                        </span>
                      </div>
                      <Progress
                        value={(balance.dailyEarned / balance.dailyLimit) * 100}
                        className="h-2"
                      />
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          {balance.canEarnMore
                            ? `${
                                balance.dailyLimit - balance.dailyEarned
                              } points remaining`
                            : "Daily limit reached"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements
                      .filter((a) => a.isUnlocked)
                      .slice(0, 3)
                      .map((achievement) => (
                        <div
                          key={achievement.achievementId}
                          className="flex items-center space-x-3 p-3 border rounded-lg"
                        >
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <p className="font-semibold">{achievement.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              +{achievement.points} points
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(transaction.category)}
                            <span className="capitalize">
                              {transaction.type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getCategoryColor(transaction.category)}
                          >
                            {transaction.category.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              transaction.amount > 0
                                ? "text-green-600 font-semibold"
                                : "text-red-600 font-semibold"
                            }
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {transaction.amount}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {transaction.reason}
                        </TableCell>
                        <TableCell>
                          {transaction.qualityScore ? (
                            <div className="flex items-center space-x-1">
                              <span>{transaction.qualityScore}%</span>
                              {transaction.verified ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Achievement Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Achievement Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements
                      .filter((a) => !a.isUnlocked)
                      .slice(0, 5)
                      .map((achievement) => (
                        <div
                          key={achievement.achievementId}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{achievement.icon}</div>
                            <div className="flex-1">
                              <p className="font-semibold">
                                {achievement.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {achievement.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">
                                {achievement.progressPercentage}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {achievement.progress.current || 0}/
                                {achievement.progress.target || 1}
                              </p>
                            </div>
                          </div>
                          <Progress
                            value={achievement.progressPercentage}
                            className="h-2"
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Unlocked Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Unlocked Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements
                      .filter((a) => a.isUnlocked)
                      .map((achievement) => (
                        <div
                          key={achievement.achievementId}
                          className="flex items-center space-x-3 p-3 border rounded-lg bg-green-50"
                        >
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <p className="font-semibold text-green-900">
                              {achievement.name}
                            </p>
                            <p className="text-sm text-green-700">
                              {achievement.description}
                            </p>
                            <p className="text-xs text-green-600">
                              +{achievement.points} points • Unlocked{" "}
                              {achievement.unlockedAt &&
                                new Date(
                                  achievement.unlockedAt
                                ).toLocaleDateString()}
                            </p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievement Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Achievement Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    "streak",
                    "mastery",
                    "collaboration",
                    "integrity",
                    "points",
                  ].map((category) => {
                    const categoryAchievements = achievements.filter(
                      (a) => a.category === category
                    );
                    const unlockedCount = categoryAchievements.filter(
                      (a) => a.isUnlocked
                    ).length;
                    const totalCount = categoryAchievements.length;

                    return (
                      <div key={category} className="text-center">
                        <div className="flex justify-center mb-2">
                          {getAchievementCategoryIcon(category)}
                        </div>
                        <p className="font-semibold capitalize">{category}</p>
                        <p className="text-sm text-muted-foreground">
                          {unlockedCount}/{totalCount}
                        </p>
                        <Progress
                          value={
                            totalCount > 0
                              ? (unlockedCount / totalCount) * 100
                              : 0
                          }
                          className="h-2 mt-2"
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Users</span>
                        <span className="font-semibold">
                          {analytics.totalUsers}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Points in Circulation</span>
                        <span className="font-semibold">
                          {analytics.totalPointsInCirculation.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Points Earned</span>
                        <span className="font-semibold">
                          {analytics.totalPointsEarned.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Points Spent</span>
                        <span className="font-semibold">
                          {analytics.totalPointsSpent.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Fraud Detection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Detections</span>
                        <span className="font-semibold">
                          {analytics.fraudDetections}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>High Risk</span>
                        <span className="font-semibold text-red-600">
                          {analytics.highRiskDetections}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Detection Rate</span>
                        <span className="font-semibold">
                          {analytics.fraudDetections > 0
                            ? Math.round(
                                (analytics.highRiskDetections /
                                  analytics.fraudDetections) *
                                  100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Points System Active</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Achievements System Active</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Fraud Detection Active</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <span>Anti-Gaming Measures Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
