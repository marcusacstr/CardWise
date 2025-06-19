-- Create super admin access log table
CREATE TABLE IF NOT EXISTS super_admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT, -- 'user', 'partner', 'card', 'system'
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card application tracking table
CREATE TABLE IF NOT EXISTS card_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  card_id UUID REFERENCES credit_cards(id),
  partner_id UUID REFERENCES partners(id),
  application_url TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
  commission_amount DECIMAL(10,2),
  conversion_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_super_admin_logs_admin_email ON super_admin_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_super_admin_logs_created_at ON super_admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_super_admin_logs_action ON super_admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_card_applications_user_id ON card_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_card_applications_card_id ON card_applications(card_id);
CREATE INDEX IF NOT EXISTS idx_card_applications_partner_id ON card_applications(partner_id);
CREATE INDEX IF NOT EXISTS idx_card_applications_status ON card_applications(status);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('platform_maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('max_csv_file_size', '10485760', 'Maximum CSV file size in bytes (10MB)'),
('welcome_bonus_update_frequency', '7', 'Days between automatic welcome bonus updates'),
('partner_commission_rate', '0.05', 'Default commission rate for partners (5%)'),
('email_notifications_enabled', 'true', 'Enable/disable email notifications'),
('analytics_retention_days', '365', 'Days to retain analytics data')
ON CONFLICT (setting_key) DO NOTHING;

-- Add RLS policies for super admin tables
ALTER TABLE super_admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_applications ENABLE ROW LEVEL SECURITY;

-- Super admin logs - only accessible by super admins (we'll handle this in the application layer)
CREATE POLICY "Super admins can view all logs" ON super_admin_logs
  FOR SELECT USING (true);

CREATE POLICY "Super admins can insert logs" ON super_admin_logs
  FOR INSERT WITH CHECK (true);

-- System settings - only accessible by super admins
CREATE POLICY "Super admins can view system settings" ON system_settings
  FOR SELECT USING (true);

CREATE POLICY "Super admins can update system settings" ON system_settings
  FOR UPDATE USING (true);

CREATE POLICY "Super admins can insert system settings" ON system_settings
  FOR INSERT WITH CHECK (true);

-- Card applications - viewable by all, manageable by super admins
CREATE POLICY "Anyone can view card applications" ON card_applications
  FOR SELECT USING (true);

CREATE POLICY "Super admins can manage card applications" ON card_applications
  FOR ALL USING (true);

-- Add some additional useful columns to existing tables if they don't exist
DO $$ 
BEGIN
  -- Add last_login to partners table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'last_login') THEN
    ALTER TABLE partners ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add subscription_tier to partners table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'subscription_tier') THEN
    ALTER TABLE partners ADD COLUMN subscription_tier TEXT DEFAULT 'basic';
  END IF;
  
  -- Add is_featured to credit_cards table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_cards' AND column_name = 'is_featured') THEN
    ALTER TABLE credit_cards ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
  
  -- Add priority_order to credit_cards table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_cards' AND column_name = 'priority_order') THEN
    ALTER TABLE credit_cards ADD COLUMN priority_order INTEGER DEFAULT 0;
  END IF;
END $$; 