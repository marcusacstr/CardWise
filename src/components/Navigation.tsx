'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { FaUser, FaSignOutAlt, FaBuilding, FaSpinner, FaBars, FaTimes, FaCog } from 'react-icons/fa'

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  // Check authentication status
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Auth error:', error)
        }
        setUser(user)
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setShowUserMenu(false)
      setShowMobileMenu(false)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Don't show navigation on auth pages
  if (pathname?.includes('/auth')) {
    return null
  }

  // Determine if user is a partner (you may need to adjust this logic based on your user metadata)
  const isPartner = user?.user_metadata?.account_type === 'partner' || pathname?.includes('/partner')
  const displayName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Always goes to homepage */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CW</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CardWise</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Show marketing links only when NOT logged in */}
            {!user && (
              <>
                <Link href="/about" className="text-gray-600 hover:text-green-600 transition-colors">
                  About
                </Link>
                <Link href="/pricing" className="text-gray-600 hover:text-green-600 transition-colors">
                  Pricing
                </Link>
              </>
            )}
            
            {/* Show My Dashboard link when logged in */}
            {user && (
              <>
                <Link 
                  href={isPartner ? "/partner/dashboard" : "/dashboard"}
                  className="text-gray-600 hover:text-green-600 transition-colors font-medium"
                >
                  My Dashboard
                </Link>
                <Link 
                  href={isPartner ? "/partner/account-settings" : "/settings"}
                  className="text-gray-600 hover:text-green-600 transition-colors font-medium"
                >
                  Settings
                </Link>
              </>
            )}
            
            {/* Authentication Section */}
            {loading ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <FaSpinner className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors font-medium"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth"
                  className="text-gray-600 hover:text-green-600 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/partner/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Get Started
                </Link>
                <Link
                  href="/partner/auth"
                  className="text-green-600 border border-green-600 px-4 py-2 rounded-md hover:bg-green-50 transition-colors font-medium"
                >
                  Partner Portal
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-600 hover:text-green-600 transition-colors p-2"
              >
                {showMobileMenu ? (
                  <FaTimes className="w-5 h-5" />
                ) : (
                  <FaBars className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation menu for non-authenticated users */}
      {showMobileMenu && !user && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            <Link 
              href="/about" 
              className="block text-gray-700 hover:text-green-600 transition-colors font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              About
            </Link>
            <Link 
              href="/pricing" 
              className="block text-gray-700 hover:text-green-600 transition-colors font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              Pricing
            </Link>
            <div className="border-t border-gray-200 pt-3 space-y-3">
              <Link
                href="/auth"
                className="block w-full text-center bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Sign In
              </Link>
              <Link
                href="/partner/register"
                className="block w-full text-center border border-green-600 text-green-600 px-4 py-3 rounded-md hover:bg-green-50 transition-colors font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Get Started
              </Link>
              <Link
                href="/partner/auth"
                className="block text-center text-green-600 hover:text-green-700 transition-colors font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Partner Portal
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile user menu for authenticated users */}
      {user && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3">
            <Link
              href={isPartner ? "/partner/dashboard" : "/dashboard"}
              className="block text-gray-700 hover:text-green-600 transition-colors font-medium mb-3"
            >
              My Dashboard
            </Link>
            <Link
              href={isPartner ? "/partner/account-settings" : "/settings"}
              className="block text-gray-700 hover:text-green-600 transition-colors font-medium mb-3"
            >
              Settings
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
