"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, Lock, ArrowRight } from "lucide-react";

export default function PathwayPage() {
  const learningPath = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      description: "Master the basics of HTML, CSS, and JavaScript",
      progress: 100,
      status: "completed",
      modules: [
        { id: 1, title: "HTML Basics", completed: true, points: 50 },
        { id: 2, title: "CSS Styling", completed: true, points: 60 },
        {
          id: 3,
          title: "JavaScript Fundamentals",
          completed: true,
          points: 80,
        },
      ],
    },
    {
      id: 2,
      title: "React Development",
      description: "Build dynamic user interfaces with React",
      progress: 60,
      status: "in-progress",
      modules: [
        { id: 1, title: "React Components", completed: true, points: 40 },
        { id: 2, title: "State Management", completed: false, points: 50 },
        {
          id: 3,
          title: "Hooks and Effects",
          completed: false,
          locked: true,
          points: 60,
        },
      ],
    },
    {
      id: 3,
      title: "Backend Development",
      description: "Learn server-side programming and databases",
      progress: 0,
      status: "locked",
      modules: [
        {
          id: 1,
          title: "Node.js Basics",
          completed: false,
          locked: true,
          points: 70,
        },
        {
          id: 2,
          title: "Database Design",
          completed: false,
          locked: true,
          points: 80,
        },
        {
          id: 3,
          title: "API Development",
          completed: false,
          locked: true,
          points: 90,
        },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "locked":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Learning Pathway</h1>
          <p className="text-muted-foreground">
            Follow your personalized learning journey to master new skills
          </p>
        </div>

        <div className="space-y-6">
          {learningPath.map((path, index) => (
            <Card key={path.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{path.title}</CardTitle>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {path.description}
                    </p>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(path.status)}>
                        {path.status === "completed"
                          ? "Completed"
                          : path.status === "in-progress"
                          ? "In Progress"
                          : "Locked"}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Target className="w-4 h-4 mr-1" />
                        {path.modules.length} modules
                      </div>
                    </div>
                  </div>
                  {path.status === "in-progress" && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-primary to-blue-400"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{path.progress}%</span>
                    </div>
                    <Progress value={path.progress} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    {path.modules.map((module) => (
                      <div
                        key={module.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3">
                            {module.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : module.locked ? (
                              <Lock className="w-4 h-4 text-gray-400" />
                            ) : (
                              <div className="w-4 h-4 border-2 border-primary rounded-full" />
                            )}
                          </div>
                          <span
                            className={
                              module.locked ? "text-muted-foreground" : ""
                            }
                          >
                            {module.title}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {module.points} pts
                          </span>
                          {module.completed && (
                            <Badge variant="outline" className="text-green-600">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Learning Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-2">2</div>
              <p className="text-sm text-muted-foreground">
                Pathways Completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">15</div>
              <p className="text-sm text-muted-foreground">Modules Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                1,250
              </div>
              <p className="text-sm text-muted-foreground">Points Earned</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

