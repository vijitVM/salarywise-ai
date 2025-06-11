
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SalaryRecord, Profile } from './types';

export const useSalaryData = () => {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch salary records
      const { data: salaryData, error: salaryError } = await supabase
        .from('salary_records')
        .select('*')
        .order('received_date', { ascending: false });

      if (salaryError) throw salaryError;
      setSalaryRecords(salaryData || []);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, expected_monthly_salary')
        .eq('id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addSalaryRecord = async (recordData: {
    amount: number;
    pay_period: string;
    received_date: string;
    description: string | null;
    is_bonus: boolean;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('salary_records')
        .insert({
          user_id: user.id,
          ...recordData,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Salary record added successfully!",
      });

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error adding salary record:', error);
      toast({
        title: "Error",
        description: "Failed to add salary record",
        variant: "destructive",
      });
    }
  };

  const updateExpectedSalary = async (amount: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          expected_monthly_salary: amount,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expected monthly salary updated!",
      });

      fetchData();
    } catch (error) {
      console.error('Error updating expected salary:', error);
      toast({
        title: "Error",
        description: "Failed to update expected salary",
        variant: "destructive",
      });
    }
  };

  return {
    salaryRecords,
    profile,
    loading,
    addSalaryRecord,
    updateExpectedSalary,
    refetch: fetchData,
  };
};
