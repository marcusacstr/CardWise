import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    console.log('Checking database tables...');
    
    // Test partner_portals table
    const { error: portalTestError } = await supabase
      .from('partner_portals')
      .select('id')
      .limit(1);
    
    console.log('partner_portals table test:', portalTestError ? 'MISSING' : 'EXISTS');
    
    // Test partner_portal_configs table  
    const { error: configTestError } = await supabase
      .from('partner_portal_configs')
      .select('id')
      .limit(1);
    
    console.log('partner_portal_configs table test:', configTestError ? 'MISSING' : 'EXISTS');
    
    return NextResponse.json({
      success: true,
      message: 'Database table check completed',
      tables: {
        partner_portals: portalTestError ? 'MISSING' : 'EXISTS',
        partner_portal_configs: configTestError ? 'MISSING' : 'EXISTS'
      },
      errors: {
        partner_portals: portalTestError?.message || null,
        partner_portal_configs: configTestError?.message || null
      }
    });
    
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { error: 'Failed to check database', details: String(error) },
      { status: 500 }
    );
  }
} 