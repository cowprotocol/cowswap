import { type NextRequest, NextResponse } from 'next/server'

// Asset pages are prerendered for upper-case tickers only, see `dynamicParams` in app/asset/[ticker]/page.tsx
export function proxy(request: NextRequest): NextResponse {
  const [, , ticker = ''] = request.nextUrl.pathname.split('/')
  const upperTicker = ticker.toUpperCase()

  if (ticker === upperTicker) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/asset/${upperTicker}`

  return NextResponse.redirect(url, 308)
}

export const config = {
  matcher: '/asset/:ticker',
}
