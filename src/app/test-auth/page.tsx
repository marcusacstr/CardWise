'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TestUser {
  id: string
  email: string
  name: string
  type: 'user' | 'partner'
}

const TEST_ACCOUNTS = [
  {
    id: 'user-123',
    email: 'user@test.com',
    name: 'Test User',
    type: 'user' as const,
    description: 'Regular user account - Goes to /dashboard',
    icon: '👤',
    color: 'blue'
  },
  {
    id: 'partner-123', 
    email: 'partner@test.com',
    name: 'Test Partner',
    type: 'partner' as const,
    description: 'Partner account - Goes to /partner/dashboard',
    icon: '🏢',
    color: 'green'
  },
  {
    id: 'advisor-123',
    email: 'advisor@test.com', 
    name: 'Financial Advisor',
    type: 'partner' as const,
    description: 'Financial advisor partner account',
    icon: '💼',
    color: 'purple'
  }
]

export default function TestAuthPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleTestLogin = async (account: typeof TEST_ACCOUNTS[0]) => {
    setIsLoading(account.id)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const userData: TestUser = {
      id: account.id,
      email: account.email,
      name: account.name,
      type: account.type
    }
    
    localStorage.setItem('testUser', JSON.stringify(userData))
    
    // Redirect based on user type
    if (account.type === 'partner') {
      router.push('/partner/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  const clearTestData = () => {
    localStorage.removeItem('testUser')
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🚀 CardWise Test Authentication</h1>
          <p className="text-xl text-gray-600 mb-2">Choose an account to test the user flows</p>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
            ⚠️ Test Mode - No real authentication required
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {TEST_ACCOUNTS.map((account) => {
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
              green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700', 
              purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
            }
            
            return (
              <div key={account.id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="text-center">
                  <div className="text-4xl mb-4">{account.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{account.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{account.email}</p>
                  <p className="text-xs text-gray-500 mb-4">{account.description}</p>
                  
                  <button
                    onClick={() => handleTestLogin(account)}
                    disabled={isLoading !== null}
                    className={`w-full bg-gradient-to-r ${colorClasses[account.color]} text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading === account.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Logging in...
                      </div>
                    ) : (
                      `Login as ${account.type === 'user' ? 'User' : 'Partner'}`
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Test Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">User Portal Features:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Dashboard with spending analysis</li>
                <li>Credit card recommendations</li>
                <li>Rewards tracking</li>
                <li>User profile management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Partner Portal Features:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Client management dashboard</li>
                <li>Analytics and reporting</li>
                <li>Custom branding options</li>
                <li>Revenue tracking</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={clearTestData}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Clear Test Data
          </button>
          <Link
            href="/"
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Homepage
          </Link>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>This is a development testing interface. In production, real authentication would be required.</p>
        </div>
      </div>
    </div>
  )
} 