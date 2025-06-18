'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import CommissionTracker from '@/components/partner/CommissionTracker';

export default function CommissionsPage() {
  const [partnerId, setPartnerId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchPartnerInfo();
  }, []);

  const fetchPartnerInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/partner/auth');
        return;
      }

      const { data: partnerData } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!partnerData) {
        router.push('/partner/auth');
        return;
      }

      setPartnerId(partnerData.id);
    } catch (error) {
      console.error('Error fetching partner info:', error);
      router.push('/partner/auth');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/partner/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <div className="h-6 border-l border-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Commission Management</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {partnerId && <CommissionTracker partnerId={partnerId} />}
      </div>
    </div>
  );
} 