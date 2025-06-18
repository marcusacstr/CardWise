'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';

export default function PartnerNavigation() {
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: partnerData } = await supabase
          .from('partners')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setPartner(partnerData);
      }
    };
    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (pathname === '/partner/auth') {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/partner/dashboard" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-indigo-600">CardWise</div>
              {partner?.company_name && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="text-lg font-medium text-gray-700">{partner.company_name}</span>
                </>
              )}
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                  title="Sign Out"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}