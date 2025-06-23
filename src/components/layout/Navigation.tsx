'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { FaBars, FaTimes } from 'react-icons/fa'

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

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <nav className="bg-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="text-xl font-bold text-green-600">CardWise</a>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {user.app_metadata?.is_partner ? (
                  // Partner Navigation
                  <>
                    <a href="/partner/dashboard" className="text-gray-700 hover:text-green-700 font-medium transition-colors px-3 py-2 rounded-md text-sm">Dashboard</a>
                    <a href="/partner/analytics" className="text-gray-700 hover:text-green-700 font-medium transition-colors px-3 py-2 rounded-md text-sm">Analytics</a>
                    <a href="/partner/billing" className="text-gray-700 hover:text-green-700 font-medium transition-colors px-3 py-2 rounded-md text-sm">Billing</a>
                    <a href="/partner/account-settings" className="text-gray-700 hover:text-green-700 font-medium transition-colors px-3 py-2 rounded-md text-sm">Settings</a>
                  </>
                ) : (
                  // User Navigation
                  <>
                    <a href="/dashboard" className="text-gray-700 hover:text-green-700 font-medium transition-colors px-3 py-2 rounded-md text-sm">Dashboard</a>
                    <a href="/my-cards" className="text-gray-700 hover:text-green-700 font-medium transition-colors px-3 py-2 rounded-md text-sm">My Cards</a>
                    <a href="/recommendations" className="text-gray-700 hover:text-green-700 font-medium transition-colors px-3 py-2 rounded-md text-sm">Recommendations</a>
                    <a href="/profile" className="text-gray-700 hover:text-green-700 font-medium transition-colors px-3 py-2 rounded-md text-sm">Profile</a>
                  </>
                )}
                <button
                  onClick={handleSignOut}
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <a href="/about" className="text-gray-700 hover:text-green-700 font-medium transition-colors px-3 py-2 rounded-md text-sm">About</a>
                <a href="/pricing" className="text-gray-700 hover:text-green-700 font-medium transition-colors px-3 py-2 rounded-md text-sm">Pricing</a>
                <a href="/faq" className="text-gray-700 hover:text-green-700 font-medium transition-colors px-3 py-2 rounded-md text-sm">FAQ</a>
                <a href="/auth" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
                  Partner Sign In
                </a>
                <a href="/contact" className="ml-2 px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-transparent hover:bg-green-50 transition-colors">
                  Request Demo
                </a>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FaTimes className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FaBars className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {user ? (
                <>
                  {user.app_metadata?.is_partner ? (
                    // Partner Mobile Navigation
                    <>
                      <a href="/partner/dashboard" onClick={closeMenu} className="text-gray-700 hover:text-green-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">Dashboard</a>
                      <a href="/partner/analytics" onClick={closeMenu} className="text-gray-700 hover:text-green-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">Analytics</a>
                      <a href="/partner/billing" onClick={closeMenu} className="text-gray-700 hover:text-green-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">Billing</a>
                      <a href="/partner/account-settings" onClick={closeMenu} className="text-gray-700 hover:text-green-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">Settings</a>
                    </>
                  ) : (
                    // User Mobile Navigation
                    <>
                      <a href="/dashboard" onClick={closeMenu} className="text-gray-700 hover:text-green-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">Dashboard</a>
                      <a href="/my-cards" onClick={closeMenu} className="text-gray-700 hover:text-green-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">My Cards</a>
                      <a href="/recommendations" onClick={closeMenu} className="text-gray-700 hover:text-green-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">Recommendations</a>
                      <a href="/profile" onClick={closeMenu} className="text-gray-700 hover:text-green-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">Profile</a>
                    </>
                  )}
                  <button
                    onClick={() => { handleSignOut(); closeMenu(); }}
                    className="w-full text-left text-gray-700 hover:text-green-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <a href="/about" onClick={closeMenu} className="text-gray-700 hover:text-green-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">About</a>
                  <a href="/pricing" onClick={closeMenu} className="text-gray-700 hover:text-green-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">Pricing</a>
                  <a href="/faq" onClick={closeMenu} className="text-gray-700 hover:text-green-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">FAQ</a>
                  <div className="px-3 py-2 space-y-2">
                    <a href="/auth" onClick={closeMenu} className="w-full block text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
                      Partner Sign In
                    </a>
                    <a href="/contact" onClick={closeMenu} className="w-full block text-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-transparent hover:bg-green-50 transition-colors">
                      Request Demo
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 