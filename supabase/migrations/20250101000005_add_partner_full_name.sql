-- Add full_name field to partners table

ALTER TABLE partners ADD COLUMN IF NOT EXISTS full_name TEXT; 