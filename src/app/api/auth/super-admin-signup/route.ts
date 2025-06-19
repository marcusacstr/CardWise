import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPER_ADMIN_EMAILS = [
  'marcus@cardwise.com',
  'admin@cardwise.com', 
  'team@cardwise.com',
]

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Check if email is in super admin whitelist
    if (!SUPER_ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: 'Email not authorized for super admin access' }, { status: 403 })
    }

    // First, try to sign up normally
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: 'Super',
          last_name: 'Admin',
          account_type: 'super_admin'
        }
      }
    })

    if (error) {
      // If user already exists, try to sign them in instead
      if (error.message.includes('User already registered')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) {
          return NextResponse.json({ error: signInError.message }, { status: 400 })
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Signed in successfully',
          user: signInData.user,
          session: signInData.session
        })
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Account created. Please check your email to verify your account.',
      user: data.user,
      session: data.session
    })

  } catch (error) {
    console.error('Super admin signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 