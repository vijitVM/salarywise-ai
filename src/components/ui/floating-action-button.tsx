
import { useState } from 'react';
import { Plus, DollarSign, Target, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FABAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
}

export const FloatingActionButton = ({ actions }: FloatingActionButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Action buttons */}
      <div className={cn(
        "flex flex-col gap-3 mb-3 transition-all duration-300 ease-out",
        isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      )}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {action.label}
              </span>
              <Button
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg hover-lift",
                  action.color || "bg-blue-600 hover:bg-blue-700"
                )}
                onClick={() => {
                  action.onClick();
                  setIsExpanded(false);
                }}
              >
                <Icon className="h-5 w-5 text-white" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Main FAB */}
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover-lift"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  );
};
