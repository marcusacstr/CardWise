'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function TestLogin() {
  const [email, setEmail] = useState('marcus.acaster@gmail.com');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const supabase = createClientComponentClient();

  const testLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setResult({
        success: !error,
        data: data,
        error: error?.message,
        user: data?.user,
        session: data?.session
      });

      if (data?.user) {
        console.log('Login successful! User:', data.user);
        console.log('User metadata:', data.user.user_metadata);
      }

    } catch (err: any) {
      setResult({
        success: false,
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-500">
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Test Login Credentials</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <button
              onClick={testLogin}
              disabled={loading || !password}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              Result: {result.success ? '✅ Success' : '❌ Failed'}
            </h2>
            
            {result.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <strong className="text-red-800">Error:</strong>
                <p className="text-red-700">{result.error}</p>
              </div>
            )}
            
            {result.user && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <strong className="text-green-800">Login Successful!</strong>
                <p className="text-green-700">User ID: {result.user.id}</p>
                <p className="text-green-700">Email: {result.user.email}</p>
                <p className="text-green-700">Email Verified: {result.user.email_confirmed_at ? 'Yes' : 'No'}</p>
              </div>
            )}
            
            <div>
              <strong>Full Response:</strong>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 