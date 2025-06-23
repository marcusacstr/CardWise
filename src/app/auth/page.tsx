'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaGoogle, FaExclamationTriangle, FaUser, FaBuilding, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import { validatePassword } from '@/utils/validation';

export default function UserAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
            emailRedirectTo: process.env.NODE_ENV === 'production' 
              ? `${process.env.NEXTAUTH_URL || 'https://card-wise-7u2k840fv-marcus-projects-04c74091.vercel.app'}/auth/callback`
              : `${location.origin}/auth/callback`,
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

  const handleOAuthLogin = async (provider: 'google') => {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      <div className="flex min-h-screen">
        {/* Left Side - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-700 p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col justify-center max-w-md">
            <div className="mb-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <FaUser className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">
                Welcome to CardWise
              </h1>
              <p className="text-xl text-green-100 leading-relaxed">
                Get personalized credit card recommendations powered by AI. Maximize your rewards and optimize your spending.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-green-300 rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">AI-Powered Analysis</h3>
                  <p className="text-green-100">Upload your statements and get instant, personalized recommendations.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-green-300 rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Maximize Rewards</h3>
                  <p className="text-green-100">Discover cards that could earn you hundreds more in rewards each year.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-green-300 rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
                  <p className="text-green-100">Your data is protected and never shared with third parties.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center">
              <Link 
                href="/" 
                className="inline-flex items-center text-green-600 hover:text-green-500 mb-6 font-medium"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
              
              <div className="lg:hidden mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaUser className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isSignUp ? 'Create Your Account' : 'Welcome Back!'}
              </h2>
              <p className="text-gray-600 mb-6">
                {isSignUp ? (
                  'Join thousands of users optimizing their credit card rewards'
                ) : (
                  'Sign in to access your personalized card recommendations'
                )}
              </p>
            </div>

            {/* Account Type Indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center">
                <FaUser className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-800">Personal User Account</h3>
                  <p className="text-sm text-blue-600">Get personalized credit card recommendations</p>
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-slide-up">
                <div className="flex items-start">
                  <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-slide-up">
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <FaUser className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* OAuth Button */}
            <button
              onClick={() => handleOAuthLogin('google')}
              className="w-full btn btn-outline flex items-center justify-center py-3 space-x-3"
            >
              <FaGoogle className="h-5 w-5 text-red-500" />
              <span>Continue with Google</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500 font-medium">Or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleAuth}>
              {/* Email */}
              <div>
                <label htmlFor="email-address" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                    className="input pr-12"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ fontSize: '16px' }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {isSignUp && passwordErrors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {passwordErrors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600 flex items-center">
                        <FaExclamationTriangle className="h-3 w-3 mr-2" />
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              {isSignUp && (
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className="input pr-12"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ fontSize: '16px' }}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {isSignUp && confirmPassword && password !== confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <FaExclamationTriangle className="h-3 w-3 mr-2" />
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (isSignUp && (passwordErrors.length > 0 || password !== confirmPassword))}
                className="w-full btn btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            {/* Toggle Sign Up/Sign In */}
            <div className="text-center">
              <p className="text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setSuccess(null);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-green-600 hover:text-green-500 font-semibold"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Partner Link */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Looking to offer CardWise to your clients?
              </p>
              <Link
                href="/partner/auth"
                className="inline-flex items-center text-green-600 hover:text-green-500 font-semibold"
              >
                <FaBuilding className="mr-2 h-4 w-4" />
                Partner Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 