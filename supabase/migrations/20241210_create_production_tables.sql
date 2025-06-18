-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'past_due')),
  subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portal_configs table
CREATE TABLE IF NOT EXISTS portal_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  subdomain TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#10B981',
  secondary_color TEXT DEFAULT '#059669',
  welcome_title TEXT DEFAULT 'Find Your Perfect Credit Card',
  welcome_message TEXT DEFAULT 'Get personalized credit card recommendations tailored to your spending habits and financial goals.',
  contact_email TEXT,
  contact_phone TEXT,
  background_image TEXT,
  custom_css TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create partner_card_selections table
CREATE TABLE IF NOT EXISTS partner_card_selections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE,
  is_featured BOOLEAN DEFAULT false,
  custom_description TEXT,
  priority_order INTEGER DEFAULT 0,
  affiliate_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, card_id)
);

-- Create user_sessions table (enhanced)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  portal_id UUID REFERENCES portal_configs(id) ON DELETE SET NULL,
  current_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL,
  current_card_name TEXT DEFAULT 'Basic Visa Card',
  current_card_issuer TEXT DEFAULT 'Generic Bank',
  current_card_annual_fee DECIMAL(10,2) DEFAULT 0,
  current_card_estimated_rewards DECIMAL(10,2) DEFAULT 0,
  current_card_is_custom BOOLEAN DEFAULT false,
  uploaded_files TEXT[],
  manual_spending_entries JSONB,
  analysis_time_period TEXT DEFAULT 'month',
  monthly_rewards_data JSONB,
  latest_analysis JSONB,
  latest_recommendations JSONB,
  current_card_rewards DECIMAL(10,2) DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create partner_analytics table
CREATE TABLE IF NOT EXISTS partner_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  portal_id UUID REFERENCES portal_configs(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_visits INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  card_applications INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, portal_id, date)
);

-- Create billing_transactions table
CREATE TABLE IF NOT EXISTS billing_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  transaction_type TEXT CHECK (transaction_type IN ('subscription', 'commission', 'fee', 'refund')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  stripe_payment_intent_id TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL,
  type TEXT CHECK (type IN ('card', 'bank_account')),
  last_4 TEXT,
  brand TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_reports table
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  file_name TEXT,
  analysis_data JSONB,
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_recommendations table
CREATE TABLE IF NOT EXISTS user_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE,
  recommendation_score DECIMAL(5,2),
  annual_rewards_estimate DECIMAL(10,2),
  reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_configs_partner_id ON portal_configs(partner_id);
CREATE INDEX IF NOT EXISTS idx_portal_configs_subdomain ON portal_configs(subdomain);
CREATE INDEX IF NOT EXISTS idx_partner_card_selections_partner_id ON partner_card_selections(partner_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_analytics_partner_id ON partner_analytics(partner_id);
CREATE INDEX IF NOT EXISTS idx_billing_transactions_partner_id ON billing_transactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_user_id ON user_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON user_recommendations(user_id);

-- Enable Row Level Security
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_card_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for partners
CREATE POLICY "Partners can view own data" ON partners
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for portal_configs
CREATE POLICY "Partners can manage own portals" ON portal_configs
  FOR ALL USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Public read access for portal configs (for client portals)
CREATE POLICY "Public can view active portals" ON portal_configs
  FOR SELECT USING (is_active = true);

-- Create RLS policies for partner_card_selections
CREATE POLICY "Partners can manage own card selections" ON partner_card_selections
  FOR ALL USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for user_sessions
CREATE POLICY "Users can manage own sessions" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for partner_analytics
CREATE POLICY "Partners can view own analytics" ON partner_analytics
  FOR ALL USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for billing_transactions
CREATE POLICY "Partners can view own transactions" ON billing_transactions
  FOR ALL USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for payment_methods
CREATE POLICY "Partners can manage own payment methods" ON payment_methods
  FOR ALL USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for user_reports
CREATE POLICY "Users can view own reports" ON user_reports
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for user_recommendations
CREATE POLICY "Users can view own recommendations" ON user_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_configs_updated_at BEFORE UPDATE ON portal_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 