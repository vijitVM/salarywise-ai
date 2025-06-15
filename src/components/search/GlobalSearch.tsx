
import { useState, useEffect } from 'react';
import { Search, X, Calendar, DollarSign, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useSalaryData } from '@/components/dashboard/salary/useSalaryData';

interface SearchResult {
  id: string;
  type: 'salary' | 'transaction' | 'goal';
  title: string;
  subtitle: string;
  amount?: number;
  date?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const { salaryRecords } = useSalaryData();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];

    // Search salary records
    salaryRecords
      .filter(record => 
        record.description?.toLowerCase().includes(query.toLowerCase()) ||
        record.amount.toString().includes(query) ||
        record.salary_month.includes(query)
      )
      .forEach(record => {
        searchResults.push({
          id: record.id,
          type: 'salary',
          title: record.description || 'Salary Payment',
          subtitle: `${record.salary_month} - ${record.pay_period}`,
          amount: record.amount,
          date: record.received_date
        });
      });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
  }, [query, salaryRecords]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'salary': return DollarSign;
      case 'transaction': return Calendar;
      case 'goal': return Target;
      default: return Search;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-2xl mx-4 animate-scale-in">
        <CardContent className="p-0">
          <div className="flex items-center border-b px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground mr-3" />
            <Input
              placeholder="Search salary records, transactions, goals..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 text-base"
              autoFocus
            />
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {results.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              {results.map((result) => {
                const Icon = getIcon(result.type);
                return (
                  <div
                    key={result.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                    </div>
                    {result.amount && (
                      <span className="font-mono text-sm font-medium">
                        ${result.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {query && results.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
