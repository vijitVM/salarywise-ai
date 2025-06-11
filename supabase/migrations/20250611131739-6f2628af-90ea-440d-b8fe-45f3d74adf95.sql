
-- Add salary_month column to salary_records table
ALTER TABLE salary_records 
ADD COLUMN salary_month TEXT;

-- Update existing records to set salary_month based on received_date
-- This assumes that existing records were received in the same month they were for
UPDATE salary_records 
SET salary_month = TO_CHAR(received_date, 'YYYY-MM')
WHERE salary_month IS NULL;

-- Make salary_month NOT NULL after updating existing records
ALTER TABLE salary_records 
ALTER COLUMN salary_month SET NOT NULL;
