-- Enhanced Partner System Migration
-- This migration enhances the partner system with comprehensive branding, card management, and analytics

-- Create or enhance partners table
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'trial',
  subscription_plan TEXT DEFAULT 'basic',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Branding fields
  primary_color TEXT DEFAULT '#4F46E5',
  secondary_color TEXT DEFAULT '#818CF8',
  accent_color TEXT DEFAULT '#10B981',
  logo_url TEXT,
  favicon_url TEXT,
  font_family TEXT DEFAULT 'Inter',
  custom_domain TEXT,
  custom_css TEXT,
  welcome_message TEXT,
  footer_text TEXT,
  
  -- White-label settings
  hide_cardwise_branding BOOLEAN DEFAULT false,
  custom_app_name TEXT DEFAULT 'CardWise',
  custom_tagline TEXT DEFAULT 'Smart Credit Card Recommendations',
  
  -- Portal settings
  portal_subdomain TEXT UNIQUE,
  portal_active BOOLEAN DEFAULT true,
  portal_url TEXT,
  
  UNIQUE(user_id)
);

-- Create partner_card_selections table for managing available cards
CREATE TABLE IF NOT EXISTS partner_card_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
  is_featured BOOLEAN DEFAULT false,
  custom_description TEXT,
  commission_rate DECIMAL(5,4) DEFAULT 0.0000,
  priority_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(partner_id, card_id)
);

-- Create partner_analytics table for detailed tracking
CREATE TABLE IF NOT EXISTS partner_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- User metrics
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  returning_users INTEGER DEFAULT 0,
  
  -- Usage metrics
  total_sessions INTEGER DEFAULT 0,
  total_analyses INTEGER DEFAULT 0,
  total_uploads INTEGER DEFAULT 0,
  avg_session_duration INTERVAL DEFAULT '0 minutes',
  
  -- Conversion metrics
  card_applications INTEGER DEFAULT 0,
  approved_applications INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0.0000,
  
  -- Revenue metrics
  revenue DECIMAL(10,2) DEFAULT 0.00,
  commissions_earned DECIMAL(10,2) DEFAULT 0.00,
  
  -- Engagement metrics
  bounce_rate DECIMAL(5,4) DEFAULT 0.0000,
  pages_per_session DECIMAL(5,2) DEFAULT 0.00,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(partner_id, date)
);

-- Create partner_user_sessions for tracking individual user sessions
CREATE TABLE IF NOT EXISTS partner_user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  
  -- Session data
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  
  -- Activity tracking
  pages_visited INTEGER DEFAULT 1,
  session_duration INTERVAL DEFAULT '0 minutes',
  actions_taken JSONB DEFAULT '[]',
  
  -- Analysis data
  uploaded_files INTEGER DEFAULT 0,
  analyses_completed INTEGER DEFAULT 0,
  cards_viewed INTEGER DEFAULT 0,
  
  -- Conversion tracking
  card_applied BOOLEAN DEFAULT false,
  card_applied_id UUID REFERENCES credit_cards(id),
  application_status TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create partner_card_filters for managing card availability rules
CREATE TABLE IF NOT EXISTS partner_card_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  
  -- Filter criteria
  filter_type TEXT NOT NULL CHECK (filter_type IN ('include_issuer', 'exclude_issuer', 'include_country', 'exclude_country', 'min_score', 'max_fee', 'card_type')),
  filter_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(partner_id, filter_type, filter_value)
);

-- Create partner_revenues for detailed revenue tracking
CREATE TABLE IF NOT EXISTS partner_revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  card_id UUID NOT NULL REFERENCES credit_cards(id),
  
  -- Revenue details
  revenue_type TEXT NOT NULL CHECK (revenue_type IN ('application', 'approval', 'monthly', 'annual')),
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  
  -- Application tracking
  application_id TEXT,
  application_status TEXT DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  
  -- Payment status
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  paid_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create partner_custom_categories for custom spending categories
CREATE TABLE IF NOT EXISTS partner_custom_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  icon_name TEXT,
  color TEXT DEFAULT '#6B7280',
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(partner_id, category_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_partner_analytics_partner_date ON partner_analytics(partner_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_partner_user_sessions_partner ON partner_user_sessions(partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_card_selections_partner ON partner_card_selections(partner_id, priority_order);
CREATE INDEX IF NOT EXISTS idx_partner_revenues_partner ON partner_revenues(partner_id, created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_card_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_card_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_custom_categories ENABLE ROW LEVEL SECURITY;

-- Policies for partners table
CREATE POLICY "Partners can view their own data" ON partners
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Partners can update their own data" ON partners
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Partners can insert their own data" ON partners
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policies for partner_card_selections
CREATE POLICY "Partners can manage their card selections" ON partner_card_selections
  FOR ALL USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- Policies for partner_analytics
CREATE POLICY "Partners can view their analytics" ON partner_analytics
  FOR SELECT USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- Policies for partner_user_sessions
CREATE POLICY "Partners can view their user sessions" ON partner_user_sessions
  FOR SELECT USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- Policies for other tables
CREATE POLICY "Partners can manage their filters" ON partner_card_filters
  FOR ALL USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Partners can view their revenues" ON partner_revenues
  FOR SELECT USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Partners can manage their categories" ON partner_custom_categories
  FOR ALL USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- Functions for analytics aggregation
CREATE OR REPLACE FUNCTION update_partner_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily analytics when user sessions are updated
  INSERT INTO partner_analytics (
    partner_id,
    date,
    total_sessions,
    new_users,
    total_analyses,
    card_applications
  )
  SELECT 
    NEW.partner_id,
    CURRENT_DATE,
    COUNT(*) as total_sessions,
    COUNT(DISTINCT NEW.user_id) as new_users,
    SUM(NEW.analyses_completed) as total_analyses,
    SUM(CASE WHEN NEW.card_applied THEN 1 ELSE 0 END) as card_applications
  FROM partner_user_sessions 
  WHERE partner_id = NEW.partner_id 
    AND DATE(created_at) = CURRENT_DATE
  ON CONFLICT (partner_id, date) 
  DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    new_users = EXCLUDED.new_users,
    total_analyses = EXCLUDED.total_analyses,
    card_applications = EXCLUDED.card_applications,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for analytics updates
CREATE TRIGGER trigger_update_partner_analytics
  AFTER INSERT OR UPDATE ON partner_user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_partner_analytics();

-- Sample data for testing (optional)
INSERT INTO partners (user_id, company_name, contact_email, subscription_plan) 
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Test Bank', 'test@testbank.com', 'premium')
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE partners IS 'Enhanced partner information with comprehensive branding and settings';
COMMENT ON TABLE partner_card_selections IS 'Cards available for each partner portal';
COMMENT ON TABLE partner_analytics IS 'Daily analytics aggregation for partners';
COMMENT ON TABLE partner_user_sessions IS 'Individual user session tracking';
COMMENT ON TABLE partner_card_filters IS 'Rules for filtering available cards';
COMMENT ON TABLE partner_revenues IS 'Revenue and commission tracking';
COMMENT ON TABLE partner_custom_categories IS 'Custom spending categories per partner'; 