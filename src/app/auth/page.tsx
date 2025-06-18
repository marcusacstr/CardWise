'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaGoogle, FaGithub, FaExclamationTriangle, FaUser, FaBuilding, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { validatePassword } from '@/utils/validation';

export default function UserAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Validate password on change for sign up
  useEffect(() => {
    if (isSignUp && password) {
      const { errors } = validatePassword(password);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  }, [password, isSignUp]);

  // Function to check if user is a partner
  const checkUserType = async (userId: string) => {
    const { data: partnerData, error } = await supabase
      .from('partners')
      .select('id')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking user type:', error);
      return 'user';
    }

    return partnerData ? 'partner' : 'user';
  };

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
        if (passwordErrors.length > 0) {
          throw new Error('Please fix the password requirements.');
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });
        if (error) throw error;

        setSuccess('Account created successfully! Please check your email to verify your account.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsSignUp(false);

      } else {
        // Sign In Logic
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          // Check if user is a partner
          const userType = await checkUserType(data.user.id);
          
          if (userType === 'partner') {
            router.push('/partner/dashboard');
          } else {
            router.push('/dashboard');
          }
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

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
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
              <FaUser className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create Your User Account' : 'Welcome Back!'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp ? (
              'Join thousands of users optimizing their credit card rewards'
            ) : (
              'Sign in to access your personalized card recommendations'
            )}
          </p>
        </div>

        {/* Account Type Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaUser className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">User Portal</h3>
              <p className="text-xs text-green-600 mt-1">
                Get personalized credit card recommendations and optimize your rewards
              </p>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="rounded-md shadow-sm -space-y-px">
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
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
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm ${isSignUp ? 'rounded-none' : 'rounded-b-md'}`}
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
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Password validation errors */}
          {isSignUp && passwordErrors.length > 0 && (
            <div className="mt-2">
              <ul className="text-sm text-red-600 space-y-1">
                {passwordErrors.map((error, index) => (
                  <li key={index} className="flex items-center">
                    <FaExclamationTriangle className="h-4 w-4 mr-1" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Error/Success Messages */}
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

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading || (isSignUp && (password !== confirmPassword || passwordErrors.length > 0))}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${(loading || (isSignUp && (password !== confirmPassword || passwordErrors.length > 0))) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* OAuth Options */}
        {!isSignUp && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuthLogin('google')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <FaGoogle className="h-5 w-5" />
                <span className="ml-2">Google</span>
              </button>
              <button
                onClick={() => handleOAuthLogin('github')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <FaGithub className="h-5 w-5" />
                <span className="ml-2">GitHub</span>
              </button>
            </div>
          </div>
        )}

        {/* Toggle Sign In/Sign Up */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setIsSignUp(false)
                    setError(null)
                    setSuccess(null)
                  }}
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Sign in here
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setIsSignUp(true)
                    setError(null)
                    setSuccess(null)
                  }}
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Create one now
                </button>
              </>
            )}
          </p>
        </div>

        {/* Partner Portal Link */}
        <div className="border-t border-gray-200 pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">
              Are you a business looking to offer CardWise to your customers?
            </p>
            <Link 
              href="/partner/auth" 
              className="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-colors"
            >
              <FaBuilding className="mr-2 h-4 w-4" />
              Access Partner Portal
            </Link>
          </div>
        </div>

        {/* Terms */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our{' '}
            <a href="#" className="text-green-600 hover:text-green-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-green-600 hover:text-green-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 