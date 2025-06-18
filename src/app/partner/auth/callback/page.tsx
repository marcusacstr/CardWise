'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

function PartnerAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Auth callback error:', error);
            setStatus('error');
            setMessage('Failed to verify authentication. Please try again.');
            return;
          }

          if (data.user) {
            // Check if partner profile exists
            const { data: partnerData } = await supabase
              .from('partners')
              .select('*')
              .eq('user_id', data.user.id)
              .single();

            setStatus('success');
            setMessage('Authentication successful! Redirecting...');

            if (partnerData) {
              setTimeout(() => router.push('/partner/dashboard'), 1500);
            } else {
              setTimeout(() => router.push('/partner/register'), 1500);
            }
          }
        } else {
          setStatus('error');
          setMessage('No authentication code received. Please try signing in again.');
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleAuthCallback();
  }, [searchParams, router, supabase]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <div className="flex flex-col items-center space-y-4">
                <FaSpinner className="h-8 w-8 text-green-600 animate-spin" />
                <h2 className="text-xl font-medium text-gray-900">Processing Authentication</h2>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center space-y-4">
                <FaCheckCircle className="h-8 w-8 text-green-600" />
                <h2 className="text-xl font-medium text-gray-900">Success!</h2>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center space-y-4">
                <FaExclamationTriangle className="h-8 w-8 text-red-600" />
                <h2 className="text-xl font-medium text-gray-900">Authentication Failed</h2>
                <p className="text-sm text-gray-600">{message}</p>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/partner/auth')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PartnerAuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <PartnerAuthCallbackContent />
    </Suspense>
  );
} 