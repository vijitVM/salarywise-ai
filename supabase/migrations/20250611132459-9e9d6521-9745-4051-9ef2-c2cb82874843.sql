
-- Create a table to track expected salary per month
CREATE TABLE public.monthly_expected_salaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM'
  expected_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.monthly_expected_salaries ENABLE ROW LEVEL SECURITY;

-- Create policies for monthly expected salaries
CREATE POLICY "Users can view their own monthly expected salaries" 
  ON public.monthly_expected_salaries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own monthly expected salaries" 
  ON public.monthly_expected_salaries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly expected salaries" 
  ON public.monthly_expected_salaries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly expected salaries" 
  ON public.monthly_expected_salaries 
  FOR DELETE 
  USING (auth.uid() = user_id);
