import { Users, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ChallengeCardProps {
  challenge: {
    id: number;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Special';
    points: number;
    solved: number;
    description: string;
  };
  onStart?: () => void;
}

export function ChallengeCard({ challenge, onStart }: ChallengeCardProps) {
  const difficultyConfig = {
    Easy: { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]' },
    Medium: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' },
    Hard: { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]' },
    Special: { bg: 'bg-[#EDE9FE]', text: 'text-[#5B21B6]' },
  };

  const config = difficultyConfig[challenge.difficulty];

  return (
    <Card className="hover:scale-105 transition-transform cursor-pointer" data-testid={`card-challenge-${challenge.id}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${config.bg} ${config.text}`}>
            {challenge.difficulty}
          </Badge>
          <span className="text-[#F59E0B] font-bold">+{challenge.points} pts</span>
        </div>
        
        <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{challenge.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-1" />
            <span>{challenge.solved.toLocaleString()} solved</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onStart}
            className="text-primary font-medium hover-elevate"
            data-testid="button-start-challenge"
          >
            Start <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
