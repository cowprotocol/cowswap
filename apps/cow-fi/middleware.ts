import { NextRequest, NextResponse } from 'next/server'

import { checkEnvironment } from './util/environment'

// List of query parameters to strip for cache normalization
const TRACKING_PARAMS = [
  'ref',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'msclkid',
  'twclid',
  'dclid',
  'mc_cid',
  'mc_eid',
  'igshid',
  'scid',
  'fb_source',
  'ref_src',
]

export function middleware(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname
  const host = request.headers.get('host') || ''

  // Check if we're on develop.cow.fi and add noindex header
  const { isDev } = checkEnvironment(host, pathname)
  const response = NextResponse.next()

  if (isDev) {
    // Add X-Robots-Tag header to prevent indexing of develop subdomain
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
  }

  // Skip non-page assets (js, css, images, etc.)
  if (pathname.includes('.')) {
    return response
  }

  // Only process /learn routes for tracking param removal
  if (!pathname.startsWith('/learn')) {
    return response
  }

  const url = request.nextUrl.clone()
  const searchParams = url.searchParams
  let hasTracking = false

  // Check if any tracking parameters exist (case-insensitive)
  TRACKING_PARAMS.forEach((param) => {
    // Check both lowercase and as-is
    if (searchParams.has(param) || searchParams.has(param.toLowerCase())) {
      hasTracking = true
      searchParams.delete(param)
      searchParams.delete(param.toLowerCase())
    }
    // Also check for camelCase variants (e.g., utmSource)
    const camelCase = param.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    if (searchParams.has(camelCase)) {
      hasTracking = true
      searchParams.delete(camelCase)
    }
  })

  // If we removed any params, redirect to clean URL with 308 (permanent)
  if (hasTracking) {
    const redirectResponse = NextResponse.redirect(url, 308)
    // Preserve noindex header if on develop
    if (isDev) {
      redirectResponse.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
    }
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|robots.txt|sitemap.xml).*)',
  ],
}
