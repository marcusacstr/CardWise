'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { FaUser, FaSignOutAlt, FaCog, FaBuilding, FaSpinner } from 'react-icons/fa'

// Test users for easy testing (bypass Supabase)
const TEST_MODE = true // Set to false for production
const TEST_USERS = {
  'user@test.com': { type: 'user' as const, name: 'Test User', id: 'user-123' },
  'partner@test.com': { type: 'partner' as const, name: 'Test Partner', id: 'partner-123' }
}

interface TestUser {
  id: string
  email: string
  type: 'user' | 'partner'
  name: string
}

export default function Navigation() {
  const [user, setUser] = useState<TestUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showTestLogin, setShowTestLogin] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Load saved test user on mount
  useEffect(() => {
    if (TEST_MODE) {
      const savedUser = localStorage.getItem('testUser')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (error) {
          localStorage.removeItem('testUser')
        }
      }
    }
  }, [])

  const handleTestLogin = (email: string) => {
    if (!TEST_MODE) return
    
    const testUser = TEST_USERS[email as keyof typeof TEST_USERS]
    if (!testUser) return

    const userData: TestUser = {
      id: testUser.id,
      email,
      type: testUser.type,
      name: testUser.name
    }

    setUser(userData)
    localStorage.setItem('testUser', JSON.stringify(userData))
    setShowTestLogin(false)
    setShowUserMenu(false)

    // Redirect based on user type
    if (testUser.type === 'partner') {
      router.push('/partner/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  const handleSignOut = () => {
    if (TEST_MODE) {
      setUser(null)
      localStorage.removeItem('testUser')
      setShowUserMenu(false)
      router.push('/')
    }
  }

  // Don't show navigation on auth pages
  if (pathname?.includes('/auth')) {
    return null
  }

  const isPartner = user?.type === 'partner'
  const displayName = user?.name || 'User'

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CW</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CardWise</span>
              {TEST_MODE && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">TEST MODE</span>
              )}
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="text-gray-600 hover:text-green-600 transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-green-600 transition-colors">
              Pricing
            </Link>
            
            {/* Authentication Section */}
            {loading ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <FaSpinner className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    {isPartner ? (
                      <FaBuilding className="w-4 h-4 text-green-600" />
                    ) : (
                      <FaUser className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{displayName}</span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                      {isPartner ? 'Partner Account' : 'User Account'}
                      {TEST_MODE && ' (Test)'}
                    </div>
                    
                    <Link
                      href={isPartner ? "/partner/dashboard" : "/dashboard"}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <FaCog className="w-4 h-4" />
                        <span>Dashboard</span>
                      </div>
                    </Link>
                    
                    {TEST_MODE && !isPartner && (
                      <button
                        onClick={() => handleTestLogin('partner@test.com')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <FaBuilding className="w-4 h-4" />
                          <span>Switch to Partner</span>
                        </div>
                      </button>
                    )}

                    {TEST_MODE && isPartner && (
                      <button
                        onClick={() => handleTestLogin('user@test.com')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <FaUser className="w-4 h-4" />
                          <span>Switch to User</span>
                        </div>
                      </button>
                    )}
                    
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>Sign Out</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {TEST_MODE && (
                  <div className="relative">
                    <button
                      onClick={() => setShowTestLogin(!showTestLogin)}
                      className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                    >
                      🚀 Quick Test Login
                    </button>
                    {showTestLogin && (
                      <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50 w-48">
                        <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                          Test Accounts
                        </div>
                        <button
                          onClick={() => handleTestLogin('user@test.com')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <div className="flex items-center space-x-2">
                            <FaUser className="w-4 h-4 text-blue-500" />
                            <span>User Portal</span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleTestLogin('partner@test.com')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <div className="flex items-center space-x-2">
                            <FaBuilding className="w-4 h-4 text-green-500" />
                            <span>Partner Portal</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
          <div className="md:hidden">
            {user ? (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  {isPartner ? (
                    <FaBuilding className="w-4 h-4 text-green-600" />
                  ) : (
                    <FaUser className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                {TEST_MODE && (
                  <button
                    onClick={() => setShowTestLogin(!showTestLogin)}
                    className="text-blue-600 text-sm"
                  >
                    Test
                  </button>
                )}
                <Link
                  href="/auth"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Test Login Menu */}
      {TEST_MODE && showTestLogin && !user && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 text-xs text-gray-500">
            Quick Test Logins
          </div>
          <button
            onClick={() => handleTestLogin('user@test.com')}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <div className="flex items-center space-x-2">
              <FaUser className="w-4 h-4 text-blue-500" />
              <span>User Portal</span>
            </div>
          </button>
          <button
            onClick={() => handleTestLogin('partner@test.com')}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <div className="flex items-center space-x-2">
              <FaBuilding className="w-4 h-4 text-green-500" />
              <span>Partner Portal</span>
            </div>
          </button>
        </div>
      )}

      {/* Mobile user dropdown menu */}
      {showUserMenu && user && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 text-xs text-gray-500">
            {isPartner ? 'Partner Account' : 'User Account'} {TEST_MODE && '(Test)'}
          </div>
          <Link
            href={isPartner ? "/partner/dashboard" : "/dashboard"}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setShowUserMenu(false)}
          >
            Dashboard
          </Link>
          {TEST_MODE && (
            <button
              onClick={() => handleTestLogin(isPartner ? 'user@test.com' : 'partner@test.com')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Switch to {isPartner ? 'User' : 'Partner'}
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  )
}
