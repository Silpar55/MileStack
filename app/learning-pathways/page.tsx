"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Target,
  CheckCircle,
  Lock,
  Play,
  Trophy,
  Users,
  Star,
  TrendingUp,
  Brain,
  Code,
  Database,
  Shield,
  Smartphone,
} from "lucide-react";

interface LearningPathway {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  totalPoints: number;
  estimatedDuration: number;
  totalCheckpoints: number;
  userProgress?: {
    status: string;
    completedCheckpoints: number;
    totalPoints: number;
    timeSpent: number;
    startedAt: string;
    completedAt: string;
    lastAccessedAt: string;
  };
  isStarted: boolean;
  isCompleted: boolean;
  progressPercentage: number;
  createdAt: string;
}

interface CategoryStats {
  category: string;
  count: number;
  avgPoints: number;
  avgDuration: number;
}

export default function LearningPathwaysPage() {
  const router = useRouter();
  const [pathways, setPathways] = useState<LearningPathway[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPathways();
  }, [searchTerm, categoryFilter, difficultyFilter, sortBy, sortOrder, page]);

  const fetchPathways = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: "current-user-id", // This would come from auth context
        category: categoryFilter,
        difficulty: difficultyFilter,
        search: searchTerm,
        page: page.toString(),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/learning-pathways?${params}`);
      const data = await response.json();

      if (data.success) {
        setPathways(data.data.pathways);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching pathways:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-orange-100 text-orange-800";
      case "expert":
        return "bg-red-100 text-red-800";
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "data-structures":
        return <Database className="w-5 h-5" />;
      case "algorithms":
        return <Code className="w-5 h-5" />;
      case "web-dev":
        return <BookOpen className="w-5 h-5" />;
      case "database":
        return <Database className="w-5 h-5" />;
      case "system-design":
        return <Target className="w-5 h-5" />;
      case "machine-learning":
        return <Brain className="w-5 h-5" />;
      case "security":
        return <Shield className="w-5 h-5" />;
      case "mobile-dev":
        return <Smartphone className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const handlePathwayClick = (pathwayId: string) => {
    router.push(`/learning-pathway/${pathwayId}`);
  };

  const filteredPathways = pathways.filter((pathway) => {
    const matchesSearch =
      pathway.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pathway.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || pathway.category === categoryFilter;
    const matchesDifficulty =
      difficultyFilter === "all" || pathway.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Learning Pathways</h1>
          <p className="text-muted-foreground">
            Master programming concepts through structured learning paths with
            competency verification
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{pathways.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Total Pathways
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
                    {pathways.filter((p) => p.isCompleted).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
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
                    {
                      pathways.filter((p) => p.isStarted && !p.isCompleted)
                        .length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {pathways.reduce(
                      (sum, p) => sum + (p.userProgress?.totalPoints || 0),
                      0
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">Points Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Pathways</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search pathways..."
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
                        <SelectItem value="createdAt">Date Created</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="difficulty">Difficulty</SelectItem>
                        <SelectItem value="totalPoints">Points</SelectItem>
                        <SelectItem value="estimatedDuration">
                          Duration
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pathways Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                : filteredPathways.map((pathway) => (
                    <Card
                      key={pathway.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handlePathwayClick(pathway.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg line-clamp-2">
                            {pathway.title}
                          </CardTitle>
                          <Badge
                            className={getDifficultyColor(pathway.difficulty)}
                          >
                            {pathway.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          {getCategoryIcon(pathway.category)}
                          <span className="capitalize">
                            {pathway.category.replace("-", " ")}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {pathway.description}
                        </p>

                        {pathway.userProgress && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>
                                {pathway.userProgress.completedCheckpoints}/
                                {pathway.totalCheckpoints} checkpoints
                              </span>
                            </div>
                            <Progress
                              value={pathway.progressPercentage}
                              className="h-2"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Target className="w-4 h-4 text-primary mr-1" />
                              <span>{pathway.totalPoints} pts</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-muted-foreground mr-1" />
                              <span>{pathway.estimatedDuration}h</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-muted-foreground mr-1" />
                            <span>{pathway.totalCheckpoints}</span>
                          </div>
                        </div>

                        {pathway.userProgress && (
                          <div className="mb-4">
                            <Badge
                              className={getStatusColor(
                                pathway.userProgress.status
                              )}
                            >
                              {pathway.userProgress.status}
                            </Badge>
                          </div>
                        )}

                        <Button
                          className="w-full"
                          variant={pathway.isCompleted ? "outline" : "default"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePathwayClick(pathway.id);
                          }}
                        >
                          {pathway.isCompleted ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Review
                            </>
                          ) : pathway.isStarted ? (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Continue
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Start Pathway
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pathways
                    .filter((p) => p.isStarted)
                    .map((pathway) => (
                      <div
                        key={pathway.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{pathway.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {pathway.userProgress?.completedCheckpoints}/
                            {pathway.totalCheckpoints} checkpoints completed
                          </p>
                          <Progress
                            value={pathway.progressPercentage}
                            className="h-2 mt-2"
                          />
                        </div>
                        <div className="text-right">
                          <Badge
                            className={getStatusColor(
                              pathway.userProgress?.status || "not-started"
                            )}
                          >
                            {pathway.userProgress?.status || "not-started"}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {pathway.userProgress?.totalPoints || 0} points
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pathway Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      category: "data-structures",
                      name: "Data Structures",
                      icon: Database,
                    },
                    { category: "algorithms", name: "Algorithms", icon: Code },
                    {
                      category: "web-dev",
                      name: "Web Development",
                      icon: BookOpen,
                    },
                    { category: "database", name: "Database", icon: Database },
                    {
                      category: "system-design",
                      name: "System Design",
                      icon: Target,
                    },
                    {
                      category: "machine-learning",
                      name: "Machine Learning",
                      icon: Brain,
                    },
                    { category: "security", name: "Security", icon: Shield },
                    {
                      category: "mobile-dev",
                      name: "Mobile Development",
                      icon: Smartphone,
                    },
                  ].map((cat) => {
                    const count = pathways.filter(
                      (p) => p.category === cat.category
                    ).length;
                    const Icon = cat.icon;
                    return (
                      <div
                        key={cat.category}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setCategoryFilter(cat.category)}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-6 h-6 text-primary" />
                          <div>
                            <h3 className="font-semibold">{cat.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {count} pathways
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
