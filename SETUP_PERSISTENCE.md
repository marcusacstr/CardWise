# Setting Up User Session Persistence

Your CardWise dashboard now includes persistence functionality that saves user data (current card, uploaded files, analysis results, etc.) so it's restored when users return to the dashboard.

## Database Setup Required

You need to create a new table in your Supabase database. Here's how:

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Click **"New Query"**
4. Copy and paste the following SQL:

```sql
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

-- Create trigger for updated_at (if update function exists)
CREATE TRIGGER update_user_sessions_updated_at 
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

5. Click **"Run"** to execute the SQL

### Option 2: Migration File (If using local Supabase)

If you're running Supabase locally with Docker:

1. The migration file is already created at `supabase/migrations/20250530222133_create_user_sessions_table.sql`
2. Run: `npx supabase db reset` (if you have local development set up)

## What This Enables

Once the table is created, your users will experience:

- **Current card selection** is remembered between sessions
- **Uploaded file names** are tracked and displayed
- **Manual spending entries** are preserved
- **Analysis results** and **recommendations** persist
- **Time period preferences** are saved
- **Monthly rewards chart data** is restored

## How It Works

- Data is automatically saved whenever users make changes (select a card, upload a file, etc.)
- When users return to the dashboard, their previous state is restored
- The system gracefully handles cases where the table doesn't exist (won't break the app)
- All data is user-specific and secured with Row Level Security (RLS)

## Testing

After creating the table:

1. Visit the dashboard and select a current card
2. Upload a CSV file or enter manual spending data
3. Refresh the page or revisit later
4. Verify that your selections and data are restored

The application will log "Loading saved user session data" in the browser console when restoring data. 