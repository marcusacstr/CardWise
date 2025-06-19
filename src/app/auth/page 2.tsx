'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FaUser, FaBuilding, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPartnerMode, setIsPartnerMode] = useState(true); // Default to partner mode
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const redirectTo = searchParams.get('redirectTo');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        // Sign Up Logic
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const signUpData: any = {
          email,
          password,
          options: {
            emailRedirectTo: process.env.NODE_ENV === 'production' 
              ? `${process.env.NEXTAUTH_URL || 'https://card-wise-7u2k840fv-marcus-projects-04c74091.vercel.app'}/auth/callback`
              : `${location.origin}/auth/callback`,
          },
        };

        if (isPartnerMode) {
          signUpData.options.data = {
            company_name: companyName,
            is_partner: true,
            contact_email: email,
            partner_signup_completed: false
          };
        }

        const { data, error } = await supabase.auth.signUp(signUpData);
        if (error) throw error;

        if (data.user && isPartnerMode) {
          // Store partner intent in user metadata instead of creating record immediately
          console.log('🏢 Storing partner intent for user:', data.user.id);
          console.log('📋 Partner data will be created after email confirmation');
          
          // Update user metadata to indicate they're a partner
          const { error: metadataError } = await supabase.auth.updateUser({
            data: {
              is_partner: true,
              company_name: companyName,
              contact_email: email,
              partner_signup_completed: false
            }
          });

          if (metadataError) {
            console.error('❌ Error updating user metadata:', metadataError);
          } else {
            console.log('✅ Partner metadata stored successfully');
          }
        }

        setSuccess(`${isPartnerMode ? 'Partner' : 'User'} account created successfully! Please check your email to verify your account.`);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setCompanyName('');
        setIsSignUp(false);

      } else {
        // Sign In Logic
        console.log('🔐 Attempting sign in for:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          console.log('🔐 Sign in successful for user:', data.user.id);
          setSuccess('Sign in successful! Redirecting...');
          
          // Check user type and redirect
          console.log('🔍 Starting partner check...');
          const { data: partnerData, error: partnerError } = await supabase
            .from('partners')
            .select('id, user_id, company_name')
            .eq('user_id', data.user.id)
            .single();

          console.log('📊 Partner check result:', { partnerData, error: partnerError });

          // Small delay then redirect
          setTimeout(() => {
            if (partnerData && !partnerError) {
              console.log('🏢 Redirecting to partner dashboard...');
              router.push('/partner/dashboard');
            } else {
              console.log('👤 Redirecting to user dashboard...');
              router.push('/dashboard');
            }
          }, 1000);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-500 mb-4">
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              {isPartnerMode ? (
                <FaBuilding className="w-8 h-8 text-green-600" />
              ) : (
                <FaUser className="w-8 h-8 text-green-600" />
              )}
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isSignUp ? 
              `Create Your ${isPartnerMode ? 'Partner' : 'User'} Account` : 
              `Welcome ${isPartnerMode ? 'Partner' : 'Back'}!`
            }
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp ? (
              isPartnerMode ? 
                'Start earning with CardWise partner program' :
                'Join thousands of users optimizing their credit card rewards'
            ) : (
              isPartnerMode ?
                'Sign in to your partner dashboard' :
                'Sign in to access your personalized card recommendations'
            )}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIsPartnerMode(true)}
            className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
              isPartnerMode 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaBuilding className="h-4 w-4 mr-2" />
            Partner Portal
          </button>
          <button
            type="button"
            onClick={() => setIsPartnerMode(false)}
            className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
              !isPartnerMode 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaUser className="h-4 w-4 mr-2" />
            User Portal
          </button>
        </div>

        {/* Account Type Benefits */}
        <div className={`${isPartnerMode ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
          <div className="flex items-center">
            {isPartnerMode ? (
              <FaBuilding className="h-5 w-5 text-green-600 mr-3" />
            ) : (
              <FaUser className="h-5 w-5 text-blue-600 mr-3" />
            )}
            <div>
              <h3 className={`text-sm font-medium ${isPartnerMode ? 'text-green-800' : 'text-blue-800'}`}>
                {isPartnerMode ? 'Partner Portal' : 'User Portal'}
              </h3>
              <p className={`text-xs mt-1 ${isPartnerMode ? 'text-green-600' : 'text-blue-600'}`}>
                {isPartnerMode ? 
                  'White-label platform, earn commissions, custom branding' :
                  'Personalized card recommendations and rewards optimization'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Partner Benefits for Sign Up */}
        {isSignUp && isPartnerMode && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Partner Benefits</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-xs text-gray-700">White-label credit card portal</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-xs text-gray-700">Earn up to 5% commission</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-xs text-gray-700">Real-time analytics</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-xs text-gray-700">Custom branding</span>
              </div>
            </div>
          </div>
        )}

        {/* Auth Form */}
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="rounded-md shadow-sm -space-y-px">
            {isSignUp && isPartnerMode && (
              <div>
                <label htmlFor="company-name" className="sr-only">
                  Company Name
                </label>
                <input
                  id="company-name"
                  name="companyName"
                  type="text"
                  required={isSignUp && isPartnerMode}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm ${
                  (isSignUp && isPartnerMode) ? 'rounded-none' : 'rounded-t-md'
                }`}
                placeholder={isPartnerMode ? "Business email address" : "Email address"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm ${
                  isSignUp ? '' : 'rounded-b-md'
                }`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {isSignUp && (
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Error and Success Messages */}
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : (
                isSignUp ? `Create ${isPartnerMode ? 'Partner' : 'User'} Account` : 'Sign In'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="text-green-600 hover:text-green-500 text-sm font-medium"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 