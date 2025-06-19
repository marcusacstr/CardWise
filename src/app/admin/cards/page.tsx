import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

export const dynamic = 'force-dynamic'

export default async function AdminCardsPage() {
  let supabase;
  let user = null;
  let creditCards = [];
  let hasError = false;

  try {
    supabase = createServerComponentClient({ cookies });
    
    // Try to get user, but handle gracefully if it fails
    try {
      const { data: { user: fetchedUser }, error: userError } = await supabase.auth.getUser();
      user = fetchedUser;
      
      if (userError) {
        console.warn('User fetch error:', userError);
      }
    } catch (authError) {
      console.warn('Auth error during build:', authError);
      hasError = true;
    }

    // Only redirect if we're not in a build environment and user is actually missing
    if (!hasError && !user && typeof window !== 'undefined') {
      redirect('/auth');
    }

    // Try to fetch credit cards, but handle gracefully if it fails
    if (!hasError && user) {
      try {
        const { data: fetchedCards, error: fetchError } = await supabase
          .from('credit_cards')
          .select('*')
          .order('name', { ascending: true });

        if (fetchError) {
          console.error('Error fetching credit cards:', fetchError);
          hasError = true;
        } else {
          creditCards = fetchedCards || [];
        }
      } catch (dbError) {
        console.warn('Database error during build:', dbError);
        hasError = true;
      }
    }
  } catch (clientError) {
    console.warn('Supabase client error during build:', clientError);
    hasError = true;
  }

  // If we're in a build environment or have errors, show a placeholder
  if (hasError) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Credit Card Database</h1>
        <div className="text-lg text-muted-foreground">
          Loading credit card data...
        </div>
      </div>
    );
  }

  // If no user and not in build, this will trigger the redirect above
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Credit Card Database</h1>
        <div className="text-lg text-muted-foreground">
          Please log in to access this page.
        </div>
      </div>
    );
  }

  // --- Display UI ---
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Credit Card Database</h1>

      {/* TODO: Add search/filter options */}

      {creditCards && creditCards.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Issuer</th>
                <th className="py-2 px-4 border-b text-left">Annual Fee</th>
                <th className="py-2 px-4 border-b text-left">Base Rate</th>
                <th className="py-2 px-4 border-b text-left">Reward Type</th>
                <th className="py-2 px-4 border-b text-left">Country</th>
                {/* TODO: Add more columns as needed */}
                 <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {creditCards.map(card => (
                <tr key={card.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{card.name}</td>
                  <td className="py-2 px-4 border-b">{card.issuer}</td>
                  <td className="py-2 px-4 border-b">${card.annual_fee?.toFixed(2) || '0.00'}</td>
                  <td className="py-2 px-4 border-b">{card.base_earn_rate || 'N/A'}x</td>
                   <td className="py-2 px-4 border-b capitalize">{card.reward_type || 'points'}</td>
                    <td className="py-2 px-4 border-b">{card.country || 'N/A'}</td>
                  {/* TODO: Add more data cells */}
                   <td className="py-2 px-4 border-b">
                       {/* TODO: Add Edit/Delete buttons */}
                       Edit | Delete
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : ( 
        <div className="text-lg text-muted-foreground">
          No credit cards found in the database.
        </div>
      )}

      {/* TODO: Add button to Add New Card */}

    </div>
  );
} 