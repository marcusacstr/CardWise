'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function SignOutButton() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      // Redirect to login or home page after sign out
      router.push('/auth'); // Assuming '/auth' is your login page
    } else {
      console.error('Error signing out:', error);
      // Optionally display an error message to the user
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 rounded-md border border-border bg-background text-foreground font-semibold shadow-sm hover:bg-muted transition"
    >
      Sign Out
    </button>
  );
} 