import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, CheckCircle, AlertCircle, Trash2 } from "lucide-react";

interface AssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    course: string;
    dueDate: string;
    progress: number;
    status: "completed" | "in-progress" | "not-started";
    points: number;
    analysisStatus?: "pending" | "processing" | "complete" | "failed";
  };
  onClick?: () => void;
  onDelete?: (assignmentId: string, assignmentTitle: string) => void;
}

export function AssignmentCard({
  assignment,
  onClick,
  onDelete,
}: AssignmentCardProps) {
  const statusConfig = {
    completed: {
      bg: "bg-[#D1FAE5]",
      text: "text-[#065F46]",
      label: "Completed",
    },
    "in-progress": {
      bg: "bg-[#FEF3C7]",
      text: "text-[#92400E]",
      label: "In Progress",
    },
    "not-started": {
      bg: "bg-primary/10",
      text: "text-primary",
      label: "Not Started",
    },
  };

  const config = statusConfig[assignment.status];

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when delete button is clicked
    onDelete?.(assignment.id, assignment.title);
  };

  return (
    <Card
      onClick={onClick}
      className="hover:scale-105 transition-transform cursor-pointer relative group"
      data-testid={`card-assignment-${assignment.id}`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3
              className="font-semibold text-lg"
              data-testid="text-assignment-title"
            >
              {assignment.title}
            </h3>
            <p className="text-muted-foreground text-sm">{assignment.course}</p>
            {assignment.analysisStatus && (
              <div className="flex items-center mt-1">
                {assignment.analysisStatus === "pending" && (
                  <Badge variant="outline" className="text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    Ready for Analysis
                  </Badge>
                )}
                {assignment.analysisStatus === "processing" && (
                  <Badge variant="outline" className="text-xs">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Analyzing...
                  </Badge>
                )}
                {assignment.analysisStatus === "complete" && (
                  <Badge variant="outline" className="text-xs text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Analysis Complete
                  </Badge>
                )}
                {assignment.analysisStatus === "failed" && (
                  <Badge variant="outline" className="text-xs text-red-600">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Analysis Failed
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${config.bg} ${config.text} hover-elevate`}>
              {config.label}
            </Badge>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                data-testid={`delete-assignment-${assignment.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span>{assignment.progress}%</span>
          </div>
          <Progress value={assignment.progress} className="h-2" />
        </div>

        <div className="flex justify-between items-center">
          <span
            className="text-sm text-muted-foreground"
            data-testid="text-due-date"
          >
            {assignment.dueDate}
          </span>
          <span className="text-[#F59E0B] font-medium">
            +{assignment.points} pts
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
