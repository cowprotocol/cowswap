import { NextRequest, NextResponse } from 'next/server'

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

  // Skip non-page assets (js, css, images, etc.)
  if (pathname.includes('.')) {
    return NextResponse.next()
  }

  // Only process /learn routes
  if (!pathname.startsWith('/learn')) {
    return NextResponse.next()
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
    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/learn/:path*',
}
