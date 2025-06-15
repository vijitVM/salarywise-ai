
import { Trophy, Star, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'streak' | 'goal' | 'growth';
  isUnlocked: boolean;
  unlockedAt?: Date;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

export const AchievementBadge = ({ achievement, size = 'md' }: AchievementBadgeProps) => {
  const icons = {
    milestone: Trophy,
    streak: Star,
    goal: Target,
    growth: TrendingUp
  };

  const colors = {
    milestone: 'from-yellow-400 to-orange-500',
    streak: 'from-purple-400 to-pink-500',
    goal: 'from-green-400 to-blue-500',
    growth: 'from-blue-400 to-indigo-500'
  };

  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const Icon = icons[achievement.type];

  return (
    <Card className={cn(
      "transition-all duration-300 hover-lift",
      achievement.isUnlocked ? "opacity-100" : "opacity-50 grayscale"
    )}>
      <CardContent className="p-4 text-center">
        <div className={cn(
          "mx-auto rounded-full bg-gradient-to-r mb-3 flex items-center justify-center",
          sizes[size],
          achievement.isUnlocked ? colors[achievement.type] : "from-gray-300 to-gray-400"
        )}>
          <Icon className={cn(
            "text-white",
            size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8'
          )} />
        </div>
        <h4 className="font-semibold text-sm">{achievement.title}</h4>
        <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
        {achievement.isUnlocked && achievement.unlockedAt && (
          <p className="text-xs text-primary mt-2">
            Unlocked {achievement.unlockedAt.toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
