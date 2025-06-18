-- Add sample credit cards for testing
INSERT INTO credit_cards (
  card_name,
  issuer,
  card_image_url,
  annual_fee,
  intro_apr,
  regular_apr,
  intro_bonus,
  bonus_requirement,
  rewards_rate,
  rewards_type,
  key_benefits,
  best_for,
  country,
  created_at,
  updated_at
) VALUES 
(
  'Chase Sapphire Preferred',
  'Chase',
  'https://creditcards.chase.com/K-Marketplace/images/cardart/sapphire_preferred_card.png',
  95,
  '0% for 12 months',
  '20.49% - 27.49% Variable',
  '60,000 bonus points',
  'after you spend $4,000 on purchases in the first 3 months',
  '2X points on travel and dining, 1X on everything else',
  'Travel Rewards',
  ARRAY['No foreign transaction fees', '25% more value when you redeem through Chase Ultimate Rewards', 'Trip cancellation/interruption insurance', 'Primary rental car coverage'],
  'Travel enthusiasts who want premium rewards',
  'US',
  NOW(),
  NOW()
),
(
  'Capital One Venture Rewards',
  'Capital One',
  'https://ecm.capitalone.com/WCM/card/products/venture-card-art.png',
  95,
  '0% for 12 months',
  '19.49% - 29.49% Variable',
  '75,000 miles',
  'after spending $4,000 in the first 3 months',
  '2X miles on every purchase',
  'Travel Rewards',
  ARRAY['No foreign transaction fees', 'Transfer partners with airlines and hotels', 'Global Entry/TSA PreCheck credit', 'Travel accident insurance'],
  'Frequent travelers who want simple earning',
  'US',
  NOW(),
  NOW()
),
(
  'Citi Double Cash',
  'Citi',
  'https://www.citi.com/CRD/images/card-art/double-cash-card.png',
  0,
  '0% for 18 months',
  '18.49% - 28.49% Variable',
  '$200 cash back',
  'after spending $1,500 in the first 6 months',
  '2% cash back on all purchases (1% when you buy, 1% when you pay)',
  'Cash Back',
  ARRAY['No annual fee', 'No category restrictions', 'No rotating categories', 'Balance transfer option'],
  'People who want simple, consistent cash back',
  'US',
  NOW(),
  NOW()
),
(
  'American Express Gold Card',
  'American Express',
  'https://icm.aexp-static.com/Internet/Acquisition/US_en/AppContent/OneSite/category/cardarts/gold-card.png',
  250,
  'N/A',
  '19.49% - 28.49% Variable',
  '60,000 Membership Rewards points',
  'after you spend $4,000 on purchases in the first 6 months',
  '4X points at restaurants, 4X at US supermarkets (up to $25K/year), 3X on flights, 1X everything else',
  'Dining & Grocery Rewards',
  ARRAY['$120 Uber Cash annually', '$120 dining credit annually', 'No foreign transaction fees', 'Purchase protection'],
  'Foodies and frequent diners',
  'US',
  NOW(),
  NOW()
),
(
  'Discover it Cash Back',
  'Discover',
  'https://www.discover.com/content/dam/discover/en_us/credit-cards/card-acquisitions/homepage/cardart/cardart-secured.png',
  0,
  '0% for 14 months',
  '16.49% - 27.49% Variable',
  'Cashback Match',
  'Discover will match all the cash back you earn in your first year',
  '5% cash back on rotating categories (up to $1,500 each quarter), 1% on everything else',
  'Cash Back',
  ARRAY['No annual fee', 'Free FICO credit score', 'Freeze your account instantly', '100% US-based customer service'],
  'People who want rotating bonus categories',
  'US',
  NOW(),
  NOW()
),
(
  'Chase Freedom Unlimited',
  'Chase',
  'https://creditcards.chase.com/K-Marketplace/images/cardart/freedom_unlimited_card.png',
  0,
  '0% for 15 months',
  '19.49% - 28.49% Variable',
  '$200 cash back',
  'after you spend $500 on purchases in the first 3 months',
  '1.5% cash back on all purchases',
  'Cash Back',
  ARRAY['No annual fee', 'No category restrictions', 'Redeem for cash or transfer to travel partners', 'Cell phone protection'],
  'People who want simple, flat-rate cash back',
  'US',
  NOW(),
  NOW()
);

-- Add these cards to all existing partners for testing
INSERT INTO partner_card_selections (
  partner_id,
  credit_card_id,
  affiliate_link,
  custom_description,
  featured,
  priority_order,
  active,
  created_at,
  updated_at
)
SELECT 
  p.id as partner_id,
  cc.id as credit_card_id,
  'https://example.com/apply/' || LOWER(REPLACE(cc.card_name, ' ', '-')) as affiliate_link,
  'Recommended by ' || p.company_name || ' for our customers.' as custom_description,
  CASE 
    WHEN cc.card_name = 'Chase Sapphire Preferred' THEN true
    WHEN cc.card_name = 'Citi Double Cash' THEN true
    ELSE false
  END as featured,
  CASE 
    WHEN cc.card_name = 'Chase Sapphire Preferred' THEN 1
    WHEN cc.card_name = 'Capital One Venture Rewards' THEN 2
    WHEN cc.card_name = 'Citi Double Cash' THEN 3
    WHEN cc.card_name = 'American Express Gold Card' THEN 4
    WHEN cc.card_name = 'Discover it Cash Back' THEN 5
    WHEN cc.card_name = 'Chase Freedom Unlimited' THEN 6
    ELSE 10
  END as priority_order,
  true as active,
  NOW() as created_at,
  NOW() as updated_at
FROM partners p
CROSS JOIN credit_cards cc
WHERE cc.card_name IN (
  'Chase Sapphire Preferred',
  'Capital One Venture Rewards', 
  'Citi Double Cash',
  'American Express Gold Card',
  'Discover it Cash Back',
  'Chase Freedom Unlimited'
)
AND p.portal_subdomain IS NOT NULL
AND p.portal_active = true; 