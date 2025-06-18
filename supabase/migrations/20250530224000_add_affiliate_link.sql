-- Add affiliate_link field to partner_card_selections table
-- This allows partners to add their own affiliate links for each card

ALTER TABLE partner_card_selections 
ADD COLUMN affiliate_link TEXT;

-- Add comment for documentation
COMMENT ON COLUMN partner_card_selections.affiliate_link IS 'Partner affiliate link for this specific card';