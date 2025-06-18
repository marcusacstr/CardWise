-- Create partner_portals table
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

-- Create partner_domain_setups table for domain verification
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

-- Create partner_portal_configs table for portal customization
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

-- Create partner_user_sessions table for analytics
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
    session_duration INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Create partner_card_applications table for tracking applications
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

-- Create partner_commissions table for commission tracking
CREATE TABLE IF NOT EXISTS partner_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES partner_card_applications(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.0250 for 2.5%
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    payout_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
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

-- Enable RLS on all tables
ALTER TABLE partner_portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_domain_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_portal_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_card_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_commissions ENABLE ROW LEVEL SECURITY;

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

-- Add updated_at trigger for partner_portals
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_partner_portals_updated_at 
    BEFORE UPDATE ON partner_portals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_portal_configs_updated_at 
    BEFORE UPDATE ON partner_portal_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_card_applications_updated_at 
    BEFORE UPDATE ON partner_card_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 