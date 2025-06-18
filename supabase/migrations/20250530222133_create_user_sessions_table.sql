-- Create user_sessions table for storing user's current dashboard state
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Current card information
  current_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL,
  current_card_name VARCHAR(255),
  current_card_issuer VARCHAR(255),
  current_card_annual_fee DECIMAL(10,2) DEFAULT 0,
  current_card_estimated_rewards DECIMAL(10,2) DEFAULT 0,
  current_card_is_custom BOOLEAN DEFAULT FALSE,
  
  -- Session data
  uploaded_files JSONB DEFAULT '[]'::jsonb,
  manual_spending_entries JSONB DEFAULT '[]'::jsonb,
  analysis_time_period VARCHAR(20) DEFAULT 'month',
  
  -- Latest analysis results
  latest_analysis JSONB DEFAULT '{}'::jsonb,
  latest_recommendations JSONB DEFAULT '[]'::jsonb,
  current_card_rewards DECIMAL(10,2) DEFAULT 0,
  
  -- Monthly rewards chart data
  monthly_rewards_data JSONB DEFAULT '{
    "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "currentCardRewards": [],
    "recommendedCardRewards": []
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_last_activity_idx ON user_sessions(last_activity);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own session" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own session" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own session" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own session" ON user_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_sessions_updated_at 
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 