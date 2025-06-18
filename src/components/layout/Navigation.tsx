'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-green-600">CardWise</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.app_metadata?.is_partner ? (
                  // Partner Navigation
                  <>
                    <a href="/partner/dashboard" className="text-gray-700 hover:text-green-700 font-medium transition">Dashboard</a>
                    {/* Add more partner links here based on dashboard sections */}
                    <a href="/partner/analytics" className="text-gray-700 hover:text-green-700 font-medium transition">Analytics</a>
                    <a href="/partner/billing" className="text-gray-700 hover:text-green-700 font-medium transition">Billing</a>
                    <a href="/partner/account-settings" className="text-gray-700 hover:text-green-700 font-medium transition">Settings</a>
                  </>
                ) : (
                  // User Navigation
                  <>
                    <a href="/dashboard" className="text-gray-700 hover:text-green-700 font-medium transition">Dashboard</a>
                    <a href="/my-cards" className="text-gray-700 hover:text-green-700 font-medium transition">My Cards</a>
                    <a href="/recommendations" className="text-gray-700 hover:text-green-700 font-medium transition">Recommendations</a>
                    <a href="/profile" className="text-gray-700 hover:text-green-700 font-medium transition">Profile</a>
                  </>
                )}
                <button
                  onClick={handleSignOut}
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <a href="/auth" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                  Partner Sign In
                </a>
                <a href="/request-demo" className="ml-4 px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-transparent hover:bg-green-50">
                  Request Demo
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 