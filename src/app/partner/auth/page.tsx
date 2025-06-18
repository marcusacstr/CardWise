'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBuilding, FaArrowLeft, FaUser, FaCheckCircle } from 'react-icons/fa';

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
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  // No longer loading saved registration data since registration is handled in /partner/register

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setSuccess('Login successful! Redirecting to your dashboard...');
        setTimeout(() => {
          router.push('/partner/dashboard');
        }, 1000);
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              company_name: companyName,
              is_partner: true
            }
          }
        });

        if (error) throw error;

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
      setError(error.message);
    } finally {
      setLoading(false);
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
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Business Email Address *
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
                  placeholder="partner@company.com"
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
                  placeholder="••••••••"
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

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  isLogin ? 'Sign In to Partner Portal' : 'Create Partner Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? "Don't have a partner account?" : "Already have a partner account?"}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError(null)
                  setSuccess(null)
                }}
                className="w-full text-center text-sm text-green-600 hover:text-green-500 font-medium"
              >
                {isLogin ? 'Create a new partner account' : 'Sign in to existing account'}
              </button>
            </div>
          </div>
        </div>

        {/* User Portal Link */}
        <div className="mt-6 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-3">
              Looking for the user portal instead?
            </p>
            <Link 
              href="/auth" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <FaUser className="mr-2 h-4 w-4" />
              Access User Portal
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help getting started?{' '}
            <a href="mailto:partners@cardwise.com" className="text-green-600 hover:text-green-500">
              Contact our partner team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 