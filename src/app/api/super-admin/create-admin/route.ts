import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPER_ADMIN_EMAILS = [
  'marcus@cardwise.com',
  'admin@cardwise.com',
  'team@cardwise.com',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Check if email is in super admin whitelist
    if (!SUPER_ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: 'Email not authorized for super admin access' }, { status: 403 })
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create the user account with admin privileges
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin accounts
      user_metadata: {
        first_name: 'Super',
        last_name: 'Admin',
        account_type: 'super_admin'
      }
    })

    if (error) {
      console.error('Error creating super admin:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log the admin account creation
    if (data.user) {
      await supabaseAdmin
        .from('super_admin_logs')
        .insert({
          admin_email: email,
          action: 'ADMIN_ACCOUNT_CREATED',
          target_type: 'user',
          target_id: data.user.id,
          details: { created_via: 'admin_api' },
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Super admin account created successfully',
      user: { id: data.user.id, email: data.user.email }
    })

  } catch (error) {
    console.error('Super admin creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 