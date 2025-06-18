-- Comprehensive seed data for CardWise production environment
-- This script populates the database with realistic data for testing and development

-- First, let's insert some sample credit cards
INSERT INTO credit_cards (
  id, name, issuer, card_network, annual_fee, credit_score_requirement,
  welcome_bonus, welcome_bonus_requirements, foreign_transaction_fee,
  base_earn_rate, groceries_earn_rate, dining_earn_rate, travel_earn_rate, gas_earn_rate,
  groceries_cap, dining_cap, travel_cap, gas_cap,
  groceries_cap_frequency, dining_cap_frequency, travel_cap_frequency, gas_cap_frequency,
  reward_type, point_value, benefits, image_url, application_url, country, is_active
) VALUES 
  (
    gen_random_uuid(), 'Chase Sapphire Preferred', 'Chase', 'Visa', 95.00, 'Good',
    '80,000 bonus points', 'Spend $4,000 in first 3 months', 0.00,
    1.00, 1.00, 2.00, 2.00, 1.00,
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    'points', 1.25, '{"travel_insurance": true, "purchase_protection": true, "extended_warranty": true}',
    '/images/cards/chase-sapphire-preferred.jpg', 'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred', 'US', true
  ),
  (
    gen_random_uuid(), 'American Express Gold Card', 'American Express', 'American Express', 250.00, 'Good',
    '90,000 Membership Rewards points', 'Spend $4,000 in first 6 months', 0.00,
    1.00, 4.00, 4.00, 3.00, 1.00,
    25000.00, 25000.00, NULL, NULL,
    'annually', 'annually', NULL, NULL,
    'points', 1.00, '{"dining_credits": "$120 annually", "uber_credits": "$120 annually", "airline_fee_credit": "$100 annually"}',
    '/images/cards/amex-gold.jpg', 'https://www.americanexpress.com/us/credit-cards/card/gold-card/', 'US', true
  ),
  (
    gen_random_uuid(), 'Capital One Venture X', 'Capital One', 'Visa', 395.00, 'Excellent',
    '75,000 bonus miles', 'Spend $4,000 in first 3 months', 0.00,
    2.00, 2.00, 2.00, 5.00, 2.00,
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    'miles', 1.00, '{"travel_portal_credit": "$300 annually", "priority_pass": true, "tsa_precheck_credit": true}',
    '/images/cards/capital-one-venture-x.jpg', 'https://www.capitalone.com/credit-cards/venture-x/', 'US', true
  ),
  (
    gen_random_uuid(), 'Citi Double Cash Card', 'Citi', 'Mastercard', 0.00, 'Good',
    '$200 cash back', 'Spend $1,500 in first 6 months', 0.00,
    2.00, 2.00, 2.00, 2.00, 2.00,
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    'cashback', 1.00, '{"no_annual_fee": true, "balance_transfer_offer": "0% APR for 18 months"}',
    '/images/cards/citi-double-cash.jpg', 'https://www.citi.com/credit-cards/citi-double-cash-credit-card', 'US', true
  ),
  (
    gen_random_uuid(), 'Chase Freedom Unlimited', 'Chase', 'Visa', 0.00, 'Fair',
    '$200 cash back', 'Spend $500 in first 3 months', 0.00,
    1.50, 1.50, 1.50, 1.50, 1.50,
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    'cashback', 1.00, '{"no_annual_fee": true, "intro_apr": "0% APR for 15 months"}',
    '/images/cards/chase-freedom-unlimited.jpg', 'https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited', 'US', true
  );

-- Insert sample partners (these would be created when partners sign up)
INSERT INTO partners (
  id, user_id, company_name, contact_email, subscription_status, subscription_plan,
  primary_color, secondary_color, accent_color, logo_url, portal_subdomain, portal_active,
  created_at, updated_at
) VALUES 
  (
    gen_random_uuid(), 
    (SELECT id FROM auth.users LIMIT 1), -- This assumes at least one user exists
    'Demo Financial Services', 
    'demo@financialservices.com', 
    'active', 
    'professional',
    '#2563eb', '#64748b', '#10b981', 
    '/images/logos/demo-financial.png', 
    'demo-financial', 
    true,
    NOW() - INTERVAL '30 days',
    NOW()
  ),
  (
    gen_random_uuid(), 
    (SELECT id FROM auth.users LIMIT 1), 
    'SmartCredit Solutions', 
    'contact@smartcredit.com', 
    'active', 
    'enterprise',
    '#7c3aed', '#a78bfa', '#f59e0b', 
    '/images/logos/smartcredit.png', 
    'smartcredit', 
    true,
    NOW() - INTERVAL '60 days',
    NOW()
  );

-- Get the partner IDs for use in subsequent inserts
DO $$
DECLARE
    demo_partner_id UUID;
    smart_partner_id UUID;
    card_ids UUID[];
BEGIN
    -- Get partner IDs
    SELECT id INTO demo_partner_id FROM partners WHERE company_name = 'Demo Financial Services';
    SELECT id INTO smart_partner_id FROM partners WHERE company_name = 'SmartCredit Solutions';
    
    -- Get some card IDs
    SELECT ARRAY(SELECT id FROM credit_cards LIMIT 5) INTO card_ids;
    
    -- Insert partner card selections
    INSERT INTO partner_card_selections (partner_id, card_id, is_featured, commission_rate, priority_order)
    VALUES 
      (demo_partner_id, card_ids[1], true, 0.0250, 1),
      (demo_partner_id, card_ids[2], true, 0.0300, 2),
      (demo_partner_id, card_ids[3], false, 0.0200, 3),
      (demo_partner_id, card_ids[4], false, 0.0150, 4),
      (smart_partner_id, card_ids[1], true, 0.0275, 1),
      (smart_partner_id, card_ids[3], true, 0.0225, 2),
      (smart_partner_id, card_ids[5], false, 0.0175, 3);
    
    -- Insert historical analytics data for the last 30 days
    FOR i IN 0..29 LOOP
        INSERT INTO partner_analytics (
            partner_id, date, total_users, new_users, active_users, returning_users,
            total_sessions, total_analyses, avg_session_duration,
            card_applications, approved_applications, conversion_rate,
            revenue, commissions_earned, bounce_rate, pages_per_session
        ) VALUES 
        (
            demo_partner_id,
            CURRENT_DATE - INTERVAL '1 day' * i,
            200 + (i * 2) + FLOOR(RANDOM() * 20)::INTEGER,
            5 + FLOOR(RANDOM() * 10)::INTEGER,
            80 + FLOOR(RANDOM() * 30)::INTEGER,
            60 + FLOOR(RANDOM() * 20)::INTEGER,
            150 + FLOOR(RANDOM() * 50)::INTEGER,
            45 + FLOOR(RANDOM() * 20)::INTEGER,
            INTERVAL '8 minutes' + (INTERVAL '1 minute' * FLOOR(RANDOM() * 10)),
            3 + FLOOR(RANDOM() * 8)::INTEGER,
            2 + FLOOR(RANDOM() * 5)::INTEGER,
            0.12 + (RANDOM() * 0.08),
            500.00 + (RANDOM() * 1000.00),
            125.00 + (RANDOM() * 250.00),
            0.25 + (RANDOM() * 0.15),
            3.2 + (RANDOM() * 1.8)
        ),
        (
            smart_partner_id,
            CURRENT_DATE - INTERVAL '1 day' * i,
            150 + (i * 3) + FLOOR(RANDOM() * 25)::INTEGER,
            8 + FLOOR(RANDOM() * 12)::INTEGER,
            65 + FLOOR(RANDOM() * 25)::INTEGER,
            45 + FLOOR(RANDOM() * 15)::INTEGER,
            120 + FLOOR(RANDOM() * 40)::INTEGER,
            35 + FLOOR(RANDOM() * 15)::INTEGER,
            INTERVAL '9 minutes' + (INTERVAL '1 minute' * FLOOR(RANDOM() * 8)),
            4 + FLOOR(RANDOM() * 6)::INTEGER,
            3 + FLOOR(RANDOM() * 4)::INTEGER,
            0.15 + (RANDOM() * 0.10),
            750.00 + (RANDOM() * 1250.00),
            187.50 + (RANDOM() * 312.50),
            0.20 + (RANDOM() * 0.12),
            3.8 + (RANDOM() * 2.2)
        );
    END LOOP;
    
    -- Insert sample user sessions for recent activity
    FOR i IN 1..20 LOOP
        INSERT INTO partner_user_sessions (
            partner_id, session_id, ip_address, user_agent, referrer, country, city,
            pages_visited, session_duration, uploaded_files, analyses_completed,
            cards_viewed, card_applied, card_applied_id, created_at
        ) VALUES 
        (
            demo_partner_id,
            gen_random_uuid(),
            ('192.168.' || FLOOR(RANDOM() * 255) || '.' || FLOOR(RANDOM() * 255))::INET,
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            CASE WHEN RANDOM() > 0.5 THEN 'https://google.com' ELSE 'https://facebook.com' END,
            'US',
            CASE WHEN RANDOM() > 0.7 THEN 'New York' WHEN RANDOM() > 0.4 THEN 'Los Angeles' ELSE 'Chicago' END,
            1 + FLOOR(RANDOM() * 8)::INTEGER,
            INTERVAL '5 minutes' + (INTERVAL '1 minute' * FLOOR(RANDOM() * 15)),
            CASE WHEN RANDOM() > 0.6 THEN 1 ELSE 0 END,
            CASE WHEN RANDOM() > 0.4 THEN 1 ELSE 0 END,
            1 + FLOOR(RANDOM() * 5)::INTEGER,
            RANDOM() > 0.8,
            CASE WHEN RANDOM() > 0.8 THEN card_ids[1 + FLOOR(RANDOM() * 3)::INTEGER] ELSE NULL END,
            NOW() - INTERVAL '1 hour' * FLOOR(RANDOM() * 72)
        );
    END LOOP;
END $$; 