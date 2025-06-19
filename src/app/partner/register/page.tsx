'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaBuilding, FaArrowLeft, FaUser, FaCheckCircle, FaEnvelope, FaLock } from 'react-icons/fa'

export default function PartnerRegister() {
  // Form state
  const [step, setStep] = useState(1) // 1: Company Info, 2: Account Creation
  const [companyName, setCompanyName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [subscriptionPlan, setSubscriptionPlan] = useState('basic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$49/month',
      description: 'Perfect for small businesses and startups',
      features: ['Up to 100 users', 'Basic analytics', 'Email support', '1 custom domain']
    },
    {
      id: 'professional',
      name: 'Professional', 
      price: '$99/month',
      description: 'Ideal for growing businesses',
      features: ['Up to 500 users', 'Advanced analytics', 'Priority support', '3 custom domains', 'White-label branding']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$199/month', 
      description: 'For large organizations',
      features: ['Unlimited users', 'Enterprise analytics', '24/7 support', 'Unlimited domains', 'Full customization', 'Dedicated account manager']
    }
  ]

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName || !contactEmail || !fullName) {
      setError('Please fill in all required fields')
      return
    }
    setError(null)
    setStep(2)
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create the user account
      const { data, error } = await supabase.auth.signUp({
        email: contactEmail,
        password,
        options: {
          emailRedirectTo: process.env.NODE_ENV === 'production' 
            ? `${process.env.NEXTAUTH_URL || 'https://card-wise-7u2k840fv-marcus-projects-04c74091.vercel.app'}/auth/callback`
            : `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback`,
          data: {
            company_name: companyName,
            is_partner: true
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // Create partner record
        console.log('Creating partner record for user:', data.user.id)
        const { error: partnerError } = await supabase
          .from('partners')
          .insert([
            {
              user_id: data.user.id,
              company_name: companyName,
              contact_email: contactEmail,
              subscription_status: 'trial',
              subscription_plan: subscriptionPlan
            }
          ])

        if (partnerError) {
          console.error('Error creating partner record:', partnerError)
          // Try to create via API as fallback
          try {
            const response = await fetch('/api/create-partner', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: data.user.id,
                company_name: companyName,
                contact_email: contactEmail,
                subscription_status: 'trial',
                subscription_plan: subscriptionPlan
              })
            })
            
            if (!response.ok) {
              const errorData = await response.json()
              console.error('API partner creation failed:', errorData)
              throw new Error(`API partner creation failed: ${errorData.error}`)
            }
            console.log('Partner record created via API fallback')
          } catch (apiError) {
            console.error('Both direct and API partner creation failed:', apiError)
            setError(`Failed to create partner account: ${apiError.message}. Please contact support.`)
            return
          }
        } else {
          console.log('Partner record created successfully')
        }

        setSuccess('Partner account created successfully! Please check your email to verify your account.')
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/partner/dashboard')
        }, 2000)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-500 mb-4">
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <FaBuilding className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Become a CardWise Partner
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 
              ? 'Choose your plan and enter your business information'
              : 'Create your account to complete registration'
            }
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Business Info</span>
            <span>Account Setup</span>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        {step === 1 ? (
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {/* Step 1: Company Info and Pricing */}
            
            {/* Pricing Plans */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Choose Your Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pricingPlans.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`relative rounded-lg border cursor-pointer transition-all ${
                      subscriptionPlan === plan.id 
                        ? 'border-green-500 bg-green-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSubscriptionPlan(plan.id)}
                  >
                    <div className="p-6">
                      {subscriptionPlan === plan.id && (
                        <div className="absolute top-0 right-0 -mt-2 -mr-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <FaCheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                      <p className="text-2xl font-bold text-green-600 mt-2">{plan.price}</p>
                      <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                      
                      <ul className="mt-4 space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-700">
                            <FaCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Information Form */}
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <div className="mt-1">
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  Business Email *
                </label>
                <div className="mt-1">
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="business@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Contact Person Full Name *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  Continue to Account Setup
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 max-w-md mx-auto">
            {/* Step 2: Account Creation */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your Account</h3>
              <p className="text-sm text-gray-600">
                Complete your registration for <strong>{companyName}</strong>
              </p>
            </div>

            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    disabled
                    value={contactEmail}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Create a secure password"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="text-sm text-green-700">{success}</div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating Account...' : 'Create Partner Account'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/partner/auth" className="font-medium text-green-600 hover:text-green-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 