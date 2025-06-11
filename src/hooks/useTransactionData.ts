
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string | null;
  transaction_date: string;
}

export const useTransactionData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      
      // Type cast the data to ensure type safety
      const typedTransactions = (data || []).map(item => ({
        id: item.id,
        amount: item.amount,
        type: item.type as 'income' | 'expense',
        category: item.category,
        description: item.description,
        transaction_date: item.transaction_date,
      }));
      
      setTransactions(typedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user?.id]);

  return {
    transactions,
    loading,
    refetch: fetchTransactions,
  };
};
