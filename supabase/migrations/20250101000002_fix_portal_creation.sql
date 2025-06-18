-- Fix Portal Creation Migration
-- This migration ensures all tables needed for portal creation exist and are properly linked

-- Ensure partners table exists with correct structure
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    website_url TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#2563eb',
    secondary_color TEXT DEFAULT '#64748b',
    accent_color TEXT DEFAULT '#10b981',
    custom_font TEXT DEFAULT 'Inter',
    white_label_enabled BOOLEAN DEFAULT true,
    portal_subdomain TEXT UNIQUE,
    portal_active BOOLEAN DEFAULT false,
    portal_custom_domain TEXT,
    subscription_tier TEXT DEFAULT 'starter',
    subscription_status TEXT DEFAULT 'trial',
    subscription_plan TEXT DEFAULT 'basic',
    api_key TEXT,
    webhook_url TEXT,
    commission_rate DECIMAL(5,4) DEFAULT 0.05,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Ensure credit_cards table exists (needed for foreign key reference)
CREATE TABLE IF NOT EXISTS credit_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    card_network VARCHAR(50),
    annual_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    credit_score_requirement VARCHAR(50),
    welcome_bonus TEXT,
    welcome_bonus_requirements TEXT,
    foreign_transaction_fee DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    base_earn_rate DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    groceries_earn_rate DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    dining_earn_rate DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    travel_earn_rate DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    gas_earn_rate DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    groceries_cap DECIMAL(10,2),
    dining_cap DECIMAL(10,2),
    travel_cap DECIMAL(10,2),
    gas_cap DECIMAL(10,2),
    groceries_cap_frequency VARCHAR(20),
    dining_cap_frequency VARCHAR(20),
    travel_cap_frequency VARCHAR(20),
    gas_cap_frequency VARCHAR(20),
    reward_type VARCHAR(20) NOT NULL DEFAULT 'points',
    point_value DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    benefits JSONB,
    image_url TEXT,
    application_url TEXT,
    country VARCHAR(2) NOT NULL DEFAULT 'US'
);

-- Ensure partner_portals table exists with correct structure
CREATE TABLE IF NOT EXISTS partner_portals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    portal_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) NOT NULL UNIQUE,
    custom_domain VARCHAR(255),
    domain_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'offline')),
    test_url VARCHAR(500) NOT NULL,
    production_url VARCHAR(500),
    ssl_enabled BOOLEAN DEFAULT TRUE,
    deployment_status VARCHAR(20) DEFAULT 'deploying' CHECK (deployment_status IN ('deploying', 'deployed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_deployed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure partner_domain_setups table exists
CREATE TABLE IF NOT EXISTS partner_domain_setups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portal_id UUID NOT NULL REFERENCES partner_portals(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    cname_record VARCHAR(255) NOT NULL,
    a_record VARCHAR(255),
    verification_token VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(portal_id, domain)
);

-- Ensure partner_portal_configs table exists
CREATE TABLE IF NOT EXISTS partner_portal_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    portal_id UUID REFERENCES partner_portals(id) ON DELETE CASCADE,
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#64748B',
    accent_color VARCHAR(7) DEFAULT '#10B981',
    logo_url TEXT,
    favicon_url TEXT,
    company_name VARCHAR(255),
    domain VARCHAR(255),
    custom_css TEXT,
    welcome_message TEXT,
    footer_text VARCHAR(500),
    contact_email VARCHAR(255),
    phone_number VARCHAR(50),
    address TEXT,
    social_links JSONB DEFAULT '{}',
    seo_settings JSONB DEFAULT '{}',
    features_enabled JSONB DEFAULT '{"spending_analysis": true, "card_recommendations": true, "credit_score_tracking": true, "financial_goals": true}',
    analytics_enabled BOOLEAN DEFAULT TRUE,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(partner_id, portal_id)
);

-- Ensure partner_user_sessions table exists
CREATE TABLE IF NOT EXISTS partner_user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    portal_id UUID REFERENCES partner_portals(id) ON DELETE CASCADE,
    user_email VARCHAR(255),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    landing_page TEXT,
    card_applied BOOLEAN DEFAULT FALSE,
    analyses_completed INTEGER DEFAULT 0,
    session_duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Ensure partner_card_applications table exists
CREATE TABLE IF NOT EXISTS partner_card_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    portal_id UUID REFERENCES partner_portals(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    user_session_id UUID REFERENCES partner_user_sessions(id) ON DELETE SET NULL,
    application_data JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    commission_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure partner_commissions table exists
CREATE TABLE IF NOT EXISTS partner_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES partner_card_applications(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,4) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    payout_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure partner_analytics table exists for dashboard queries
CREATE TABLE IF NOT EXISTS partner_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    returning_users INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    total_analyses INTEGER DEFAULT 0,
    total_uploads INTEGER DEFAULT 0,
    avg_session_duration INTERVAL DEFAULT '0 minutes',
    card_applications INTEGER DEFAULT 0,
    approved_applications INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0.0000,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    commissions_earned DECIMAL(10,2) DEFAULT 0.00,
    bounce_rate DECIMAL(5,4) DEFAULT 0.0000,
    pages_per_session DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(partner_id, date)
);

-- Ensure partner_card_selections table exists for dashboard queries
CREATE TABLE IF NOT EXISTS partner_card_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
    is_featured BOOLEAN DEFAULT false,
    custom_description TEXT,
    commission_rate DECIMAL(5,4) DEFAULT 0.0000,
    priority_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(partner_id, card_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_portals_partner_id ON partner_portals(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_portals_subdomain ON partner_portals(subdomain);
CREATE INDEX IF NOT EXISTS idx_partner_portals_custom_domain ON partner_portals(custom_domain);
CREATE INDEX IF NOT EXISTS idx_partner_domain_setups_portal_id ON partner_domain_setups(portal_id);
CREATE INDEX IF NOT EXISTS idx_partner_portal_configs_partner_id ON partner_portal_configs(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_user_sessions_partner_id ON partner_user_sessions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_user_sessions_created_at ON partner_user_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_partner_card_applications_partner_id ON partner_card_applications(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_card_applications_created_at ON partner_card_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_partner_id ON partner_commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_created_at ON partner_commissions(created_at);
CREATE INDEX IF NOT EXISTS idx_partner_analytics_partner_date ON partner_analytics(partner_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_partner_card_selections_partner ON partner_card_selections(partner_id, priority_order);
CREATE INDEX IF NOT EXISTS idx_credit_cards_issuer ON credit_cards(issuer);
CREATE INDEX IF NOT EXISTS idx_credit_cards_active ON credit_cards(is_active);

-- Enable RLS on all tables
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_domain_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_portal_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_card_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_card_selections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Partners can view their own data" ON partners;
DROP POLICY IF EXISTS "Partners can update their own data" ON partners;
DROP POLICY IF EXISTS "Partners can insert their own data" ON partners;
DROP POLICY IF EXISTS "Credit cards are viewable by everyone" ON credit_cards;
DROP POLICY IF EXISTS "Partners can manage their own portals" ON partner_portals;
DROP POLICY IF EXISTS "Partners can manage their own domain setups" ON partner_domain_setups;
DROP POLICY IF EXISTS "Partners can manage their own portal configs" ON partner_portal_configs;
DROP POLICY IF EXISTS "Partners can view their own user sessions" ON partner_user_sessions;
DROP POLICY IF EXISTS "Partners can view their own applications" ON partner_card_applications;
DROP POLICY IF EXISTS "Partners can view their own commissions" ON partner_commissions;
DROP POLICY IF EXISTS "Partners can view their analytics" ON partner_analytics;
DROP POLICY IF EXISTS "Partners can manage their card selections" ON partner_card_selections;

-- Create RLS policies for partners
CREATE POLICY "Partners can view their own data" ON partners
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Partners can update their own data" ON partners
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Partners can insert their own data" ON partners
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for credit_cards
CREATE POLICY "Credit cards are viewable by everyone" ON credit_cards
    FOR SELECT USING (true);

-- Create RLS policies for partner_portals
CREATE POLICY "Partners can manage their own portals" ON partner_portals
    FOR ALL USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for partner_domain_setups
CREATE POLICY "Partners can manage their own domain setups" ON partner_domain_setups
    FOR ALL USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for partner_portal_configs
CREATE POLICY "Partners can manage their own portal configs" ON partner_portal_configs
    FOR ALL USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for partner_user_sessions
CREATE POLICY "Partners can view their own user sessions" ON partner_user_sessions
    FOR SELECT USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for partner_card_applications
CREATE POLICY "Partners can view their own applications" ON partner_card_applications
    FOR SELECT USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for partner_commissions
CREATE POLICY "Partners can view their own commissions" ON partner_commissions
    FOR SELECT USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for partner_analytics
CREATE POLICY "Partners can view their analytics" ON partner_analytics
    FOR SELECT USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for partner_card_selections
CREATE POLICY "Partners can manage their card selections" ON partner_card_selections
    FOR ALL USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

-- Create or replace function for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partner_portals_updated_at ON partner_portals;
CREATE TRIGGER update_partner_portals_updated_at 
    BEFORE UPDATE ON partner_portals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partner_portal_configs_updated_at ON partner_portal_configs;
CREATE TRIGGER update_partner_portal_configs_updated_at 
    BEFORE UPDATE ON partner_portal_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partner_card_applications_updated_at ON partner_card_applications;
CREATE TRIGGER update_partner_card_applications_updated_at 
    BEFORE UPDATE ON partner_card_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partner_analytics_updated_at ON partner_analytics;
CREATE TRIGGER update_partner_analytics_updated_at 
    BEFORE UPDATE ON partner_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample credit cards for testing
INSERT INTO credit_cards (name, issuer, card_network, annual_fee, credit_score_requirement, welcome_bonus, base_earn_rate, dining_earn_rate, travel_earn_rate, groceries_earn_rate, gas_earn_rate, reward_type, point_value, application_url) VALUES
('Chase Sapphire Preferred', 'Chase', 'Visa', 95.00, 'Good', '60,000 points after spending $4,000 in first 3 months', 1.00, 2.00, 2.00, 1.00, 1.00, 'points', 1.25, 'https://chase.com'),
('Capital One Venture Rewards', 'Capital One', 'Visa', 95.00, 'Good', '75,000 miles after spending $4,000 in first 3 months', 2.00, 2.00, 2.00, 2.00, 2.00, 'miles', 1.00, 'https://capitalone.com'),
('American Express Gold Card', 'American Express', 'American Express', 250.00, 'Good', '60,000 points after spending $4,000 in first 6 months', 1.00, 4.00, 3.00, 4.00, 1.00, 'points', 1.00, 'https://americanexpress.com'),
('Citi Double Cash Card', 'Citi', 'Mastercard', 0.00, 'Fair', 'No welcome bonus', 2.00, 2.00, 2.00, 2.00, 2.00, 'cashback', 1.00, 'https://citi.com'),
('Discover it Cash Back', 'Discover', 'Discover', 0.00, 'Fair', 'Cashback Match for first year', 1.00, 5.00, 1.00, 5.00, 5.00, 'cashback', 1.00, 'https://discover.com');

-- Create a storage bucket for partner assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-assets', 'partner-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for partner assets
DROP POLICY IF EXISTS "Partners can upload their assets" ON storage.objects;
CREATE POLICY "Partners can upload their assets" ON storage.objects
    FOR ALL USING (bucket_id = 'partner-assets' AND auth.uid() IS NOT NULL);

COMMENT ON TABLE partners IS 'Partner companies that use the white-label platform';
COMMENT ON TABLE partner_portals IS 'Individual portals created by partners';
COMMENT ON TABLE partner_portal_configs IS 'Customization settings for partner portals';
COMMENT ON TABLE partner_user_sessions IS 'User session tracking for analytics';
COMMENT ON TABLE partner_card_applications IS 'Credit card applications through partner portals';
COMMENT ON TABLE partner_commissions IS 'Commission tracking and payouts';
COMMENT ON TABLE partner_analytics IS 'Daily analytics aggregation';
COMMENT ON TABLE partner_card_selections IS 'Cards available for each partner portal';
COMMENT ON TABLE credit_cards IS 'Database of available credit cards'; 