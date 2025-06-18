import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (data.user) {
      // Check if user is marked as partner in metadata first
      const isPartnerFromMetadata = data.user.user_metadata?.is_partner === true;
      
      // Use service role client for partner check to bypass RLS
      const adminSupabase = createServiceRoleClient()
      const { data: partnerData, error } = await adminSupabase
        .from('partners')
        .select('id')
        .eq('user_id', data.user.id)
        .single();

      console.log('Partner check result:', { 
        partnerData, 
        error, 
        userId: data.user.id, 
        isPartnerFromMetadata,
        userMetadata: data.user.user_metadata 
      });

      // Redirect based on user type - check both partner table and metadata
      if ((partnerData && !error) || isPartnerFromMetadata) {
        // User is a partner - redirect to partner dashboard
        console.log('Redirecting to partner dashboard');
        return NextResponse.redirect(`${requestUrl.origin}/partner/dashboard`)
      } else {
        // User is not a partner - redirect to user dashboard
        console.log('Redirecting to user dashboard');
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    }
  }

  // Fallback to home page
  return NextResponse.redirect(requestUrl.origin)
} 