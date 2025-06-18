import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function AdminCardsPage() {
  const supabase = createServerComponentClient({ cookies });

  // TODO: Implement admin authentication/authorization
  // For now, let's just fetch the user to check if they are logged in at all
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    // If not logged in or error fetching user, redirect to login
    redirect('/auth'); // Or redirect to a specific admin login page
  }

  // TODO: Check if the logged-in user has admin privileges
  // If not, redirect or show an access denied message
  // Example: if (!user.user_metadata?.is_admin) { redirect('/dashboard'); }

  // --- Fetch Credit Card Data ---
  const { data: creditCards, error: fetchError } = await supabase
    .from('credit_cards')
    .select('*') // Fetch all columns for admin view
    .order('name', { ascending: true });

  if (fetchError) {
    console.error('Error fetching credit cards for admin:', fetchError);
    // Handle error gracefully in the UI
    return <div className="container mx-auto p-6 text-red-600">Error loading credit card data.</div>;
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