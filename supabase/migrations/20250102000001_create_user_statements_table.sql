-- Create user_statements table for tracking uploaded statements
CREATE TABLE IF NOT EXISTS user_statements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  statement_period_start TIMESTAMPTZ,
  statement_period_end TIMESTAMPTZ,
  statement_date TIMESTAMPTZ,
  bank_name TEXT,
  account_number TEXT,
  transaction_count INTEGER DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  categories JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_statements_user_id ON user_statements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statements_created_at ON user_statements(created_at);
CREATE INDEX IF NOT EXISTS idx_user_statements_statement_date ON user_statements(statement_date);

-- Enable RLS (Row Level Security)
ALTER TABLE user_statements ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own statements" ON user_statements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statements" ON user_statements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statements" ON user_statements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own statements" ON user_statements
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_statements_updated_at
  BEFORE UPDATE ON user_statements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 