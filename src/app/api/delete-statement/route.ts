import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statementId = searchParams.get('id');
    
    if (!statementId) {
      return NextResponse.json({ error: 'Statement ID is required' }, { status: 400 });
    }

    // Delete the statement record from the database
    const { error: deleteError } = await supabase
      .from('user_statements')
      .delete()
      .eq('id', statementId)
      .eq('user_id', user.id); // Ensure user can only delete their own statements

    if (deleteError) {
      console.error('Error deleting statement:', deleteError);
      return NextResponse.json({ error: 'Failed to delete statement' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Statement deleted successfully'
    });

  } catch (error) {
    console.error('Delete statement error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('🔍 GET /api/delete-statement - Debug:', {
      hasUser: !!user,
      userId: user?.id,
      userError: userError?.message,
      requestHeaders: Object.fromEntries(request.headers.entries())
    });
    
    if (userError || !user) {
      console.log('❌ GET /api/delete-statement: User not authenticated');
      return NextResponse.json({ 
        statements: [],
        authenticated: false,
        message: 'User not authenticated - no statements to show'
      });
    }

    // Get all statements for the user
    const { data: statements, error: fetchError } = await supabase
      .from('user_statements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    console.log('🔍 Statements query result:', {
      statementsFound: statements?.length || 0,
      hasError: !!fetchError,
      errorCode: fetchError?.code,
      errorMessage: fetchError?.message,
      statements: statements?.map(s => ({ id: s.id, filename: s.filename, created_at: s.created_at }))
    });

    if (fetchError) {
      console.error('❌ Error fetching statements:', fetchError);
      return NextResponse.json({ 
        statements: [],
        error: 'Failed to fetch statements',
        details: fetchError.message
      });
    }

    console.log(`✅ Successfully fetched ${statements?.length || 0} statements for user ${user.id}`);
    
    return NextResponse.json({ 
      statements: statements || [],
      authenticated: true
    });

  } catch (error) {
    console.error('❌ Fetch statements error:', error);
    return NextResponse.json(
      { 
        statements: [],
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
} 