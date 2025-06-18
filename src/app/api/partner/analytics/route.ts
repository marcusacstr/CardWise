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
    
    // Get analytics data
    const { data: analytics, error: analyticsError } = await supabase
      .from('partner_analytics')
      .select('*')
      .eq('partner_id', partnerData.id)
      .order('date', { ascending: false })
      .limit(30);
    
    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
      return NextResponse.json(
        { error: 'Failed to fetch analytics' }, 
        { status: 500 }
      );
    }
    
    // Calculate summary metrics
    const totalUsers = analytics?.reduce((sum, day) => sum + (day.total_users || 0), 0) || 0;
    const activeUsers = analytics?.reduce((sum, day) => sum + (day.active_users || 0), 0) || 0;
    const totalAnalyses = analytics?.reduce((sum, day) => sum + (day.total_analyses || 0), 0) || 0;
    const totalApplications = analytics?.reduce((sum, day) => sum + (day.card_applications || 0), 0) || 0;
    const conversionRate = totalUsers > 0 ? (totalApplications / totalUsers) * 100 : 0;
    
    return NextResponse.json({
      analytics: analytics || [],
      summary: {
        totalUsers,
        activeUsers,
        totalAnalyses,
        totalApplications,
        conversionRate
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