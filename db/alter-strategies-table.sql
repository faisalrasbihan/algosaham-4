-- ============================================
-- ALTER TABLE statements to add missing columns
-- Run these BEFORE seeding the data
-- ============================================

-- Add missing columns to strategies table
ALTER TABLE strategies 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS starting_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS total_returns numeric,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Verify the columns were added
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'strategies' 
-- ORDER BY ordinal_position;

