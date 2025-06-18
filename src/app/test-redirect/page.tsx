'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TestRedirect() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const testWindowLocation = () => {
    setMessage('Testing window.location.href...');
    setTimeout(() => {
      console.log('🧪 Using window.location.href to redirect');
      window.location.href = '/partner/dashboard';
    }, 1000);
  };

  const testRouterPush = () => {
    setMessage('Testing router.push...');
    setTimeout(() => {
      console.log('🧪 Using router.push to redirect');
      router.push('/partner/dashboard');
    }, 1000);
  };

  const testImmediateRedirect = () => {
    setMessage('Testing immediate redirect...');
    console.log('🧪 Immediate router.push');
    router.push('/partner/dashboard');
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Redirect Test Page</h1>
      
      {message && (
        <div className="bg-blue-100 p-4 rounded mb-4">
          <p>{message}</p>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={testWindowLocation}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test window.location.href (1s delay)
        </button>

        <button
          onClick={testRouterPush}
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Test router.push (1s delay)
        </button>

        <button
          onClick={testImmediateRedirect}
          className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Test immediate router.push
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>Check browser console for debug messages.</p>
      </div>
    </div>
  );
} 