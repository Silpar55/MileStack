import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface AssignmentCardProps {
  assignment: {
    id: number;
    title: string;
    course: string;
    dueDate: string;
    progress: number;
    status: 'completed' | 'in-progress' | 'not-started';
    points: number;
  };
  onClick?: () => void;
}

export function AssignmentCard({ assignment, onClick }: AssignmentCardProps) {
  const statusConfig = {
    'completed': { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]', label: 'Completed' },
    'in-progress': { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', label: 'In Progress' },
    'not-started': { bg: 'bg-primary/10', text: 'text-primary', label: 'Not Started' },
  };

  const config = statusConfig[assignment.status];

  return (
    <Card
      onClick={onClick}
      className="hover:scale-105 transition-transform cursor-pointer"
      data-testid={`card-assignment-${assignment.id}`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg" data-testid="text-assignment-title">{assignment.title}</h3>
            <p className="text-muted-foreground text-sm">{assignment.course}</p>
          </div>
          <Badge className={`${config.bg} ${config.text} hover-elevate`}>
            {config.label}
          </Badge>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span>{assignment.progress}%</span>
          </div>
          <Progress
            value={assignment.progress}
            className="h-2"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground" data-testid="text-due-date">{assignment.dueDate}</span>
          <span className="text-[#F59E0B] font-medium">+{assignment.points} pts</span>
        </div>
      </CardContent>
    </Card>
  );
}
