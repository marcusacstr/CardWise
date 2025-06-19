-- Add country column to credit_cards table
ALTER TABLE credit_cards 
ADD COLUMN IF NOT EXISTS country VARCHAR(50) DEFAULT 'Canada';

-- Update existing cards to have a default country
UPDATE credit_cards 
SET country = CASE 
  WHEN issuer IN ('Chase', 'Citi', 'Capital One', 'Discover', 'Bank of America', 'Wells Fargo') THEN 'United States'
  WHEN issuer IN ('TD', 'RBC', 'BMO', 'Scotiabank') THEN 'Canada'
  ELSE 'Canada'
END
WHERE country IS NULL OR country = 'Canada'; 