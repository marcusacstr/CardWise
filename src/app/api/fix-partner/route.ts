import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if partner record already exists
    const { data: existingPartner } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingPartner) {
      return NextResponse.json({ message: 'Partner record already exists' })
    }

    // Create service role client for database operations
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get company data from user metadata
    const metadata = user.user_metadata || {}
    const companyName = metadata.company_name || metadata.companyName || 'Your Company'
    const subscriptionPlan = metadata.subscription_plan || metadata.subscriptionPlan || 'premium'

    // Create partner record
    const { data: partnerData, error: partnerError } = await serviceRoleClient
      .from('partners')
      .insert({
        user_id: user.id,
        company_name: companyName,
        contact_email: user.email,
        subscription_plan: subscriptionPlan,
        subscription_status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (partnerError) {
      console.error('Error creating partner record:', partnerError)
      return NextResponse.json({ 
        error: 'Failed to create partner record',
        details: partnerError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Partner record created successfully',
      partner: partnerData
    })

  } catch (error) {
    console.error('Error in fix-partner:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 