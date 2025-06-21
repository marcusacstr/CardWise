import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('Debug API - User check:', user ? `Authenticated as ${user.id}` : 'Not authenticated');
    
    // Test if table exists by trying to select from it
    const { data: tableTest, error: tableError } = await supabase
      .from('user_statements')
      .select('id, created_at')
      .limit(1);
      
    console.log('Table test result:', { 
      hasData: !!tableTest, 
      dataLength: tableTest?.length || 0, 
      error: tableError 
    });
    
    return NextResponse.json({
      user: user ? { id: user.id, email: user.email } : null,
      userError: userError?.message || null,
      tableExists: !tableError,
      tableError: tableError ? {
        code: tableError.code,
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint
      } : null,
      tableData: tableTest || null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      error: 'Debug API failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 