import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    let databaseStatus = 'not_configured'
    
    // Only attempt database connection if environment variables are present
    if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co') {
      try {
        const { supabase } = await import('@/lib/supabase/client')
        
        const { data, error } = await supabase
          .from('credit_cards')
          .select('count(*)')
          .limit(1)
          .single()

        if (error) {
          databaseStatus = `error: ${error.message}`
        } else {
          databaseStatus = 'connected'
        }
      } catch (dbError) {
        databaseStatus = `connection_failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`
      }
    }

    // System health check
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: databaseStatus,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      supabase_configured: !!(supabaseUrl && supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co')
    }

    return NextResponse.json(healthData, { status: 200 })
  } catch (error) {
    const errorData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }

    return NextResponse.json(errorData, { status: 503 })
  }
} 