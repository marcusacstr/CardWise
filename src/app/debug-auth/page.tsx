'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DebugAuth() {
  const [user, setUser] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      setUser(user);

      if (user) {
        const { data: partnerData, error } = await supabase
          .from('partners')
          .select('*')
          .eq('user_id', user.id)
          .single();

        console.log('Partner data:', partnerData);
        console.log('Partner error:', error);
        setPartnerData(partnerData);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const testRedirect = async () => {
    if (!user) {
      alert('No user logged in');
      return;
    }

    const { data: partnerData, error } = await supabase
      .from('partners')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('Test redirect - Partner data:', partnerData);
    console.log('Test redirect - Error:', error);

    if (partnerData && !error) {
      console.log('Redirecting to partner dashboard...');
      router.push('/partner/dashboard');
    } else {
      console.log('Redirecting to user dashboard...');
      router.push('/dashboard');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">User Info</h2>
          {user ? (
            <pre className="text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
          ) : (
            <p>No user logged in</p>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Partner Data</h2>
          {partnerData ? (
            <pre className="text-sm overflow-auto">{JSON.stringify(partnerData, null, 2)}</pre>
          ) : (
            <p>No partner record found</p>
          )}
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">User Type</h2>
          <p className="text-lg font-bold">
            {partnerData ? '🏢 PARTNER' : '👤 USER'}
          </p>
        </div>

        {user && (
          <div className="bg-yellow-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Test Redirect</h2>
            <button 
              onClick={testRedirect}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Redirect Logic
            </button>
          </div>
        )}

        {!user && (
          <div className="bg-red-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Not Logged In</h2>
            <p>Please sign in first, then return to this page.</p>
            <a href="/auth" className="text-blue-600 hover:text-blue-800">Go to Auth Page</a>
          </div>
        )}
      </div>
    </div>
  );
} 