import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { currentCards } = await request.json(); // Expecting an array of card names (strings)

  // Validate input: ensure currentCards is an array of strings
  if (!Array.isArray(currentCards) || !currentCards.every(card => typeof card === 'string')) {
    return NextResponse.json({ error: 'Invalid input format. Expected an array of strings.' }, { status: 400 });
  }

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

    // Update the user's metadata with the new list of current cards
    const { data, error } = await supabase.auth.updateUser({
      data: { current_cards: currentCards },
    });

    if (error) {
      console.error('Error updating user metadata:', error);
      return NextResponse.json({ error: 'Failed to update current cards' }, { status: 500 });
    }

    console.log('User metadata updated for user:', user.id, '- current_cards:', currentCards);

    return NextResponse.json({ message: 'Current cards updated successfully', user: data.user });

  } catch (error) {
    console.error('Error in update-cards API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 