import { Star, CheckCircle, Zap, Clock, Brain, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  progress: number;
  status: string;
  points: number;
  milestones?: Milestone[];
}

interface Milestone {
  id: string;
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
    globalRank: number;
  };
  assignments?: Assignment[];
  onContinueAssignment?: (assignmentId: string) => void;
  onViewRequirements?: (assignmentId: string) => void;
  onUploadAssignment?: () => void;
  onRequestAssistance?: () => void;
}

export function Dashboard({
  user,
  assignments = [],
  onContinueAssignment,
  onViewRequirements,
  onUploadAssignment,
  onRequestAssistance,
}: DashboardProps) {
  // Function to find the current milestone for an assignment
  const getCurrentMilestone = (assignment: Assignment) => {
    if (!assignment.milestones || assignment.milestones.length === 0) {
      return null;
    }

    // Find the first non-completed milestone
    const availableMilestone = assignment.milestones.find(
      (milestone) => !milestone.completed && !milestone.locked
    );

    return availableMilestone || null;
  };

  // Calculate stats from assignments data
  const totalMilestones = assignments.reduce(
    (sum, assignment) => sum + (assignment.milestones?.length || 0),
    0
  );
  const completedMilestones = assignments.reduce(
    (sum, assignment) =>
      sum + (assignment.milestones?.filter((m) => m.completed).length || 0),
    0
  );
  const activeAssignments = assignments.filter(
    (a) => a.status === "in-progress"
  ).length;
  const completedAssignments = assignments.filter(
    (a) => a.status === "completed"
  ).length;

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
      value: `${completedMilestones}/${totalMilestones}`,
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
      label: "Active Assignments",
      value: activeAssignments,
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
            <div className="text-2xl font-bold">
              {completedAssignments}/{assignments.length}
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-primary-foreground/80 text-sm mb-1">
              Global Rank
            </div>
            <div className="text-2xl font-bold">#{user.globalRank}</div>
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
          <h2 className="text-xl font-bold mb-4">Your Assignments</h2>
          {assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3
                          className="text-lg font-semibold"
                          data-testid="text-assignment-title"
                        >
                          {assignment.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          {assignment.dueDate} • {assignment.course}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          assignment.status === "completed"
                            ? "bg-[#D1FAE5] text-[#065F46]"
                            : assignment.status === "in-progress"
                            ? "bg-[#FEF3C7] text-[#92400E]"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {assignment.status === "completed"
                          ? "Completed"
                          : assignment.status === "in-progress"
                          ? "In Progress"
                          : "Not Started"}
                      </span>
                    </div>

                    {assignment.milestones &&
                      assignment.milestones.length > 0 && (
                        <>
                          <div className="space-y-3 mb-6">
                            {assignment.milestones.map((milestone) => (
                              <div
                                key={milestone.id}
                                className="flex items-center"
                              >
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
                                      {(assignment.milestones?.indexOf(
                                        milestone
                                      ) ?? -1) + 1}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {milestone.title}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {milestone.completed
                                      ? `Completed • +${milestone.points} pts`
                                      : milestone.locked
                                      ? "Locked • Complete previous milestone"
                                      : `Available • ${milestone.points} pts`}
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
                                {assignment.progress}%
                              </span>
                            </div>
                            <Progress
                              value={assignment.progress}
                              className="h-2"
                            />
                          </div>
                        </>
                      )}

                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          if (assignment.status === "completed") {
                            onContinueAssignment?.(assignment.id);
                          } else {
                            const currentMilestone =
                              getCurrentMilestone(assignment);
                            if (currentMilestone) {
                              onContinueAssignment?.(currentMilestone.id);
                            } else {
                              onContinueAssignment?.(assignment.id);
                            }
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-primary to-blue-400 hover-elevate"
                        data-testid="button-continue-assignment"
                        disabled={assignment.status === "completed"}
                      >
                        {assignment.status === "completed"
                          ? "View Details"
                          : "Continue Working"}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 hover-elevate"
                        data-testid="button-view-requirements"
                        onClick={() => onViewRequirements?.(assignment.id)}
                      >
                        View Requirements
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground mb-4">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Assignments Yet
                  </h3>
                  <p>
                    Upload your first assignment to get started with
                    personalized learning milestones!
                  </p>
                </div>
                <Button
                  className="bg-gradient-to-r from-primary to-blue-400 hover-elevate"
                  onClick={() => onUploadAssignment?.()}
                >
                  Upload Assignment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
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
                    {
                      label: "Conceptual Hint",
                      points: 5,
                      description: "Get a gentle nudge",
                    },
                    {
                      label: "Pseudocode Guide",
                      points: 15,
                      description: "Step-by-step approach",
                    },
                    {
                      label: "Code Review",
                      points: 25,
                      description: "Detailed feedback",
                    },
                  ].map((option, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center py-2 px-3 bg-background/60 rounded hover:bg-background/80 transition-colors"
                    >
                      <div>
                        <span className="font-medium">{option.label}</span>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
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

          {/* Quick Stats Card */}
          <div>
            <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Total Assignments
                    </span>
                    <span className="font-semibold">{assignments.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-semibold text-green-600">
                      {completedAssignments}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">In Progress</span>
                    <span className="font-semibold text-blue-600">
                      {activeAssignments}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Total Points Available
                    </span>
                    <span className="font-semibold">
                      {assignments.reduce((sum, a) => sum + a.points, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {assignments
                    .filter(
                      (a) =>
                        a.status === "in-progress" || a.status === "completed"
                    )
                    .slice(0, 3)
                    .map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center space-x-3"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            assignment.status === "completed"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {assignment.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.status === "completed"
                              ? "Completed"
                              : `${assignment.progress}% complete`}
                          </p>
                        </div>
                      </div>
                    ))}
                  {assignments.filter(
                    (a) =>
                      a.status === "in-progress" || a.status === "completed"
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
