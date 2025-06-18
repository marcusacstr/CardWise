'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    // Remove the entire handleSignUp function as public signup is not needed
    // e.preventDefault()
    // setLoading(true)
    // setMessage(null)

    // // Clear form fields on new attempt
    // setEmail('');
    // setPassword('');

    // try { // ... signup logic ... }
    // catch (error) { // ... error handling ... }
    // finally { setLoading(false) }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

     // Clear form fields on new attempt
     setEmail('');
     setPassword('');

    try {
       // Check if email and password are provided
       if (!email || !password) {
        setMessage({ type: 'error', text: 'Please enter both email and password.' });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      // On successful sign-in, redirect the user to the dashboard
      setMessage({ type: 'success', text: 'Signed in successfully!' })

      // Explicitly redirect after successful sign-in
      router.push('/partner/dashboard');

    } catch (error) {
      console.error('Signin Error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'An unexpected error occurred during signin.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-card rounded-lg shadow-lg border border-border">
      <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Partner Login</h2>
      
      {message && (
        <div className={`p-4 mb-4 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border shadow-sm p-2 focus:outline-none focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border shadow-sm p-2 focus:outline-none focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            onClick={handleSignIn}
            disabled={loading}
            className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Partner Login'}
          </button>
        </div>
      </form>
    </div>
  )
} 