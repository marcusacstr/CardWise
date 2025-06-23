'use client'

import React, { useState } from 'react'
import { FaUserShield, FaLock, FaEnvelope, FaCheck, FaExclamationTriangle } from 'react-icons/fa'

const SUPER_ADMIN_EMAILS = [
  'marcus@cardwise.com',
  'admin@cardwise.com',
  'team@cardwise.com',
]

export default function SuperAdminSetup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setMessage('Please fill in all fields')
      return
    }

    if (!SUPER_ADMIN_EMAILS.includes(email)) {
      setMessage('Email not authorized for super admin access')
      return
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/super-admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setMessage(`Super admin account created successfully for ${email}`)
        setEmail('')
        setPassword('')
      } else {
        setMessage(data.error || 'Failed to create admin account')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <FaUserShield className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Super Admin Setup
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create super admin accounts for CardWise team members
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Authorized Emails Only
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Only these emails can create super admin accounts:
                </p>
                <ul className="mt-2 text-sm text-yellow-700">
                  {SUPER_ADMIN_EMAILS.map(email => (
                    <li key={email} className="font-mono">• {email}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleCreateAdmin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <div className="mt-1 relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Enter admin email"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Create a strong password"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Minimum 8 characters required
              </p>
            </div>

            {message && (
              <div className={`p-4 rounded-md ${success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex">
                  {success ? (
                    <FaCheck className="h-5 w-5 text-green-400" />
                  ) : (
                    <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                  )}
                  <p className={`ml-3 text-sm ${success ? 'text-green-800' : 'text-red-800'}`}>
                    {message}
                  </p>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FaUserShield className="h-5 w-5 mr-2" />
                    Create Super Admin Account
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-600">
              After creating an account, you can sign in at{' '}
              <a 
                href="/super-admin" 
                className="font-medium text-red-600 hover:text-red-500"
              >
                /super-admin
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 