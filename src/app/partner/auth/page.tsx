'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBuilding, FaArrowLeft, FaUser, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function PartnerAuth() {
  const [isLogin, setIsLogin] = useState(true); // Default to login since registration is handled in /partner/register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Helper function to handle rate limit errors
  const handleRateLimit = async (retryAfter = 5000) => {
    setError(`Rate limit reached. Retrying in ${retryAfter/1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, retryAfter));
    setError(null);
  };

  // Helper function for exponential backoff
  const getRetryDelay = (attempt: number) => {
    return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const attemptAuth = async (attempt = 0): Promise<void> => {
      try {
        if (isLogin) {
          // Login with timeout
          const authPromise = supabase.auth.signInWithPassword({
            email,
            password,
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Authentication timeout')), 15000)
          );

          const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any;

          if (error) {
            // Handle specific error types
            if (error.message?.includes('rate') || error.message?.includes('too many') || error.status === 429) {
              if (attempt < 3) {
                const delay = getRetryDelay(attempt);
                await handleRateLimit(delay);
                return attemptAuth(attempt + 1);
              } else {
                throw new Error('Rate limit exceeded. Please wait a few minutes and try again, or try using an incognito browser window.');
              }
            }
            throw error;
          }

          setSuccess('Login successful! Redirecting to your dashboard...');
          setTimeout(() => {
            router.push('/partner/dashboard');
          }, 1000);
        } else {
          // Sign up with timeout
          const authPromise = supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                company_name: companyName,
                is_partner: true
              }
            }
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Authentication timeout')), 15000)
          );

          const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any;

          if (error) {
            // Handle specific error types
            if (error.message?.includes('rate') || error.message?.includes('too many') || error.status === 429) {
              if (attempt < 3) {
                const delay = getRetryDelay(attempt);
                await handleRateLimit(delay);
                return attemptAuth(attempt + 1);
              } else {
                throw new Error('Rate limit exceeded. Please wait a few minutes and try again, or try using an incognito browser window.');
              }
            }
            throw error;
          }

          if (data.user) {
            // Create partner record
            console.log('Creating partner record for user:', data.user.id);
            const { error: partnerError } = await supabase
              .from('partners')
              .insert([
                {
                  user_id: data.user.id,
                  company_name: companyName,
                  contact_email: email,
                  subscription_status: 'trial',
                  subscription_plan: subscriptionPlan
                }
              ])

            if (partnerError) {
              console.error('Error creating partner record:', partnerError);
              // Try to create via API as fallback
              try {
                const response = await fetch('/api/create-partner', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    user_id: data.user.id,
                    company_name: companyName,
                    contact_email: email,
                    subscription_status: 'trial',
                    subscription_plan: subscriptionPlan
                  })
                });
                
                if (!response.ok) {
                  throw new Error('API partner creation failed');
                }
                console.log('Partner record created via API fallback');
              } catch (apiError) {
                console.error('Both direct and API partner creation failed:', apiError);
                setError('Failed to create partner account. Please contact support.');
                return;
              }
            } else {
              console.log('Partner record created successfully');
            }

            setSuccess('Partner account created successfully! Please check your email to verify your account.');
            
            // Clear saved registration data
            localStorage.removeItem('partnerRegistrationData');
          }
        }
      } catch (error: any) {
        console.error('Authentication error:', error);
        
        // Handle timeout errors
        if (error.message === 'Authentication timeout') {
          setError('Authentication is taking longer than expected. Please try again.');
        } else {
          setError(error.message);
        }
      }
    };

    try {
      await attemptAuth();
    } finally {
      setLoading(false);
      setRetryCount(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
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
            CardWise Partner Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your partner account
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Rate Limit Info */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6">
          <div className="flex items-start">
            <FaExclamationTriangle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Rate Limit Issues?</h3>
              <p className="text-sm text-blue-700 mt-1">
                If you're experiencing "rate limit" errors, try:
              </p>
              <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
                <li>Clearing your browser cookies and cache</li>
                <li>Using an incognito/private browser window</li>
                <li>Waiting 5-10 minutes before trying again</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Partner Benefits */}
        {!isLogin && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Benefits</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <FaCheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-700">White-label credit card portal</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-700">Earn up to 5% commission on referrals</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-700">Real-time analytics and reporting</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-700">Custom branding and domain</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/partner/register" className="font-medium text-green-600 hover:text-green-500">
                Register as a partner here
              </Link>
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center">
                <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center">
                <FaCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleAuth}>
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name *
                  </label>
                  <div className="mt-1">
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required={!isLogin}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Your Company Name"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <div className="mt-1">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required={!isLogin}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Your Full Name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-gray-700">
                    Subscription Plan *
                  </label>
                  <div className="mt-1">
                    <select
                      id="subscriptionPlan"
                      name="subscriptionPlan"
                      value={subscriptionPlan}
                      onChange={(e) => setSubscriptionPlan(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="basic">Basic Plan ($29/month)</option>
                      <option value="premium">Premium Plan ($79/month)</option>
                      <option value="enterprise">Enterprise Plan ($199/month)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address *
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  <>
                    <FaUser className="mr-2 h-4 w-4" />
                    {isLogin ? 'Sign in' : 'Create partner account'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Development Bypass (only show in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <div className="flex items-start">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Development Bypass</h3>
                <p className="text-sm text-yellow-700 mt-1 mb-3">
                  Experiencing rate limit issues? You can bypass authentication in development:
                </p>
                <Link
                  href="/partner/dashboard"
                  className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 transition-colors"
                >
                  Access Dashboard Directly
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 