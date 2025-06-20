import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const {
      portalName,
      subdomain,
      customDomain,
      companyName,
      primaryColor,
      secondaryColor,
      logoUrl,
      welcomeMessage,
      contactEmail,
      phone,
      featuredCards
    } = body;

    // Validate required fields
    if (!portalName || !subdomain || !companyName) {
      return NextResponse.json({ 
        error: 'Missing required fields: portalName, subdomain, companyName' 
      }, { status: 400 });
    }

    // Validate subdomain format (alphanumeric, hyphens only, 3-50 chars)
    const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json({ 
        error: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens. 3-50 characters.' 
      }, { status: 400 });
    }

    // Get partner record
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner record not found' }, { status: 404 });
    }

    // Check if subdomain is already taken
    const { data: existingPortal, error: checkError } = await supabase
      .from('partner_portals')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    if (existingPortal) {
      return NextResponse.json({ 
        error: 'Subdomain already taken. Please choose a different one.' 
      }, { status: 409 });
    }

    // Generate URLs - using realistic localhost URLs for development
    const testUrl = `http://localhost:3000/portal/${subdomain}`
    const productionUrl = customDomain ? `https://${customDomain}` : `https://yourapp.com/portal/${subdomain}`

    // Start transaction by creating portal
    const { data: newPortal, error: portalError } = await supabase
      .from('partner_portals')
      .insert([{
        partner_id: partner.id,
        portal_name: portalName,
        subdomain: subdomain,
        custom_domain: customDomain || null,
        test_url: testUrl,
        production_url: productionUrl,
        status: 'published',
        deployment_status: 'deployed'
      }])
      .select()
      .single();

    if (portalError) {
      console.error('Error creating portal:', portalError);
      return NextResponse.json({ 
        error: 'Failed to create portal: ' + portalError.message 
      }, { status: 500 });
    }

    // Create portal configuration
    const { data: config, error: configError } = await supabase
      .from('partner_portal_configs')
      .insert([{
        partner_id: partner.id,
        portal_id: newPortal.id,
        primary_color: primaryColor || '#10B981',
        secondary_color: secondaryColor || '#059669',
        accent_color: '#F59E0B',
        logo_url: logoUrl || '',
        company_name: companyName,
        domain: subdomain,
        welcome_message: welcomeMessage || 'Find the perfect credit card for your needs',
        contact_email: contactEmail || partner.contact_email,
        phone_number: phone || '',
        features_enabled: {
          spending_analysis: true,
          card_recommendations: true,
          credit_score_tracking: true,
          financial_goals: true
        },
        analytics_enabled: true
      }])
      .select()
      .single();

    if (configError) {
      console.error('Error creating portal config:', configError);
      // Rollback portal creation
      await supabase.from('partner_portals').delete().eq('id', newPortal.id);
      return NextResponse.json({ 
        error: 'Failed to create portal configuration: ' + configError.message 
      }, { status: 500 });
    }

    // Add featured cards if provided, otherwise add default cards
    if (featuredCards && featuredCards.length > 0) {
      const cardSelections = featuredCards.map((cardId: string, index: number) => ({
        partner_id: partner.id,
        portal_id: newPortal.id,
        card_id: cardId,
        active: true,
        featured: true,
        priority_order: index + 1,
        commission_rate: 0.025 // 2.5% default commission
      }))

      const { error: cardsError } = await supabase
        .from('partner_card_selections')
        .insert(cardSelections)

      if (cardsError) {
        console.error('Error adding featured cards:', cardsError)
        // Don't rollback for this, just log the error
      }
    } else {
      // Add some default cards if no specific cards were selected
      const { data: defaultCards, error: defaultCardsError } = await supabase
        .from('credit_cards')
        .select('id')
        .eq('is_active', true)
        .limit(3)

      if (!defaultCardsError && defaultCards && defaultCards.length > 0) {
        const defaultSelections = defaultCards.map((card, index) => ({
          partner_id: partner.id,
          portal_id: newPortal.id,
          card_id: card.id,
          active: true,
          featured: true,
          priority_order: index + 1,
          commission_rate: 0.025
        }))

        const { error: defaultError } = await supabase
          .from('partner_card_selections')
          .insert(defaultSelections)

        if (defaultError) {
          console.error('Error adding default cards:', defaultError)
        }
      }
    }

    // Create initial session tracking
    const { error: sessionError } = await supabase
      .from('partner_user_sessions')
      .insert([{
        partner_id: partner.id,
        portal_id: newPortal.id,
        user_email: 'system',
        session_id: 'portal-created',
        landing_page: '/',
        analyses_completed: 0
      }]);

    if (sessionError) {
      console.error('Error creating initial session:', sessionError);
      // Don't rollback for this, just log the error
    }

    return NextResponse.json({
      success: true,
      portal: {
        id: newPortal.id,
        portalName: newPortal.portal_name,
        subdomain: newPortal.subdomain,
        testUrl: newPortal.test_url,
        productionUrl: newPortal.production_url,
        status: newPortal.status,
        config: config
      }
    });

  } catch (error) {
    console.error('Error in portal creation:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
