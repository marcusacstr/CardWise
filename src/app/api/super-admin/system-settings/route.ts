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

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super admin
    if (!SUPER_ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden - Super admin access required' }, { status: 403 })
    }

    // Get all system settings
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_key')

    if (error) {
      console.error('Error fetching system settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    return NextResponse.json({ settings })

  } catch (error) {
    console.error('System settings GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super admin
    if (!SUPER_ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden - Super admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { setting_key, setting_value, description } = body

    if (!setting_key || setting_value === undefined) {
      return NextResponse.json({ error: 'Setting key and value are required' }, { status: 400 })
    }

    // Update or insert the setting
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        setting_key,
        setting_value,
        description,
        updated_by: user.email,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error updating system setting:', error)
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('super_admin_logs')
      .insert({
        admin_email: user.email,
        action: 'update_system_setting',
        target_type: 'system',
        target_id: setting_key,
        details: { setting_key, setting_value, description },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('System settings PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 