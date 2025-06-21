import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    console.log('Checking database tables...');
    
    // Test partner_portals table
    const { error: portalTestError } = await supabase
      .from('partner_portals')
      .select('id')
      .limit(1);
    
    console.log('partner_portals table test:', portalTestError ? 'MISSING' : 'EXISTS');
    
    // Test partner_portal_configs table  
    const { error: configTestError } = await supabase
      .from('partner_portal_configs')
      .select('id')
      .limit(1);
    
    console.log('partner_portal_configs table test:', configTestError ? 'MISSING' : 'EXISTS');
    
    // Test user_statements table
    const { error: statementsTestError } = await supabase
      .from('user_statements')
      .select('id')
      .limit(1);
    
    console.log('user_statements table test:', statementsTestError ? 'MISSING' : 'EXISTS');
    
    return NextResponse.json({
      success: true,
      message: 'Database table check completed',
      tables: {
        partner_portals: portalTestError ? 'MISSING' : 'EXISTS',
        partner_portal_configs: configTestError ? 'MISSING' : 'EXISTS',
        user_statements: statementsTestError ? 'MISSING' : 'EXISTS'
      },
      errors: {
        partner_portals: portalTestError?.message || null,
        partner_portal_configs: configTestError?.message || null,
        user_statements: statementsTestError?.message || null
      }
    });
    
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { error: 'Failed to check database', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    console.log('Setting up database tables...');

    // Create user_statements table
    const createUserStatementsTable = `
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
    `;

    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: createUserStatementsTable
    });

    if (createTableError) {
      console.error('Error creating user_statements table:', createTableError);
      // Try alternative method
      console.log('Trying alternative table creation method...');
      
      const { error: altError } = await supabase
        .from('user_statements')
        .select('id')
        .limit(1);
        
      if (altError && altError.code === '42P01') {
        // Table doesn't exist, but we can't create it via API
        return NextResponse.json({ 
          error: 'user_statements table does not exist and cannot be created via API',
          details: 'Please run the migration manually in Supabase dashboard',
          createTableError: createTableError.message,
          altError: altError.message
        }, { status: 500 });
      }
    } else {
      console.log('✅ user_statements table created successfully');
    }

    // Create RLS policies
    const createRLSPolicies = `
      ALTER TABLE user_statements ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Users can view own statements" ON user_statements
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can insert own statements" ON user_statements
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can delete own statements" ON user_statements
        FOR DELETE USING (auth.uid() = user_id);
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: createRLSPolicies
    });

    if (rlsError) {
      console.error('Error creating RLS policies:', rlsError);
    } else {
      console.log('✅ RLS policies created successfully');
    }

    // Create indexes
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_user_statements_user_id ON user_statements(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_statements_created_at ON user_statements(created_at);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: createIndexes
    });

    if (indexError) {
      console.error('Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Test the table
    const { data: testData, error: testError } = await supabase
      .from('user_statements')
      .select('id')
      .limit(1);

    return NextResponse.json({
      success: true,
      message: 'Database setup completed',
      tableCreated: !createTableError,
      rlsCreated: !rlsError,
      indexesCreated: !indexError,
      tableTest: {
        success: !testError,
        error: testError?.message || null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 