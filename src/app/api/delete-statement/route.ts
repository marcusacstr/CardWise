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
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all statements for the user
    const { data: statements, error: fetchError } = await supabase
      .from('user_statements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching statements:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch statements' }, { status: 500 });
    }

    return NextResponse.json({ statements });

  } catch (error) {
    console.error('Fetch statements error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 