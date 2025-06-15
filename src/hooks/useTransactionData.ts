
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string; // This will be mapped from transaction_date
  transaction_date: string; // Original database field
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface NewTransaction {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}

export const useTransactionData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.info('No user found, skipping data fetch');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      // Map transaction_date to date for compatibility
      const mappedTransactions = (data || []).map(transaction => ({
        ...transaction,
        date: transaction.transaction_date
      }));

      setTransactions(mappedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (newTransaction: NewTransaction) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          amount: newTransaction.amount,
          type: newTransaction.type,
          category: newTransaction.category,
          description: newTransaction.description,
          transaction_date: newTransaction.date,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding transaction:', error);
        throw error;
      }

      // Map the new transaction and add to state
      const mappedTransaction = {
        ...data,
        date: data.transaction_date
      };

      setTransactions(prev => [mappedTransaction, ...prev]);
      
      return data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refetch = async () => {
    setLoading(true);
    await fetchTransactions();
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    addTransaction,
    refetch
  };
};
