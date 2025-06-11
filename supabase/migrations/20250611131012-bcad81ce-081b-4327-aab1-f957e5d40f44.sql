
-- Add expected_monthly_salary column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN expected_monthly_salary DECIMAL(12,2) DEFAULT 0;
