# CardWise Production Setup Guide

## 1. Database Setup

Run the following SQL commands in your Supabase SQL Editor:

### Partners Table
```sql
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
```

### Portal Configs Table
```sql
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
```

### Partner Card Selections Table
```sql
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
```

### Enhanced User Sessions Table
```sql
DROP TABLE IF EXISTS user_sessions;
CREATE TABLE user_sessions (
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
```

### Analytics and Billing Tables
```sql
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

CREATE TABLE IF NOT EXISTS user_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  file_name TEXT,
  analysis_data JSONB,
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_configs_partner_id ON portal_configs(partner_id);
CREATE INDEX IF NOT EXISTS idx_portal_configs_subdomain ON portal_configs(subdomain);
CREATE INDEX IF NOT EXISTS idx_partner_card_selections_partner_id ON partner_card_selections(partner_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_analytics_partner_id ON partner_analytics(partner_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_user_id ON user_reports(user_id);
```

### Row Level Security
```sql
-- Enable RLS
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_card_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Partners can view own data" ON partners
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Partners can manage own portals" ON portal_configs
  FOR ALL USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active portals" ON portal_configs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage own card selections" ON partner_card_selections
  FOR ALL USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own sessions" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reports" ON user_reports
  FOR ALL USING (auth.uid() = user_id);
```

## 2. Environment Variables

Make sure your `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 3. Supabase Auth Configuration

In your Supabase Auth settings:
- Enable email auth
- Set Site URL to your domain
- Add redirect URLs for auth callbacks

## 4. Deploy to Production

1. Push code to your Git repository
2. Deploy to Vercel/Netlify
3. Update Supabase auth settings with production URLs
4. Test authentication flow
5. Test portal creation and customization

## Features Ready for Production

### User Portal (`/dashboard`)
✅ Full personal finance dashboard
✅ CSV upload and analysis
✅ AI card recommendations
✅ Manual spending entry
✅ Session persistence
✅ Authentication required

### Partner Portal (`/partner/dashboard`)
✅ Business dashboard
✅ Client management
✅ Revenue tracking
✅ Performance analytics

### Portal Builder (`/partner/portal-builder`)
✅ Full customization interface
✅ Real-time preview
✅ Database persistence
✅ Custom branding and colors

### Client Preview (`/preview/[subdomain]`)
✅ Custom branded portals
✅ Database-driven content
✅ Featured cards from real database
✅ Professional design

### Authentication
✅ User registration and login
✅ Partner account creation
✅ Protected routes
✅ Session management

All features are now integrated with Supabase and ready for production use! 