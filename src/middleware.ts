import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth',
    '/auth/signin',
    '/auth/signup',
    '/auth/callback',
    '/partner/register',
    '/partner/auth',
    '/super-admin',
    '/preview',
    '/api',
    '/about',
    '/pricing',
    '/contact'
  ]

  // Check if the current path is public or starts with a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // If it's a public route, allow access
  if (isPublicRoute) {
    return res
  }

  // For protected routes, check authentication
  if (!session) {
    // Redirect to main auth page (which defaults to partner login)
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth'
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Special case: /partner/register should be accessible to authenticated users who aren't partners
  if (pathname === '/partner/register') {
    return res
  }

  // For other partner routes, check if user has partner account
  if (pathname.startsWith('/partner')) {
    try {
      // First check user metadata for partner status
      const isPartnerFromMetadata = session.user.user_metadata?.is_partner === true;
      
      const { data: partner, error } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking partner status:', error)
        // If partner record query fails but user has partner metadata, allow access
        if (isPartnerFromMetadata) {
          return res
        }
      }

      // Allow access if user has partner record OR partner metadata
      if (!partner && !isPartnerFromMetadata) {
        // User is authenticated but not a partner - redirect to partner registration
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/partner/register'
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error('Error checking partner status:', error)
      // If error but user has partner metadata, allow access
      if (session.user.user_metadata?.is_partner === true) {
        return res
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 