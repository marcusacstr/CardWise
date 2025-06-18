import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Expecting preferences data in the request body
  const { preferredCards, excludedCards, country } = await request.json();

  // Create a Supabase client configured to use cookies
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error('Error fetching user:', userError);
        return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Data to insert/update
    const preferenceData = {
      user_id: user.id,
      preferred_cards: preferredCards || null, // Ensure null if empty/not provided
      excluded_cards: excludedCards || null, // Ensure null if empty/not provided
      country: country || null,
      // Add other preferences as needed
    };

    // Attempt to update the existing row, or insert a new one if it doesn't exist
    const { error } = await supabase
      .from('user_preferences')
      .upsert(preferenceData, { onConflict: 'user_id' }); // Upsert based on user_id

    if (error) {
      console.error('Error updating user preferences:', error);
      return NextResponse.json({ error: 'Failed to update user preferences' }, { status: 500 });
    }

    console.log('User preferences updated for user:', user.id);

    return NextResponse.json({ message: 'User preferences updated successfully' });

  } catch (error) {
    console.error('Error in update-preferences API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 