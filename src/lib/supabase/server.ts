import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Standard server client for authenticated requests
export const createServerSupabaseClient = () => {
  // During build time, environment variables might not be available
  // Return a mock client that won't crash the build
  try {
    return createServerComponentClient({ cookies })
  } catch (error) {
    console.warn('Failed to create server Supabase client during build:', error)
    // Return a mock client for build time
    return null
  }
}

// Admin client with service role for bypassing RLS when needed
export const createServiceRoleClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // Handle missing environment variables gracefully
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Missing Supabase environment variables for service role client')
    // Return a mock client that throws helpful errors
    return {
      from: () => ({
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
        select: () => ({ eq: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }) }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) })
      })
    }
  }
  
  // During build, use placeholder values to prevent crashes
  if (supabaseUrl === 'https://placeholder.supabase.co' || serviceRoleKey.includes('placeholder')) {
    console.warn('Using placeholder Supabase configuration during build')
    return {
      from: () => ({
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Build-time placeholder') }) }) }),
        select: () => ({ eq: () => Promise.resolve({ data: [], error: new Error('Build-time placeholder') }) }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Build-time placeholder') }) }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Build-time placeholder') }) })
      })
    }
  }

  try {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  } catch (error) {
    console.warn('Failed to create service role client:', error)
    // Return mock client
    return {
      from: () => ({
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Client creation failed') }) }) }),
        select: () => ({ eq: () => Promise.resolve({ data: [], error: new Error('Client creation failed') }) }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Client creation failed') }) }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Client creation failed') }) })
      })
    }
  }
} 