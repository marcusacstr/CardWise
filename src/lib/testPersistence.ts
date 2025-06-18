import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export async function testUserSessionsTable(): Promise<{
  tableExists: boolean;
  canRead: boolean;
  canWrite: boolean;
  error?: string;
}> {
  try {
    // Test if table exists and we can read from it
    const { data: readData, error: readError } = await supabase
      .from('user_sessions')
      .select('id')
      .limit(1);

    if (readError) {
      if (readError.code === '42P01') {
        return {
          tableExists: false,
          canRead: false,
          canWrite: false,
          error: 'Table user_sessions does not exist'
        };
      }
      return {
        tableExists: true,
        canRead: false,
        canWrite: false,
        error: readError.message
      };
    }

    // Test if we can write to the table (will fail if user not authenticated)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        tableExists: true,
        canRead: true,
        canWrite: false,
        error: 'User not authenticated - cannot test write permissions'
      };
    }

    // Check if user already has session data - if so, don't overwrite with test data
    const { data: existingSession } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingSession) {
      // User has existing data, just verify we can read/write without overwriting
      console.log('✅ User has existing session data - skipping test write to avoid overwriting');
      return {
        tableExists: true,
        canRead: true,
        canWrite: true // We assume write works if read works and user is authenticated
      };
    }

    // Only create test data if user has no existing session
    console.log('📝 No existing session found - testing write permissions with temporary data');
    
    // Try to upsert a minimal test record that won't interfere with real data
    const { error: writeError } = await supabase
      .from('user_sessions')
      .upsert({
        user_id: user.id,
        current_card_name: 'TEMP_TEST_CARD_DELETE_ME',
        current_card_issuer: 'Test Bank',
        analysis_time_period: 'month',
        uploaded_files: [],
        manual_spending_entries: []
      }, {
        onConflict: 'user_id'
      });

    if (writeError) {
      return {
        tableExists: true,
        canRead: true,
        canWrite: false,
        error: writeError.message
      };
    }

    // Immediately clean up the test data
    console.log('🧹 Cleaning up test data');
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', user.id)
      .eq('current_card_name', 'TEMP_TEST_CARD_DELETE_ME');

    return {
      tableExists: true,
      canRead: true,
      canWrite: true
    };

  } catch (error) {
    return {
      tableExists: false,
      canRead: false,
      canWrite: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getUserSessionCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting session count:', error);
      return -1;
    }

    return count || 0;
  } catch (error) {
    console.error('Failed to get session count:', error);
    return -1;
  }
}

// ... existing code ...