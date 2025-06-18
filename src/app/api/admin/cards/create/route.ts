import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  // Expecting credit card data in the request body
  const newCardData = await request.json();

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

    // TODO: Implement proper admin authorization check here
    // Example: if (!user.user_metadata?.is_admin) { return NextResponse.json({ error: 'Unauthorized' }, { status: 403 }); }

    // --- Insert new card data into Supabase ---
    // Ensure the keys in newCardData match the columns in your credit_cards table exactly
    const { data: createdCard, error: insertError } = await supabase
      .from('credit_cards')
      .insert([newCardData])
      .select()
      .single(); // Select the inserted row

    if (insertError) {
      console.error('Error inserting new credit card:', insertError);
      return NextResponse.json({ error: 'Failed to create credit card' }, { status: 500 });
    }

    console.log('New credit card created:', createdCard.name, 'by user:', user.id);

    return NextResponse.json({ message: 'Credit card created successfully', card: createdCard });

  } catch (error) {
    console.error('Error in create-card API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 