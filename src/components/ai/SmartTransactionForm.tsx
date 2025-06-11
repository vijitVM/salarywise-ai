
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SmartTransactionFormProps {
  onCategoryGenerated: (category: string) => void;
  currentDescription: string;
  currentAmount: string;
  currentType: 'income' | 'expense';
}

export const SmartTransactionForm = ({ 
  onCategoryGenerated, 
  currentDescription, 
  currentAmount,
  currentType 
}: SmartTransactionFormProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string>('');
  const { toast } = useToast();

  const generateCategory = async () => {
    if (!currentDescription.trim() || !currentAmount.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both description and amount first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('categorize-expense', {
        body: {
          description: currentDescription,
          amount: parseFloat(currentAmount),
          type: currentType
        }
      });

      if (error) throw error;

      setSuggestedCategory(data.category);
      onCategoryGenerated(data.category);
      
      toast({
        title: "Category Generated",
        description: `AI suggested: ${data.category}`,
      });
    } catch (error) {
      console.error('Error generating category:', error);
      toast({
        title: "Error",
        description: "Failed to generate category suggestion.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const acceptSuggestion = () => {
    onCategoryGenerated(suggestedCategory);
    setSuggestedCategory('');
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Smart Categorization
        </CardTitle>
        <CardDescription className="text-xs">
          Let AI automatically categorize your {currentType} based on the description
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={generateCategory}
          disabled={isGenerating || !currentDescription.trim() || !currentAmount.trim()}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Category
            </>
          )}
        </Button>

        {suggestedCategory && (
          <div className="space-y-2">
            <Label className="text-xs">AI Suggestion:</Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {suggestedCategory}
              </Badge>
              <Button
                onClick={acceptSuggestion}
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
              >
                Use This
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
