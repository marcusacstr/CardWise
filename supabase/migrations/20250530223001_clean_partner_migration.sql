-- Clean Partner System Migration
-- This version handles existing objects gracefully

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Partners can view their own data" ON partners;
DROP POLICY IF EXISTS "Partners can update their own data" ON partners;
DROP POLICY IF EXISTS "Partners can insert their own data" ON partners;

-- Create or replace tables
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
  api_key TEXT,
  webhook_url TEXT,
  commission_rate DECIMAL(5,4) DEFAULT 0.05,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS partner_card_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  commission_rate DECIMAL(5,4) DEFAULT 0.05,
  is_featured BOOLEAN DEFAULT false,
  priority_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, card_id)
);

CREATE TABLE IF NOT EXISTS partner_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  applications_submitted INTEGER DEFAULT 0,
  applications_approved INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  commission_earned DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, date)
);

CREATE TABLE IF NOT EXISTS partner_user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_email TEXT,
  user_name TEXT,
  credit_score INTEGER,
  annual_income DECIMAL(12,2),
  current_card TEXT,
  spending_data JSONB,
  recommendations JSONB,
  application_submitted BOOLEAN DEFAULT false,
  application_approved BOOLEAN DEFAULT false,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  country TEXT,
  city TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_card_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  filter_type TEXT NOT NULL, -- 'include' or 'exclude'
  filter_category TEXT NOT NULL, -- 'issuer', 'network', 'fee_range', 'country'
  filter_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  user_session_id UUID REFERENCES partner_user_sessions(id),
  revenue_type TEXT NOT NULL, -- 'application', 'approval', 'monthly', 'annual'
  amount DECIMAL(10,2) NOT NULL,
  card_name TEXT,
  commission_rate DECIMAL(5,4),
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  payout_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_custom_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  category_icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, category_name)
);

-- Enable Row Level Security
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_card_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_card_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_custom_categories ENABLE ROW LEVEL SECURITY;

-- Create fresh RLS policies
CREATE POLICY "Partners can view their own data" ON partners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Partners can update their own data" ON partners
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Partners can insert their own data" ON partners
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Partner card selections policies  
CREATE POLICY "Partners can manage their card selections" ON partner_card_selections
  FOR ALL USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Partner analytics policies
CREATE POLICY "Partners can view their analytics" ON partner_analytics
  FOR SELECT USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Partner user sessions policies
CREATE POLICY "Partners can manage their user sessions" ON partner_user_sessions
  FOR ALL USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Partner card filters policies
CREATE POLICY "Partners can manage their card filters" ON partner_card_filters
  FOR ALL USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Partner revenues policies
CREATE POLICY "Partners can view their revenues" ON partner_revenues
  FOR SELECT USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Partner custom categories policies
CREATE POLICY "Partners can manage their custom categories" ON partner_custom_categories
  FOR ALL USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_card_selections_partner_id ON partner_card_selections(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_analytics_partner_date ON partner_analytics(partner_id, date);
CREATE INDEX IF NOT EXISTS idx_partner_user_sessions_partner_id ON partner_user_sessions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_revenues_partner_id ON partner_revenues(partner_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partner_user_sessions_updated_at ON partner_user_sessions;
CREATE TRIGGER update_partner_user_sessions_updated_at
    BEFORE UPDATE ON partner_user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 