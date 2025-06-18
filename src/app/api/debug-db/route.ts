import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const adminSupabase = createServiceRoleClient()
    
    // Check if full_name column exists
    const { data: columns, error: columnError } = await adminSupabase
      .rpc('get_table_columns', { table_name: 'partners' })
    
    if (columnError) {
      console.log('Column check failed, trying manual approach...')
    }
    
    // Try to add the column
    const { data: alterResult, error: alterError } = await adminSupabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE partners ADD COLUMN IF NOT EXISTS full_name TEXT;' 
      })
    
    if (alterError) {
      console.error('Alter table error:', alterError)
    }
    
    // Test partner creation
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      company_name: 'Test Company',
      contact_email: 'test@example.com',
      full_name: 'Test User',
      subscription_status: 'trial',
      subscription_plan: 'basic'
    }
    
    const { data: testInsert, error: testError } = await adminSupabase
      .from('partners')
      .insert([testData])
      .select()
    
    // Clean up test data
    if (testInsert && testInsert[0]) {
      await adminSupabase
        .from('partners')
        .delete()
        .eq('id', testInsert[0].id)
    }
    
    return NextResponse.json({
      message: 'Database debug complete',
      alterError: alterError?.message || null,
      testError: testError?.message || null,
      success: !testError
    })
    
  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    )
  }
} 