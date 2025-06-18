import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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
    
    // Get commission data
    const { data: commissions, error: commissionsError } = await supabase
      .from('partner_commissions')
      .select(`
        *,
        partner_card_applications (
          user_email,
          card_id,
          created_at,
          credit_cards (
            name,
            issuer
          )
        )
      `)
      .eq('partner_id', partnerData.id)
      .order('created_at', { ascending: false });
    
    if (commissionsError) {
      console.error('Error fetching commissions:', commissionsError);
      return NextResponse.json(
        { error: 'Failed to fetch commissions' }, 
        { status: 500 }
      );
    }
    
    // Calculate summary metrics
    const totalEarnings = commissions?.reduce((sum, commission) => sum + parseFloat(commission.amount || 0), 0) || 0;
    const pendingEarnings = commissions?.filter(c => c.status === 'pending').reduce((sum, commission) => sum + parseFloat(commission.amount || 0), 0) || 0;
    const paidEarnings = commissions?.filter(c => c.status === 'paid').reduce((sum, commission) => sum + parseFloat(commission.amount || 0), 0) || 0;
    const totalCommissions = commissions?.length || 0;
    
    // Group by month for trends
    const monthlyEarnings = commissions?.reduce((acc, commission) => {
      const month = new Date(commission.created_at).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + parseFloat(commission.amount || 0);
      return acc;
    }, {} as Record<string, number>) || {};
    
    return NextResponse.json({
      commissions: commissions || [],
      summary: {
        totalEarnings,
        pendingEarnings,
        paidEarnings,
        totalCommissions,
        monthlyEarnings
      }
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 