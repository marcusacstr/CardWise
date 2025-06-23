'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { SpendingDataProvider } from '@/contexts/SpendingDataContext';
import DashboardContent from '@/components/DashboardContent';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  if (!user) {
    return <div className="p-8 text-center">Loading user...</div>;
  }

  return (
    <SpendingDataProvider user={user}>
      <DashboardContent user={user} />
    </SpendingDataProvider>
  );
} 