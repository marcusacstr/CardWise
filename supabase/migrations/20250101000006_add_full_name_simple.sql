-- Add full_name column to partners table (simple version)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'partners' 
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE partners ADD COLUMN full_name TEXT;
    END IF;
END $$; 