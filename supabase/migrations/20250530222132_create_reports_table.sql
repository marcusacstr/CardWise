-- Create reports table for storing historical spending analysis
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  
  -- Core metrics
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_spending DECIMAL(10,2) NOT NULL DEFAULT 0,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  average_transaction_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Analysis data (stored as JSONB for flexibility)
  category_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  monthly_trends JSONB NOT NULL DEFAULT '[]'::jsonb,
  merchant_analysis JSONB NOT NULL DEFAULT '[]'::jsonb,
  spending_insights JSONB NOT NULL DEFAULT '[]'::jsonb,
  top_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Card recommendations
  card_recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Metadata
  file_name VARCHAR(255),
  transactions_processed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS reports_user_id_idx ON reports(user_id);
CREATE INDEX IF NOT EXISTS reports_year_month_idx ON reports(year, month);
CREATE INDEX IF NOT EXISTS reports_date_range_idx ON reports(date_range_start, date_range_end);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at);

-- Create unique constraint to prevent duplicate reports for same month/year
CREATE UNIQUE INDEX IF NOT EXISTS reports_user_month_year_unique 
ON reports(user_id, year, month);

-- Enable RLS (Row Level Security)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" ON reports
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_reports_updated_at 
  BEFORE UPDATE ON reports
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 