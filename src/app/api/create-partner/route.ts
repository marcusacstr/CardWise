import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, company_name, contact_email, subscription_status, subscription_plan } = body

    // Validate required fields
    if (!user_id || !company_name || !contact_email) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, company_name, contact_email' },
        { status: 400 }
      )
    }

    console.log('🔧 Service: Creating partner record via API...')
    console.log('📋 Service: Partner data:', { user_id, company_name, contact_email })

    // Use service role client to bypass RLS
    const adminSupabase = createServiceRoleClient()
    
    // Insert partner record
    const { data: partner, error } = await adminSupabase
      .from('partners')
      .insert([{
        user_id,
        company_name,
        contact_email,
        subscription_status: subscription_status || 'trial',
        subscription_plan: subscription_plan || 'basic'
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Service: Error creating partner record:', error)
      return NextResponse.json(
        { error: 'Failed to create partner record', details: error },
        { status: 500 }
      )
    }

    console.log('✅ Service: Partner record created successfully:', partner)
    return NextResponse.json({ success: true, partner })

  } catch (error) {
    console.error('❌ Service: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 