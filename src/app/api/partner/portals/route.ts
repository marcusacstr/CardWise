import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { portal_name, subdomain, custom_domain } = await request.json();
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    // Get partner ID for the authenticated user
    const { data: partnerData, error: partnerError } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (partnerError || !partnerData) {
      return NextResponse.json(
        { error: 'Partner not found' }, 
        { status: 404 }
      );
    }
    
    // Validate input
    if (!portal_name?.trim()) {
      return NextResponse.json(
        { error: 'Portal name is required' }, 
        { status: 400 }
      );
    }
    
    const finalSubdomain = subdomain || portal_name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Validate subdomain format
    if (!/^[a-z0-9-]+$/.test(finalSubdomain) || finalSubdomain.length < 3) {
      return NextResponse.json(
        { error: 'Invalid subdomain format' }, 
        { status: 400 }
      );
    }
    
    // Check if subdomain already exists
    const { data: existingPortal } = await supabase
      .from('partner_portals')
      .select('id')
      .eq('subdomain', finalSubdomain)
      .single();
    
    if (existingPortal) {
      return NextResponse.json(
        { error: 'Subdomain already exists' }, 
        { status: 409 }
      );
    }
    
    // Create portal
    const portalData = {
      partner_id: partnerData.id,
      portal_name: portal_name.trim(),
      subdomain: finalSubdomain,
      custom_domain: custom_domain?.trim() || null,
      domain_verified: false,
      status: 'draft',
      test_url: `https://${finalSubdomain}.cardwise-preview.com`,
      ssl_enabled: true,
      deployment_status: 'deploying',
    };
    
    const { data: newPortal, error: createError } = await supabase
      .from('partner_portals')
      .insert(portalData)
      .select()
      .single();
    
    if (createError) {
      console.error('Portal creation error:', createError);
      return NextResponse.json(
        { error: 'Failed to create portal', details: createError.message }, 
        { status: 500 }
      );
    }
    
    // Simulate deployment process
    setTimeout(async () => {
      await supabase
        .from('partner_portals')
        .update({
          deployment_status: 'deployed',
          status: 'published',
          last_deployed: new Date().toISOString()
        })
        .eq('id', newPortal.id);
    }, 3000);
    
    return NextResponse.json(newPortal);
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    // Get partner ID for the authenticated user
    const { data: partnerData, error: partnerError } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (partnerError || !partnerData) {
      return NextResponse.json(
        { error: 'Partner not found' }, 
        { status: 404 }
      );
    }
    
    // Get portals for this partner
    const { data: portals, error: portalsError } = await supabase
      .from('partner_portals')
      .select('*')
      .eq('partner_id', partnerData.id)
      .order('created_at', { ascending: false });
    
    if (portalsError) {
      console.error('Error fetching portals:', portalsError);
      return NextResponse.json(
        { error: 'Failed to fetch portals' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(portals || []);
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 