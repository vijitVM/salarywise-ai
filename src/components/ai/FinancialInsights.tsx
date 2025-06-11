
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Insight {
  type: 'positive' | 'warning' | 'suggestion';
  title: string;
  description: string;
  metric?: string;
}

export const FinancialInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      case 'suggestion':
        return <TrendingUp className="h-3 w-3 text-blue-600" />;
      default:
        return <Brain className="h-3 w-3" />;
    }
  };

  const getInsightBadgeVariant = (type: string) => {
    switch (type) {
      case 'positive':
        return 'default';
      case 'warning':
        return 'destructive';
      case 'suggestion':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const generateInsights = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-insights', {
        body: { userId: user.id }
      });

      if (error) throw error;

      setInsights(data.insights);
      setLastUpdated(new Date());
      
      toast({
        title: "Insights Updated",
        description: `Generated ${data.insights.length} new insights`,
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, [user]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <div>
            <h3 className="font-semibold text-sm">AI Financial Insights</h3>
            <p className="text-xs text-muted-foreground">
              Personalized analysis of your financial patterns
            </p>
          </div>
        </div>
        <Button 
          onClick={generateInsights}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="h-7 px-2"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
        </Button>
      </div>
      
      {lastUpdated && (
        <p className="text-xs text-muted-foreground">
          Last updated: {lastUpdated.toLocaleString()}
        </p>
      )}

      {insights.length === 0 && !isLoading ? (
        <div className="text-center py-6 text-muted-foreground">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No insights available yet</p>
          <p className="text-xs">Click refresh to generate AI insights</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex gap-2 p-2 rounded-lg border">
              <div className="flex-shrink-0 mt-0.5">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-xs">{insight.title}</h4>
                  <Badge 
                    variant={getInsightBadgeVariant(insight.type)}
                    className="text-xs px-1 py-0"
                  >
                    {insight.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {insight.description}
                </p>
                {insight.metric && (
                  <p className="text-xs font-mono text-primary">
                    {insight.metric}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
