'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaSpinner } from 'react-icons/fa'

export default function SuperAdminLogin() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Super admin email whitelist - only these emails can access
  const SUPER_ADMIN_EMAILS = [
    'marcus@cardwise.com',
    'admin@cardwise.com',
    'team@cardwise.com',
    'marcus.acaster@gmail.com', // Add your real email temporarily
    // Add your team emails here
  ]

  useEffect(() => {
    checkSuperAdminAuth()
  }, [])

  const checkSuperAdminAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Allow access for super admin emails even if not verified
      if (user && SUPER_ADMIN_EMAILS.includes(user.email || '')) {
        setIsAuthenticated(true)
        router.push('/super-admin/dashboard')
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setCheckingAuth(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Check if email is in super admin whitelist
    if (!SUPER_ADMIN_EMAILS.includes(email)) {
      setError('Access denied. This email is not authorized for super admin access.')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Double-check email authorization after successful login
        // Allow access even if email is not verified for super admin accounts
        if (SUPER_ADMIN_EMAILS.includes(data.user.email || '')) {
          setIsAuthenticated(true)
          router.push('/super-admin/dashboard')
        } else {
          await supabase.auth.signOut()
          setError('Access denied. This account is not authorized for super admin access.')
        }
      }
    } catch (error: any) {
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4">
            <FaShieldAlt className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-white">CardWise Super Admin</h2>
          <p className="mt-2 text-red-200">Internal Team Access Only</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="admin@cardwise.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <FaLock />
                  <span>Access Super Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-xs">
              <strong>Security Notice:</strong> This portal is restricted to authorized CardWise team members only. 
              All access attempts are logged and monitored.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-red-200 text-sm">
          <p>CardWise Internal Systems v1.0</p>
          <p className="mt-1">Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  )
} 