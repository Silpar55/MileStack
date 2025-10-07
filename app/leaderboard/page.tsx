"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  TrendingUp,
  Users,
  Zap,
  Clock,
  Target,
  Award,
  Flame,
} from "lucide-react";

interface LeaderboardEntry {
  id: string;
  userId: string;
  points: number;
  rank: number;
  challengesSolved: number;
  averageTime: number;
  streak: number;
  longestStreak: number;
  lastSolvedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface CategoryStats {
  totalUsers: number;
  totalPoints: number;
  averagePoints: number;
  totalChallengesSolved: number;
  averageChallengesSolved: number;
}

interface TopPerformer {
  userId: string;
  points?: number;
  challengesSolved?: number;
  longestStreak?: number;
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats | null>(
    null
  );
  const [topPerformers, setTopPerformers] = useState<{
    byPoints: TopPerformer[];
    byChallenges: TopPerformer[];
    byStreak: TopPerformer[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("overall");
  const [sortBy, setSortBy] = useState("points");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          category: selectedCategory,
          sortBy,
          sortOrder,
          limit: "50",
        });

        const response = await fetch(`/api/leaderboard?${params}`);
        const data = await response.json();

        if (response.ok) {
          setLeaderboard(data.leaderboard);
          setCategoryStats(data.stats);
          setTopPerformers(data.topPerformers);
        } else {
          console.error("Failed to fetch leaderboard:", data.error);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedCategory, sortBy, sortOrder]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="text-lg font-bold text-muted-foreground">
            #{rank}
          </span>
        );
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-muted";
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const categories = [
    { value: "overall", label: "Overall" },
    { value: "data-structures", label: "Data Structures" },
    { value: "algorithms", label: "Algorithms" },
    { value: "web-dev", label: "Web Development" },
    { value: "database", label: "Database" },
    { value: "system-design", label: "System Design" },
    { value: "machine-learning", label: "Machine Learning" },
    { value: "security", label: "Security" },
    { value: "mobile-dev", label: "Mobile Development" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            See how you rank against other developers in programming challenges
          </p>
        </div>

        {/* Category and Sort Controls */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Points</SelectItem>
                    <SelectItem value="challengesSolved">Challenges</SelectItem>
                    <SelectItem value="streak">Streak</SelectItem>
                    <SelectItem value="averageTime">Avg Time</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Desc</SelectItem>
                    <SelectItem value="asc">Asc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="achievements">Top Performers</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <Card
                    key={entry.id}
                    className={`transition-all hover:shadow-lg ${
                      index < 3 ? "ring-2 ring-primary/20" : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12">
                          {getRankIcon(entry.rank)}
                        </div>
                        <Avatar className="w-12 h-12">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {entry.user.firstName?.[0]}
                            {entry.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">
                              {entry.user.firstName} {entry.user.lastName}
                            </h3>
                            {index < 3 && (
                              <Badge className={getRankColor(entry.rank)}>
                                #{entry.rank}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {entry.user.email}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">
                                {entry.points.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Points
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-semibold">
                                {entry.challengesSolved}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Solved
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-semibold flex items-center">
                                <Flame className="w-4 h-4 mr-1 text-orange-500" />
                                {entry.streak}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Streak
                              </div>
                            </div>
                            {entry.averageTime && (
                              <div className="text-center">
                                <div className="text-xl font-semibold">
                                  {formatTime(entry.averageTime)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Avg Time
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {categoryStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="w-8 h-8 text-blue-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">
                          {categoryStats.totalUsers}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total Users
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Zap className="w-8 h-8 text-yellow-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">
                          {categoryStats.totalPoints.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total Points
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Target className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">
                          {categoryStats.totalChallengesSolved}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Challenges Solved
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <TrendingUp className="w-8 h-8 text-purple-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">
                          {categoryStats.averagePoints.toFixed(0)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Avg Points
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            {topPerformers && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                      Top by Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topPerformers.byPoints.map((performer, index) => (
                        <div
                          key={performer.userId}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-yellow-600">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {performer.user.firstName}{" "}
                              {performer.user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {performer.points?.toLocaleString()} points
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-green-500" />
                      Top by Challenges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topPerformers.byChallenges.map((performer, index) => (
                        <div
                          key={performer.userId}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-green-600">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {performer.user.firstName}{" "}
                              {performer.user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {performer.challengesSolved} challenges
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Flame className="w-5 h-5 mr-2 text-orange-500" />
                      Top by Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topPerformers.byStreak.map((performer, index) => (
                        <div
                          key={performer.userId}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-orange-600">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {performer.user.firstName}{" "}
                              {performer.user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {performer.longestStreak} day streak
                            </p>
                          </div>
                        </div>
                      ))}
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
