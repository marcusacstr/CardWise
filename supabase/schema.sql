-- Create tables for CardWise

-- Partners table (our clients who white-label the platform)
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    custom_domain TEXT UNIQUE,
    subscription_status TEXT NOT NULL DEFAULT 'trial',
    subscription_tier TEXT NOT NULL DEFAULT 'basic'
);

-- Users table (end users of the white-labeled platform)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    current_cards JSONB DEFAULT '[]'::jsonb,
    spending_categories JSONB DEFAULT '{}'::jsonb
);

-- Credit Cards table (database of all available cards)
CREATE TABLE credit_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    card_network VARCHAR(50),
    annual_fee DECIMAL(10,2) NOT NULL,
    credit_score_requirement VARCHAR(50),
    welcome_bonus TEXT,
    welcome_bonus_requirements TEXT,
    foreign_transaction_fee DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Base earn rate for all purchases
    base_earn_rate DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    -- Category-specific earn rates
    groceries_earn_rate DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    dining_earn_rate DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    travel_earn_rate DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    gas_earn_rate DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    -- Category spending caps (NULL means no cap)
    groceries_cap DECIMAL(10,2),
    dining_cap DECIMAL(10,2),
    travel_cap DECIMAL(10,2),
    gas_cap DECIMAL(10,2),
    -- Cap frequency (monthly, quarterly, annually)
    groceries_cap_frequency VARCHAR(20),
    dining_cap_frequency VARCHAR(20),
    travel_cap_frequency VARCHAR(20),
    gas_cap_frequency VARCHAR(20),
    -- Reward type (points, miles, cashback)
    reward_type VARCHAR(20) NOT NULL DEFAULT 'points',
    -- Point value in cents (e.g., 100 = $1.00)
    point_value DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    -- Additional benefits
    benefits JSONB,
    -- Card image URL
    image_url TEXT,
    -- Card application URL
    application_url TEXT,
    -- Card country/region
    country VARCHAR(2) NOT NULL DEFAULT 'US'
);

-- User Recommendations table
CREATE TABLE user_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE,
    estimated_rewards DECIMAL(10,2) NOT NULL,
    reasoning TEXT,
    is_viewed BOOLEAN DEFAULT false
);

-- User Spending Data table
CREATE TABLE spending_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    vendor TEXT,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT,
    raw_description TEXT
);

-- Spending Analyses table
CREATE TABLE spending_analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    raw_spending_data JSONB NOT NULL,
    categorized_spending JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Preferences table
CREATE TABLE user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    preferred_cards JSONB,
    excluded_cards JSONB,
    spending_categories JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_partner_id ON users(partner_id);
CREATE INDEX idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX idx_credit_cards_issuer ON credit_cards(issuer);
CREATE INDEX idx_spending_data_user_id ON spending_data(user_id);
CREATE INDEX idx_spending_data_category ON spending_data(category);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_cards_updated_at
    BEFORE UPDATE ON credit_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Partners
CREATE POLICY "Partners are viewable by everyone" ON partners
    FOR SELECT USING (true);
CREATE POLICY "Partners can update their own data" ON partners
    FOR UPDATE USING (auth.uid() = id);

-- Users
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Credit Cards
CREATE POLICY "Credit cards are viewable by everyone" ON credit_cards
    FOR SELECT USING (true);
CREATE POLICY "Credit cards are modifiable by admins only" ON credit_cards
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM user_preferences WHERE user_id = auth.uid()
    ));

-- User Recommendations
CREATE POLICY "Users can view their own recommendations" ON user_recommendations
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own recommendations" ON user_recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Spending Data
CREATE POLICY "Users can view their own spending data" ON spending_data
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own spending data" ON spending_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own spending data" ON spending_data
    FOR UPDATE USING (auth.uid() = user_id);

-- Spending Analyses
CREATE POLICY "Users can view their own spending analyses" ON spending_analyses
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own spending analyses" ON spending_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Preferences
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- This is a basic example. You'll add more tables here later.
-- CREATE TABLE public.test_connection (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   created_at TIMESTAMPTZ DEFAULT now(),
--   message TEXT
-- );

-- Profiles table for user and partner information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  full_name TEXT,
  avatar_url TEXT,
  -- Add specific fields for users or partners
  is_partner BOOLEAN DEFAULT FALSE,
  company_name TEXT NULL,
  website TEXT NULL
);

-- Credit Cards table
CREATE TABLE public.credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  issuer TEXT,
  card_network TEXT,
  annual_fee DECIMAL(10, 2),
  -- Add fields for rewards rates, benefits, etc.
  image_url TEXT NULL
);

-- Recommendations table
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE,
  credit_card_id UUID REFERENCES public.credit_cards ON DELETE CASCADE,
  reason TEXT,
  -- Score or ranking for the recommendation
  score DECIMAL(5, 2)
);

-- Policies for Row Level Security (RLS) - IMPORTANT FOR SUPABASE SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ((auth.uid() = id));

ALTER TABLE public.spending_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own spending data." ON public.spending_data FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert their own spending data." ON public.spending_data FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update their own spending data." ON public.spending_data FOR UPDATE USING ((auth.uid() = user_id));

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own recommendations." ON public.recommendations FOR SELECT USING ((auth.uid() = user_id));

-- You will need to decide on RLS policies for the credit_cards table
-- depending on whether it's public or requires authentication to view.
-- For now, let's assume credit card info is public.
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Credit cards are viewable by everyone." ON public.credit_cards FOR SELECT USING (true);

-- Optional: Update RLS policy on profiles table if you restricted insert previously
-- If you used the policy "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));
-- This policy is fine and allows the trigger (running as the new user) to insert.

-- Create spending_analyses table
CREATE TABLE spending_analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    raw_spending_data JSONB NOT NULL,
    categorized_spending JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_preferences table
CREATE TABLE user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    preferred_cards JSONB,
    excluded_cards JSONB,
    spending_categories JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policies
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Credit cards are publicly readable
CREATE POLICY "Credit cards are viewable by everyone" ON credit_cards
    FOR SELECT USING (true);

-- Only admins can modify credit cards
CREATE POLICY "Credit cards are modifiable by admins only" ON credit_cards
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM user_preferences WHERE user_id = auth.uid()
    ));

-- Users can only see their own spending analyses
CREATE POLICY "Users can view their own spending analyses" ON spending_analyses
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only create their own spending analyses
CREATE POLICY "Users can create their own spending analyses" ON spending_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only manage their own preferences
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 