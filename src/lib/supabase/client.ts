import { createBrowserClient } from '@supabase/ssr'

// Create Supabase client only if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a comprehensive mock client for build time
const createMockClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ 
      data: { user: null }, 
      error: new Error('Supabase not configured during build') 
    }),
    signInWithPassword: () => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: new Error('Supabase not configured') 
    }),
    signUp: () => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: new Error('Supabase not configured') 
    }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
      order: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
      single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
      })
    }),
    update: (data: any) => ({
      eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
    })
  })
})

// Provide a fallback client for build time when env vars might not be available
let supabase: any = null

if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co') {
  try {
    supabase = createBrowserClient(supabaseUrl, supabaseKey)
  } catch (error) {
    console.warn('Failed to create Supabase client:', error)
    supabase = createMockClient()
  }
} else {
  // Use mock client during build or when env vars are missing
  supabase = createMockClient()
}

// Export a safe client that handles missing configuration
export { supabase } 