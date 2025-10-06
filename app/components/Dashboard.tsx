import { Star, CheckCircle, Zap, Clock, Brain, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Assignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  progress: number;
  status: string;
  points: number;
  milestones?: Milestone[];
}

interface Milestone {
  id: number;
  title: string;
  completed: boolean;
  locked?: boolean;
  progress?: number;
  points: number;
}

interface DashboardProps {
  user: {
    name: string;
    points: number;
    level: number;
    streak: number;
  };
  currentAssignment?: Assignment;
  onContinueAssignment?: () => void;
  onRequestAssistance?: () => void;
}

export function Dashboard({
  user,
  currentAssignment,
  onContinueAssignment,
  onRequestAssistance,
}: DashboardProps) {
  const stats = [
    {
      label: "Total Points",
      value: user.points,
      icon: Star,
      color: "text-[#F59E0B]",
      bgColor: "bg-[#FEF3C7]",
    },
    {
      label: "Active Milestones",
      value: "4/5",
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Current Level",
      value: `Level ${user.level}`,
      icon: Zap,
      color: "text-[#7C3AED]",
      bgColor: "bg-[#DDD6FE]",
    },
    {
      label: "AI Assistance",
      value: "2.5 hrs",
      icon: Clock,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-primary to-blue-500 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-primary-foreground/90 mb-6">
          You&apos;re making great progress. Keep up the momentum!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-primary-foreground/80 text-sm mb-1">
              Current Streak
            </div>
            <div className="text-2xl font-bold">{user.streak} days 🔥</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-primary-foreground/80 text-sm mb-1">
              Assignments Complete
            </div>
            <div className="text-2xl font-bold">12/15</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-primary-foreground/80 text-sm mb-1">
              Global Rank
            </div>
            <div className="text-2xl font-bold">#342</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover-elevate cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    This Week
                  </span>
                </div>
                <div
                  className="text-2xl font-bold"
                  data-testid={`stat-${index}`}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Current Assignment</h2>
          {currentAssignment && (
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3
                      className="text-lg font-semibold"
                      data-testid="text-assignment-title"
                    >
                      {currentAssignment.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Due in 3 days • {currentAssignment.course}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-[#FEF3C7] text-[#92400E] rounded-full text-sm font-medium">
                    In Progress
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  {currentAssignment.milestones?.map((milestone) => (
                    <div key={milestone.id} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full ${
                          milestone.completed
                            ? "bg-[#10B981]"
                            : milestone.locked
                            ? "bg-muted"
                            : "bg-primary"
                        } text-white flex items-center justify-center mr-3`}
                      >
                        {milestone.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : milestone.locked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-bold">
                            {milestone.id}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{milestone.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {milestone.completed
                            ? `Completed • +${milestone.points} pts`
                            : milestone.locked
                            ? "Locked • Complete previous milestone"
                            : `In Progress • ${
                                milestone.progress || 0
                              }% complete`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      Overall Progress
                    </span>
                    <span className="font-medium">
                      {currentAssignment.progress}%
                    </span>
                  </div>
                  <Progress
                    value={currentAssignment.progress}
                    className="h-2"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={onContinueAssignment}
                    className="flex-1 bg-gradient-to-r from-primary to-blue-400 hover-elevate"
                    data-testid="button-continue-assignment"
                  >
                    Continue Working
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 hover-elevate"
                    data-testid="button-view-requirements"
                  >
                    View Requirements
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">AI Assistance</h2>
          <Card className="bg-gradient-to-br from-[#EDE9FE] to-blue-100 dark:from-[#7C3AED]/20 dark:to-blue-900/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#7C3AED] rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-[#7C3AED] font-medium">AI Ready</span>
              </div>

              <h3 className="font-semibold mb-2">Available Options</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Conceptual Hint", points: 5 },
                  { label: "Pseudocode Guide", points: 15 },
                  { label: "Code Review", points: 25 },
                ].map((option, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 px-3 bg-background/60 rounded"
                  >
                    <span>{option.label}</span>
                    <span className="font-medium text-[#7C3AED]">
                      {option.points} pts
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={onRequestAssistance}
                className="w-full mt-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                data-testid="button-request-assistance"
              >
                Request Assistance
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
