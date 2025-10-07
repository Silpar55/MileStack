"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChallengeCard } from "@/components/ChallengeCard";
import { CustomChallengeGenerator } from "@/components/CustomChallengeGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Filter,
  Trophy,
  Clock,
  Users,
  Star,
  TrendingUp,
  Zap,
  Brain,
  Plus,
  Sparkles,
} from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  subcategory?: string;
  points: number;
  timeLimit?: number;
  memoryLimit?: number;
  tags: string[];
  rating: number;
  ratingCount: number;
  submissionCount: number;
  solvedCount: number;
  createdAt: string;
  userProgress?: {
    status: string;
    attempts: number;
    bestScore: number;
    timeSpent: number;
  };
}

interface CategoryStats {
  category: string;
  count: number;
  avgRating: number;
  avgPoints: number;
}

export default function ChallengeLibraryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCustomGenerator, setShowCustomGenerator] = useState(false);

  // Fetch challenges from API
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
          sortBy,
          sortOrder,
        });

        if (categoryFilter !== "all") {
          params.append("category", categoryFilter);
        }
        if (difficultyFilter !== "all") {
          params.append("difficulty", difficultyFilter);
        }

        const response = await fetch(`/api/challenges?${params}`);
        const data = await response.json();

        if (response.ok) {
          setChallenges(data.challenges);
          setCategoryStats(data.categoryStats);
          setTotalPages(data.pagination.totalPages);
        } else {
          console.error("Failed to fetch challenges:", data.error);
        }
      } catch (error) {
        console.error("Error fetching challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [page, categoryFilter, difficultyFilter, sortBy, sortOrder]);

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch =
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesDifficulty =
      difficultyFilter === "all" ||
      challenge.difficulty.toLowerCase() === difficultyFilter;

    const matchesCategory =
      categoryFilter === "all" || challenge.category === categoryFilter;

    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      case "expert":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "not-started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleChallengeClick = (challengeId: string) => {
    router.push(`/challenge/${challengeId}`);
  };

  const handleGenerateCustom = () => {
    setShowCustomGenerator(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Challenge Library</h1>
              <p className="text-muted-foreground">
                Practice your skills with coding challenges and earn points
              </p>
            </div>
            <CustomChallengeGenerator
              onChallengeGenerated={(challenge) => {
                console.log("Generated challenge:", challenge);
                // Optionally refresh the challenge list or navigate to the new challenge
              }}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">342</p>
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
                <Clock className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">24h</p>
                  <p className="text-sm text-muted-foreground">Time Invested</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">#342</p>
                  <p className="text-sm text-muted-foreground">Global Rank</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">8,420</p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Tabs */}
        <Tabs defaultValue="browse" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Challenges</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search challenges..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Select
                      value={difficultyFilter}
                      onValueChange={setDifficultyFilter}
                    >
                      <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="data-structures">
                          Data Structures
                        </SelectItem>
                        <SelectItem value="algorithms">Algorithms</SelectItem>
                        <SelectItem value="web-dev">Web Development</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="system-design">
                          System Design
                        </SelectItem>
                        <SelectItem value="machine-learning">
                          Machine Learning
                        </SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="mobile-dev">
                          Mobile Development
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Newest</SelectItem>
                        <SelectItem value="points">Points</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="solvedCount">Most Solved</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Trending Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {challenges
                    .sort((a, b) => b.solvedCount - a.solvedCount)
                    .slice(0, 6)
                    .map((challenge) => (
                      <Card
                        key={challenge.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleChallengeClick(challenge.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-sm">
                              {challenge.title}
                            </h3>
                            <Badge
                              className={getDifficultyColor(
                                challenge.difficulty
                              )}
                            >
                              {challenge.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {challenge.description}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-primary font-medium">
                              {challenge.points} pts
                            </span>
                            <span className="text-muted-foreground">
                              {challenge.solvedCount} solved
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryStats.map((stat) => (
                <Card
                  key={stat.category}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold capitalize">
                        {stat.category.replace("-", " ")}
                      </h3>
                      <Badge variant="outline">{stat.count} challenges</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Avg Rating:
                        </span>
                        <span className="font-medium">
                          {stat.avgRating.toFixed(1)} ⭐
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Avg Points:
                        </span>
                        <span className="font-medium">
                          {Math.round(stat.avgPoints)} pts
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => {
                        setCategoryFilter(stat.category);
                        // Switch to browse tab
                      }}
                    >
                      View Challenges
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Challenge Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <Card
                key={challenge.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleChallengeClick(challenge.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {challenge.title}
                    </CardTitle>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {challenge.description}
                  </p>
                  {challenge.userProgress && (
                    <div className="mt-2">
                      <Badge
                        className={getStatusColor(
                          challenge.userProgress.status
                        )}
                      >
                        {challenge.userProgress.status}
                      </Badge>
                      {challenge.userProgress.status === "in-progress" && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>
                              {challenge.userProgress.attempts} attempts
                            </span>
                          </div>
                          <Progress
                            value={
                              (challenge.userProgress.bestScore /
                                challenge.points) *
                              100
                            }
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium capitalize">
                        {challenge.category.replace("-", " ")}
                      </span>
                    </div>
                    {challenge.timeLimit && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Time Limit:
                        </span>
                        <span className="font-medium">
                          {Math.floor(challenge.timeLimit / 60)} min
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Points:</span>
                      <span className="font-medium text-primary">
                        {challenge.points} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Solved by:</span>
                      <span className="font-medium">
                        {challenge.solvedCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rating:</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        <span className="font-medium">
                          {challenge.rating.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          ({challenge.ratingCount})
                        </span>
                      </div>
                    </div>
                    {challenge.tags && challenge.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {challenge.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {challenge.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{challenge.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-blue-400 hover:from-primary/90 hover:to-blue-400/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChallengeClick(challenge.id);
                      }}
                    >
                      {challenge.userProgress?.status === "completed"
                        ? "Review Solution"
                        : challenge.userProgress?.status === "in-progress"
                        ? "Continue"
                        : "Start Challenge"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {filteredChallenges.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No challenges found matching your criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
