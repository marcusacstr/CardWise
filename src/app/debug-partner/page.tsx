'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function DebugPartner() {
  const [user, setUser] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkData() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          console.log('User metadata:', user.user_metadata);
          
          // Check if partner record exists
          const { data: partner, error: partnerError } = await supabase
            .from('partners')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (partnerError) {
            console.error('Partner query error:', partnerError);
            setError(`Partner query error: ${partnerError.message}`);
          } else {
            console.log('Partner data:', partner);
            setPartnerData(partner);
          }
        }
      } catch (err: any) {
        console.error('Debug error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    checkData();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-500">
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Partner Data Debug</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h3 className="text-red-800 font-semibold">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Auth Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Auth User Data</h2>
            {user ? (
              <div className="space-y-2">
                <div>
                  <strong>User ID:</strong> <code className="text-sm bg-gray-100 px-1 rounded">{user.id}</code>
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>Email Confirmed:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>User Metadata:</strong>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(user.user_metadata, null, 2)}
                  </pre>
                </div>
                <div>
                  <strong>App Metadata:</strong>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(user.app_metadata, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No user logged in</p>
            )}
          </div>

          {/* Partner Table Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Partners Table Data</h2>
            {partnerData ? (
              <div className="space-y-2">
                <div>
                  <strong>Partner ID:</strong> <code className="text-sm bg-gray-100 px-1 rounded">{partnerData.id}</code>
                </div>
                <div>
                  <strong>Company Name:</strong> {partnerData.company_name || 'Not set'}
                </div>
                <div>
                  <strong>Contact Email:</strong> {partnerData.contact_email || 'Not set'}
                </div>
                <div>
                  <strong>Full Name:</strong> {partnerData.full_name || 'Not set'}
                </div>
                <div>
                  <strong>Subscription Status:</strong> {partnerData.subscription_status || 'Not set'}
                </div>
                <div>
                  <strong>Subscription Plan:</strong> {partnerData.subscription_plan || 'Not set'}
                </div>
                <div>
                  <strong>Created At:</strong> {partnerData.created_at}
                </div>
                <div>
                  <strong>Updated At:</strong> {partnerData.updated_at}
                </div>
                <div>
                  <strong>All Data:</strong>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(partnerData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : user ? (
              <p className="text-red-500">No partner record found for this user</p>
            ) : (
              <p className="text-gray-500">Please log in to see partner data</p>
            )}
          </div>
        </div>

        {/* Test Partner Creation */}
        {user && !partnerData && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-yellow-800 font-semibold mb-2">Missing Partner Record</h3>
            <p className="text-yellow-700 mb-4">
              You have a user account but no partner record. This suggests the partner creation failed during registration.
            </p>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/create-partner', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      user_id: user.id,
                      company_name: user.user_metadata?.company_name || 'Test Company',
                      contact_email: user.email,
                      full_name: user.user_metadata?.full_name || 'Test User',
                      subscription_status: 'trial',
                      subscription_plan: 'basic'
                    })
                  });
                  
                  if (response.ok) {
                    alert('Partner record created! Refresh the page.');
                  } else {
                    const errorData = await response.json();
                    alert(`Failed to create partner record: ${errorData.error}`);
                  }
                } catch (err: any) {
                  alert(`Error: ${err.message}`);
                }
              }}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Create Partner Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
}